import { Router } from 'express';
import {
    getMedical,
    getMedicals,
    createMedical,
    updateMedical,
    deleteMedical,
    toggleMedicalStatus,
} from '../../controllers/Stores/Medical';

const medicalRouter = Router();

// Get all medicals
medicalRouter.get('/', getMedicals);

// Get a single medical
medicalRouter.get('/:id', getMedical);

// Create a new medical
medicalRouter.post('/', createMedical);

// Update a medical
medicalRouter.put('/:id', updateMedical);

// Delete a medical
medicalRouter.delete('/:id', deleteMedical);

// Toggle medical status
medicalRouter.patch('/:id/toggle-status', toggleMedicalStatus);

export default medicalRouter;
