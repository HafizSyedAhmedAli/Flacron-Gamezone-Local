import type { Request, Response } from "express";
import { leagueService } from "../services/league.service.js";
import { teamService } from "../services/team.service.js";
import { matchService } from "../services/match.service.js";
import { streamService } from "../services/stream.service.js";
import { aiService } from "../services/ai.service.js";
import { aiSummaryRepository } from "../repositories/aiSummary.repository.js";
import { matchRepository } from "../repositories/match.repository.js";
import { userRepository } from "../repositories/user.repository.js";

function pagination(req: Request) {
  return {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 100,
  };
}

// ─── Leagues ──────────────────────────────────────────────────────────────────

export const adminLeagueController = {
  async getFromApi(req: Request, res: Response) {
    const { page, limit } = pagination(req);
    const result = await leagueService.fetchFromApi(page, limit);
    res.json({ success: true, ...result });
  },

  async getSaved(req: Request, res: Response) {
    const result = await leagueService.getPaginated(pagination(req));
    res.json({ leagues: result.data, pagination: result.pagination });
  },

  async create(req: Request, res: Response) {
    const league = await leagueService.create((req as any).validated);
    res.json(league);
  },

  async update(req: Request, res: Response) {
    const league = await leagueService.update(
      req.params.id,
      (req as any).validated,
    );
    res.json(league);
  },

  async delete(req: Request, res: Response) {
    await leagueService.delete(req.params.id);
    res.json({ ok: true });
  },
};

// ─── Teams ────────────────────────────────────────────────────────────────────

export const adminTeamController = {
  async getFromApi(req: Request, res: Response) {
    const { page, limit } = pagination(req);
    const leagueId =
      typeof req.query.leagueId === "string" ? req.query.leagueId : null;
    const result = await teamService.fetchFromApi(leagueId, page, limit);
    res.json({ success: true, ...result });
  },

  async getSaved(req: Request, res: Response) {
    const result = await teamService.getPaginated(pagination(req));
    res.json({ teams: result.data, pagination: result.pagination });
  },

  async create(req: Request, res: Response) {
    const team = await teamService.create((req as any).validated);
    res.status(201).json({
      success: true,
      message: `Added ${(team as any).name}`,
    });
  },

  async update(req: Request, res: Response) {
    const team = await teamService.update(
      req.params.id,
      (req as any).validated,
    );
    res.json(team);
  },

  async delete(req: Request, res: Response) {
    await teamService.delete(req.params.id);
    res.json({ ok: true });
  },
};

// ─── Matches ──────────────────────────────────────────────────────────────────

export const adminMatchController = {
  async getFromApi(req: Request, res: Response) {
    const { page, limit } = pagination(req);
    const result = await matchService.fetchFromApi({
      leagueId:
        typeof req.query.leagueId === "string" && req.query.leagueId.trim()
          ? req.query.leagueId.trim()
          : null,
      date:
        typeof req.query.date === "string" && req.query.date.trim()
          ? req.query.date.trim()
          : null,
      status:
        typeof req.query.status === "string" && req.query.status.trim()
          ? req.query.status.trim()
          : null,
      page,
      limit,
    });
    res.json({
      success: true,
      matches: result.data,
      total: result.pagination.total,
      pagination: result.pagination,
    });
  },

  async getSaved(req: Request, res: Response) {
    const result = await matchService.getPaginated(pagination(req));
    res.json({ matches: result.data, pagination: result.pagination });
  },

  async create(req: Request, res: Response) {
    const match = await matchService.create((req as any).validated);
    res.json(match);
  },

  async update(req: Request, res: Response) {
    const match = await matchService.update(
      req.params.id,
      (req as any).validated,
    );
    res.json(match);
  },

  async delete(req: Request, res: Response) {
    await matchService.delete(req.params.id);
    res.json({ ok: true });
  },

  async sync(req: Request, res: Response) {
    const liveIds = await matchService.syncLiveFromApi();
    const liveCount = await matchRepository.countLive();
    res.json({ success: true, synced: liveIds.length, live: liveCount });
  },
};

// ─── Streams ──────────────────────────────────────────────────────────────────

export const adminStreamController = {
  async upsert(req: Request, res: Response) {
    const stream = await streamService.upsert((req as any).validated);
    res.json(stream);
  },

  async findForMatch(req: Request, res: Response) {
    const stream = await streamService.findStreamForMatch(req.params.id);
    if (!stream)
      return res
        .status(404)
        .json({ error: "No stream found or quota exceeded" });
    res.json(stream);
  },
};

// ─── AI ───────────────────────────────────────────────────────────────────────

export const adminAiController = {
  async generatePreview(req: Request, res: Response) {
    const { matchId, language } = (req as any).validated;
    const preview = await aiService.generateMatchPreview(matchId, language);
    res.json({ success: true, preview });
  },

  async generateSummary(req: Request, res: Response) {
    const { matchId, language } = (req as any).validated;
    const summary = await aiService.generateMatchSummary(matchId, language);
    res.json({ success: true, summary });
  },

  async deleteContent(req: Request, res: Response) {
    await aiService.clearCache(req.params.matchId);
    await aiSummaryRepository.deleteByMatch(req.params.matchId);
    res.json({ success: true, message: "AI content cleared" });
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const adminUserController = {
  async getAll(_req: Request, res: Response) {
    const users = await userRepository.findAll();
    res.json(users);
  },
};
