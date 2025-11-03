import { Router } from "express";
import { upload, handleMulterError } from "../config/multer.js";
import * as aiControllers from "../controllers/ai-controllers.js";

const router = Router();

router.post("/article", aiControllers.generateArticle);
router.post("/blog-titles", aiControllers.generateBlogTitles);
router.post("/image", aiControllers.generateImage);
router.post(
  "/remove/background",
  upload("image"),
  handleMulterError,
  aiControllers.removeBackground
);
router.post(
  "/remove/object",
  upload("image"),
  handleMulterError,
  aiControllers.removeObject
);
router.post(
  "/review/resume",
  upload("resume"),
  handleMulterError,
  aiControllers.resumeReview
);

export default router;
