import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const router = Router();

router.post(
  "/signup",
  validateBody(signupSchema),
  asyncHandler(authController.signup),
);
router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(authController.login),
);

export default router;
