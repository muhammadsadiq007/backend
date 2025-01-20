import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addNetwork, getNetworks } from "../controllers/networkController.js";

const router = express.Router();

router.post("/add", authMiddleware ,addNetwork);
router.get("/", authMiddleware ,getNetworks);

export default router;
