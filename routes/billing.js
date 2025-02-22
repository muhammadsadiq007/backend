import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/billing", authMiddleware);

export default router;
