import { Router } from 'express';
import {
    getOrder,
    getOrders,
    getUserOrders,
    getStoreOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updateOrderTransaction,
    cancelOrder,
    deleteOrder,
    getOrderStats,
    updateOrderItems,
    addDeliveryInstructions,
    estimateDeliveryTime,
    getStoreOrderHistory
} from '../controllers/Order';

const router = Router();

// Get order statistics
router.get('/stats', getOrderStats);

// Get all orders
router.get('/', getOrders);

// Get a single order
router.get('/:id', getOrder);

// Get user's orders
router.get('/user/:userId', getUserOrders);

// Get store's orders
router.get('/store/:storeId', getStoreOrders);

// Get store order history
router.get('/store/:storeId/history', getStoreOrderHistory);

// Estimate delivery time
router.post('/estimate-delivery', estimateDeliveryTime);

// Create a new order
router.post('/', createOrder);

// Update order
router.put('/:id', updateOrder);

// Update order status
router.patch('/:id/status', updateOrderStatus);

// Update order items
router.patch('/:id/items', updateOrderItems);

// Add delivery instructions
router.patch('/:id/delivery-instructions', addDeliveryInstructions);

// Update transaction details
router.patch('/:id/transaction', updateOrderTransaction);

// Cancel order
router.patch('/:id/cancel', cancelOrder);

// Delete order
router.delete('/:id', deleteOrder);

export default router;
