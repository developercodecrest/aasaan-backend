import { Router } from "express";
import {
  getMenuItem,
  getMenuItems,
  getRestaurentMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  getMenuItemsByCategory,
  bulkCreateMenuItems,
  getPopularItems,
} from "@/controllers/Stores/MenuItem";

const router = Router();

// Core CRUD operations
router.get("/", getMenuItems);
router.get("/popular", getPopularItems);
router.get("/:id", getMenuItem);
router.post("/", createMenuItem);
router.put("/:id", updateMenuItem);
router.delete("/:id", deleteMenuItem);

// Bulk operations
router.post("/bulk", bulkCreateMenuItems);

// Availability management
router.patch("/:id/toggle-availability", toggleMenuItemAvailability);

// Restaurant-specific operations
router.get("/restaurent/:restaurentId", getRestaurentMenuItems);
router.get("/restaurent/:restaurentId/category/:category", getMenuItemsByCategory);

export default router;
