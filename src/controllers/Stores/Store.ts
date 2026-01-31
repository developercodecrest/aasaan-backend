import RestaurentModel from "@/schemas/Stores/Restaurent";
import MedicalModel from "@/schemas/Stores/Medical";
import GroceryModel from "@/schemas/Stores/Grocery";
import ClothesModel from "@/schemas/Stores/Clothes";
import MenuItemModel from "@/schemas/Stores/MenuItem";
import MedicalItemModel from "@/schemas/Stores/MedicalItem";
import GroceryItemModel from "@/schemas/Stores/GroceryItem";
import ClothesItemModel from "@/schemas/Stores/ClothesItem";
import { DefaultResponseBody } from "@/types/default";
import { Request, Response } from "express";
import { Types } from "mongoose";

/**
 * Get all stores (unified endpoint for all store types)
 */
export const getStores = async (
  req: Request<{}, {}, {}, { storeType?: string; status?: string; rating?: number; search?: string; page?: string; limit?: string }>,
  res: Response<DefaultResponseBody<any[]>>
) => {
  try {
    const { storeType, status, rating, search, page = "1", limit = "20" } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filters: Record<string, any> = {};
    if (status) filters.isOpen = status === 'active';
    if (rating) filters.rating = { $gte: Number(rating) };
    if (search) filters.$text = { $search: search };

    let stores: any[] = [];

    // If storeType is specified, query only that type
    if (storeType) {
      switch (storeType) {
        case 'restaurents':
          stores = await RestaurentModel.find(filters).skip(skip).limit(limitNum).lean();
          break;
        case 'medical':
          stores = await MedicalModel.find(filters).skip(skip).limit(limitNum).lean();
          break;
        case 'grocery':
          stores = await GroceryModel.find(filters).skip(skip).limit(limitNum).lean();
          break;
        case 'clothes':
          stores = await ClothesModel.find(filters).skip(skip).limit(limitNum).lean();
          break;
        default:
          res.status(400).json({
            data: null,
            Status: {
              Code: 400,
              Message: "Invalid store type"
            }
          });
          return;
      }
    } else {
      // Query all store types and merge
      const [restaurents, medical, grocery, clothes] = await Promise.all([
        RestaurentModel.find(filters).skip(skip).limit(Math.ceil(limitNum / 4)).lean(),
        MedicalModel.find(filters).skip(skip).limit(Math.ceil(limitNum / 4)).lean(),
        GroceryModel.find(filters).skip(skip).limit(Math.ceil(limitNum / 4)).lean(),
        ClothesModel.find(filters).skip(skip).limit(Math.ceil(limitNum / 4)).lean(),
      ]);

      stores = [
        ...restaurents.map(s => ({ ...s, storeType: 'restaurents' })),
        ...medical.map(s => ({ ...s, storeType: 'medical' })),
        ...grocery.map(s => ({ ...s, storeType: 'grocery' })),
        ...clothes.map(s => ({ ...s, storeType: 'clothes' })),
      ];
    }

    res.status(200).json({
      data: stores,
      Status: {
        Code: 200,
        Message: "Stores retrieved successfully"
      }
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error"
      }
    });
  }
};

/**
 * Get a single store by ID (checks all store types)
 */
export const getStoreById = async (
  req: Request<{ storeId: string }>,
  res: Response<DefaultResponseBody<any>>
) => {
  const { storeId } = req.params;

  try {
    if (!Types.ObjectId.isValid(storeId)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid store ID"
        }
      });
      return;
    }

    // Try to find store in all collections
    const [restaurent, medical, grocery, clothes] = await Promise.all([
      RestaurentModel.findById(storeId).lean(),
      MedicalModel.findById(storeId).lean(),
      GroceryModel.findById(storeId).lean(),
      ClothesModel.findById(storeId).lean(),
    ]);

    const store = restaurent || medical || grocery || clothes;

    if (!store) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Store not found"
        }
      });
      return;
    }

    // Add store type identifier
    const storeWithType = {
      ...store,
      storeType: restaurent ? 'restaurents' : medical ? 'medical' : grocery ? 'grocery' : 'clothes'
    };

    res.status(200).json({
      data: storeWithType,
      Status: {
        Code: 200,
        Message: "Store retrieved successfully"
      }
    });
  } catch (error) {
    console.error("Error fetching store by ID:", error);
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error"
      }
    });
  }
};

/**
 * Get stores by type
 */
export const getStoresByType = async (
  req: Request<{ storeType: string }, {}, {}, { status?: string; rating?: number; search?: string; page?: string; limit?: string }>,
  res: Response<DefaultResponseBody<any[]>>
) => {
  const { storeType } = req.params;
  const { status, rating, search, page = "1", limit = "20" } = req.query;

  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filters: Record<string, any> = {};
    if (status) filters.isOpen = status === 'active';
    if (rating) filters.rating = { $gte: Number(rating) };
    if (search) filters.$text = { $search: search };

    let Model: any;
    switch (storeType) {
      case 'restaurents':
        Model = RestaurentModel;
        break;
      case 'medical':
        Model = MedicalModel;
        break;
      case 'grocery':
        Model = GroceryModel;
        break;
      case 'clothes':
        Model = ClothesModel;
        break;
      default:
        res.status(400).json({
          data: null,
          Status: {
            Code: 400,
            Message: "Invalid store type. Valid types: restaurents, medical, grocery, clothes"
          }
        });
        return;
    }

    const stores = await (Model as any).find(filters).skip(skip).limit(limitNum).lean();

    res.status(200).json({
      data: stores,
      Status: {
        Code: 200,
        Message: `${storeType} stores retrieved successfully`
      }
    });
  } catch (error) {
    console.error("Error fetching stores by type:", error);
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error"
      }
    });
  }
};

/**
 * Get items for a specific store
 */
export const getStoreItems = async (
  req: Request<{ storeId: string }>,
  res: Response<DefaultResponseBody<any[]>>
) => {
  const { storeId } = req.params;

  try {
    if (!Types.ObjectId.isValid(storeId)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid store ID"
        }
      });
      return;
    }

    // Try to find items from all item collections
    const [menuItems, medicalItems, groceryItems, clothesItems] = await Promise.all([
      MenuItemModel.find({ restaurentId: storeId }).lean(),
      MedicalItemModel.find({ medicalId: storeId }).lean(),
      GroceryItemModel.find({ groceryId: storeId }).lean(),
      ClothesItemModel.find({ clothesId: storeId }).lean(),
    ]);

    const items = [...menuItems, ...medicalItems, ...groceryItems, ...clothesItems];

    res.status(200).json({
      data: items,
      Status: {
        Code: 200,
        Message: "Store items retrieved successfully"
      }
    });
  } catch (error) {
    console.error("Error fetching store items:", error);
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error"
      }
    });
  }
};

/**
 * Update store status
 */
export const updateStoreStatus = async (
  req: Request<{ storeId: string }, {}, { status: string }>,
  res: Response<DefaultResponseBody<any>>
) => {
  const { storeId } = req.params;
  const { status } = req.body;

  try {
    if (!Types.ObjectId.isValid(storeId)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid store ID"
        }
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Status is required"
        }
      });
      return;
    }

    // Map status to isOpen field
    const isOpen = status === 'active';

    // Try to update in all store collections
    const [restaurent, medical, grocery, clothes] = await Promise.all([
      RestaurentModel.findByIdAndUpdate(storeId, { isOpen }, { new: true }).lean(),
      MedicalModel.findByIdAndUpdate(storeId, { isOpen }, { new: true }).lean(),
      GroceryModel.findByIdAndUpdate(storeId, { isOpen }, { new: true }).lean(),
      ClothesModel.findByIdAndUpdate(storeId, { isOpen }, { new: true }).lean(),
    ]);

    const updatedStore = restaurent || medical || grocery || clothes;

    if (!updatedStore) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Store not found"
        }
      });
      return;
    }

    res.status(200).json({
      data: updatedStore,
      Status: {
        Code: 200,
        Message: "Store status updated successfully"
      }
    });
  } catch (error) {
    console.error("Error updating store status:", error);
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error"
      }
    });
  }
};

/**
 * Get store statistics
 */
export const getStoreStats = async (
  req: Request<{ storeId: string }>,
  res: Response<DefaultResponseBody<any>>
) => {
  const { storeId } = req.params;

  try {
    if (!Types.ObjectId.isValid(storeId)) {
      res.status(400).json({
        data: null,
        Status: {
          Code: 400,
          Message: "Invalid store ID"
        }
      });
      return;
    }

    // Find the store
    const [restaurent, medical, grocery, clothes] = await Promise.all([
      RestaurentModel.findById(storeId).lean(),
      MedicalModel.findById(storeId).lean(),
      GroceryModel.findById(storeId).lean(),
      ClothesModel.findById(storeId).lean(),
    ]);

    const store = restaurent || medical || grocery || clothes;

    if (!store) {
      res.status(404).json({
        data: null,
        Status: {
          Code: 404,
          Message: "Store not found"
        }
      });
      return;
    }

    // Calculate basic stats from store data
    const stats = {
      totalOrders: (store as any).totalOrders || 0,
      totalRevenue: (store as any).totalRevenue || 0,
      monthOrders: (store as any).monthOrders || 0,
      avgRating: (store as any).rating || 0,
      totalReviews: (store as any).totalReviews || 0,
    };

    res.status(200).json({
      data: stats,
      Status: {
        Code: 200,
        Message: "Store statistics retrieved successfully"
      }
    });
  } catch (error) {
    console.error("Error fetching store stats:", error);
    res.status(500).json({
      data: null,
      Status: {
        Code: 500,
        Message: "Internal server error"
      }
    });
  }
};
