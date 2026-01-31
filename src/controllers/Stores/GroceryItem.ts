import { Request, Response } from 'express';
import GroceryItemModel from '../../schemas/Stores/GroceryItem';
import GroceryModel from '../../schemas/Stores/Grocery';
import { DefaultResponseBody } from '../../types/default';
import { Types } from 'mongoose';

// Get a single grocery item
export const getGroceryItem = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const groceryItem = await GroceryItemModel.findById(id).populate('grocery');

        if (!groceryItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Grocery item not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: groceryItem,
            Status: {
                Code: 200,
                Message: 'Grocery item retrieved successfully'
            }
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error'
            }
        });
        return;
    }
};

// Get all grocery items with filters
export const getGroceryItems = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { groceryId, category, minPrice, maxPrice, isAvailable, organic, searchBy, page = 1, limit = 10 } = req.query;

        const filter: any = {};

        if (groceryId) {
            filter.groceryId = new Types.ObjectId(String(groceryId));
        }

        if (category) {
            filter.category = String(category);
        }

        if (minPrice || maxPrice) {
            const priceFilter: any = {};
            if (minPrice) priceFilter.$gte = Number(minPrice);
            if (maxPrice) priceFilter.$lte = Number(maxPrice);
            filter.price = priceFilter;
        }

        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === 'true';
        }

        if (organic !== undefined) {
            filter.organic = organic === 'true';
        }

        if (searchBy) {
            filter.$text = { $search: String(searchBy) };
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const groceryItems = await GroceryItemModel.find(filter)
            .populate('grocery')
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        const total = await GroceryItemModel.countDocuments(filter);

        res.status(200).json({
            data: {
                groceryItems,
                total,
                page: pageNum,
                limit: limitNum,
            },
            Status: {
                Code: 200,
                Message: 'Grocery items retrieved successfully'
            }
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error'
            }
        });
        return;
    }
};

// Get grocery items by grocery ID
export const getGroceryGroceryItems = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { groceryId } = req.params;
        const { category, isAvailable, page = 1, limit = 20 } = req.query;

        const filter: any = { groceryId: new Types.ObjectId(groceryId) };

        if (category) {
            filter.category = String(category);
        }

        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === 'true';
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const groceryItems = await GroceryItemModel.find(filter)
            .skip(skip)
            .limit(limitNum)
            .sort({ category: 1, name: 1 });

        const total = await GroceryItemModel.countDocuments(filter);

        res.status(200).json({
            data: {
                groceryItems,
                total,
                page: pageNum,
                limit: limitNum,
            },
            Status: {
                Code: 200,
                Message: 'Grocery items retrieved successfully'
            }
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error'
            }
        });
        return;
    }
};

// Create a new grocery item
export const createGroceryItem = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const groceryItemData = req.body;

        // Verify that the grocery exists
        const grocery = await GroceryModel.findById(groceryItemData.groceryId);
        if (!grocery) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Grocery not found'
                }
            });
            return;
        }

        const groceryItem = new GroceryItemModel(groceryItemData);
        await groceryItem.save();

        res.status(201).json({
            data: groceryItem,
            Status: {
                Code: 201,
                Message: 'Grocery item created successfully'
            }
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error'
            }
        });
        return;
    }
};

// Update a grocery item
export const updateGroceryItem = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const groceryItem = await GroceryItemModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!groceryItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Grocery item not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: groceryItem,
            Status: {
                Code: 200,
                Message: 'Grocery item updated successfully'
            }
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error'
            }
        });
        return;
    }
};

// Delete a grocery item
export const deleteGroceryItem = async (req: Request, res: Response<DefaultResponseBody<null>>) => {
    try {
        const { id } = req.params;

        const groceryItem = await GroceryItemModel.findByIdAndDelete(id);

        if (!groceryItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Grocery item not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: null,
            Status: {
                Code: 200,
                Message: 'Grocery item deleted successfully'
            }
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error'
            }
        });
        return;
    }
};

// Toggle grocery item availability
export const toggleGroceryItemAvailability = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const groceryItem = await GroceryItemModel.findById(id);

        if (!groceryItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Grocery item not found'
                }
            });
            return;
        }

        groceryItem.isAvailable = !groceryItem.isAvailable;
        await groceryItem.save();

        res.status(200).json({
            data: groceryItem,
            Status: {
                Code: 200,
                Message: `Grocery item ${groceryItem.isAvailable ? 'available' : 'unavailable'} successfully`
            }
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error'
            }
        });
        return;
    }
};

// Bulk create grocery items
export const bulkCreateGroceryItems = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { groceryItems } = req.body;

        if (!Array.isArray(groceryItems) || groceryItems.length === 0) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Grocery items array is required'
                }
            });
            return;
        }

        const createdItems = await GroceryItemModel.insertMany(groceryItems);

        res.status(201).json({
            data: createdItems,
            Status: {
                Code: 201,
                Message: 'Grocery items created successfully'
            }
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error'
            }
        });
        return;
    }
};

// Get popular grocery items
export const getPopularItems = async (req: Request, res: Response<DefaultResponseBody<any>>): Promise<void> => {
    try {
        const { limit = 20 } = req.query;
        const limitNum = parseInt(String(limit));

        const popularItems = await GroceryItemModel.find({
            isAvailable: true
        })
            .populate('grocery')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .lean();

        res.status(200).json({
            data: popularItems,
            Status: {
                Code: 200,
                Message: 'Popular grocery items retrieved successfully'
            }
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error'
            }
        });
        return;
    }
};
