import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addExpType, editExpType, getExpType, getExpTypes } from "../controllers/expentypeController.js";

const router = express.Router();

router.get("/", authMiddleware, getExpTypes);
router.post("/add", authMiddleware, addExpType);
router.get("/:id", authMiddleware, getExpType);
router.patch("/:id", authMiddleware, editExpType); 

export default router;
