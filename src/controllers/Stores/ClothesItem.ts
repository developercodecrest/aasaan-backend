import { Request, Response } from 'express';
import ClothesItemModel from '../../schemas/Stores/ClothesItem';
import ClothesModel from '../../schemas/Stores/Clothes';
import { DefaultResponseBody } from '../../types/default';
import { Types } from 'mongoose';

// Get a single clothes item
export const getClothesItem = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const clothesItem = await ClothesItemModel.findById(id).populate('clothes');

        if (!clothesItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Clothes item not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: clothesItem,
            Status: {
                Code: 200,
                Message: 'Clothes item retrieved successfully'
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

// Get all clothes items with filters
export const getClothesItems = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { clothesId, category, minPrice, maxPrice, isAvailable, brand, gender, searchBy, page = 1, limit = 10 } = req.query;

        const filter: any = {};

        if (clothesId) {
            filter.clothesId = new Types.ObjectId(String(clothesId));
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

        if (brand) {
            filter.brand = String(brand);
        }

        if (gender) {
            filter.gender = String(gender);
        }

        if (searchBy) {
            filter.$text = { $search: String(searchBy) };
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const clothesItems = await ClothesItemModel.find(filter)
            .populate('clothes')
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        const total = await ClothesItemModel.countDocuments(filter);

        res.status(200).json({
            data: {
                clothesItems,
                total,
                page: pageNum,
                limit: limitNum,
            },
            Status: {
                Code: 200,
                Message: 'Clothes items retrieved successfully'
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

// Get clothes items by clothes ID
export const getClothesClothesItems = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { clothesId } = req.params;
        const { category, isAvailable, page = 1, limit = 20 } = req.query;

        const filter: any = { clothesId: new Types.ObjectId(clothesId) };

        if (category) {
            filter.category = String(category);
        }

        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === 'true';
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const clothesItems = await ClothesItemModel.find(filter)
            .skip(skip)
            .limit(limitNum)
            .sort({ category: 1, name: 1 });

        const total = await ClothesItemModel.countDocuments(filter);

        res.status(200).json({
            data: {
                clothesItems,
                total,
                page: pageNum,
                limit: limitNum,
            },
            Status: {
                Code: 200,
                Message: 'Clothes items retrieved successfully'
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

// Create a new clothes item
export const createClothesItem = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const clothesItemData = req.body;

        // Verify that the clothes exists
        const clothes = await ClothesModel.findById(clothesItemData.clothesId);
        if (!clothes) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Clothes not found'
                }
            });
            return;
        }

        const clothesItem = new ClothesItemModel(clothesItemData);
        await clothesItem.save();

        res.status(201).json({
            data: clothesItem,
            Status: {
                Code: 201,
                Message: 'Clothes item created successfully'
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

// Update a clothes item
export const updateClothesItem = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const clothesItem = await ClothesItemModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!clothesItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Clothes item not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: clothesItem,
            Status: {
                Code: 200,
                Message: 'Clothes item updated successfully'
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

// Delete a clothes item
export const deleteClothesItem = async (req: Request, res: Response<DefaultResponseBody<null>>) => {
    try {
        const { id } = req.params;

        const clothesItem = await ClothesItemModel.findByIdAndDelete(id);

        if (!clothesItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Clothes item not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: null,
            Status: {
                Code: 200,
                Message: 'Clothes item deleted successfully'
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

// Toggle clothes item availability
export const toggleClothesItemAvailability = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const clothesItem = await ClothesItemModel.findById(id);

        if (!clothesItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Clothes item not found'
                }
            });
            return;
        }

        clothesItem.isAvailable = !clothesItem.isAvailable;
        await clothesItem.save();

        res.status(200).json({
            data: clothesItem,
            Status: {
                Code: 200,
                Message: `Clothes item ${clothesItem.isAvailable ? 'available' : 'unavailable'} successfully`
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

// Bulk create clothes items
export const bulkCreateClothesItems = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { clothesItems } = req.body;

        if (!Array.isArray(clothesItems) || clothesItems.length === 0) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Clothes items array is required'
                }
            });
            return;
        }

        const createdItems = await ClothesItemModel.insertMany(clothesItems);

        res.status(201).json({
            data: createdItems,
            Status: {
                Code: 201,
                Message: 'Clothes items created successfully'
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

// Get popular clothes items
export const getPopularItems = async (req: Request, res: Response<DefaultResponseBody<any>>): Promise<void> => {
    try {
        const { limit = 20 } = req.query;
        const limitNum = parseInt(String(limit));

        const popularItems = await ClothesItemModel.find({
            isAvailable: true
        })
            .populate('clothes')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .lean();

        res.status(200).json({
            data: popularItems,
            Status: {
                Code: 200,
                Message: 'Popular clothes items retrieved successfully'
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
