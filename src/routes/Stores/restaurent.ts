import { Router } from "express";
import {
  getRestaurent,
  getRestaurents,
  createRestaurent,
  updateRestaurent,
  deleteRestaurent,
  addReview,
  addOperatingHours,
  updateOperatingHours,
  toggleRestaurentStatus,
  getNearbyRestaurents,
  getRestaurentMenu,
  getRestaurentReviews,
} from "@/controllers/Stores/Restaurent";

const restaurentRouter = Router();

// Core CRUD operations
restaurentRouter.get("/", getRestaurents);
restaurentRouter.get("/:id", getRestaurent);
restaurentRouter.post("/", createRestaurent);
restaurentRouter.put("/:id", updateRestaurent);
restaurentRouter.delete("/:id", deleteRestaurent);

// Status management
restaurentRouter.patch("/:id/toggle-status", toggleRestaurentStatus);

// Review operations
restaurentRouter.post("/:id/reviews", addReview);
restaurentRouter.get("/:id/reviews", getRestaurentReviews);

// Menu operations (now in separate MenuItem routes)
restaurentRouter.get("/:id/menu", getRestaurentMenu);

// Operating hours
restaurentRouter.post("/:id/operating-hours", addOperatingHours);
restaurentRouter.put("/:id/operating-hours/:hoursId", updateOperatingHours);

// Location-based search
restaurentRouter.post("/nearby", getNearbyRestaurents);

export default restaurentRouter;
