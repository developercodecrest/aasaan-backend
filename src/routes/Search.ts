import { Router } from 'express';
import {
    globalSearch,
    searchStores,
    searchItems
} from '../controllers/search';

const searchRouter = Router();

// Global search (stores + items)
searchRouter.get('/', globalSearch);

// Search stores only
searchRouter.get('/stores', searchStores);

// Search items only
searchRouter.get('/items', searchItems);

export default searchRouter;
