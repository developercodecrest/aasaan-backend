import MenuItemModel from "@/schemas/Stores/MenuItem";
import RestaurentModel from "@/schemas/Stores/Restaurent";
import { DefaultResponseBody } from "@/types/default";
import {
  MenuItem,
  CreateMenuItemDTO,
  UpdateMenuItemDTO,
  MenuItemFilterDTO,
} from "@/types/stores/menuItem";
import { Request, Response } from "express";
import { Types } from "mongoose";

/**
 * Get a single menu item by ID
 */
export const getMenuItem = async (
  req: Request<{ id: string }>,
  res: Response<DefaultResponseBody<MenuItem>>
) => {
  const { id } = req.params;

  try {
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid menu item ID format.",
        },
      });
      return;
    }

    const menuItem = await MenuItemModel.findById(new Types.ObjectId(id))
      .populate("restaurent", "name address")
      .lean();

    if (!menuItem) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Menu item not found.",
        },
      });
      return;
    }

    res.status(200).json({
      data: menuItem as MenuItem,
      Status: {
        Code: 200,
        Message: "Menu item found successfully.",
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
 * Get multiple menu items with optional filters
 */
export const getMenuItems = async (
  req: Request<{}, {}, {}, Partial<MenuItemFilterDTO>>,
  res: Response<DefaultResponseBody<MenuItem[]>>
) => {
  const { restaurentId, category, minPrice, maxPrice, isAvailable, searchBy } = req.query;

  try {
    const filters: Record<string, unknown> = {};

    if (restaurentId) {
      const idString = String(restaurentId);
      if (Types.ObjectId.isValid(idString)) {
        filters.restaurentId = new Types.ObjectId(idString);
      }
    }
    if (category) filters.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      filters.price = priceFilter;
    }
    if (typeof isAvailable !== "undefined") {
      filters.isAvailable = String(isAvailable) === "true" || isAvailable === true;
    }
    if (searchBy) filters.$text = { $search: searchBy };

    const menuItems = await MenuItemModel.find(filters)
      .populate("restaurent", "name address")
      .lean();

    res.status(200).json({
      data: menuItems as MenuItem[],
      Status: {
        Code: 200,
        Message: "Menu items retrieved successfully.",
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
 * Get all menu items for a specific restaurant
 */
export const getRestaurentMenuItems = async (
  req: Request<{ restaurentId: string }>,
  res: Response<DefaultResponseBody<MenuItem[]>>
) => {
  const { restaurentId } = req.params;

  try {
    if (!Types.ObjectId.isValid(restaurentId)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid restaurant ID format.",
        },
      });
      return;
    }

    // Check if restaurant exists
    const restaurent = await RestaurentModel.findById(new Types.ObjectId(restaurentId));
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

    const menuItems = await MenuItemModel.find({
      restaurentId: new Types.ObjectId(restaurentId),
    }).lean();

    res.status(200).json({
      data: menuItems as MenuItem[],
      Status: {
        Code: 200,
        Message: "Restaurant menu items retrieved successfully.",
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
 * Create a new menu item
 */
export const createMenuItem = async (
  req: Request<{}, {}, CreateMenuItemDTO>,
  res: Response<DefaultResponseBody<MenuItem>>
) => {
  const {
    restaurentId,
    name,
    description,
    price,
    category,
    image,
    isAvailable,
    preparationTime,
    ingredients,
    allergens,
    nutritionalInfo,
  } = req.body;
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

    if (!restaurentId || !Types.ObjectId.isValid(restaurentId as any)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Valid restaurant ID is required.",
        },
      });
      return;
    }

    if (!name || typeof price !== "number" || !category) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Name, price, and category are required fields.",
        },
      });
      return;
    }

    // Check if restaurant exists
    const restaurent = await RestaurentModel.findById(restaurentId);
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

    const newMenuItem = new MenuItemModel({
      restaurentId,
      name,
      description: description || "",
      price,
      category,
      image: image || "",
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      preparationTime: preparationTime || 0,
      ingredients: ingredients || [],
      allergens: allergens || [],
      nutritionalInfo: nutritionalInfo || {},
    });

    await newMenuItem.save();

    res.status(201).json({
      data: newMenuItem.toObject() as MenuItem,
      Status: {
        Code: 201,
        Message: "Menu item created successfully.",
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
 * Update a menu item
 */
export const updateMenuItem = async (
  req: Request<{ id: string }, {}, UpdateMenuItemDTO>,
  res: Response<DefaultResponseBody<MenuItem>>
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
          Message: "Invalid menu item ID format.",
        },
      });
      return;
    }

    const menuItem = await MenuItemModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: updateData },
      { new: true }
    ).lean();

    if (!menuItem) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Menu item not found.",
        },
      });
      return;
    }

    res.status(200).json({
      data: menuItem as MenuItem,
      Status: {
        Code: 200,
        Message: "Menu item updated successfully.",
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
 * Delete a menu item
 */
export const deleteMenuItem = async (
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
          Message: "Invalid menu item ID format.",
        },
      });
      return;
    }

    const menuItem = await MenuItemModel.findByIdAndDelete(new Types.ObjectId(id));

    if (!menuItem) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Menu item not found.",
        },
      });
      return;
    }

    res.status(200).json({
      data: null,
      Status: {
        Code: 200,
        Message: "Menu item deleted successfully.",
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
 * Toggle menu item availability
 */
export const toggleMenuItemAvailability = async (
  req: Request<{ id: string }>,
  res: Response<DefaultResponseBody<MenuItem>>
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
          Message: "Invalid menu item ID format.",
        },
      });
      return;
    }

    const menuItem = await MenuItemModel.findById(new Types.ObjectId(id));

    if (!menuItem) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Menu item not found.",
        },
      });
      return;
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.status(200).json({
      data: menuItem.toObject() as MenuItem,
      Status: {
        Code: 200,
        Message: `Menu item availability changed to ${menuItem.isAvailable ? "available" : "unavailable"}.`,
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
 * Get menu items by category for a restaurant
 */
export const getMenuItemsByCategory = async (
  req: Request<{ restaurentId: string; category: string }>,
  res: Response<DefaultResponseBody<MenuItem[]>>
) => {
  const { restaurentId, category } = req.params;

  try {
    if (!Types.ObjectId.isValid(restaurentId)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid restaurant ID format.",
        },
      });
      return;
    }

    const menuItems = await MenuItemModel.find({
      restaurentId: new Types.ObjectId(restaurentId),
      category,
    }).lean();

    res.status(200).json({
      data: menuItems as MenuItem[],
      Status: {
        Code: 200,
        Message: "Menu items by category retrieved successfully.",
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
 * Bulk create menu items for a restaurant
 */
export const bulkCreateMenuItems = async (
  req: Request<{}, {}, { items: CreateMenuItemDTO[] }>,
  res: Response<DefaultResponseBody<MenuItem[]>>
) => {
  const { items } = req.body;
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

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Items array is required and cannot be empty.",
        },
      });
      return;
    }

    const createdItems = await MenuItemModel.insertMany(items);

    res.status(201).json({
      data: createdItems as MenuItem[],
      Status: {
        Code: 201,
        Message: `${createdItems.length} menu items created successfully.`,
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
 * Get popular menu items
 */
export const getPopularItems = async (
  req: Request,
  res: Response<DefaultResponseBody<MenuItem[]>>
): Promise<void> => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = parseInt(String(limit));

    const popularItems = await MenuItemModel.find({
      isAvailable: true
    })
      .populate("restaurent", "name address")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();

    res.status(200).json({
      data: popularItems as MenuItem[],
      Status: {
        Code: 200,
        Message: "Popular menu items retrieved successfully.",
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
