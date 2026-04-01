import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import adminRoutes from "./admin.routes.js";
import aiRoutes from "./ai.routes.js";
import authRoutes from "./auth.routes.js";
import billingRoutes from "./billing.routes.js";
import contactRoutes from "./contact.routes.js";
import publicRoutes from "./public.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/", publicRoutes);
router.use("/admin", requireAuth, requireAdmin, adminRoutes);
router.use("/billing", billingRoutes);
router.use("/ai", aiRoutes);
router.use("/contact", contactRoutes);

export default router;
