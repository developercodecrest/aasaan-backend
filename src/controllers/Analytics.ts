import { Request, Response } from 'express';
import OrderModel from '../schemas/Order';
import UserModel from '../schemas/User';
import RiderModel from '../schemas/Rider';
import RestaurentModel from '../schemas/Stores/Restaurent';
import MedicalModel from '../schemas/Stores/Medical';
import GroceryModel from '../schemas/Stores/Grocery';
import ClothesModel from '../schemas/Stores/Clothes';
import { DefaultResponseBody } from '../types/default';
import { StoreType } from '../types/order';

// Get admin dashboard summary
export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get total counts
        const totalUsers = await UserModel.countDocuments();
        const totalOrders = await OrderModel.countDocuments();
        const totalRiders = await RiderModel.countDocuments();

        // Count stores by type
        const totalRestaurents = await RestaurentModel.countDocuments();
        const totalMedical = await MedicalModel.countDocuments();
        const totalGrocery = await GroceryModel.countDocuments();
        const totalClothes = await ClothesModel.countDocuments();
        const totalStores = totalRestaurents + totalMedical + totalGrocery + totalClothes;

        // Calculate total revenue
        const revenueResult = await OrderModel.aggregate([
            {
                $match: {
                    'transactionDetails.paymentStatus': 'success'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Get active riders count
        const activeRiders = await RiderModel.countDocuments({ 
            status: { $in: ['AVAILABLE', 'BUSY'] },
            isActive: true 
        });

        // Get recent order stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = await OrderModel.countDocuments({ 
            createdAt: { $gte: today } 
        });

        res.status(200).json({
            data: {
                totalUsers,
                totalStores,
                storeBreakdown: {
                    restaurents: totalRestaurents,
                    medical: totalMedical,
                    grocery: totalGrocery,
                    clothes: totalClothes
                },
                totalOrders,
                todayOrders,
                totalRevenue,
                totalRiders,
                activeRiders
            },
            Status: {
                Code: 200,
                Message: 'Dashboard summary retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve dashboard summary'
            }
        });
    }
};

// Get revenue report
export const getRevenueReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate, storeType, groupBy = 'day' } = req.query;

        const matchFilter: any = {
            'transactionDetails.paymentStatus': 'success'
        };

        // Date range filter
        if (startDate || endDate) {
            matchFilter.createdAt = {};
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate as string);
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate as string);
        }

        // Store type filter
        if (storeType) {
            matchFilter.storeType = storeType;
        }

        // Determine grouping format
        let dateFormat: any;
        switch (groupBy) {
            case 'week':
                dateFormat = { $week: '$createdAt' };
                break;
            case 'month':
                dateFormat = { $month: '$createdAt' };
                break;
            default: // day
                dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        }

        const revenueData = await OrderModel.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: dateFormat,
                    totalRevenue: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            data: revenueData,
            Status: {
                Code: 200,
                Message: 'Revenue report retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve revenue report'
            }
        });
    }
};

// Get store performance report
export const getStorePerformance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeType, page = 1, limit = 20, sortBy = 'revenue' } = req.query;

        const matchFilter: any = {
            'transactionDetails.paymentStatus': 'success'
        };

        if (storeType) {
            matchFilter.storeType = storeType;
        }

        // Determine sort field
        let sortField: any = { totalRevenue: -1 };
        if (sortBy === 'orders') {
            sortField = { orderCount: -1 };
        } else if (sortBy === 'rating') {
            sortField = { avgRating: -1 };
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const performanceData = await OrderModel.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: {
                        storeId: '$storeId',
                        storeName: '$storeName',
                        storeType: '$storeType'
                    },
                    orderCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    storeId: '$_id.storeId',
                    storeName: '$_id.storeName',
                    storeType: '$_id.storeType',
                    orderCount: 1,
                    totalRevenue: 1,
                    avgOrderValue: { $divide: ['$totalRevenue', '$orderCount'] }
                }
            },
            { $sort: sortField },
            { $skip: skip },
            { $limit: limitNum }
        ]);

        const totalStores = await OrderModel.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$storeId'
                }
            },
            {
                $count: 'total'
            }
        ]);

        const total = totalStores.length > 0 ? totalStores[0].total : 0;

        res.status(200).json({
            data: {
                stores: performanceData,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            },
            Status: {
                Code: 200,
                Message: 'Store performance report retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve store performance report'
            }
        });
    }
};

// Get rider performance report
export const getRiderPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, sortBy = 'deliveries' } = req.query;

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        // Determine sort field
        let sortField: any = { totalDeliveries: -1 };
        if (sortBy === 'rating') {
            sortField = { rating: -1 };
        }

        const riders = await RiderModel.find({ isActive: true })
            .select('name phone totalDeliveries rating profileImage')
            .sort(sortField)
            .skip(skip)
            .limit(limitNum)
            .lean();

        const total = await RiderModel.countDocuments({ isActive: true });

        res.status(200).json({
            data: {
                riders,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            },
            Status: {
                Code: 200,
                Message: 'Rider performance report retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve rider performance report'
            }
        });
    }
};

// Get category-wise sales
export const getCategorySales = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;

        const matchFilter: any = {
            'transactionDetails.paymentStatus': 'success'
        };

        // Date range filter
        if (startDate || endDate) {
            matchFilter.createdAt = {};
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate as string);
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate as string);
        }

        const categorySales = await OrderModel.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$storeType',
                    totalSales: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalAmount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    totalSales: 1,
                    orderCount: 1,
                    avgOrderValue: 1
                }
            },
            { $sort: { totalSales: -1 } }
        ]);

        res.status(200).json({
            data: categorySales,
            Status: {
                Code: 200,
                Message: 'Category-wise sales retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve category-wise sales'
            }
        });
    }
};
