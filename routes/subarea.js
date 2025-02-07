import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getSubarea, addSubarea, getSubareas, editSubarea } from "../controllers/subareaController.js";

const   router = express.Router();

router.get("/", authMiddleware, getSubareas);
router.get("/:id", authMiddleware, getSubarea); 
router.patch("/edit/:id", authMiddleware, editSubarea);
router.post("/add", authMiddleware, addSubarea);



export default router;