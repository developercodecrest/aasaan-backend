import { Router } from 'express';
import {
    getMedicalItem,
    getMedicalItems,
    getMedicalMedicalItems,
    createMedicalItem,
    updateMedicalItem,
    deleteMedicalItem,
    toggleMedicalItemAvailability,
    bulkCreateMedicalItems,
    getPopularItems,
} from '../../controllers/Stores/MedicalItem';

const router = Router();

// Get all medical items
router.get('/', getMedicalItems);

// Get popular medical items
router.get('/popular', getPopularItems);

// Get a single medical item
router.get('/:id', getMedicalItem);

// Create a new medical item
router.post('/', createMedicalItem);

// Bulk create medical items
router.post('/bulk', bulkCreateMedicalItems);

// Update a medical item
router.put('/:id', updateMedicalItem);

// Delete a medical item
router.delete('/:id', deleteMedicalItem);

// Toggle medical item availability
router.patch('/:id/toggle-availability', toggleMedicalItemAvailability);

// Get medical items by medical ID
router.get('/medical/:medicalId', getMedicalMedicalItems);

export default router;
