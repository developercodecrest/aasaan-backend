import { Request, Response } from 'express';
import NotificationModel from '../schemas/Notification';
import { DefaultResponseBody } from '../types/default';
import { CreateNotificationDTO, NotificationFilterDTO } from '../types/notification';

// Get single notification by ID
export const getNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const notification = await NotificationModel.findById(id)
            .populate('userId', 'name profileImage');

        if (!notification) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Notification not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: notification,
            Status: {
                Code: 200,
                Message: 'Notification retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve notification'
            }
        });
    }
};

// Get all notifications with filters
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { 
            type, 
            isRead, 
            fromDate, 
            toDate,
            page = 1, 
            limit = 20 
        } = req.query as any;

        const filter: any = { userId };

        if (type) filter.type = type;
        if (isRead !== undefined) filter.isRead = isRead === 'true';

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) filter.createdAt.$lte = new Date(toDate);
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [notifications, total] = await Promise.all([
            NotificationModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            NotificationModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                notifications,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Notifications retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve notifications'
            }
        });
    }
};

// Get notifications for a specific user (admin use)
export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { 
            type, 
            isRead, 
            fromDate, 
            toDate,
            page = 1, 
            limit = 20 
        } = req.query as any;

        const filter: any = { userId };

        if (type) filter.type = type;
        if (isRead !== undefined) filter.isRead = isRead === 'true';

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) filter.createdAt.$lte = new Date(toDate);
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [notifications, total] = await Promise.all([
            NotificationModel.find(filter)
                .populate('userId', 'name profileImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            NotificationModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                notifications,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'User notifications retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve user notifications'
            }
        });
    }
};

// Create notification (for system use)
export const createNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, type, title, message, data } = req.body as CreateNotificationDTO;

        if (!userId || !type || !title || !message) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Missing required fields: userId, type, title, message'
                }
            });
            return;
        }

        const notification = await NotificationModel.create({
            userId,
            type,
            title,
            message,
            data
        });

        const populatedNotification = await NotificationModel.findById(notification._id)
            .populate('userId', 'name profileImage');

        res.status(201).json({
            data: populatedNotification,
            Status: {
                Code: 201,
                Message: 'Notification created successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to create notification'
            }
        });
    }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        const notification = await NotificationModel.findOne({ 
            _id: id, 
            userId 
        });

        if (!notification) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Notification not found'
                }
            });
            return;
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.status(200).json({
            data: notification,
            Status: {
                Code: 200,
                Message: 'Notification marked as read'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to mark notification as read'
            }
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { notificationIds } = req.body;

        let filter: any = { userId, isRead: false };

        // If specific notification IDs are provided, only mark those
        if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
            filter._id = { $in: notificationIds };
        }

        const result = await NotificationModel.updateMany(
            filter,
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                }
            }
        );

        res.status(200).json({
            data: {
                modifiedCount: result.modifiedCount
            },
            Status: {
                Code: 200,
                Message: `${result.modifiedCount} notification(s) marked as read`
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to mark notifications as read'
            }
        });
    }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        const notification = await NotificationModel.findOneAndDelete({ 
            _id: id, 
            userId 
        });

        if (!notification) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Notification not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: notification,
            Status: {
                Code: 200,
                Message: 'Notification deleted successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to delete notification'
            }
        });
    }
};

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;

        const unreadCount = await NotificationModel.countDocuments({
            userId,
            isRead: false
        });

        res.status(200).json({
            data: { unreadCount },
            Status: {
                Code: 200,
                Message: 'Unread count retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve unread count'
            }
        });
    }
};
