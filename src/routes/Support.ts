import { Router } from 'express';
import {
    getTicket,
    getTickets,
    getUserTickets,
    createTicket,
    updateTicket,
    addTicketMessage,
    resolveTicket,
    closeTicket,
    deleteTicket,
    getTicketStats
} from '../controllers/Support';

const supportRouter = Router();

// Get statistics (SADMIN)
supportRouter.get('/stats', getTicketStats);

// Get all tickets (SADMIN with filters)
supportRouter.get('/all', getTickets);

// Get user's tickets
supportRouter.get('/', getUserTickets);

// Get single ticket
supportRouter.get('/:id', getTicket);

// Create ticket
supportRouter.post('/', createTicket);

// Add message to ticket
supportRouter.post('/:id/messages', addTicketMessage);

// Update ticket (SADMIN)
supportRouter.put('/:id', updateTicket);

// Resolve ticket
supportRouter.patch('/:id/resolve', resolveTicket);

// Close ticket
supportRouter.patch('/:id/close', closeTicket);

// Delete ticket (SADMIN)
supportRouter.delete('/:id', deleteTicket);

export default supportRouter;
