import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addCollection,getCollections,getCollection, getLegder, editStatus } from "../controllers/collectionController.js";

const   router = express.Router();

router.post("/add/:id", authMiddleware, addCollection);
router.get("/", authMiddleware, getCollections);
router.get("/:id", authMiddleware, getCollection);
// router.get("status/:id", authMiddleware, getStatus);
router.patch("/:id", authMiddleware, editStatus);
router.get("/legder/:id", authMiddleware, getLegder);


export default router; 