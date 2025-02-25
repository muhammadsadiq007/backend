import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateMonthlyBills, getBillingSummary } from "../controllers/billingContoller.js";

const router = express.Router();
getBillingSummary

router.post("/", authMiddleware, generateMonthlyBills);
router.get("/", authMiddleware, getBillingSummary);

export default router;
