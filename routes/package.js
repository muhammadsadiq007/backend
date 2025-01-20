import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addPackage,
 getPackages,
 getPackage,
  editPackage,
  // deletePackage,
} from "../controllers/packageController.js";

const router = express.Router();

router.get("/", authMiddleware, getPackages);
router.post("/add", authMiddleware, addPackage);
router.get("/:id", authMiddleware, getPackage);
router.patch("/:id", authMiddleware, editPackage);
// router.delete("/:id", authMiddleware, deletePackage);

export default router;
