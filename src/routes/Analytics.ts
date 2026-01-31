import { Router } from 'express';
import {
    getDashboardSummary,
    getRevenueReport,
    getStorePerformance,
    getRiderPerformance,
    getCategorySales
} from '../controllers/Analytics';

const analyticsRouter = Router();

// Admin dashboard routes (all require SADMIN role)
analyticsRouter.get('/admin/dashboard', getDashboardSummary);
analyticsRouter.get('/admin/revenue', getRevenueReport);
analyticsRouter.get('/admin/stores/performance', getStorePerformance);
analyticsRouter.get('/admin/riders/performance', getRiderPerformance);
analyticsRouter.get('/admin/category-sales', getCategorySales);

export default analyticsRouter;
