import { Router } from 'express';
import {
    getCoupon,
    getCoupons,
    getAvailableCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    applyCoupon,
    getCouponStats
} from '../controllers/Coupon';

const couponRouter = Router();

// Get statistics
couponRouter.get('/stats', getCouponStats);

// Get available coupons (active + valid)
couponRouter.get('/available', getAvailableCoupons);

// Get all coupons
couponRouter.get('/', getCoupons);

// Get single coupon
couponRouter.get('/:id', getCoupon);

// Validate coupon
couponRouter.post('/validate', validateCoupon);

// Apply coupon to order
couponRouter.post('/apply', applyCoupon);

// Create coupon (SADMIN)
couponRouter.post('/create', createCoupon);

// Update coupon (SADMIN)
couponRouter.put('/:id', updateCoupon);

// Toggle coupon status (SADMIN)
couponRouter.patch('/:id/toggle-status', toggleCouponStatus);

// Delete coupon (SADMIN)
couponRouter.delete('/:id', deleteCoupon);

export default couponRouter;
