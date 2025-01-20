import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addClients, editClient, getClient, getClients, activateClient, deactivateClient } from "../controllers/clientController.js";

const router = express.Router();

router.get("/", authMiddleware, getClients);
router.get("/:id", authMiddleware, getClient);
router.patch("/:id", authMiddleware, editClient);
router.post("/add", authMiddleware, addClients);
router.patch("/activate/:id", authMiddleware, activateClient);

router.patch("/deactivate/:id", authMiddleware, deactivateClient);

export default router;
