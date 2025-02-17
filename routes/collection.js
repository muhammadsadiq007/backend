import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addCollection,getCollections,getCollection, getLegder, statusUnpaid, statusPaid, renewClient, delCollection, addAmount, otherAmount } from "../controllers/collectionController.js";
import { permissionCheck } from "../middleware/roleCheck.js";

const   router = express.Router();
 
router.post("/add/:id", authMiddleware, permissionCheck("clientpayments"), addCollection);
router.post("/other/:id", authMiddleware, permissionCheck("clientpayments"), otherAmount);
router.post("/addamount/:id", authMiddleware, permissionCheck("clientpayments"), addAmount);
router.get("/", authMiddleware, getCollections);
router.get("/:id", authMiddleware, getCollection);
// router.get("status/:id", authMiddleware, getStatus);
router.patch("/unpaid/:id", authMiddleware, permissionCheck("paymentstatus"), statusUnpaid); 
router.patch("/paid/:id", authMiddleware, permissionCheck("paymentstatus"), statusPaid);
router.get("/legder/:id", authMiddleware, permissionCheck("clientlegder"), getLegder);
router.post("/renew/:id", authMiddleware, permissionCheck("clientpayments"), renewClient);
router.delete("/delete/:id", authMiddleware, permissionCheck("deletepayment"), delCollection);


export default router;