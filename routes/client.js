import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addClients, editClient, getClient, getClients, activateMonthlyClient, deactivateClient, activateVariableClient } from "../controllers/clientController.js";
import { permissionCheck } from "../middleware/roleCheck.js";

const router = express.Router();

router.get("/", authMiddleware, getClients);
router.get("/:id", authMiddleware, getClient); 
router.patch("/:id", authMiddleware, permissionCheck("editclient"), editClient);
router.post("/add", authMiddleware, permissionCheck("addclient"), addClients);
router.patch("/Variable/:id", authMiddleware, permissionCheck("changestatus"),activateVariableClient);
router.patch("/Monthly/:id", authMiddleware, permissionCheck("changestatus"),activateMonthlyClient);
router.patch("/deactivate/:id", authMiddleware,permissionCheck("changestatus"), deactivateClient); 

export default router;
