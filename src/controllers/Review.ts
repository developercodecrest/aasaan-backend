import { Request, Response } from 'express';
import ReviewModel from '../schemas/Review';
import RiderModel from '../schemas/Rider';
import OrderModel from '../schemas/Order';
import { DefaultResponseBody } from '../types/default';
import { ReviewType, CreateReviewDTO, UpdateReviewDTO, ReplyToReviewDTO, ReviewFilterDTO } from '../types/review';

// Get single review by ID
export const getReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const review = await ReviewModel.findById(id)
            .populate('user', 'name profileImage')
            .populate('store')
            .populate('rider', 'name profileImage rating')
            .populate('order');

        if (!review) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Review not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: review,
            Status: {
                Code: 200,
                Message: 'Review retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve review'
            }
        });
    }
};

// Get all reviews with filters
export const getReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            reviewType, 
            storeType, 
            storeId, 
            riderId, 
            orderId, 
            userId,
            rating,
            minRating,
            isVerifiedPurchase,
            isApproved,
            isFlagged,
            page = 1, 
            limit = 20 
        } = req.query as any;

        const filter: any = {};

        if (reviewType) filter.reviewType = reviewType;
        if (storeType) filter.storeType = storeType;
        if (storeId) filter.storeId = storeId;
        if (riderId) filter.riderId = riderId;
        if (orderId) filter.orderId = orderId;
        if (userId) filter.userId = userId;
        if (rating) filter.rating = Number(rating);
        if (minRating) filter.rating = { $gte: Number(minRating) };
        if (isVerifiedPurchase !== undefined) filter.isVerifiedPurchase = isVerifiedPurchase === 'true';
        if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
        if (isFlagged !== undefined) filter.isFlagged = isFlagged === 'true';

        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            ReviewModel.find(filter)
                .populate('user', 'name profileImage')
                .populate('store')
                .populate('rider', 'name profileImage rating')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            ReviewModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                reviews,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Reviews retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve reviews'
            }
        });
    }
};

// Get reviews for a specific store
export const getStoreReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const { rating, page = 1, limit = 20 } = req.query as any;

        const filter: any = { 
            storeId,
            reviewType: ReviewType.STORE,
            isApproved: true
        };

        if (rating) filter.rating = Number(rating);

        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            ReviewModel.find(filter)
                .populate('user', 'name profileImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            ReviewModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                reviews,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Store reviews retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve store reviews'
            }
        });
    }
};

// Get reviews for a specific rider
export const getRiderReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { riderId } = req.params;
        const { rating, page = 1, limit = 20 } = req.query as any;

        const filter: any = { 
            riderId,
            reviewType: ReviewType.RIDER,
            isApproved: true
        };

        if (rating) filter.rating = Number(rating);

        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            ReviewModel.find(filter)
                .populate('user', 'name profileImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            ReviewModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                reviews,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Rider reviews retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve rider reviews'
            }
        });
    }
};

// Get user's reviews
export const getUserReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query as any;

        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            ReviewModel.find({ userId })
                .populate('store')
                .populate('rider', 'name profileImage rating')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            ReviewModel.countDocuments({ userId })
        ]);

        res.status(200).json({
            data: {
                reviews,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'User reviews retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve user reviews'
            }
        });
    }
};

// Create a new review
export const createReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId; // From JWT middleware
        const reviewData = req.body as CreateReviewDTO;

        // Check if user already reviewed
        const filter: any = { userId };
        
        if (reviewData.storeId) filter.storeId = reviewData.storeId;
        if (reviewData.riderId) filter.riderId = reviewData.riderId;
        if (reviewData.orderId) filter.orderId = reviewData.orderId;

        const existingReview = await ReviewModel.findOne(filter);
        if (existingReview) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'You have already reviewed this'
                }
            });
            return;
        }

        // Check if verified purchase (if order review)
        let isVerifiedPurchase = false;
        if (reviewData.orderId) {
            const order = await OrderModel.findOne({
                _id: reviewData.orderId,
                userId
            });
            isVerifiedPurchase = !!order;
        }

        const review = await ReviewModel.create({
            ...reviewData,
            userId,
            isVerifiedPurchase
        });

        // Update store/rider average rating
        if (reviewData.storeId && reviewData.storeType) {
            await updateStoreRating(reviewData.storeType, reviewData.storeId);
        } else if (reviewData.riderId) {
            await updateRiderRating(reviewData.riderId);
        }

        const populatedReview = await ReviewModel.findById(review._id)
            .populate('user', 'name profileImage')
            .populate('store')
            .populate('rider', 'name profileImage rating');

        res.status(201).json({
            data: populatedReview,
            Status: {
                Code: 201,
                Message: 'Review created successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to create review'
            }
        });
    }
};

// Update review
export const updateReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const updateData = req.body as UpdateReviewDTO;

        const review = await ReviewModel.findOne({ _id: id, userId });
        if (!review) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Review not found or unauthorized'
                }
            });
            return;
        }

        Object.assign(review, updateData);
        await review.save();

        // Update store/rider average rating
        if (review.storeId && review.storeType) {
            await updateStoreRating(review.storeType, review.storeId.toString());
        } else if (review.riderId) {
            await updateRiderRating(review.riderId.toString());
        }

        const updatedReview = await ReviewModel.findById(id)
            .populate('user', 'name profileImage')
            .populate('store')
            .populate('rider', 'name profileImage rating');

        res.status(200).json({
            data: updatedReview,
            Status: {
                Code: 200,
                Message: 'Review updated successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to update review'
            }
        });
    }
};

// Delete review
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        const review = await ReviewModel.findOneAndDelete({ _id: id, userId });
        if (!review) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Review not found or unauthorized'
                }
            });
            return;
        }

        // Update store/rider average rating
        if (review.storeId && review.storeType) {
            await updateStoreRating(review.storeType, review.storeId.toString());
        } else if (review.riderId) {
            await updateRiderRating(review.riderId.toString());
        }

        res.status(200).json({
            data: null,
            Status: {
                Code: 200,
                Message: 'Review deleted successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to delete review'
            }
        });
    }
};

// Reply to review (Store owner/SADMIN)
export const replyToReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const { reply } = req.body as ReplyToReviewDTO;

        const review = await ReviewModel.findById(id);
        if (!review) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Review not found'
                }
            });
            return;
        }

        review.reply = reply;
        review.repliedBy = userId;
        review.repliedAt = new Date();
        await review.save();

        const updatedReview = await ReviewModel.findById(id)
            .populate('user', 'name profileImage')
            .populate('store')
            .populate('rider', 'name profileImage rating')
            .populate('repliedBy', 'name');

        res.status(200).json({
            data: updatedReview,
            Status: {
                Code: 200,
                Message: 'Reply added successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to reply to review'
            }
        });
    }
};

// Mark review as helpful/unhelpful
export const markReviewHelpful = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { helpful } = req.body;

        const review = await ReviewModel.findById(id);
        if (!review) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Review not found'
                }
            });
            return;
        }

        if (helpful) {
            review.helpfulCount += 1;
        } else {
            review.unhelpfulCount += 1;
        }

        await review.save();

        res.status(200).json({
            data: review,
            Status: {
                Code: 200,
                Message: 'Review marked successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to mark review'
            }
        });
    }
};

// Flag review (inappropriate content)
export const flagReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const review = await ReviewModel.findByIdAndUpdate(
            id,
            { isFlagged: true },
            { new: true }
        );

        if (!review) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Review not found'
                }
            });
            return;
        }

        // TODO: Send notification to admin about flagged review

        res.status(200).json({
            data: review,
            Status: {
                Code: 200,
                Message: 'Review flagged successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to flag review'
            }
        });
    }
};

// Approve/reject review (SADMIN)
export const moderateReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;

        const review = await ReviewModel.findByIdAndUpdate(
            id,
            { isApproved, isFlagged: false },
            { new: true }
        );

        if (!review) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Review not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: review,
            Status: {
                Code: 200,
                Message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to moderate review'
            }
        });
    }
};

// Get review statistics
export const getReviewStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeId, riderId } = req.query;

        const filter: any = { isApproved: true };
        if (storeId) filter.storeId = storeId;
        if (riderId) filter.riderId = riderId;

        const stats = await ReviewModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                    verifiedPurchases: { $sum: { $cond: ['$isVerifiedPurchase', 1, 0] } },
                    withComments: { $sum: { $cond: [{ $ne: ['$comment', null] }, 1, 0] } },
                    withImages: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$images', []] } }, 0] }, 1, 0] } }
                }
            }
        ]);

        const result = stats[0] || {
            totalReviews: 0,
            averageRating: 0,
            rating5: 0,
            rating4: 0,
            rating3: 0,
            rating2: 0,
            rating1: 0,
            verifiedPurchases: 0,
            withComments: 0,
            withImages: 0
        };

        const formattedResult = {
            totalReviews: result.totalReviews,
            averageRating: Number(result.averageRating.toFixed(1)),
            ratingDistribution: {
                5: result.rating5,
                4: result.rating4,
                3: result.rating3,
                2: result.rating2,
                1: result.rating1
            },
            verifiedPurchases: result.verifiedPurchases,
            withComments: result.withComments,
            withImages: result.withImages
        };

        res.status(200).json({
            data: formattedResult,
            Status: {
                Code: 200,
                Message: 'Review statistics retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve review statistics'
            }
        });
    }
};

// Helper functions
async function updateStoreRating(storeType: string, storeId: string) {
    try {
        const stats = await ReviewModel.aggregate([
            {
                $match: {
                    storeId: new (require('mongoose').Types.ObjectId)(storeId),
                    isApproved: true
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);

        if (stats.length > 0) {
            const Model = require(`../schemas/Stores/${storeType}`).default;
            await Model.findByIdAndUpdate(storeId, {
                rating: Number(stats[0].averageRating.toFixed(1))
            });
        }
    } catch (error) {
        console.error('Error updating store rating:', error);
    }
}

async function updateRiderRating(riderId: string) {
    try {
        const stats = await ReviewModel.aggregate([
            {
                $match: {
                    riderId: new (require('mongoose').Types.ObjectId)(riderId),
                    isApproved: true
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);

        if (stats.length > 0) {
            await RiderModel.findByIdAndUpdate(riderId, {
                rating: Number(stats[0].averageRating.toFixed(1))
            });
        }
    } catch (error) {
        console.error('Error updating rider rating:', error);
    }
}
