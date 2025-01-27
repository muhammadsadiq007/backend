import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { clientreports, collectionReports, monthlyReports } from "../controllers/reportsController.js";

const router = express.Router();

router.post("/", authMiddleware, collectionReports);
router.get("/clientbalance", authMiddleware, clientreports);
router.post("/monthlyreports", authMiddleware, monthlyReports);

export default router;