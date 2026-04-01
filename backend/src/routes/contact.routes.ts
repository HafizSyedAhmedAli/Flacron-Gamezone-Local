import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import rateLimit from "express-rate-limit";
import { contactController } from "../controllers/contact.controller.js";

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 submissions per IP per window
  message: { error: "Too many submissions. Please try again later." },
});

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
});

const router = Router();
router.post(
  "/",
  contactLimiter,
  validateBody(contactSchema),
  asyncHandler(contactController.send)
);

export default router;