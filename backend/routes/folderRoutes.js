import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createFolder,
  deleteFolder,
  getFolders,
  renameFolder
} from "../controllers/folderController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getFolders);
router.post("/", createFolder);
router.put("/:id", renameFolder);
router.delete("/:id", deleteFolder);

export default router;