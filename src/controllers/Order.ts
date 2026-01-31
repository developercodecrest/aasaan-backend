import { Request, Response } from 'express';
import OrderModel from '../schemas/Order';
import { DefaultResponseBody } from '../types/default';
import { Types } from 'mongoose';
import { OrderStatus, StoreType } from '../types/order';

// Get a single order
export const getOrder = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;

        const order = await OrderModel.findById(id).populate('user');

        if (!order) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Order not found',
                },
            });
            return;
        }

        res.status(200).json({
            data: order,
            Status: {
                Code: 200,
                Message: 'Order retrieved successfully',
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

// Get all orders with filters
export const getOrders = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { 
            userId, 
            storeType, 
            storeId, 
            status, 
            minAmount, 
            maxAmount, 
            startDate, 
            endDate,
            page = 1, 
            limit = 10, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;

        const filter: any = {};

        if (userId) {
            filter.userId = new Types.ObjectId(String(userId));
        }

        if (storeType) {
            filter.storeType = String(storeType);
        }

        if (storeId) {
            filter.storeId = new Types.ObjectId(String(storeId));
        }

        if (status) {
            filter.status = String(status);
        }

        if (minAmount || maxAmount) {
            const amountFilter: any = {};
            if (minAmount) amountFilter.$gte = Number(minAmount);
            if (maxAmount) amountFilter.$lte = Number(maxAmount);
            filter.totalAmount = amountFilter;
        }

        if (startDate || endDate) {
            const dateFilter: any = {};
            if (startDate) dateFilter.$gte = new Date(String(startDate));
            if (endDate) dateFilter.$lte = new Date(String(endDate));
            filter.createdAt = dateFilter;
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const sortOptions: any = {};
        sortOptions[String(sortBy)] = sortOrder === 'asc' ? 1 : -1;

        const orders = await OrderModel.find(filter)
            .populate('user')
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        const total = await OrderModel.countDocuments(filter);

        res.status(200).json({
            data: {
                orders,
                total,
                page: pageNum,
                limit: limitNum,
            },
            Status: {
                Code: 200,
                Message: 'Orders retrieved successfully',
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

// Get user's orders
export const getUserOrders = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { userId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        const filter: any = { userId: new Types.ObjectId(userId) };

        if (status) {
            filter.status = String(status);
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const orders = await OrderModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await OrderModel.countDocuments(filter);

        res.status(200).json({
            data: {
                orders,
                total,
                page: pageNum,
                limit: limitNum,
            },
            Status: {
                Code: 200,
                Message: 'User orders retrieved successfully',
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

// Get store's orders
export const getStoreOrders = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { storeId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        const filter: any = { storeId: new Types.ObjectId(storeId) };

        if (status) {
            filter.status = String(status);
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const orders = await OrderModel.find(filter)
            .populate('user')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await OrderModel.countDocuments(filter);

        res.status(200).json({
            data: {
                orders,
                total,
                page: pageNum,
                limit: limitNum,
            },
            Status: {
                Code: 200,
                Message: 'Store orders retrieved successfully',
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

// Create a new order
export const createOrder = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const orderData = req.body;

        // Calculate total amount
        const totalAmount = orderData.subTotal + 
            (orderData.deliveryCharge || 0) + 
            (orderData.tax || 0) - 
            (orderData.discount || 0);

        const order = new OrderModel({
            ...orderData,
            totalAmount,
        });

        await order.save();

        res.status(201).json({
            data: order,
            Status: {
                Code: 201,
                Message: 'Order created successfully',
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

// Update order
export const updateOrder = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const order = await OrderModel.findByIdAndUpdate(id, updateData, { 
            new: true, 
            runValidators: true 
        });

        if (!order) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Order not found',
                },
            });
            return;
        }

        res.status(200).json({
            data: order,
            Status: {
                Code: 200,
                Message: 'Order updated successfully',
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

// Update order status
export const updateOrderStatus = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!Object.values(OrderStatus).includes(status)) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Invalid order status',
                },
            });
            return;
        }

        const updateData: any = { status };

        if (status === OrderStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        } else if (status === OrderStatus.CANCELLED) {
            updateData.cancelledAt = new Date();
        }

        const order = await OrderModel.findByIdAndUpdate(id, updateData, { 
            new: true, 
            runValidators: true 
        });

        if (!order) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Order not found',
                },
            });
            return;
        }

        res.status(200).json({
            data: order,
            Status: {
                Code: 200,
                Message: `Order status updated to ${status}`,
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

// Update transaction details (after payment)
export const updateOrderTransaction = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const transactionData = req.body;

        const order = await OrderModel.findByIdAndUpdate(
            id,
            { 
                transactionDetails: transactionData,
                status: transactionData.paymentStatus === 'success' ? OrderStatus.CONFIRMED : OrderStatus.PENDING
            },
            { new: true, runValidators: true }
        );

        if (!order) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Order not found',
                },
            });
            return;
        }

        res.status(200).json({
            data: order,
            Status: {
                Code: 200,
                Message: 'Transaction details updated successfully',
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

// Cancel order
export const cancelOrder = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { id } = req.params;
        const { cancellationReason } = req.body;

        const order = await OrderModel.findById(id);

        if (!order) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Order not found',
                },
            });
            return;
        }

        // Check if order can be cancelled
        if ([OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Order cannot be cancelled',
                },
            });
            return;
        }

        order.status = OrderStatus.CANCELLED;
        order.cancelledAt = new Date();
        order.cancellationReason = cancellationReason || 'Cancelled by user';
        await order.save();

        res.status(200).json({
            data: order,
            Status: {
                Code: 200,
                Message: 'Order cancelled successfully',
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

// Delete order
export const deleteOrder = async (req: Request, res: Response<DefaultResponseBody<null>>) => {
    try {
        const { id } = req.params;

        const order = await OrderModel.findByIdAndDelete(id);

        if (!order) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Order not found',
                },
            });
            return;
        }

        res.status(200).json({
            data: null,
            Status: {
                Code: 200,
                Message: 'Order deleted successfully',
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
// Update order items (before confirmed status)
export const updateOrderItems = async (req: Request, res: Response<DefaultResponseBody<any>>): Promise<void> => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Items array is required',
                },
            });
            return;
        }

        const order = await OrderModel.findById(id);

        if (!order) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Order not found',
                },
            });
            return;
        }

        // Check order status is 'pending'
        if (order.status !== OrderStatus.PENDING) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Cannot update items for orders that are not in pending status',
                },
            });
            return;
        }

        // Update items array
        order.items = items;

        // Recalculate totalAmount
        const subTotal = items.reduce((sum: number, item: any) => {
            return sum + (item.price * item.quantity);
        }, 0);

        order.subTotal = subTotal;
        order.totalAmount = subTotal + 
            (order.deliveryCharge || 0) + 
            (order.tax || 0) - 
            (order.discount || 0);

        await order.save();

        res.status(200).json({
            data: order,
            Status: {
                Code: 200,
                Message: 'Order items updated successfully',
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

// Add delivery instructions
export const addDeliveryInstructions = async (req: Request, res: Response<DefaultResponseBody<any>>): Promise<void> => {
    try {
        const { id } = req.params;
        const { instructions } = req.body;

        if (!instructions || typeof instructions !== 'string') {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Instructions are required',
                },
            });
            return;
        }

        const order = await OrderModel.findById(id);

        if (!order) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Order not found',
                },
            });
            return;
        }

        // Update deliveryAddress.instructions field
        if (!order.deliveryAddress) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Order does not have delivery address',
                },
            });
            return;
        }

        // Add instructions field (using type assertion as it may not be in the type definition)
        (order.deliveryAddress as any).instructions = instructions;
        await order.save();

        res.status(200).json({
            data: order,
            Status: {
                Code: 200,
                Message: 'Delivery instructions added successfully',
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

// Estimate delivery time
export const estimateDeliveryTime = async (req: Request, res: Response<DefaultResponseBody<any>>): Promise<void> => {
    try {
        const { storeId, deliveryAddress } = req.body;

        if (!storeId || !deliveryAddress) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Store ID and delivery address are required',
                },
            });
            return;
        }

        // Based on storeId location and user delivery address
        // Calculate estimated time (simple: 30-45 mins default)
        // TODO: Implement actual distance calculation based on store and delivery address coordinates
        
        const estimatedMinutes = 30 + Math.floor(Math.random() * 16); // 30-45 mins
        const estimatedDeliveryAt = new Date();
        estimatedDeliveryAt.setMinutes(estimatedDeliveryAt.getMinutes() + estimatedMinutes);

        res.status(200).json({
            data: {
                estimatedTime: `${estimatedMinutes} mins`,
                estimatedDeliveryAt,
            },
            Status: {
                Code: 200,
                Message: 'Delivery time estimated successfully',
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

// Get store order history
export const getStoreOrderHistory = async (req: Request, res: Response<DefaultResponseBody<any>>): Promise<void> => {
    try {
        const { storeId } = req.params;
        const { 
            status, 
            startDate, 
            endDate, 
            page = 1, 
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        if (!storeId) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Store ID is required',
                },
            });
            return;
        }

        const filter: any = {
            storeId: new Types.ObjectId(String(storeId)),
        };

        // Support status filters
        if (status) {
            filter.status = String(status);
        }

        // Support date range
        if (startDate || endDate) {
            const dateFilter: any = {};
            if (startDate) dateFilter.$gte = new Date(String(startDate));
            if (endDate) dateFilter.$lte = new Date(String(endDate));
            filter.createdAt = dateFilter;
        }

        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;

        const sortOptions: any = {};
        sortOptions[String(sortBy)] = sortOrder === 'asc' ? 1 : -1;

        // Get orders with pagination
        const [orders, total] = await Promise.all([
            OrderModel.find(filter)
                .populate('userId', 'name email phone')
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum),
            OrderModel.countDocuments(filter)
        ]);

        // Calculate stats
        const stats = await OrderModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: '$totalAmount' },
                }
            }
        ]);

        res.status(200).json({
            data: {
                orders,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
                stats: stats.length > 0 ? stats[0] : {
                    totalRevenue: 0,
                    totalOrders: 0,
                    averageOrderValue: 0,
                },
            },
            Status: {
                Code: 200,
                Message: 'Store order history retrieved successfully',
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
// Get order statistics
export const getOrderStats = async (req: Request, res: Response<DefaultResponseBody<any>>) => {
    try {
        const { userId, storeId, startDate, endDate } = req.query;

        const filter: any = {};

        if (userId) {
            filter.userId = new Types.ObjectId(String(userId));
        }

        if (storeId) {
            filter.storeId = new Types.ObjectId(String(storeId));
        }

        if (startDate || endDate) {
            const dateFilter: any = {};
            if (startDate) dateFilter.$gte = new Date(String(startDate));
            if (endDate) dateFilter.$lte = new Date(String(endDate));
            filter.createdAt = dateFilter;
        }

        const stats = await OrderModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    avgOrderValue: { $avg: '$totalAmount' },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', OrderStatus.PENDING] }, 1, 0] }
                    },
                    confirmedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', OrderStatus.CONFIRMED] }, 1, 0] }
                    },
                    deliveredOrders: {
                        $sum: { $cond: [{ $eq: ['$status', OrderStatus.DELIVERED] }, 1, 0] }
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ['$status', OrderStatus.CANCELLED] }, 1, 0] }
                    },
                }
            }
        ]);

        res.status(200).json({
            data: stats.length > 0 ? stats[0] : {
                totalOrders: 0,
                totalRevenue: 0,
                avgOrderValue: 0,
                pendingOrders: 0,
                confirmedOrders: 0,
                deliveredOrders: 0,
                cancelledOrders: 0,
            },
            Status: {
                Code: 200,
                Message: 'Order statistics retrieved successfully',
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
