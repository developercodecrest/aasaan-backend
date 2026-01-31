import { Request, Response } from 'express';
import AssignedOrderModel from '../schemas/AssignedOrder';
import RiderModel from '../schemas/Rider';
import OrderModel from '../schemas/Order';
import { DefaultResponseBody } from '../types/default';
import { AssignedOrderStatus, CreateAssignedOrderDTO, UpdateAssignedOrderDTO, UpdateAssignedOrderStatusDTO, AssignedOrderFilterDTO, BulkAssignOrdersDTO } from '../types/assignedOrder';
import { RiderStatus } from '../types/rider';
import { Types } from 'mongoose';
import { OrderStatus } from '../types/order';

// Get single assigned order by ID
export const getAssignedOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const assignedOrder = await AssignedOrderModel.findById(id)
            .populate('rider', '-password')
            .populate('order')
            .populate('user', '-password');

        if (!assignedOrder) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Assigned order not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: assignedOrder,
            Status: {
                Code: 200,
                Message: 'Assigned order retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve assigned order'
            }
        });
    }
};

// Get all assigned orders with filters
export const getAssignedOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { riderId, orderId, userId, status, fromDate, toDate, page = 1, limit = 20 } = req.query as any;

        const filter: any = {};

        if (riderId) filter.riderId = riderId;
        if (orderId) filter.orderId = orderId;
        if (userId) filter.userId = userId;
        if (status) filter.status = status;

        if (fromDate || toDate) {
            filter.assignedAt = {};
            if (fromDate) filter.assignedAt.$gte = new Date(fromDate);
            if (toDate) filter.assignedAt.$lte = new Date(toDate);
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [assignedOrders, total] = await Promise.all([
            AssignedOrderModel.find(filter)
                .populate('rider', '-password')
                .populate('order')
                .populate('user', '-password')
                .sort({ assignedAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            AssignedOrderModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                assignedOrders,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Assigned orders retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve assigned orders'
            }
        });
    }
};

// Get assigned orders for a specific rider
export const getRiderAssignedOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { riderId } = req.params;
        const { status } = req.query;

        const filter: any = { riderId };
        if (status) filter.status = status;

        const assignedOrders = await AssignedOrderModel.find(filter)
            .populate('order')
            .populate('user', '-password')
            .sort({ assignedAt: -1 });

        res.status(200).json({
            data: assignedOrders,
            Status: {
                Code: 200,
                Message: 'Rider assigned orders retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve rider assigned orders'
            }
        });
    }
};

// Get assigned orders for a specific user
export const getUserAssignedOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { status } = req.query;

        const filter: any = { userId };
        if (status) filter.status = status;

        const assignedOrders = await AssignedOrderModel.find(filter)
            .populate('rider', '-password')
            .populate('order')
            .sort({ assignedAt: -1 });

        res.status(200).json({
            data: assignedOrders,
            Status: {
                Code: 200,
                Message: 'User assigned orders retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve user assigned orders'
            }
        });
    }
};

// Assign order to rider (SADMIN only)
export const assignOrderToRider = async (req: Request, res: Response): Promise<void> => {
    try {
        const { riderId, orderId, userId, notes } = req.body as CreateAssignedOrderDTO;

        // Validate rider exists
        const rider = await RiderModel.findById(riderId);
        if (!rider) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Rider not found'
                }
            });
            return;
        }

        // Validate order exists
        const order = await OrderModel.findById(orderId);
        if (!order) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Order not found'
                }
            });
            return;
        }

        // Check if order already assigned to this rider
        const existingAssignment = await AssignedOrderModel.findOne({ orderId, riderId });
        if (existingAssignment) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Order already assigned to this rider'
                }
            });
            return;
        }

        // Create assigned order
        const assignedOrder = await AssignedOrderModel.create({
            riderId,
            orderId,
            userId,
            notes,
            status: AssignedOrderStatus.ASSIGNED
        });

        // Update rider status to BUSY if currently AVAILABLE
        if (rider.status === RiderStatus.AVAILABLE) {
            rider.status = RiderStatus.BUSY;
            await rider.save();
        }

        const populatedAssignedOrder = await AssignedOrderModel.findById(assignedOrder._id)
            .populate('rider', '-password')
            .populate('order')
            .populate('user', '-password');

        res.status(201).json({
            data: populatedAssignedOrder,
            Status: {
                Code: 201,
                Message: 'Order assigned to rider successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to assign order to rider'
            }
        });
    }
};

// Bulk assign multiple orders to rider (SADMIN only)
export const bulkAssignOrdersToRider = async (req: Request, res: Response): Promise<void> => {
    try {
        const { riderId, orders } = req.body as BulkAssignOrdersDTO;

        // Validate rider exists
        const rider = await RiderModel.findById(riderId);
        if (!rider) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Rider not found'
                }
            });
            return;
        }

        // Validate all orders exist
        const orderIds = orders.map(o => o.orderId);
        const existingOrders = await OrderModel.find({ _id: { $in: orderIds } });
        if (existingOrders.length !== orderIds.length) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'One or more orders not found'
                }
            });
            return;
        }

        // Check for existing assignments
        const existingAssignments = await AssignedOrderModel.find({
            riderId,
            orderId: { $in: orderIds }
        });

        if (existingAssignments.length > 0) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: `${existingAssignments.length} order(s) already assigned to this rider`
                }
            });
            return;
        }

        // Create assigned orders
        const assignedOrdersData = orders.map(order => ({
            riderId,
            orderId: order.orderId,
            userId: order.userId,
            notes: order.notes,
            status: AssignedOrderStatus.ASSIGNED
        }));

        const assignedOrders = await AssignedOrderModel.insertMany(assignedOrdersData);

        // Update rider status to BUSY
        if (rider.status === RiderStatus.AVAILABLE) {
            rider.status = RiderStatus.BUSY;
            await rider.save();
        }

        const populatedAssignedOrders = await AssignedOrderModel.find({
            _id: { $in: assignedOrders.map(ao => ao._id) }
        })
            .populate('rider', '-password')
            .populate('order')
            .populate('user', '-password');

        res.status(201).json({
            data: populatedAssignedOrders,
            Status: {
                Code: 201,
                Message: `${assignedOrders.length} orders assigned to rider successfully`
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to bulk assign orders to rider'
            }
        });
    }
};

// Update assigned order status
export const updateAssignedOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body as UpdateAssignedOrderStatusDTO;

        const assignedOrder = await AssignedOrderModel.findById(id);
        if (!assignedOrder) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Assigned order not found'
                }
            });
            return;
        }

        // Update status and timestamp
        assignedOrder.status = status;

        switch (status) {
            case AssignedOrderStatus.PICKED_UP:
                assignedOrder.pickedUpAt = new Date();
                break;
            case AssignedOrderStatus.DELIVERED:
                assignedOrder.deliveredAt = new Date();
                // Update rider's total deliveries
                await RiderModel.findByIdAndUpdate(
                    assignedOrder.riderId,
                    { $inc: { totalDeliveries: 1 } }
                );
                break;
            case AssignedOrderStatus.CANCELLED:
                assignedOrder.cancelledAt = new Date();
                break;
        }

        await assignedOrder.save();

        // Check if rider has any active assignments left
        if (status === AssignedOrderStatus.DELIVERED || status === AssignedOrderStatus.CANCELLED) {
            const activeAssignments = await AssignedOrderModel.countDocuments({
                riderId: assignedOrder.riderId,
                status: { 
                    $nin: [AssignedOrderStatus.DELIVERED, AssignedOrderStatus.CANCELLED] 
                }
            });

            // If no active assignments, set rider to AVAILABLE
            if (activeAssignments === 0) {
                await RiderModel.findByIdAndUpdate(
                    assignedOrder.riderId,
                    { status: RiderStatus.AVAILABLE }
                );
            }
        }

        const updatedAssignedOrder = await AssignedOrderModel.findById(id)
            .populate('rider', '-password')
            .populate('order')
            .populate('user', '-password');

        res.status(200).json({
            data: updatedAssignedOrder,
            Status: {
                Code: 200,
                Message: 'Assigned order status updated successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to update assigned order status'
            }
        });
    }
};

// Update assigned order details (SADMIN only)
export const updateAssignedOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body as UpdateAssignedOrderDTO;

        const assignedOrder = await AssignedOrderModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('rider', '-password')
            .populate('order')
            .populate('user', '-password');

        if (!assignedOrder) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Assigned order not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: assignedOrder,
            Status: {
                Code: 200,
                Message: 'Assigned order updated successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to update assigned order'
            }
        });
    }
};

// Delete assigned order (SADMIN only)
export const deleteAssignedOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const assignedOrder = await AssignedOrderModel.findByIdAndDelete(id);

        if (!assignedOrder) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Assigned order not found'
                }
            });
            return;
        }

        // Check if rider has any active assignments left
        const activeAssignments = await AssignedOrderModel.countDocuments({
            riderId: assignedOrder.riderId,
            status: { 
                $nin: [AssignedOrderStatus.DELIVERED, AssignedOrderStatus.CANCELLED] 
            }
        });

        // If no active assignments, set rider to AVAILABLE
        if (activeAssignments === 0) {
            await RiderModel.findByIdAndUpdate(
                assignedOrder.riderId,
                { status: RiderStatus.AVAILABLE }
            );
        }

        res.status(200).json({
            data: null,
            Status: {
                Code: 200,
                Message: 'Assigned order deleted successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to delete assigned order'
            }
        });
    }
};

// Get assigned order statistics
export const getAssignedOrderStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { riderId } = req.query;

        const matchStage: any = {};
        if (riderId) matchStage.riderId = riderId;

        const stats = await AssignedOrderModel.aggregate([
            ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
            {
                $group: {
                    _id: null,
                    totalAssignments: { $sum: 1 },
                    assignedCount: {
                        $sum: { $cond: [{ $eq: ['$status', AssignedOrderStatus.ASSIGNED] }, 1, 0] }
                    },
                    pickedUpCount: {
                        $sum: { $cond: [{ $eq: ['$status', AssignedOrderStatus.PICKED_UP] }, 1, 0] }
                    },
                    inTransitCount: {
                        $sum: { $cond: [{ $eq: ['$status', AssignedOrderStatus.IN_TRANSIT] }, 1, 0] }
                    },
                    deliveredCount: {
                        $sum: { $cond: [{ $eq: ['$status', AssignedOrderStatus.DELIVERED] }, 1, 0] }
                    },
                    cancelledCount: {
                        $sum: { $cond: [{ $eq: ['$status', AssignedOrderStatus.CANCELLED] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalAssignments: 0,
            assignedCount: 0,
            pickedUpCount: 0,
            inTransitCount: 0,
            deliveredCount: 0,
            cancelledCount: 0
        };

        res.status(200).json({
            data: result,
            Status: {
                Code: 200,
                Message: 'Assigned order statistics retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve assigned order statistics'
            }
        });
    }
};

// Reassign order to different rider
export const reassignOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { newRiderId, reason } = req.body;

        if (!newRiderId) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'New rider ID is required'
                }
            });
            return;
        }

        // Check current assignment exists
        const assignedOrder = await AssignedOrderModel.findById(id).populate('rider');
        if (!assignedOrder) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Assigned order not found'
                }
            });
            return;
        }

        // Validate new rider exists
        const newRider = await RiderModel.findById(newRiderId);
        if (!newRider) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'New rider not found'
                }
            });
            return;
        }

        // Check if already assigned to the same rider
        if (assignedOrder.riderId.toString() === newRiderId) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Order is already assigned to this rider'
                }
            });
            return;
        }

        const oldRiderId = assignedOrder.riderId;

        // Change riderId to new rider
        assignedOrder.riderId = new Types.ObjectId(newRiderId);
        if (reason) {
            assignedOrder.notes = (assignedOrder.notes || '') + `\nReassigned: ${reason}`;
        }
        await assignedOrder.save();

        // Update old rider status if no more assignments
        const oldRiderAssignments = await AssignedOrderModel.countDocuments({
            riderId: oldRiderId,
            status: { $in: [AssignedOrderStatus.ASSIGNED, AssignedOrderStatus.PICKED_UP] }
        });

        if (oldRiderAssignments === 0) {
            await RiderModel.findByIdAndUpdate(oldRiderId, { status: RiderStatus.AVAILABLE });
        }

        // Update new rider status to BUSY
        if (newRider.status === RiderStatus.AVAILABLE) {
            newRider.status = RiderStatus.BUSY;
            await newRider.save();
        }

        const updatedAssignment = await AssignedOrderModel.findById(id)
            .populate('rider', '-password')
            .populate('order')
            .populate('user', '-password');

        // TODO: Send notification to old rider about reassignment
        // TODO: Send notification to new rider about new assignment
        // TODO: Send notification to user about rider change

        res.status(200).json({
            data: updatedAssignment,
            Status: {
                Code: 200,
                Message: 'Order reassigned successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to reassign order'
            }
        });
    }
};

// Add delivery proof (photo/signature)
export const addDeliveryProof = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { deliveryProof, proofType } = req.body;

        if (!deliveryProof) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Delivery proof is required'
                }
            });
            return;
        }

        const assignedOrder = await AssignedOrderModel.findById(id);
        if (!assignedOrder) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Assigned order not found'
                }
            });
            return;
        }

        // Check if order is in picked up status
        if (assignedOrder.status !== AssignedOrderStatus.PICKED_UP) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Order must be picked up before adding delivery proof'
                }
            });
            return;
        }

        // Add deliveryProof field to assigned order
        const proofData = Array.isArray(deliveryProof) ? deliveryProof : [deliveryProof];
        
        // Add deliveryProof field (using type assertion as it may not be in the type definition)
        (assignedOrder as any).deliveryProof = proofData;
        assignedOrder.status = AssignedOrderStatus.DELIVERED;
        assignedOrder.deliveredAt = new Date();
        await assignedOrder.save();

        // Update order status
        await OrderModel.findByIdAndUpdate(assignedOrder.orderId, {
            status: OrderStatus.DELIVERED,
            deliveredAt: new Date()
        });

        // Update rider status to available
        const rider = await RiderModel.findById(assignedOrder.riderId);
        if (rider) {
            const activeAssignments = await AssignedOrderModel.countDocuments({
                riderId: rider._id,
                status: { $in: [AssignedOrderStatus.ASSIGNED, AssignedOrderStatus.PICKED_UP] }
            });

            if (activeAssignments === 0) {
                rider.status = RiderStatus.AVAILABLE;
                await rider.save();
            }
        }

        const updatedAssignment = await AssignedOrderModel.findById(id)
            .populate('rider', '-password')
            .populate('order')
            .populate('user', '-password');

        // TODO: Send notification to user about successful delivery
        // TODO: Update delivery proof in notification with image/signature

        res.status(200).json({
            data: updatedAssignment,
            Status: {
                Code: 200,
                Message: 'Delivery proof added successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to add delivery proof'
            }
        });
    }
};

// Get tracking info
export const getTrackingInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Populate assigned order with rider.currentLocation
        const assignedOrder = await AssignedOrderModel.findById(id)
            .populate('rider', '-password')
            .populate('order')
            .populate('user', '-password');

        if (!assignedOrder) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Assigned order not found'
                }
            });
            return;
        }

        const rider = await RiderModel.findById(assignedOrder.riderId);
        if (!rider) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Rider not found'
                }
            });
            return;
        }

        // Create status history
        const statusHistory = [
            { status: AssignedOrderStatus.ASSIGNED, timestamp: assignedOrder.assignedAt },
        ];

        if (assignedOrder.pickedUpAt) {
            statusHistory.push({ status: AssignedOrderStatus.PICKED_UP, timestamp: assignedOrder.pickedUpAt });
        }

        if (assignedOrder.deliveredAt) {
            statusHistory.push({ status: AssignedOrderStatus.DELIVERED, timestamp: assignedOrder.deliveredAt });
        }

        // Get order details
        const order = await OrderModel.findById(assignedOrder.orderId);

        res.status(200).json({
            data: {
                assignedOrder,
                rider: {
                    name: rider.name,
                    phone: rider.phone,
                    currentLocation: rider.currentLocation,
                    vehicleType: rider.vehicleType,
                    vehicleNumber: rider.vehicleNumber,
                },
                order,
                statusHistory,
            },
            Status: {
                Code: 200,
                Message: 'Tracking info retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve tracking info'
            }
        });
    }
};

// Verify pickup with OTP (bonus - simple implementation)
export const verifyPickup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { otp } = req.body;

        if (!otp) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'OTP is required'
                }
            });
            return;
        }

        const assignedOrder = await AssignedOrderModel.findById(id);
        if (!assignedOrder) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Assigned order not found'
                }
            });
            return;
        }

        // Check if order is in assigned status
        if (assignedOrder.status !== AssignedOrderStatus.ASSIGNED) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Order must be in assigned status to verify pickup'
                }
            });
            return;
        }

        // Get order details
        const order = await OrderModel.findById(assignedOrder.orderId);
        if (!order) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Order not found'
                }
            });
            return;
        }

        // Simple: check OTP matches (can be order last 4 digits)
        const expectedOtp = (order as any).orderId?.toString().slice(-4) || order._id.toString().slice(-4);

        if (otp !== expectedOtp) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Invalid OTP'
                }
            });
            return;
        }

        // Update status to PICKED_UP
        assignedOrder.status = AssignedOrderStatus.PICKED_UP;
        assignedOrder.pickedUpAt = new Date();
        await assignedOrder.save();

        // Update order status
        await OrderModel.findByIdAndUpdate(assignedOrder.orderId, {
            status: OrderStatus.CONFIRMED
        });

        const updatedAssignment = await AssignedOrderModel.findById(id)
            .populate('rider', '-password')
            .populate('order')
            .populate('user', '-password');

        // TODO: Send notification to user about order pickup

        res.status(200).json({
            data: updatedAssignment,
            Status: {
                Code: 200,
                Message: 'Pickup verified successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to verify pickup'
            }
        });
    }
};
