import { Request, Response } from 'express';
import ClothesModel from '../../schemas/Stores/Clothes';
import { DefaultResponseBody } from '../../types/default';
import { Types } from 'mongoose';

// Get a single clothes
export const getClothes = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const clothes = await ClothesModel.findById(id);

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

        res.status(200).json({
            data: clothes,
            Status: {
                Code: 200,
                Message: 'Clothes retrieved successfully'
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

// Get all clothes with filters
export const getAllClothes = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { name, category, minRating, isOpen, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

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

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const sortOptions: any = {};
        sortOptions[String(sortBy)] = sortOrder === 'asc' ? 1 : -1;

        const clothes = await ClothesModel.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        const total = await ClothesModel.countDocuments(filter);

        res.status(200).json({
            data: clothes,
            Status: {
                Code: 200,
                Message: 'Clothes retrieved successfully'
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

// Create a new clothes
export const createClothes = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const clothesData = req.body;

        const clothes = new ClothesModel(clothesData);
        await clothes.save();

        res.status(201).json({
            data: clothes,
            Status: {
                Code: 201,
                Message: 'Clothes created successfully'
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

// Update a clothes
export const updateClothes = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const clothes = await ClothesModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

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

        res.status(200).json({
            data: clothes,
            Status: {
                Code: 200,
                Message: 'Clothes updated successfully'
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

// Delete a clothes
export const deleteClothes = async (req: Request, res: Response<DefaultResponseBody<null>>) => {
    try {
        const { id } = req.params;

        const clothes = await ClothesModel.findByIdAndDelete(id);

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

        res.status(200).json({
            data: null,
            Status: {
                Code: 200,
                Message: 'Clothes deleted successfully'
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

// Toggle clothes status
export const toggleClothesStatus = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const clothes = await ClothesModel.findById(id);

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

        clothes.isOpen = !clothes.isOpen;
        await clothes.save();

        res.status(200).json({
            data: clothes,
            Status: {
                Code: 200,
                Message: `Clothes ${clothes.isOpen ? 'opened' : 'closed'} successfully`
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
