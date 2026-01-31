import { Request, Response } from 'express';
import RiderModel from '../schemas/Rider';
import AssignedOrderModel from '../schemas/AssignedOrder';
import { DefaultResponseBody } from '../types/default';
import { RiderStatus } from '../types/rider';
import crypto from 'crypto';

// Get a single rider
export const getRider = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const rider = await RiderModel.findById(id).select('-password');

        if (!rider) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Rider not found',
                },
            });
            return;
        }

        res.status(200).json({
            data: rider,
            Status: {
                Code: 200,
                Message: 'Rider retrieved successfully',
            },
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error',
            },
        });
        return;
    }
};

// Get all riders with filters
export const getRiders = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { 
            name, 
            phone, 
            status, 
            vehicleType, 
            isActive, 
            minRating,
            page = 1, 
            limit = 10, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;

        const filter: any = {};

        if (name) {
            filter.$text = { $search: String(name) };
        }

        if (phone) {
            filter.phone = new RegExp(String(phone), 'i');
        }

        if (status) {
            filter.status = String(status);
        }

        if (vehicleType) {
            filter.vehicleType = String(vehicleType);
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        if (minRating) {
            filter.rating = { $gte: Number(minRating) };
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const sortOptions: any = {};
        sortOptions[String(sortBy)] = sortOrder === 'asc' ? 1 : -1;

        const riders = await RiderModel.find(filter)
            .select('-password')
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        const total = await RiderModel.countDocuments(filter);

        res.status(200).json({
            data: {
                riders,
                total,
                page: pageNum,
                limit: limitNum,
            },
            Status: {
                Code: 200,
                Message: 'Riders retrieved successfully',
            },
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error',
            },
        });
        return;
    }
};

// Get available riders
export const getAvailableRiders = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const riders = await RiderModel.findAvailableRiders();

        res.status(200).json({
            data: riders,
            Status: {
                Code: 200,
                Message: 'Available riders retrieved successfully',
            },
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error',
            },
        });
        return;
    }
};

// Create a new rider (SADMIN only)
export const createRider = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const riderData = req.body;

        // Hash password
        const hashedPassword = crypto.createHash('sha256').update(riderData.password).digest('hex');

        const rider = new RiderModel({
            ...riderData,
            password: hashedPassword,
        });

        await rider.save();

        // Remove password from response
        const riderResponse: any = rider.toObject();
        delete riderResponse.password;

        res.status(201).json({
            data: riderResponse,
            Status: {
                Code: 201,
                Message: 'Rider created successfully',
            },
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error',
            },
        });
        return;
    }
};

// Update rider (SADMIN only)
export const updateRider = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Hash password if being updated
        if (updateData.password) {
            updateData.password = crypto.createHash('sha256').update(updateData.password).digest('hex');
        }

        const rider = await RiderModel.findByIdAndUpdate(id, updateData, { 
            new: true, 
            runValidators: true 
        }).select('-password');

        if (!rider) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Rider not found',
                },
            });
            return;
        }

        res.status(200).json({
            data: rider,
            Status: {
                Code: 200,
                Message: 'Rider updated successfully',
            },
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error',
            },
        });
        return;
    }
};

// Delete rider (SADMIN only)
export const deleteRider = async (req: Request, res: Response<DefaultResponseBody<null>>) => {
    try {
        const { id } = req.params;

        const rider = await RiderModel.findByIdAndDelete(id);

        if (!rider) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Rider not found',
                },
            });
            return;
        }

        res.status(200).json({
            data: null,
            Status: {
                Code: 200,
                Message: 'Rider deleted successfully',
            },
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error',
            },
        });
        return;
    }
};

// Toggle rider active status (SADMIN only)
export const toggleRiderStatus = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const rider = await RiderModel.findById(id).select('-password');

        if (!rider) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Rider not found',
                },
            });
            return;
        }

        rider.isActive = !rider.isActive;
        await rider.save();

        res.status(200).json({
            data: rider,
            Status: {
                Code: 200,
                Message: `Rider ${rider.isActive ? 'activated' : 'deactivated'} successfully`,
            },
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error',
            },
        });
        return;
    }
};

// Get rider's assigned orders
export const getRiderAssignedOrders = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const { status } = req.query;

        const rider = await RiderModel.findById(id).select('-password');
        if (!rider) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Rider not found',
                },
            });
            return;
        }

        const filter: any = { riderId: id };
        if (status) {
            filter.status = String(status);
        }

        const assignedOrders = await AssignedOrderModel.find(filter)
            .populate('order')
            .populate('user', '-password')
            .sort({ assignedAt: -1 });

        res.status(200).json({
            data: assignedOrders,
            Status: {
                Code: 200,
                Message: 'Rider assigned orders retrieved successfully',
            },
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error',
            },
        });
        return;
    }
};

// Update rider location
export const updateRiderLocation = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const { latitude, longitude, address } = req.body;

        const rider = await RiderModel.findByIdAndUpdate(
            id,
            { 
                currentLocation: { latitude, longitude, address } 
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!rider) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Rider not found',
                },
            });
            return;
        }

        res.status(200).json({
            data: rider,
            Status: {
                Code: 200,
                Message: 'Rider location updated successfully',
            },
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error',
            },
        });
        return;
    }
};

// Get rider statistics
export const getRiderStats = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const stats = await RiderModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalRiders: { $sum: 1 },
                    activeRiders: {
                        $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                    },
                    availableRiders: {
                        $sum: { $cond: [{ $eq: ['$status', RiderStatus.AVAILABLE] }, 1, 0] }
                    },
                    busyRiders: {
                        $sum: { $cond: [{ $eq: ['$status', RiderStatus.BUSY] }, 1, 0] }
                    },
                    offlineRiders: {
                        $sum: { $cond: [{ $eq: ['$status', RiderStatus.OFFLINE] }, 1, 0] }
                    },
                    avgRating: { $avg: '$rating' },
                    totalDeliveries: { $sum: '$totalDeliveries' },
                }
            }
        ]);

        res.status(200).json({
            data: stats.length > 0 ? stats[0] : {
                totalRiders: 0,
                activeRiders: 0,
                availableRiders: 0,
                busyRiders: 0,
                offlineRiders: 0,
                avgRating: 0,
                totalDeliveries: 0,
            },
            Status: {
                Code: 200,
                Message: 'Rider statistics retrieved successfully',
            },
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Internal server error',
            },
        });
        return;
    }
};
