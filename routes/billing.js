import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateMonthlyBills, getBillingSummary, tvMonthlyBills } from "../controllers/billingContoller.js";

const router = express.Router();
getBillingSummary

router.post("/", authMiddleware, generateMonthlyBills);
router.post("/tv", authMiddleware, tvMonthlyBills);
router.get("/", authMiddleware, getBillingSummary);

export default router;
