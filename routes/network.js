import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addNetwork, editNetworkPassword,editNetworkPermission, getNetworkData, getNetworks } from "../controllers/networkController.js";

const router = express.Router();

router.post("/add", authMiddleware ,addNetwork);
router.get("/", authMiddleware ,getNetworks);
router.get("/:id", authMiddleware, getNetworkData); 
router.patch("/password/:id", authMiddleware, editNetworkPassword); 
router.patch("/permissions/:id", authMiddleware, editNetworkPermission); 



export default router;
