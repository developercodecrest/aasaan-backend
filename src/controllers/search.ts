import { Request, Response } from 'express';
import RestaurentModel from '../schemas/Stores/Restaurent';
import MedicalModel from '../schemas/Stores/Medical';
import GroceryModel from '../schemas/Stores/Grocery';
import ClothesModel from '../schemas/Stores/Clothes';
import MenuItemModel from '../schemas/Stores/MenuItem';
import MedicalItemModel from '../schemas/Stores/MedicalItem';
import GroceryItemModel from '../schemas/Stores/GroceryItem';
import ClothesItemModel from '../schemas/Stores/ClothesItem';
import { DefaultResponseBody } from '../types/default';

// Global search across all stores and items
export const globalSearch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query, page = 1, limit = 20 } = req.query as any;

        if (!query) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Search query is required'
                }
            });
            return;
        }

        const searchRegex = new RegExp(query, 'i');
        const skip = (Number(page) - 1) * Number(limit);

        // Search across all store types
        const [restaurants, medicalStores, groceryStores, clothesStores] = await Promise.all([
            RestaurentModel.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex }
                ]
            })
                .limit(5)
                .select('name description image rating address'),
            MedicalModel.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex }
                ]
            })
                .limit(5)
                .select('name description image rating address'),
            GroceryModel.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex }
                ]
            })
                .limit(5)
                .select('name description image rating address'),
            ClothesModel.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex }
                ]
            })
                .limit(5)
                .select('name description image rating address')
        ]);

        // Search across all item types
        const [menuItems, medicalItems, groceryItems, clothesItems] = await Promise.all([
            MenuItemModel.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex }
                ]
            })
                .limit(5)
                .populate('storeId', 'name')
                .select('name description image price rating storeId'),
            MedicalItemModel.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex }
                ]
            })
                .limit(5)
                .populate('storeId', 'name')
                .select('name description image price rating storeId'),
            GroceryItemModel.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex }
                ]
            })
                .limit(5)
                .populate('storeId', 'name')
                .select('name description image price rating storeId'),
            ClothesItemModel.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex }
                ]
            })
                .limit(5)
                .populate('storeId', 'name')
                .select('name description image price rating storeId')
        ]);

        // Format results with type indication
        const stores = [
            ...restaurants.map(r => ({ ...r.toObject(), storeType: 'Restaurent' })),
            ...medicalStores.map(m => ({ ...m.toObject(), storeType: 'Medical' })),
            ...groceryStores.map(g => ({ ...g.toObject(), storeType: 'Grocery' })),
            ...clothesStores.map(c => ({ ...c.toObject(), storeType: 'Clothes' }))
        ];

        const items = [
            ...menuItems.map(i => ({ ...i.toObject(), itemType: 'MenuItem' })),
            ...medicalItems.map(i => ({ ...i.toObject(), itemType: 'MedicalItem' })),
            ...groceryItems.map(i => ({ ...i.toObject(), itemType: 'GroceryItem' })),
            ...clothesItems.map(i => ({ ...i.toObject(), itemType: 'ClothesItem' }))
        ];

        res.status(200).json({
            data: {
                stores,
                items,
                totalStores: stores.length,
                totalItems: items.length
            },
            Status: {
                Code: 200,
                Message: 'Search completed successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to perform search'
            }
        });
    }
};

// Search stores only
export const searchStores = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query, storeType, page = 1, limit = 20 } = req.query as any;

        if (!query) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Search query is required'
                }
            });
            return;
        }

        const searchRegex = new RegExp(query, 'i');
        const skip = (Number(page) - 1) * Number(limit);

        const searchFilter = {
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { tags: searchRegex }
            ]
        };

        let stores: any[] = [];
        let total = 0;

        if (!storeType || storeType === 'all') {
            // Search all store types
            const [restaurants, medicalStores, groceryStores, clothesStores] = await Promise.all([
                RestaurentModel.find(searchFilter)
                    .skip(skip)
                    .limit(Math.ceil(Number(limit) / 4))
                    .select('name description image rating address'),
                MedicalModel.find(searchFilter)
                    .skip(skip)
                    .limit(Math.ceil(Number(limit) / 4))
                    .select('name description image rating address'),
                GroceryModel.find(searchFilter)
                    .skip(skip)
                    .limit(Math.ceil(Number(limit) / 4))
                    .select('name description image rating address'),
                ClothesModel.find(searchFilter)
                    .skip(skip)
                    .limit(Math.ceil(Number(limit) / 4))
                    .select('name description image rating address')
            ]);

            stores = [
                ...restaurants.map(r => ({ ...r.toObject(), storeType: 'Restaurent' })),
                ...medicalStores.map(m => ({ ...m.toObject(), storeType: 'Medical' })),
                ...groceryStores.map(g => ({ ...g.toObject(), storeType: 'Grocery' })),
                ...clothesStores.map(c => ({ ...c.toObject(), storeType: 'Clothes' }))
            ];

            const [resCount, medCount, groCount, cloCount] = await Promise.all([
                RestaurentModel.countDocuments(searchFilter),
                MedicalModel.countDocuments(searchFilter),
                GroceryModel.countDocuments(searchFilter),
                ClothesModel.countDocuments(searchFilter)
            ]);

            total = resCount + medCount + groCount + cloCount;
        } else {
            // Search specific store type
            switch (storeType) {
                case 'Restaurent': {
                    const [results, count] = await Promise.all([
                        RestaurentModel.find(searchFilter)
                            .skip(skip)
                            .limit(Number(limit))
                            .select('name description image rating address'),
                        RestaurentModel.countDocuments(searchFilter)
                    ]);
                    stores = results.map((s: any) => ({ ...s.toObject(), storeType: 'Restaurent' }));
                    total = count;
                    break;
                }
                case 'Medical': {
                    const [results, count] = await Promise.all([
                        MedicalModel.find(searchFilter)
                            .skip(skip)
                            .limit(Number(limit))
                            .select('name description image rating address'),
                        MedicalModel.countDocuments(searchFilter)
                    ]);
                    stores = results.map((s: any) => ({ ...s.toObject(), storeType: 'Medical' }));
                    total = count;
                    break;
                }
                case 'Grocery': {
                    const [results, count] = await Promise.all([
                        GroceryModel.find(searchFilter)
                            .skip(skip)
                            .limit(Number(limit))
                            .select('name description image rating address'),
                        GroceryModel.countDocuments(searchFilter)
                    ]);
                    stores = results.map((s: any) => ({ ...s.toObject(), storeType: 'Grocery' }));
                    total = count;
                    break;
                }
                case 'Clothes': {
                    const [results, count] = await Promise.all([
                        ClothesModel.find(searchFilter)
                            .skip(skip)
                            .limit(Number(limit))
                            .select('name description image rating address'),
                        ClothesModel.countDocuments(searchFilter)
                    ]);
                    stores = results.map((s: any) => ({ ...s.toObject(), storeType: 'Clothes' }));
                    total = count;
                    break;
                }
                default:
                    res.status(400).json({
                        data: null,
                        Status: {
                            Code: 400,
                            Message: 'Invalid store type'
                        }
                    });
                    return;
            }
        }

        res.status(200).json({
            data: {
                stores,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Store search completed successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to search stores'
            }
        });
    }
};

// Search items only
export const searchItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query, itemType, page = 1, limit = 20 } = req.query as any;

        if (!query) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Search query is required'
                }
            });
            return;
        }

        const searchRegex = new RegExp(query, 'i');
        const skip = (Number(page) - 1) * Number(limit);

        const searchFilter = {
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { tags: searchRegex }
            ]
        };

        let items: any[] = [];
        let total = 0;

        if (!itemType || itemType === 'all') {
            // Search all item types
            const [menuItems, medicalItems, groceryItems, clothesItems] = await Promise.all([
                MenuItemModel.find(searchFilter)
                    .skip(skip)
                    .limit(Math.ceil(Number(limit) / 4))
                    .populate('storeId', 'name')
                    .select('name description image price rating storeId'),
                MedicalItemModel.find(searchFilter)
                    .skip(skip)
                    .limit(Math.ceil(Number(limit) / 4))
                    .populate('storeId', 'name')
                    .select('name description image price rating storeId'),
                GroceryItemModel.find(searchFilter)
                    .skip(skip)
                    .limit(Math.ceil(Number(limit) / 4))
                    .populate('storeId', 'name')
                    .select('name description image price rating storeId'),
                ClothesItemModel.find(searchFilter)
                    .skip(skip)
                    .limit(Math.ceil(Number(limit) / 4))
                    .populate('storeId', 'name')
                    .select('name description image price rating storeId')
            ]);

            items = [
                ...menuItems.map(i => ({ ...i.toObject(), itemType: 'MenuItem' })),
                ...medicalItems.map(i => ({ ...i.toObject(), itemType: 'MedicalItem' })),
                ...groceryItems.map(i => ({ ...i.toObject(), itemType: 'GroceryItem' })),
                ...clothesItems.map(i => ({ ...i.toObject(), itemType: 'ClothesItem' }))
            ];

            const [menuCount, medCount, groCount, cloCount] = await Promise.all([
                MenuItemModel.countDocuments(searchFilter),
                MedicalItemModel.countDocuments(searchFilter),
                GroceryItemModel.countDocuments(searchFilter),
                ClothesItemModel.countDocuments(searchFilter)
            ]);

            total = menuCount + medCount + groCount + cloCount;
        } else {
            // Search specific item type
            switch (itemType) {
                case 'MenuItem': {
                    const [results, count] = await Promise.all([
                        MenuItemModel.find(searchFilter)
                            .skip(skip)
                            .limit(Number(limit))
                            .populate('storeId', 'name')
                            .select('name description image price rating storeId'),
                        MenuItemModel.countDocuments(searchFilter)
                    ]);
                    items = results.map((i: any) => ({ ...i.toObject(), itemType: 'MenuItem' }));
                    total = count;
                    break;
                }
                case 'MedicalItem': {
                    const [results, count] = await Promise.all([
                        MedicalItemModel.find(searchFilter)
                            .skip(skip)
                            .limit(Number(limit))
                            .populate('storeId', 'name')
                            .select('name description image price rating storeId'),
                        MedicalItemModel.countDocuments(searchFilter)
                    ]);
                    items = results.map((i: any) => ({ ...i.toObject(), itemType: 'MedicalItem' }));
                    total = count;
                    break;
                }
                case 'GroceryItem': {
                    const [results, count] = await Promise.all([
                        GroceryItemModel.find(searchFilter)
                            .skip(skip)
                            .limit(Number(limit))
                            .populate('storeId', 'name')
                            .select('name description image price rating storeId'),
                        GroceryItemModel.countDocuments(searchFilter)
                    ]);
                    items = results.map((i: any) => ({ ...i.toObject(), itemType: 'GroceryItem' }));
                    total = count;
                    break;
                }
                case 'ClothesItem': {
                    const [results, count] = await Promise.all([
                        ClothesItemModel.find(searchFilter)
                            .skip(skip)
                            .limit(Number(limit))
                            .populate('storeId', 'name')
                            .select('name description image price rating storeId'),
                        ClothesItemModel.countDocuments(searchFilter)
                    ]);
                    items = results.map((i: any) => ({ ...i.toObject(), itemType: 'ClothesItem' }));
                    total = count;
                    break;
                }
                default:
                    res.status(400).json({
                        data: null,
                        Status: {
                            Code: 400,
                            Message: 'Invalid item type'
                        }
                    });
                    return;
            }
        }

        res.status(200).json({
            data: {
                items,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Item search completed successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to search items'
            }
        });
    }
};
