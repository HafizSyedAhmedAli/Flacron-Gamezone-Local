import type { Request, Response } from "express";
import { aiService } from "../services/ai.service.js";
import { aiSummaryRepository } from "../repositories/aiSummary.repository.js";
import { matchRepository } from "../repositories/match.repository.js";

export const aiController = {
  async generatePreview(req: Request, res: Response) {
    const { matchId, language, regenerate } = (req as any).validated;

    const match = await matchRepository.findByIdWithTeams(matchId);
    if (!match)
      return res.status(404).json({ success: false, error: "Match not found" });
    if (match.status === "FINISHED")
      return res.status(400).json({
        success: false,
        error:
          "Cannot generate preview for finished match. Use summary instead.",
      });

    if (regenerate) {
      await aiService.clearCache(matchId);
      await aiSummaryRepository.deleteByMatch(matchId, {
        kind: "preview",
        language,
      });
    } else {
      const existing = await aiSummaryRepository.findOne(
        matchId,
        language,
        "preview",
      );
      if (existing)
        return res.json({
          success: true,
          preview: existing.content,
          cached: true,
        });
    }

    const preview = await aiService.generateMatchPreview(matchId, language);
    res.json({ success: true, preview, cached: false });
  },

  async generateSummary(req: Request, res: Response) {
    const { matchId, language, regenerate } = (req as any).validated;

    const match = await matchRepository.findByIdWithTeams(matchId);
    if (!match)
      return res.status(404).json({ success: false, error: "Match not found" });
    if (match.status !== "FINISHED")
      return res.status(400).json({
        success: false,
        error: "Cannot generate summary for unfinished match",
      });

    if (regenerate) {
      await aiService.clearCache(matchId);
      await aiSummaryRepository.deleteByMatch(matchId, {
        kind: "summary",
        language,
      });
    } else {
      const existing = await aiSummaryRepository.findOne(
        matchId,
        language,
        "summary",
      );
      if (existing)
        return res.json({
          success: true,
          summary: existing.content,
          cached: true,
        });
    }

    const summary = await aiService.generateMatchSummary(matchId, language);
    res.json({ success: true, summary, cached: false });
  },

  async getMatchContent(req: Request, res: Response) {
    const { matchId } = req.params;
    const language =
      typeof req.query.language === "string" ? req.query.language : "en";
    if (!["en", "fr"].includes(language))
      return res
        .status(400)
        .json({ success: false, error: "Invalid language" });

    const content = await aiService.getContent(matchId, language);
    const aiTexts = [];
    if (content.preview)
      aiTexts.push({ kind: "preview", language, content: content.preview });
    if (content.summary)
      aiTexts.push({ kind: "summary", language, content: content.summary });
    res.json(aiTexts);
  },

  async deleteMatchContent(req: Request, res: Response) {
    await aiService.clearCache(req.params.matchId);
    await aiSummaryRepository.deleteByMatch(req.params.matchId);
    res.json({ success: true, message: "AI content cleared" });
  },
};
