import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addPaymethod, editPaymethod, getPaymethod, getPaymethods } from "../controllers/paymethodController.js";

const router = express.Router();

router.get("/", authMiddleware, getPaymethods);
router.post("/add", authMiddleware, addPaymethod);
router.get("/:id", authMiddleware, getPaymethod);
router.patch("/:id", authMiddleware, editPaymethod);

export default router;
