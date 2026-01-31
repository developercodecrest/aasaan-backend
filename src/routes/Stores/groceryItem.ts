import { Router } from 'express';
import {
    getGroceryItem,
    getGroceryItems,
    getGroceryGroceryItems,
    createGroceryItem,
    updateGroceryItem,
    deleteGroceryItem,
    toggleGroceryItemAvailability,
    bulkCreateGroceryItems,
    getPopularItems,
} from '../../controllers/Stores/GroceryItem';

const router = Router();

// Get all grocery items
router.get('/', getGroceryItems);

// Get popular grocery items
router.get('/popular', getPopularItems);

// Get a single grocery item
router.get('/:id', getGroceryItem);

// Create a new grocery item
router.post('/', createGroceryItem);

// Bulk create grocery items
router.post('/bulk', bulkCreateGroceryItems);

// Update a grocery item
router.put('/:id', updateGroceryItem);

// Delete a grocery item
router.delete('/:id', deleteGroceryItem);

// Toggle grocery item availability
router.patch('/:id/toggle-availability', toggleGroceryItemAvailability);

// Get grocery items by grocery ID
router.get('/grocery/:groceryId', getGroceryGroceryItems);

export default router;
