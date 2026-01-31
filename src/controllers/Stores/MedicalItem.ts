import { Request, Response } from 'express';
import MedicalItemModel from '../../schemas/Stores/MedicalItem';
import MedicalModel from '../../schemas/Stores/Medical';
import { DefaultResponseBody } from '../../types/default';
import { Types } from 'mongoose';

// Get a single medical item
export const getMedicalItem = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const medicalItem = await MedicalItemModel.findById(id).populate('medical');

        if (!medicalItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Medical item not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: medicalItem,
            Status: {
                Code: 200,
                Message: 'Medical item retrieved successfully'
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

// Get all medical items with filters
export const getMedicalItems = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { medicalId, category, minPrice, maxPrice, isAvailable, prescriptionRequired, searchBy, page = 1, limit = 10 } = req.query;

        const filter: any = {};

        if (medicalId) {
            filter.medicalId = new Types.ObjectId(String(medicalId));
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

        if (prescriptionRequired !== undefined) {
            filter.prescriptionRequired = prescriptionRequired === 'true';
        }

        if (searchBy) {
            filter.$text = { $search: String(searchBy) };
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const medicalItems = await MedicalItemModel.find(filter)
            .populate('medical')
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        const total = await MedicalItemModel.countDocuments(filter);

        res.status(200).json({
            data: {
                medicalItems,
                total,
                page: pageNum,
                limit: limitNum,
            },
            Status: {
                Code: 200,
                Message: 'Medical items retrieved successfully'
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

// Get medical items by medical ID
export const getMedicalMedicalItems = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { medicalId } = req.params;
        const { category, isAvailable, page = 1, limit = 20 } = req.query;

        const filter: any = { medicalId: new Types.ObjectId(medicalId) };

        if (category) {
            filter.category = String(category);
        }

        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === 'true';
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const medicalItems = await MedicalItemModel.find(filter)
            .skip(skip)
            .limit(limitNum)
            .sort({ category: 1, name: 1 });

        const total = await MedicalItemModel.countDocuments(filter);

        res.status(200).json({
            data: {
                medicalItems,
                total,
                page: pageNum,
                limit: limitNum,
            },
            Status: {
                Code: 200,
                Message: 'Medical items retrieved successfully'
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

// Create a new medical item
export const createMedicalItem = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const medicalItemData = req.body;

        // Verify that the medical exists
        const medical = await MedicalModel.findById(medicalItemData.medicalId);
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

        const medicalItem = new MedicalItemModel(medicalItemData);
        await medicalItem.save();

        res.status(201).json({
            data: medicalItem,
            Status: {
                Code: 201,
                Message: 'Medical item created successfully'
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

// Update a medical item
export const updateMedicalItem = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const medicalItem = await MedicalItemModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!medicalItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Medical item not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: medicalItem,
            Status: {
                Code: 200,
                Message: 'Medical item updated successfully'
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

// Delete a medical item
export const deleteMedicalItem = async (req: Request, res: Response<DefaultResponseBody<null>>) => {
    try {
        const { id } = req.params;

        const medicalItem = await MedicalItemModel.findByIdAndDelete(id);

        if (!medicalItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Medical item not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: null,
            Status: {
                Code: 200,
                Message: 'Medical item deleted successfully'
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

// Toggle medical item availability
export const toggleMedicalItemAvailability = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const medicalItem = await MedicalItemModel.findById(id);

        if (!medicalItem) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Medical item not found'
                }
            });
            return;
        }

        medicalItem.isAvailable = !medicalItem.isAvailable;
        await medicalItem.save();

        res.status(200).json({
            data: medicalItem,
            Status: {
                Code: 200,
                Message: `Medical item ${medicalItem.isAvailable ? 'available' : 'unavailable'} successfully`
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

// Bulk create medical items
export const bulkCreateMedicalItems = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { medicalItems } = req.body;

        if (!Array.isArray(medicalItems) || medicalItems.length === 0) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Medical items array is required'
                }
            });
            return;
        }

        const createdItems = await MedicalItemModel.insertMany(medicalItems);

        res.status(201).json({
            data: createdItems,
            Status: {
                Code: 201,
                Message: 'Medical items created successfully'
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

// Get popular medical items
export const getPopularItems = async (req: Request, res: Response<DefaultResponseBody<any>>): Promise<void> => {
    try {
        const { limit = 20 } = req.query;
        const limitNum = parseInt(String(limit));

        const popularItems = await MedicalItemModel.find({
            isAvailable: true
        })
            .populate('medical')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .lean();

        res.status(200).json({
            data: popularItems,
            Status: {
                Code: 200,
                Message: 'Popular medical items retrieved successfully'
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
