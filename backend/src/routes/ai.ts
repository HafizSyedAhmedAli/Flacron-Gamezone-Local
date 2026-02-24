import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../lib/validate.js";
import {
  generateMatchPreview,
  generateMatchSummary,
  getMatchAIContent,
  clearAICache,
} from "../services/ai-service.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin, requirePremium } from "../lib/auth.js";

export const aiRouter = Router();

const generateAISchema = z.object({
  matchId: z.string().min(1),
  language: z.enum(["en", "fr"]).optional().default("en"),
  regenerate: z.boolean().optional().default(false),
});

/**
 * POST /api/ai/match-preview
 * Generate AI match preview before the game
 * Authenticated users only
 */
aiRouter.post(
  "/match-preview",
  requireAuth,
  requirePremium,
  validateBody(generateAISchema),
  async (req, res) => {
    try {
      const { matchId, language, regenerate } = (req as any).validated;

      // Check if match exists
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { homeTeam: true, awayTeam: true },
      });

      if (!match) {
        return res
          .status(404)
          .json({ success: false, error: "Match not found" });
      }

      if (match.status === "FINISHED") {
        return res.status(400).json({
          success: false,
          error:
            "Cannot generate preview for finished match. Use summary instead.",
        });
      }

      // If regenerate requested, only allow admins to trigger a full regenerate
      if (regenerate && !(req as any).user?.isAdmin) {
        return res.status(403).json({
          success: false,
          error: "Insufficient permissions to regenerate",
        });
      }

      if (regenerate) {
        await clearAICache(matchId);
        await prisma.aISummary.deleteMany({
          where: { matchId, kind: "preview", language },
        });
      } else {
        const existing = await prisma.aISummary.findFirst({
          where: { matchId, kind: "preview", language },
        });
        if (existing) {
          return res.json({
            success: true,
            preview: existing.content,
            cached: true,
          });
        }
      }

      const preview = await generateMatchPreview(matchId, language);

      res.json({ success: true, preview, cached: false });
    } catch (error) {
      console.error("Error generating match preview:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate preview",
      });
    }
  },
);

/**
 * POST /api/ai/match-summary
 * Generate AI match summary after the game
 * Authenticated users only
 */
aiRouter.post(
  "/match-summary",
  requireAuth,
  requirePremium,
  validateBody(generateAISchema),
  async (req, res) => {
    try {
      const { matchId, language, regenerate } = (req as any).validated;

      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { homeTeam: true, awayTeam: true },
      });

      if (!match)
        return res
          .status(404)
          .json({ success: false, error: "Match not found" });
      if (match.status !== "FINISHED")
        return res.status(400).json({
          success: false,
          error: "Cannot generate summary for unfinished match",
        });

      if (regenerate && !(req as any).user?.isAdmin) {
        return res.status(403).json({
          success: false,
          error: "Insufficient permissions to regenerate",
        });
      }

      if (regenerate) {
        await clearAICache(matchId);
        await prisma.aISummary.deleteMany({
          where: { matchId, kind: "summary", language },
        });
      } else {
        const existing = await prisma.aISummary.findFirst({
          where: { matchId, kind: "summary", language },
        });
        if (existing) {
          return res.json({
            success: true,
            summary: existing.content,
            cached: true,
          });
        }
      }

      const summary = await generateMatchSummary(matchId, language);

      res.json({ success: true, summary, cached: false });
    } catch (error) {
      console.error("Error generating match summary:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate summary",
      });
    }
  },
);

/**
 * GET /api/ai/match/:matchId
 * Get existing AI content (preview and summary) for a match
 * Authenticated users
 */
aiRouter.get(
  "/match/:matchId",
  requireAuth,
  requirePremium,
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const language = req.query.language as string | undefined;
      if (language && !["en", "fr"].includes(language)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid language" });
      }
      const validLanguage = language || "en";

      const content = await getMatchAIContent(matchId, validLanguage);

      const aiTexts = [];

      if (content.preview) {
        aiTexts.push({
          kind: "preview",
          language: validLanguage,
          content: content.preview,
        });
      }

      if (content.summary) {
        aiTexts.push({
          kind: "summary",
          language: validLanguage,
          content: content.summary,
        });
      }

      res.json(aiTexts);
    } catch (error) {
      console.error("Error fetching AI content:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch AI content" });
    }
  },
);

/**
 * DELETE /api/ai/match/:matchId
 * Clear AI cache and delete AI content for a match
 * Admin only
 */
aiRouter.delete("/match/:matchId", requireAdmin, async (req, res) => {
  try {
    const { matchId } = req.params;

    await clearAICache(matchId);
    await prisma.aISummary.deleteMany({ where: { matchId } });

    res.json({ success: true, message: "AI content cleared" });
  } catch (error) {
    console.error("Error clearing AI content:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to clear AI content" });
  }
});

export default aiRouter;
