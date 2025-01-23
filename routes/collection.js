import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addCollection,getCollections,getCollection, getLegder, statusUnpaid, statusPaid } from "../controllers/collectionController.js";

const   router = express.Router();

router.post("/add/:id", authMiddleware, addCollection);
router.get("/", authMiddleware, getCollections);
router.get("/:id", authMiddleware, getCollection);
// router.get("status/:id", authMiddleware, getStatus);
router.patch("/unpaid/:id", authMiddleware, statusUnpaid); 
router.patch("/paid/:id", authMiddleware, statusPaid);
router.get("/legder/:id", authMiddleware, getLegder);


export default router; 