import { Request, Response } from 'express';
import SupportTicketModel from '../schemas/SupportTicket';
import Counter from '../schemas/Counter';
import { DefaultResponseBody } from '../types/default';
import { CreateTicketDTO, UpdateTicketDTO, AddTicketMessageDTO, TicketStatus } from '../types/support';

// Get single ticket by ID
export const getTicket = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const ticket = await SupportTicketModel.findById(id)
            .populate('userId', 'name email profileImage')
            .populate('orderId')
            .populate('assignedTo', 'name email')
            .populate('messages.userId', 'name profileImage');

        if (!ticket) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Support ticket not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: ticket,
            Status: {
                Code: 200,
                Message: 'Support ticket retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve support ticket'
            }
        });
    }
};

// Get all tickets with filters
export const getTickets = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            userId, 
            status, 
            priority, 
            category, 
            assignedTo,
            page = 1, 
            limit = 20 
        } = req.query as any;

        const filter: any = {};

        if (userId) filter.userId = userId;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (category) filter.category = category;
        if (assignedTo) filter.assignedTo = assignedTo;

        const skip = (Number(page) - 1) * Number(limit);

        const [tickets, total] = await Promise.all([
            SupportTicketModel.find(filter)
                .populate('userId', 'name email profileImage')
                .populate('orderId')
                .populate('assignedTo', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            SupportTicketModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                tickets,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Support tickets retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve support tickets'
            }
        });
    }
};

// Get user's tickets
export const getUserTickets = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { status, priority, category, page = 1, limit = 20 } = req.query as any;

        const filter: any = { userId };

        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (category) filter.category = category;

        const skip = (Number(page) - 1) * Number(limit);

        const [tickets, total] = await Promise.all([
            SupportTicketModel.find(filter)
                .populate('orderId')
                .populate('assignedTo', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            SupportTicketModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                tickets,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'User tickets retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve user tickets'
            }
        });
    }
};

// Create ticket (auto-generate ticket number)
export const createTicket = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { orderId, category, subject, description, attachments } = req.body as CreateTicketDTO;

        if (!category || !subject || !description) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Missing required fields: category, subject, description'
                }
            });
            return;
        }

        // Auto-generate ticket number using Counter
        const counter = await Counter.findOneAndUpdate(
            { id: 'ticketNumber' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const ticketNumber = `TKT${String(counter.seq).padStart(6, '0')}`;

        // Create initial message
        const initialMessage = {
            userId,
            message: description,
            attachments: attachments || [],
            isStaff: false,
            createdAt: new Date()
        };

        const ticket = await SupportTicketModel.create({
            ticketNumber,
            userId,
            orderId,
            category,
            priority: 'medium', // Default priority
            status: TicketStatus.OPEN,
            subject,
            description,
            messages: [initialMessage]
        });

        // TODO: Send notification to user about ticket creation
        // await createNotification({ userId, type: 'SUPPORT_TICKET_CREATED', ... });

        const populatedTicket = await SupportTicketModel.findById(ticket._id)
            .populate('userId', 'name email profileImage')
            .populate('orderId');

        res.status(201).json({
            data: populatedTicket,
            Status: {
                Code: 201,
                Message: 'Support ticket created successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to create support ticket'
            }
        });
    }
};

// Update ticket (SADMIN - status, priority, assignedTo)
export const updateTicket = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, priority, assignedTo } = req.body as UpdateTicketDTO;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (assignedTo) updateData.assignedTo = assignedTo;

        const ticket = await SupportTicketModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('userId', 'name email profileImage')
            .populate('orderId')
            .populate('assignedTo', 'name email');

        if (!ticket) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Support ticket not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: ticket,
            Status: {
                Code: 200,
                Message: 'Support ticket updated successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to update support ticket'
            }
        });
    }
};

// Add ticket message
export const addTicketMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const { message, attachments } = req.body as AddTicketMessageDTO;

        if (!message) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Message is required'
                }
            });
            return;
        }

        const ticket = await SupportTicketModel.findById(id);

        if (!ticket) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Support ticket not found'
                }
            });
            return;
        }

        // Determine if the user is staff (you may need to check user role)
        // For now, assuming users adding messages are not staff
        const isStaff = false; // TODO: Check if user is admin/staff

        const newMessage = {
            userId,
            message,
            attachments: attachments || [],
            isStaff,
            createdAt: new Date()
        };

        ticket.messages.push(newMessage);
        await ticket.save();

        // TODO: Send notification about new message
        // If isStaff, notify user; if user, notify assigned staff

        const populatedTicket = await SupportTicketModel.findById(ticket._id)
            .populate('userId', 'name email profileImage')
            .populate('orderId')
            .populate('assignedTo', 'name email')
            .populate('messages.userId', 'name profileImage');

        res.status(200).json({
            data: populatedTicket,
            Status: {
                Code: 200,
                Message: 'Message added successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to add message'
            }
        });
    }
};

// Resolve ticket
export const resolveTicket = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const ticket = await SupportTicketModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    status: TicketStatus.RESOLVED,
                    resolvedAt: new Date()
                }
            },
            { new: true }
        )
            .populate('userId', 'name email profileImage')
            .populate('orderId')
            .populate('assignedTo', 'name email');

        if (!ticket) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Support ticket not found'
                }
            });
            return;
        }

        // TODO: Send notification to user about ticket resolution
        // await createNotification({ userId: ticket.userId, type: 'SUPPORT_TICKET_RESOLVED', ... });

        res.status(200).json({
            data: ticket,
            Status: {
                Code: 200,
                Message: 'Support ticket resolved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to resolve support ticket'
            }
        });
    }
};

// Close ticket
export const closeTicket = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const ticket = await SupportTicketModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    status: TicketStatus.CLOSED,
                    closedAt: new Date()
                }
            },
            { new: true }
        )
            .populate('userId', 'name email profileImage')
            .populate('orderId')
            .populate('assignedTo', 'name email');

        if (!ticket) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Support ticket not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: ticket,
            Status: {
                Code: 200,
                Message: 'Support ticket closed successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to close support ticket'
            }
        });
    }
};

// Delete ticket (SADMIN only)
export const deleteTicket = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const ticket = await SupportTicketModel.findByIdAndDelete(id);

        if (!ticket) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Support ticket not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: ticket,
            Status: {
                Code: 200,
                Message: 'Support ticket deleted successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to delete support ticket'
            }
        });
    }
};

// Get ticket statistics
export const getTicketStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const [
            totalTickets,
            openTickets,
            inProgressTickets,
            resolvedTickets,
            closedTickets,
            lowPriority,
            mediumPriority,
            highPriority,
            urgentPriority
        ] = await Promise.all([
            SupportTicketModel.countDocuments(),
            SupportTicketModel.countDocuments({ status: TicketStatus.OPEN }),
            SupportTicketModel.countDocuments({ status: TicketStatus.IN_PROGRESS }),
            SupportTicketModel.countDocuments({ status: TicketStatus.RESOLVED }),
            SupportTicketModel.countDocuments({ status: TicketStatus.CLOSED }),
            SupportTicketModel.countDocuments({ priority: 'low' }),
            SupportTicketModel.countDocuments({ priority: 'medium' }),
            SupportTicketModel.countDocuments({ priority: 'high' }),
            SupportTicketModel.countDocuments({ priority: 'urgent' })
        ]);

        res.status(200).json({
            data: {
                total: totalTickets,
                byStatus: {
                    open: openTickets,
                    inProgress: inProgressTickets,
                    resolved: resolvedTickets,
                    closed: closedTickets
                },
                byPriority: {
                    low: lowPriority,
                    medium: mediumPriority,
                    high: highPriority,
                    urgent: urgentPriority
                }
            },
            Status: {
                Code: 200,
                Message: 'Ticket statistics retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve ticket statistics'
            }
        });
    }
};
