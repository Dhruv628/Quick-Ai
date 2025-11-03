import { Router } from "express";
import aiRoutes from "./ai-routes.js";
import userRoutes from "./user-routes.js";
import { auth } from "../middlwares/auth/auth.js";

const router = Router();

// * routes
router.use("/api/ai", auth, aiRoutes);
router.use("/api/user", auth, userRoutes);

export default router;
