import { Request, Response } from 'express';
import GroceryModel from '../../schemas/Stores/Grocery';
import { DefaultResponseBody } from '../../types/default';
import { Types } from 'mongoose';

// Get a single grocery
export const getGrocery = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const grocery = await GroceryModel.findById(id);

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

        res.status(200).json({
            data: grocery,
            Status: {
                Code: 200,
                Message: 'Grocery retrieved successfully'
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

// Get all groceries with filters
export const getGroceries = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { name, category, minRating, isOpen, deliveryAvailable, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const filter: any = {};

        if (name) {
            filter.$text = { $search: String(name) };
        }

        if (category) {
            const categories = Array.isArray(category) ? category : [category];
            filter.category = { $in: categories.map(String) };
        }

        if (minRating) {
            filter.rating = { $gte: Number(minRating) };
        }

        if (isOpen !== undefined) {
            filter.isOpen = isOpen === 'true';
        }

        if (deliveryAvailable !== undefined) {
            filter.deliveryAvailable = deliveryAvailable === 'true';
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const sortOptions: any = {};
        sortOptions[String(sortBy)] = sortOrder === 'asc' ? 1 : -1;

        const groceries = await GroceryModel.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        const total = await GroceryModel.countDocuments(filter);

        res.status(200).json({
            data: groceries,
            Status: {
                Code: 200,
                Message: 'Groceries retrieved successfully'
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

// Create a new grocery
export const createGrocery = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const groceryData = req.body;

        const grocery = new GroceryModel(groceryData);
        await grocery.save();

        res.status(201).json({
            data: grocery,
            Status: {
                Code: 201,
                Message: 'Grocery created successfully'
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

// Update a grocery
export const updateGrocery = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const grocery = await GroceryModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

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

        res.status(200).json({
            data: grocery,
            Status: {
                Code: 200,
                Message: 'Grocery updated successfully'
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

// Delete a grocery
export const deleteGrocery = async (req: Request, res: Response<DefaultResponseBody<null>>) => {
    try {
        const { id } = req.params;

        const grocery = await GroceryModel.findByIdAndDelete(id);

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

        res.status(200).json({
            data: null,
            Status: {
                Code: 200,
                Message: 'Grocery deleted successfully'
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

// Toggle grocery status
export const toggleGroceryStatus = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const grocery = await GroceryModel.findById(id);

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

        grocery.isOpen = !grocery.isOpen;
        await grocery.save();

        res.status(200).json({
            data: grocery,
            Status: {
                Code: 200,
                Message: `Grocery ${grocery.isOpen ? 'opened' : 'closed'} successfully`
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
