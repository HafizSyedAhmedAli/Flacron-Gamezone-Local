import { Router } from "express";
import { z } from "zod";
import { aiController } from "../controllers/ai.controller.js";
import { requireAuth, requirePremium } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const generateSchema = z.object({
  matchId: z.string(),
  language: z.enum(["en", "fr"]).default("en"),
  regenerate: z.boolean().default(false),
});

const router = Router();

router.use(requireAuth, requirePremium);

router.post(
  "/preview",
  validateBody(generateSchema),
  asyncHandler(aiController.generatePreview),
);
router.post(
  "/summary",
  validateBody(generateSchema),
  asyncHandler(aiController.generateSummary),
);
router.get("/:matchId", asyncHandler(aiController.getMatchContent));
router.delete("/:matchId", asyncHandler(aiController.deleteMatchContent));

export default router;
