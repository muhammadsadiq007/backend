import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addExpense, getExpense } from "../controllers/expenseController.js";

const router = express.Router();

router.post("/add", authMiddleware, addExpense);
router.get("/", authMiddleware, getExpense);

export default router;  