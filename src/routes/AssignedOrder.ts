import { Router } from 'express';
import {
    getAssignedOrder,
    getAssignedOrders,
    getRiderAssignedOrders,
    getUserAssignedOrders,
    assignOrderToRider,
    bulkAssignOrdersToRider,
    updateAssignedOrderStatus,
    updateAssignedOrder,
    deleteAssignedOrder,
    getAssignedOrderStats,
    reassignOrder,
    addDeliveryProof,
    getTrackingInfo,
    verifyPickup
} from '../controllers/AssignedOrder';
import {
    checkAssignedOrderExists,
    validateRiderOwnership,
    validateUserOwnership,
    validateStatusTransition,
    validateBulkAssignment
} from '../middleware/assignedOrder';

const assignedOrderRouter = Router();

// NOTE: Add SADMIN middleware to routes marked with (SADMIN) in production
// NOTE: Add rider authentication middleware to routes marked with (RIDER) in production
// NOTE: Add user authentication middleware to routes marked with (USER) in production

// Get statistics (SADMIN)
assignedOrderRouter.get('/stats', getAssignedOrderStats);

// Get all assigned orders with filters (SADMIN)
assignedOrderRouter.get('/', getAssignedOrders);

// Get single assigned order (SADMIN/RIDER/USER)
assignedOrderRouter.get('/:id', getAssignedOrder);

// Get tracking info
assignedOrderRouter.get('/:id/tracking', getTrackingInfo);

// Get assigned orders for specific rider (SADMIN/RIDER)
assignedOrderRouter.get('/rider/:riderId', getRiderAssignedOrders);

// Get assigned orders for specific user (SADMIN/USER)
assignedOrderRouter.get('/user/:userId', validateUserOwnership, getUserAssignedOrders);

// Assign single order to rider (SADMIN)
assignedOrderRouter.post('/assign', assignOrderToRider);

// Bulk assign multiple orders to rider (SADMIN)
assignedOrderRouter.post('/assign-bulk', validateBulkAssignment, bulkAssignOrdersToRider);

// Update assigned order status (RIDER)
assignedOrderRouter.patch(
    '/:id/status',
    checkAssignedOrderExists,
    validateStatusTransition,
    updateAssignedOrderStatus
);

// Reassign order to different rider (SADMIN)
assignedOrderRouter.patch('/:id/reassign', reassignOrder);

// Add delivery proof (RIDER)
assignedOrderRouter.post('/:id/delivery-proof', addDeliveryProof);

// Verify pickup with OTP (RIDER)
assignedOrderRouter.post('/:id/verify-pickup', verifyPickup);

// Update assigned order details (SADMIN)
assignedOrderRouter.put('/:id', updateAssignedOrder);

// Delete assigned order (SADMIN)
assignedOrderRouter.delete('/:id', deleteAssignedOrder);

export default assignedOrderRouter;
