import { Router } from 'express';
import {
    getFavorite,
    getFavorites,
    getUserFavoriteStores,
    getUserFavoriteItems,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    checkIsFavorite
} from '../controllers/Favorite';

const favoriteRouter = Router();

// Get user's favorite stores
favoriteRouter.get('/stores', getUserFavoriteStores);

// Get user's favorite items
favoriteRouter.get('/items', getUserFavoriteItems);

// Get all favorites
favoriteRouter.get('/', getFavorites);

// Get single favorite
favoriteRouter.get('/:id', getFavorite);

// Check if item/store is favorite
favoriteRouter.post('/check', checkIsFavorite);

// Add to favorites
favoriteRouter.post('/', addFavorite);

// Toggle favorite (add/remove)
favoriteRouter.post('/toggle', toggleFavorite);

// Remove from favorites
favoriteRouter.delete('/:id', removeFavorite);

export default favoriteRouter;
