import { Router } from "express";
import authRoutes from "./auth.routes.js";
import publicRoutes from "./public.routes.js";
import adminRoutes from "./admin.routes.js";
import billingRoutes from "./billing.routes.js";
import aiRoutes from "./ai.routes.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/", publicRoutes);
router.use("/admin", requireAuth, requireAdmin, adminRoutes);
router.use("/billing", billingRoutes);
router.use("/ai", aiRoutes);

export default router;
