import express from "express";
import { getAssistant, updateAssistant, askToAssistant, clearHistory } from "../controllers/assistantController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getAssistant);
router.post("/update", protect, updateAssistant);
router.post("/ask", protect, askToAssistant);
router.post("/clear-history", protect, clearHistory);

export default router;
