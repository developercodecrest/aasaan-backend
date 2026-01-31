import { Router } from 'express';
import {
    getReview,
    getReviews,
    getStoreReviews,
    getRiderReviews,
    getUserReviews,
    createReview,
    updateReview,
    deleteReview,
    replyToReview,
    markReviewHelpful,
    flagReview,
    moderateReview,
    getReviewStats
} from '../controllers/Review';

const reviewRouter = Router();

// Get statistics
reviewRouter.get('/stats', getReviewStats);

// Get all reviews with filters
reviewRouter.get('/', getReviews);

// Get single review
reviewRouter.get('/:id', getReview);

// Get store reviews
reviewRouter.get('/store/:storeId', getStoreReviews);

// Get rider reviews
reviewRouter.get('/rider/:riderId', getRiderReviews);

// Get user reviews
reviewRouter.get('/user/:userId', getUserReviews);

// Create review (requires authentication)
reviewRouter.post('/', createReview);

// Update review (user must own the review)
reviewRouter.put('/:id', updateReview);

// Delete review (user must own the review)
reviewRouter.delete('/:id', deleteReview);

// Reply to review (store owner or SADMIN)
reviewRouter.post('/:id/reply', replyToReview);

// Mark review as helpful/unhelpful
reviewRouter.post('/:id/helpful', markReviewHelpful);

// Flag review as inappropriate
reviewRouter.post('/:id/flag', flagReview);

// Moderate review (SADMIN only)
reviewRouter.patch('/:id/moderate', moderateReview);

export default reviewRouter;
