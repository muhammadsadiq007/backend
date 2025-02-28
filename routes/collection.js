import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addCollection,getCollections,getCollection, getLegder, statusUnpaid, statusPaid, renewClient, delCollection, addAmount, otherAmount, deleteAmount, addAdvance } from "../controllers/collectionController.js";
import { permissionCheck } from "../middleware/roleCheck.js";

const   router = express.Router();
 
router.post("/add/:id", authMiddleware, permissionCheck("clientpayments"), addCollection);  // Add Collection
router.post("/other/:id", authMiddleware, permissionCheck("clientpayments"), otherAmount);   // Recevie Balance Amount
router.post("/advance/:id", authMiddleware, permissionCheck("clientpayments"), addAdvance); // Advaance Collection Skip Current Month
router.post("/addamount/:id", authMiddleware, permissionCheck("clientpayments"), addAmount); // Add Other Amount in Client Balance
router.get("/", authMiddleware, getCollections);
router.get("/:id", authMiddleware, getCollection);   
// router.get("status/:id", authMiddleware, getStatus);
router.patch("/unpaid/:id", authMiddleware, permissionCheck("paymentstatus"), statusUnpaid); // Collection Reversal
router.patch("/paid/:id", authMiddleware, permissionCheck("paymentstatus"), statusPaid);  // No Need for this now
router.get("/legder/:id", authMiddleware, permissionCheck("clientlegder"), getLegder);   // Client Legder
router.post("/renew/:id", authMiddleware, permissionCheck("clientpayments"), renewClient);  // Renew Collection & add days amount
router.delete("/delete/:id", authMiddleware, permissionCheck("deletepayment"), delCollection);  // Delete Collection
router.delete("/deleteamount/:id", authMiddleware, permissionCheck("deletepayment"), deleteAmount); // Delete Amount


export default router;