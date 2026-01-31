import { Request, Response, NextFunction } from 'express';
import AssignedOrderModel from '../schemas/AssignedOrder';
import { DefaultResponseBody } from '../types/default';

// Middleware to check if assigned order exists
export const checkAssignedOrderExists = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

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

        // Attach assigned order to request for use in controller
        (req as any).assignedOrder = assignedOrder;
        next();
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Error checking assigned order'
            }
        });
    }
};

// Middleware to validate rider ownership (rider can only update their own assigned orders)
export const validateRiderOwnership = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const riderId = (req as any).riderId; // Assuming riderId is set by auth middleware

        if (!riderId) {
            res.status(401).json({
                data: null,
                Status: {
                    Code: 401,
                    Message: 'Rider not authenticated'
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

        if (assignedOrder.riderId.toString() !== riderId.toString()) {
            res.status(403).json({
                data: null,
                Status: {
                    Code: 403,
                    Message: 'You are not authorized to access this assigned order'
                }
            });
            return;
        }

        (req as any).assignedOrder = assignedOrder;
        next();
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Error validating rider ownership'
            }
        });
    }
};

// Middleware to validate user ownership (user can only view their own assigned orders)
export const validateUserOwnership = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { userId } = req.params;
        const authenticatedUserId = (req as any).userId; // Assuming userId is set by auth middleware

        if (!authenticatedUserId) {
            res.status(401).json({
                data: null,
                Status: {
                    Code: 401,
                    Message: 'User not authenticated'
                }
            });
            return;
        }

        // Allow SADMIN to access any user's assigned orders
        const isSADMIN = (req as any).isSADMIN; // Assuming SADMIN flag is set by auth middleware
        
        if (!isSADMIN && userId !== authenticatedUserId.toString()) {
            res.status(403).json({
                data: null,
                Status: {
                    Code: 403,
                    Message: 'You are not authorized to access this user\'s assigned orders'
                }
            });
            return;
        }

        next();
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Error validating user ownership'
            }
        });
    }
};

// Middleware to validate assigned order status transition
export const validateStatusTransition = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { status } = req.body;
        const assignedOrder = (req as any).assignedOrder;

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

        const currentStatus = assignedOrder.status;

        // Define valid status transitions
        const validTransitions: { [key: string]: string[] } = {
            'assigned': ['picked-up', 'cancelled'],
            'picked-up': ['in-transit', 'cancelled'],
            'in-transit': ['delivered', 'cancelled'],
            'delivered': [], // Terminal state
            'cancelled': []  // Terminal state
        };

        if (!validTransitions[currentStatus]?.includes(status)) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: `Invalid status transition from ${currentStatus} to ${status}`
                }
            });
            return;
        }

        next();
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Error validating status transition'
            }
        });
    }
};

// Middleware to validate bulk assignment request
export const validateBulkAssignment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { riderId, orders } = req.body;

        if (!riderId) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Rider ID is required'
                }
            });
            return;
        }

        if (!orders || !Array.isArray(orders) || orders.length === 0) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Orders array is required and must not be empty'
                }
            });
            return;
        }

        // Validate each order has required fields
        for (let i = 0; i < orders.length; i++) {
            if (!orders[i].orderId || !orders[i].userId) {
                res.status(400).json({
                    data: null,
                    Status: {
                        Code: 400,
                        Message: `Order at index ${i} is missing orderId or userId`
                    }
                });
                return;
            }
        }

        next();
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Error validating bulk assignment'
            }
        });
    }
};
