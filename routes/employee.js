import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addEmployee, getEmployees, getEmployee, editEmployee } from "../controllers/employeeController.js";

const   router = express.Router();

router.get("/", authMiddleware, getEmployees);
router.get("/:id", authMiddleware, getEmployee);
router.patch("/:id", authMiddleware, editEmployee);
router.post("/add", authMiddleware, addEmployee);

export default router;
