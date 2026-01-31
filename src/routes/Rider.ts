import { Router } from 'express';
import {
    getRider,
    getRiders,
    getAvailableRiders,
    createRider,
    updateRider,
    deleteRider,
    toggleRiderStatus,
    getRiderAssignedOrders,
    updateRiderLocation,
    getRiderStats,
} from '../controllers/Rider';

const router = Router();

// NOTE: Add SADMIN middleware to these routes in production
// Example: router.post('/', sadminMiddleware, createRider);

// Get rider statistics
router.get('/stats', getRiderStats);

// Get available riders
router.get('/available', getAvailableRiders);

// Get all riders
router.get('/', getRiders);

// Get a single rider
router.get('/:id', getRider);

// Get rider's assigned orders
router.get('/:id/orders', getRiderAssignedOrders);

// Create a new rider (SADMIN only)
router.post('/', createRider);

// Update rider location
router.patch('/:id/location', updateRiderLocation);

// Update rider (SADMIN only)
router.put('/:id', updateRider);

// Toggle rider active status (SADMIN only)
router.patch('/:id/toggle-status', toggleRiderStatus);

// Delete rider (SADMIN only)
router.delete('/:id', deleteRider);

export default router;
