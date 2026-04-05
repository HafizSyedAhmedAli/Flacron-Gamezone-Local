import type { Request, Response } from "express";
import { leagueService } from "../services/league.service.js";
import { teamService } from "../services/team.service.js";
import { matchService } from "../services/match.service.js";
import { streamService } from "../services/stream.service.js";
import { youtubeService } from "../services/youtube.service.js";

export const publicController = {
  async getLeagues(_req: Request, res: Response) {
    const leagues = await leagueService.getAll();
    res.json({ success: true, leagues });
  },

  async getLeagueById(req: Request, res: Response) {
    const details = await matchService.getLeagueDetails(req.params.id);
    res.json(details);
  },

  async getTeams(req: Request, res: Response) {
    const q = String(req.query.q ?? "").trim();
    const teams = await teamService.getAllWithStats(q || undefined);
    res.json(teams);
  },

  async getTeamById(req: Request, res: Response) {
    const details = await matchService.getTeamDetails(req.params.id);
    res.json(details);
  },

  async getMatches(req: Request, res: Response) {
    const status = String(req.query.status ?? "").toUpperCase() as any;
    const matches = await matchService.getAll({
      status: ["LIVE", "UPCOMING", "FINISHED"].includes(status)
        ? status
        : undefined,
      leagueId: String(req.query.leagueId ?? "") || undefined,
      teamId: String(req.query.teamId ?? "") || undefined,
      date: String(req.query.date ?? "") || undefined,
    });
    res.json(matches);
  },

  async getLiveMatches(_req: Request, res: Response) {
    // await matchService.syncLiveFromApi();
    // youtubeService
    //   .refreshAllLiveStreams()
    //   .catch((e) => console.error("[YouTube] refreshAllLiveStreams error:", e));
    const liveMatches = await matchService.getAll({ status: "LIVE" });
    // console.log("liveMatches in publicController:", liveMatches);
    
    res.json(liveMatches);
  },

  async getMatchById(req: Request, res: Response) {
    const match = await matchService.getByIdForUser(
      req.params.id,
      req.headers.authorization,
    );
    if (!match) return res.status(404).json({ error: "Not found" });
    res.json(match);
  },

  async getStreamStatus(req: Request, res: Response) {
    const status = await streamService.getStreamStatus(req.params.id);
    res.json(status);
  },

  async search(req: Request, res: Response) {
    const q = String(req.query.q ?? "").trim();
    const results = await matchService.search(q);
    res.json(results);
  },
};
