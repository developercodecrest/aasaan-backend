import RestaurentModel from "@/schemas/Stores/Restaurent";
import MenuItemModel from "@/schemas/Stores/MenuItem";
import { DefaultResponseBody } from "@/types/default";
import {
  CreateRestaurentDTO,
  UpdateRestaurentDTO,
  RestaurentFilterDTO,
  CreateRestaurentReviewDTO,
  CreateRestaurentMenuItemDTO,
  UpdateRestaurentMenuItemDTO,
  CreateRestaurentOperatingHoursDTO,
  UpdateRestaurentOperatingHoursDTO,
  NearbyRestaurentDTO,
  Restaurent,
} from "@/types/stores/restaurent";
import { Request, Response } from "express";
import { Types } from "mongoose";

/**
 * Get a single restaurant by ID or filters
 */
export const getRestaurent = async (
  req: Request<{ id?: string }, {}, {}, Partial<Restaurent>>,
  res: Response<DefaultResponseBody<Restaurent>>
) => {
  const { id } = req.params;
  const { name, phone } = req.query;

  try {
    const filters: Record<string, unknown> = {};

    if (id && Types.ObjectId.isValid(id)) {
      filters._id = new Types.ObjectId(id);
    }
    if (name) filters.name = new RegExp(name as string, "i");
    if (phone) filters.phone = new RegExp(phone as string, "i");

    const restaurent = await RestaurentModel.findOne(filters).lean();

    if (!restaurent) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Restaurant not found.",
        },
      });
      return;
    }

    res.status(200).json({
      data: restaurent as Restaurent,
      Status: {
        Code: 200,
        Message: "Restaurant found successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};

/**
 * Get multiple restaurants with optional filters
 */
export const getRestaurents = async (
  req: Request<{}, {}, {}, Partial<RestaurentFilterDTO & { searchBy?: string }>>,
  res: Response<DefaultResponseBody<Restaurent[]>>
) => {
  const { name, cuisine, minRating, isOpen, searchBy } = req.query;
  console.log('Received query parameters:', req.query);

  try {
    const filters: Record<string, unknown> = {};

    if (name) filters.name = new RegExp(name as string, "i");
    if (cuisine) {
      const cuisineArray = Array.isArray(cuisine) ? cuisine : [cuisine];
      filters.cuisine = { $in: cuisineArray };
    }
    if (minRating) filters.rating = { $gte: Number(minRating) };
    if (typeof isOpen !== "undefined") {
      filters.isOpen = String(isOpen) === "true" || isOpen === true;
    }
    if (searchBy) filters.$text = { $search: searchBy };

    const restaurents = await RestaurentModel.find(filters).lean();

    res.status(200).json({
      data: restaurents as Restaurent[],
      Status: {
        Code: 200,
        Message: "Restaurants retrieved successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};

/**
 * Create a new restaurant
 */
export const createRestaurent = async (
  req: Request<{}, {}, CreateRestaurentDTO>,
  res: Response<DefaultResponseBody<Restaurent>>
) => {
  const { name, address, phone, cuisine, images, description } = req.body;
  const createdBy = req.user?.userId;

  try {
    if (!createdBy) {
      res.status(401).json({
        data: null,
        Status: {
          Code: 401,
          Message: "Unauthorized: User information is missing.",
        },
      });
      return;
    }

    if (!name || !address || !phone) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Name, address, and phone are required fields.",
        },
      });
      return;
    }

    const newRestaurent = new RestaurentModel({
      name,
      address,
      phone,
      cuisine: cuisine || [],
      images: images || [],
      description: description || "",
      rating: 0,
      isOpen: true,
    });

    await newRestaurent.save();

    res.status(201).json({
      data: newRestaurent.toObject() as Restaurent,
      Status: {
        Code: 201,
        Message: "Restaurant created successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};

/**
 * Update a restaurant
 */
export const updateRestaurent = async (
  req: Request<{ id: string }, {}, UpdateRestaurentDTO>,
  res: Response<DefaultResponseBody<Restaurent>>
) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedBy = req.user?.userId;

  try {
    if (!updatedBy) {
      res.status(401).json({
        data: null,
        Status: {
          Code: 401,
          Message: "Unauthorized: User information is missing.",
        },
      });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid restaurant ID format.",
        },
      });
      return;
    }

    const restaurent = await RestaurentModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: updateData },
      { new: true }
    ).lean();

    if (!restaurent) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Restaurant not found.",
        },
      });
      return;
    }

    res.status(200).json({
      data: restaurent as Restaurent,
      Status: {
        Code: 200,
        Message: "Restaurant updated successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};

/**
 * Delete a restaurant
 */
export const deleteRestaurent = async (
  req: Request<{ id: string }>,
  res: Response<DefaultResponseBody<null>>
) => {
  const { id } = req.params;
  const deletedBy = req.user?.userId;

  try {
    if (!deletedBy) {
      res.status(401).json({
        data: null,
        Status: {
          Code: 401,
          Message: "Unauthorized: User information is missing.",
        },
      });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid restaurant ID format.",
        },
      });
      return;
    }

    const restaurent = await RestaurentModel.findByIdAndDelete(new Types.ObjectId(id));

    if (!restaurent) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Restaurant not found.",
        },
      });
      return;
    }

    res.status(200).json({
      data: null,
      Status: {
        Code: 200,
        Message: "Restaurant deleted successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};

/**
 * Toggle restaurant open/close status
 */
export const toggleRestaurentStatus = async (
  req: Request<{ id: string }>,
  res: Response<DefaultResponseBody<Restaurent>>
) => {
  const { id } = req.params;
  const updatedBy = req.user?.userId;

  try {
    if (!updatedBy) {
      res.status(401).json({
        data: null,
        Status: {
          Code: 401,
          Message: "Unauthorized: User information is missing.",
        },
      });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid restaurant ID format.",
        },
      });
      return;
    }

    const restaurent = await RestaurentModel.findById(new Types.ObjectId(id));

    if (!restaurent) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Restaurant not found.",
        },
      });
      return;
    }

    restaurent.isOpen = !restaurent.isOpen;
    await restaurent.save();

    res.status(200).json({
      data: restaurent.toObject() as Restaurent,
      Status: {
        Code: 200,
        Message: `Restaurant status changed to ${restaurent.isOpen ? "open" : "closed"}.`,
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};

/**
 * Add a review to a restaurant
 */
export const addReview = async (
  req: Request<{ id: string }, {}, Omit<CreateRestaurentReviewDTO, "restaurentId">>,
  res: Response<DefaultResponseBody<Restaurent>>
) => {
  const { id } = req.params;
  const { userId, rating, comment } = req.body;
  const reviewBy = req.user?.userId;

  try {
    if (!reviewBy) {
      res.status(401).json({
        data: null,
        Status: {
          Code: 401,
          Message: "Unauthorized: User information is missing.",
        },
      });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid restaurant ID format.",
        },
      });
      return;
    }

    if (!rating || rating < 0 || rating > 5) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Rating must be between 0 and 5.",
        },
      });
      return;
    }

    const restaurent = await RestaurentModel.findById(new Types.ObjectId(id));

    if (!restaurent) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Restaurant not found.",
        },
      });
      return;
    }

    const review = {
      restaurentId: new Types.ObjectId(id),
      userId: userId || new Types.ObjectId(reviewBy),
      rating,
      comment: comment || "",
      createdAt: new Date(),
    };

    await (restaurent as any).addReview(review);

    res.status(201).json({
      data: restaurent.toObject() as Restaurent,
      Status: {
        Code: 201,
        Message: "Review added successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};

/**
 * Get all reviews for a restaurant
 */
export const getRestaurentReviews = async (
  req: Request<{ id: string }>,
  res: Response<DefaultResponseBody<any[]>>
) => {
  const { id } = req.params;

  try {
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid restaurant ID format.",
        },
      });
      return;
    }

    const restaurent = await RestaurentModel.findById(new Types.ObjectId(id))
      .select("reviews")
      .lean();

    if (!restaurent) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Restaurant not found.",
        },
      });
      return;
    }

    res.status(200).json({
      data: (restaurent as any).reviews || [],
      Status: {
        Code: 200,
        Message: "Reviews retrieved successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};

// Menu item operations (addMenuItem, updateMenuItem, deleteMenuItem) 
// have been moved to MenuItem controller (src/controllers/Stores/MenuItem.ts)

/**
 * Get restaurant menu
 */
export const getRestaurentMenu = async (
  req: Request<{ id: string }>,
  res: Response<DefaultResponseBody<any[]>>
) => {
  const { id } = req.params;

  try {
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid restaurant ID format.",
        },
      });
      return;
    }

    const restaurent = await RestaurentModel.findById(new Types.ObjectId(id));

    if (!restaurent) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Restaurant not found.",
        },
      });
      return;
    }

    // Fetch menu items from MenuItem collection
    const menuItems = await MenuItemModel.find({
      restaurentId: new Types.ObjectId(id),
    }).lean();

    res.status(200).json({
      data: menuItems,
      Status: {
        Code: 200,
        Message: "Menu retrieved successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};

/**
 * Add operating hours
 */
export const addOperatingHours = async (
  req: Request<{ id: string }, {}, Omit<CreateRestaurentOperatingHoursDTO, "restaurentId">>,
  res: Response<DefaultResponseBody<Restaurent>>
) => {
  const { id } = req.params;
  const { dayOfWeek, openTime, closeTime } = req.body;
  const createdBy = req.user?.userId;

  try {
    if (!createdBy) {
      res.status(401).json({
        data: null,
        Status: {
          Code: 401,
          Message: "Unauthorized: User information is missing.",
        },
      });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid restaurant ID format.",
        },
      });
      return;
    }

    if (!dayOfWeek || !openTime || !closeTime) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "dayOfWeek, openTime, and closeTime are required.",
        },
      });
      return;
    }

    const restaurent = await RestaurentModel.findById(new Types.ObjectId(id));

    if (!restaurent) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Restaurant not found.",
        },
      });
      return;
    }

    const operatingHours = {
      _id: new Types.ObjectId(),
      dayOfWeek,
      openTime,
      closeTime,
    };

    if (!restaurent.operatingHours) restaurent.operatingHours = [];
    (restaurent.operatingHours as any).push(operatingHours);
    await restaurent.save();

    res.status(201).json({
      data: restaurent.toObject() as Restaurent,
      Status: {
        Code: 201,
        Message: "Operating hours added successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};

/**
 * Update operating hours
 */
export const updateOperatingHours = async (
  req: Request<{ id: string; hoursId: string }, {}, UpdateRestaurentOperatingHoursDTO>,
  res: Response<DefaultResponseBody<Restaurent>>
) => {
  const { id, hoursId } = req.params;
  const updateData = req.body;
  const updatedBy = req.user?.userId;

  try {
    if (!updatedBy) {
      res.status(401).json({
        data: null,
        Status: {
          Code: 401,
          Message: "Unauthorized: User information is missing.",
        },
      });
      return;
    }

    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(hoursId)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid ID format.",
        },
      });
      return;
    }

    const restaurent = await RestaurentModel.findById(new Types.ObjectId(id));

    if (!restaurent) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Restaurant not found.",
        },
      });
      return;
    }

    const operatingHours = (restaurent.operatingHours || []) as any[];
    const hoursIndex = operatingHours.findIndex(
      (hours: any) => hours._id?.toString() === hoursId
    );

    if (hoursIndex === -1) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Operating hours not found.",
        },
      });
      return;
    }

    Object.assign(operatingHours[hoursIndex], updateData);
    await restaurent.save();

    res.status(200).json({
      data: restaurent.toObject() as Restaurent,
      Status: {
        Code: 200,
        Message: "Operating hours updated successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};

/**
 * Get nearby restaurants based on location
 */
export const getNearbyRestaurents = async (
  req: Request<{}, {}, NearbyRestaurentDTO>,
  res: Response<DefaultResponseBody<Restaurent[]>>
) => {
  const { latitude, longitude, radius } = req.body;

  try {
    if (typeof latitude !== "number" || typeof longitude !== "number" || typeof radius !== "number") {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Latitude, longitude, and radius are required and must be numbers.",
        },
      });
      return;
    }

    const restaurents = await RestaurentModel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius,
        },
      },
    }).lean();

    res.status(200).json({
      data: restaurents as Restaurent[],
      Status: {
        Code: 200,
        Message: "Nearby restaurants retrieved successfully.",
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error.",
      },
    });
  }
};
