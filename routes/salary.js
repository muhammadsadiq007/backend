import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addSalary, getMonthlySalaries, getSalaries, getSalary } from "../controllers/salaryController.js";

const   router = express.Router();

router.post("/add", authMiddleware, addSalary);

router.get("/:id", authMiddleware, getSalary);
router.get("/", authMiddleware, getSalaries);
router.post("/", authMiddleware, getMonthlySalaries);



export default router;