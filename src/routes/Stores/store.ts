import { Router } from "express";
import {
  getStores,
  getStoreById,
  getStoresByType,
  getStoreItems,
  updateStoreStatus,
  getStoreStats,
} from "@/controllers/Stores/Store";

const router = Router();

// Unified store endpoints
router.get("/", getStores); // Get all stores with filters
router.get("/type/:storeType", getStoresByType); // Get stores by type (restaurents, medical, grocery, clothes)

export default router;
