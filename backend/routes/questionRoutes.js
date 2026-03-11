import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createQuestion,
  deleteQuestion,
  getQuestionsByFolder,
  updateQuestion,
  fetchMetaFromLink,
  analyzeQuestionCode
} from "../controllers/questionController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/folder/:folderId", getQuestionsByFolder);
router.post("/meta", fetchMetaFromLink);
router.post("/analyze", analyzeQuestionCode);
router.post("/", createQuestion);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;