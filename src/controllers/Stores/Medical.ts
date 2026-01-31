import { Request, Response } from 'express';
import MedicalModel from '../../schemas/Stores/Medical';
import { DefaultResponseBody } from '../../types/default';
import { Types } from 'mongoose';

// Get a single medical
export const getMedical = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const medical = await MedicalModel.findById(id);

        if (!medical) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Medical not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: medical,
            Status: {
                Code: 200,
                Message: 'Medical retrieved successfully'
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

// Get all medicals with filters
export const getMedicals = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { name, category, minRating, isOpen, emergencyServices, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

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

        if (emergencyServices !== undefined) {
            filter.emergencyServices = emergencyServices === 'true';
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const sortOptions: any = {};
        sortOptions[String(sortBy)] = sortOrder === 'asc' ? 1 : -1;

        const medicals = await MedicalModel.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        const total = await MedicalModel.countDocuments(filter);

        res.status(200).json({
            data: medicals,
            Status: {
                Code: 200,
                Message: 'Medicals retrieved successfully'
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

// Create a new medical
export const createMedical = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const medicalData = req.body;

        const medical = new MedicalModel(medicalData);
        await medical.save();

        res.status(201).json({
            data: medical,
            Status: {
                Code: 201,
                Message: 'Medical created successfully'
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

// Update a medical
export const updateMedical = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const medical = await MedicalModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!medical) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Medical not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: medical,
            Status: {
                Code: 200,
                Message: 'Medical updated successfully'
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

// Delete a medical
export const deleteMedical = async (req: Request, res: Response<DefaultResponseBody<null>>) => {
    try {
        const { id } = req.params;

        const medical = await MedicalModel.findByIdAndDelete(id);

        if (!medical) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Medical not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: null,
            Status: {
                Code: 200,
                Message: 'Medical deleted successfully'
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

// Toggle medical status
export const toggleMedicalStatus = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const medical = await MedicalModel.findById(id);

        if (!medical) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Medical not found'
                }
            });
            return;
        }

        medical.isOpen = !medical.isOpen;
        await medical.save();

        res.status(200).json({
            data: medical,
            Status: {
                Code: 200,
                Message: `Medical ${medical.isOpen ? 'opened' : 'closed'} successfully`
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
