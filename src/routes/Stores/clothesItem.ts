import { Router } from 'express';
import {
    getClothesItem,
    getClothesItems,
    getClothesClothesItems,
    createClothesItem,
    updateClothesItem,
    deleteClothesItem,
    toggleClothesItemAvailability,
    bulkCreateClothesItems,
    getPopularItems,
} from '../../controllers/Stores/ClothesItem';

const router = Router();

// Get all clothes items
router.get('/', getClothesItems);

// Get popular clothes items
router.get('/popular', getPopularItems);

// Get a single clothes item
router.get('/:id', getClothesItem);

// Create a new clothes item
router.post('/', createClothesItem);

// Bulk create clothes items
router.post('/bulk', bulkCreateClothesItems);

// Update a clothes item
router.put('/:id', updateClothesItem);

// Delete a clothes item
router.delete('/:id', deleteClothesItem);

// Toggle clothes item availability
router.patch('/:id/toggle-availability', toggleClothesItemAvailability);

// Get clothes items by clothes ID
router.get('/clothes/:clothesId', getClothesClothesItems);

export default router;
