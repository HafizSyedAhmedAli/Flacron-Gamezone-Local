import { Router } from "express";
import { publicController } from "../controllers/public.controller.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const router = Router();

// Leagues
router.get("/leagues", asyncHandler(publicController.getLeagues));
router.get("/leagues/:id", asyncHandler(publicController.getLeagueById));

// Teams
router.get("/teams", asyncHandler(publicController.getTeams));
router.get("/teams/:id", asyncHandler(publicController.getTeamById));

// Matches
router.get("/matches", asyncHandler(publicController.getMatches));
router.get("/matches/live", asyncHandler(publicController.getLiveMatches));
router.get("/matches/:id", asyncHandler(publicController.getMatchById));

// Streams
router.get(
  "/streams/:id/status",
  asyncHandler(publicController.getStreamStatus),
);

// Search
router.get("/search", asyncHandler(publicController.search));

export default router;
