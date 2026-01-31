import { Router } from 'express';
import {
    getClothes,
    getAllClothes,
    createClothes,
    updateClothes,
    deleteClothes,
    toggleClothesStatus,
} from '../../controllers/Stores/Clothes';

const clothesRouter = Router();

// Get all clothes
clothesRouter.get('/', getAllClothes);

// Get a single clothes
clothesRouter.get('/:id', getClothes);

// Create a new clothes
clothesRouter.post('/', createClothes);

// Update a clothes
clothesRouter.put('/:id', updateClothes);

// Delete a clothes
clothesRouter.delete('/:id', deleteClothes);

// Toggle clothes status
clothesRouter.patch('/:id/toggle-status', toggleClothesStatus);

export default clothesRouter;
