import { Router } from 'express';
import paymentRouter from './Payment/index';
import jwtAuthMiddleware from '@/middleware/session';
import transactionRouter from './Transaction';
import storeRouter from './Stores/store';
import restaurentRouter from './Stores/restaurent';
import menuItemRouter from './Stores/menuItem';
import medicalRouter from './Stores/medical';
import medicalItemRouter from './Stores/medicalItem';
import groceryRouter from './Stores/grocery';
import groceryItemRouter from './Stores/groceryItem';
import clothesRouter from './Stores/clothes';
import clothesItemRouter from './Stores/clothesItem';
import orderRouter from './Order';
import riderRouter from './Rider';
import assignedOrderRouter from './AssignedOrder';
import reviewRouter from './Review';
import notificationRouter from './Notification';
import couponRouter from './Coupon';
import favoriteRouter from './Favorite';
import supportRouter from './Support';
import searchRouter from './Search';
import analyticsRouter from './Analytics';
import userRouter from './User';

const router = Router();

// User routes
router.use('/user', jwtAuthMiddleware, userRouter);
router.use('/users', jwtAuthMiddleware, userRouter);

// Unified store routes (for admin dashboard)
router.use('/stores', jwtAuthMiddleware, storeRouter);

// Restaurant routes
router.use('/stores/restaurents', jwtAuthMiddleware, restaurentRouter);
router.use('/stores/menu-items', jwtAuthMiddleware, menuItemRouter);

// Medical routes
router.use('/stores/medical', jwtAuthMiddleware, medicalRouter);
router.use('/stores/medical-items', jwtAuthMiddleware, medicalItemRouter);

// Grocery routes
router.use('/stores/grocery', jwtAuthMiddleware, groceryRouter);
router.use('/stores/grocery-items', jwtAuthMiddleware, groceryItemRouter);

// Clothes routes
router.use('/stores/clothes', jwtAuthMiddleware, clothesRouter);
router.use('/stores/clothes-items', jwtAuthMiddleware, clothesItemRouter);

// Order routes
router.use('/orders', jwtAuthMiddleware, orderRouter);

// Rider routes (SADMIN access required for CRUD operations)
router.use('/riders', jwtAuthMiddleware, riderRouter);

// Assigned Order routes (SADMIN for assignments, RIDER for status updates)
router.use('/assigned-orders', jwtAuthMiddleware, assignedOrderRouter);

// Review routes
router.use('/reviews', jwtAuthMiddleware, reviewRouter);

// Notification routes
router.use('/notifications', jwtAuthMiddleware, notificationRouter);

// Coupon routes
router.use('/coupons', jwtAuthMiddleware, couponRouter);

// Favorite routes
router.use('/favorites', jwtAuthMiddleware, favoriteRouter);

// Support ticket routes
router.use('/support', jwtAuthMiddleware, supportRouter);

// Search routes
router.use('/search', jwtAuthMiddleware, searchRouter);

// Analytics routes (SADMIN access)
router.use('/analytics', jwtAuthMiddleware, analyticsRouter);

// Payment and Transaction routes
router.use('/payment', jwtAuthMiddleware, paymentRouter);
router.use('/transaction', jwtAuthMiddleware, transactionRouter);

export default router;
