import { Router } from 'express';
import {
    getGrocery,
    getGroceries,
    createGrocery,
    updateGrocery,
    deleteGrocery,
    toggleGroceryStatus,
} from '../../controllers/Stores/Grocery';


const groceryRouter = Router();

// Get all groceries
groceryRouter.get('/', getGroceries);

// Get a single grocery
groceryRouter.get('/:id', getGrocery);

// Create a new grocery
groceryRouter.post('/', createGrocery);

// Update a grocery
groceryRouter.put('/:id', updateGrocery);

// Delete a grocery
groceryRouter.delete('/:id', deleteGrocery);

// Toggle grocery status
groceryRouter.patch('/:id/toggle-status', toggleGroceryStatus);

export default groceryRouter;
