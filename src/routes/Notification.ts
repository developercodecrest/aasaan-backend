import { Router } from 'express';
import {
    getNotification,
    getNotifications,
    getUserNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
} from '../controllers/Notification';

const notificationRouter = Router();

// Get unread count
notificationRouter.get('/unread-count', getUnreadCount);

// Get all notifications (for logged-in user)
notificationRouter.get('/', getNotifications);

// Get single notification
notificationRouter.get('/:id', getNotification);

// Get user notifications (SADMIN)
notificationRouter.get('/user/:userId', getUserNotifications);

// Create notification (System/SADMIN)
notificationRouter.post('/', createNotification);

// Mark as read
notificationRouter.patch('/:id/read', markAsRead);

// Mark all as read
notificationRouter.patch('/mark-all-read', markAllAsRead);

// Delete notification
notificationRouter.delete('/:id', deleteNotification);

export default notificationRouter;
