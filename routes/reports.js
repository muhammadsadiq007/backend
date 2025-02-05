import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { activityLogs, clientbBadDebt, clientreports, collectionReports, monthlyReports } from "../controllers/reportsController.js";

const router = express.Router();

router.post("/", authMiddleware, collectionReports);
router.get("/clientbalance", authMiddleware, clientreports);
router.get("/clientbaddebt", authMiddleware, clientbBadDebt);
router.post("/monthlyreports", authMiddleware, monthlyReports);
router.post("/activitylogs", authMiddleware, activityLogs); 

export default router;