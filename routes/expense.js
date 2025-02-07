import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addExpense, addExpHead, addExpType, editExpType, getExpense, getExpHead, getExpType, getExpTypes, getMonthlyExpense } from "../controllers/expenseController.js";

const router = express.Router();

// Expense Routes
router.post("/add", authMiddleware, addExpense);
router.post("/", authMiddleware, getMonthlyExpense);
router.get("/", authMiddleware, getExpense);
// Expense Head Routes
router.post("/addhead", authMiddleware, addExpHead);
router.get("/exphead", authMiddleware, getExpHead); 
// Expense Sub-Head Routes
router.get("/exptype", authMiddleware, getExpTypes);
router.post("/addtype", authMiddleware, addExpType);
router.get("/exptype/:id", authMiddleware, getExpType);
router.patch("/exptype/:id", authMiddleware, editExpType); 

export default router;   