import express from "express"; 
import authMiddleware from "../middleware/authMiddleware.js";
import { getDashboard, getEmployeeDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", authMiddleware, getDashboard);
router.get("/employee/", authMiddleware, getEmployeeDashboard);


export default router; 
