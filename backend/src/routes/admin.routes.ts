import { Router } from "express";
import { z } from "zod";
import {
  adminLeagueController,
  adminTeamController,
  adminMatchController,
  adminStreamController,
  adminAiController,
  adminUserController,
} from "../controllers/admin.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const router = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const leagueCreateSchema = z.object({
  name: z.string().min(1),
  country: z.string().optional(),
  logo: z.string().optional(),
  apiLeagueId: z.number().optional(),
});

const leagueUpdateSchema = leagueCreateSchema.partial();

const teamCreateSchema = z.object({
  name: z.string().min(1),
  logo: z.string().optional(),
  apiTeamId: z.number().optional(),
  leagueId: z.string(),
});

const teamUpdateSchema = teamCreateSchema.partial();

const matchCreateSchema = z.object({
  leagueId: z.string().nullable().optional(),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  kickoffTime: z.string(),
  status: z.enum(["UPCOMING", "LIVE", "FINISHED"]).optional(),
  score: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  apiFixtureId: z.number().nullable().optional(),
});

const matchUpdateSchema = matchCreateSchema.partial();

const streamUpsertSchema = z.object({
  matchId: z.string(),
  type: z.enum(["EMBED", "NONE"]),
  provider: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  youtubeVideoId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const aiSchema = z.object({
  matchId: z.string(),
  language: z.enum(["en", "fr"]).default("en"),
});

// ─── Leagues ──────────────────────────────────────────────────────────────────

router.get("/leagues/api", asyncHandler(adminLeagueController.getFromApi));
router.get("/leagues", asyncHandler(adminLeagueController.getSaved));
router.post(
  "/leagues",
  validateBody(leagueCreateSchema),
  asyncHandler(adminLeagueController.create),
);
router.put(
  "/leagues/:id",
  validateBody(leagueUpdateSchema),
  asyncHandler(adminLeagueController.update),
);
router.delete("/leagues/:id", asyncHandler(adminLeagueController.delete));

// ─── Teams ────────────────────────────────────────────────────────────────────

router.get("/teams/api", asyncHandler(adminTeamController.getFromApi));
router.get("/teams", asyncHandler(adminTeamController.getSaved));
router.post(
  "/teams",
  validateBody(teamCreateSchema),
  asyncHandler(adminTeamController.create),
);
router.put(
  "/teams/:id",
  validateBody(teamUpdateSchema),
  asyncHandler(adminTeamController.update),
);
router.delete("/teams/:id", asyncHandler(adminTeamController.delete));

// ─── Matches ──────────────────────────────────────────────────────────────────

router.get("/matches/api", asyncHandler(adminMatchController.getFromApi));
router.get("/matches", asyncHandler(adminMatchController.getSaved));
router.post(
  "/matches",
  validateBody(matchCreateSchema),
  asyncHandler(adminMatchController.create),
);
router.put(
  "/matches/:id",
  validateBody(matchUpdateSchema),
  asyncHandler(adminMatchController.update),
);
router.delete("/matches/:id", asyncHandler(adminMatchController.delete));
router.post("/matches/sync", asyncHandler(adminMatchController.sync));

// ─── Streams ──────────────────────────────────────────────────────────────────

router.post(
  "/streams",
  validateBody(streamUpsertSchema),
  asyncHandler(adminStreamController.upsert),
);
router.post(
  "/streams/:id/find",
  asyncHandler(adminStreamController.findForMatch),
);

// ─── AI ───────────────────────────────────────────────────────────────────────

router.post(
  "/ai/preview",
  validateBody(aiSchema),
  asyncHandler(adminAiController.generatePreview),
);
router.post(
  "/ai/summary",
  validateBody(aiSchema),
  asyncHandler(adminAiController.generateSummary),
);
router.delete("/ai/:matchId", asyncHandler(adminAiController.deleteContent));

// ─── Users ────────────────────────────────────────────────────────────────────

router.get("/users", asyncHandler(adminUserController.getAll));

export default router;
