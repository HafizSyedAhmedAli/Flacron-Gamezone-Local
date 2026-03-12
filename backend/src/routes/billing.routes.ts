import { Router } from "express";
import express from "express";
import { billingController } from "../controllers/billing.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const router = Router();

// Stripe webhook — raw body required, placed BEFORE json() middleware
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(billingController.webhook),
);

router.use(requireAuth);

router.post("/checkout", asyncHandler(billingController.checkout));
router.get("/subscription", asyncHandler(billingController.getSubscription));
router.post("/cancel", asyncHandler(billingController.cancel));
router.post("/reactivate", asyncHandler(billingController.reactivate));
router.post("/portal", asyncHandler(billingController.portal));

export default router;
