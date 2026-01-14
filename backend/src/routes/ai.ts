import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../lib/auth.js";
import { validateBody } from "../lib/validate.js";
import { generateText } from "../services/ai.js";

export const aiRouter = Router();

const schema = z.object({
  matchId: z.string().min(1),
  language: z.enum(["en", "fr"]).default("en"),
});

aiRouter.post(
  "/match-preview",
  requireAuth,
  validateBody(schema),
  async (req, res) => {
    const { matchId, language } = (req as any).validated;
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { league: true, homeTeam: true, awayTeam: true },
    });
    if (!match) return res.status(404).json({ error: "Match not found" });

    const existing = await prisma.aISummary.findFirst({
      where: { matchId, language, kind: "preview" },
      orderBy: { createdAt: "desc" },
    });
    if (existing) return res.json(existing);

    const prompt =
      language === "fr"
        ? `Rédige un aperçu concis du match (style journaliste). Match: ${
            match.homeTeam.name
          } vs ${match.awayTeam.name}. Ligue: ${
            match.league?.name || "N/A"
          }. Coup d'envoi: ${match.kickoffTime.toISOString()}.`
        : `Write a concise football match preview (journalistic style). Match: ${
            match.homeTeam.name
          } vs ${match.awayTeam.name}. League: ${
            match.league?.name || "N/A"
          }. Kickoff: ${match.kickoffTime.toISOString()}.`;

    const content = await generateText(prompt);

    const saved = await prisma.aISummary.create({
      data: { matchId, provider: "openai", language, kind: "preview", content },
    });
    res.json(saved);
  }
);

aiRouter.post(
  "/match-summary",
  requireAuth,
  validateBody(schema),
  async (req, res) => {
    const { matchId, language } = (req as any).validated;
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { league: true, homeTeam: true, awayTeam: true },
    });
    if (!match) return res.status(404).json({ error: "Match not found" });

    const existing = await prisma.aISummary.findFirst({
      where: { matchId, language, kind: "summary" },
      orderBy: { createdAt: "desc" },
    });
    if (existing) return res.json(existing);

    const prompt =
      language === "fr"
        ? `Rédige un résumé du match après coup. Match: ${
            match.homeTeam.name
          } vs ${match.awayTeam.name}. Score: ${
            match.score || "N/A"
          }. Statut: ${match.status}.`
        : `Write a post-match summary. Match: ${match.homeTeam.name} vs ${
            match.awayTeam.name
          }. Score: ${match.score || "N/A"}. Status: ${match.status}.`;

    const content = await generateText(prompt);

    const saved = await prisma.aISummary.create({
      data: { matchId, provider: "openai", language, kind: "summary", content },
    });
    res.json(saved);
  }
);

// Admin-only regenerate (optional)
aiRouter.post("/regenerate", requireAuth, requireAdmin, async (req, res) => {
  const { matchId, language, kind } = req.body || {};
  if (!matchId || !language || !kind)
    return res.status(400).json({ error: "matchId, language, kind required" });

  await prisma.aISummary.deleteMany({ where: { matchId, language, kind } });
  res.json({ ok: true });
});
