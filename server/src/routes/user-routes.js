import { Router } from "express";
import * as userControllers from "../controllers/user-controllers.js";

const router = Router();

router.get("/creations", userControllers.getUserCreations);
router.post("/creations/:creationId/like", userControllers.likeCreation);
router.get("/creations/public", userControllers.getPublicCreations);

export default router;
