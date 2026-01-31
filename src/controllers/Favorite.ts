import { Request, Response } from 'express';
import FavoriteModel from '../schemas/Favorite';
import { DefaultResponseBody } from '../types/default';
import { AddFavoriteDTO, FavoriteType } from '../types/favorite';

// Get single favorite by ID
export const getFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const favorite = await FavoriteModel.findById(id)
            .populate('userId', 'name profileImage')
            .populate('storeId')
            .populate('itemId');

        if (!favorite) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Favorite not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: favorite,
            Status: {
                Code: 200,
                Message: 'Favorite retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve favorite'
            }
        });
    }
};

// Get user's favorites with filters
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { 
            favoriteType, 
            storeType, 
            itemType,
            page = 1, 
            limit = 20 
        } = req.query as any;

        const filter: any = { userId };

        if (favoriteType) filter.favoriteType = favoriteType;
        if (storeType) filter.storeType = storeType;
        if (itemType) filter.itemType = itemType;

        const skip = (Number(page) - 1) * Number(limit);

        const [favorites, total] = await Promise.all([
            FavoriteModel.find(filter)
                .populate('storeId')
                .populate('itemId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            FavoriteModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                favorites,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Favorites retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve favorites'
            }
        });
    }
};

// Get user's favorite stores
export const getUserFavoriteStores = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { storeType, page = 1, limit = 20 } = req.query as any;

        const filter: any = { 
            userId, 
            favoriteType: FavoriteType.STORE 
        };

        if (storeType) filter.storeType = storeType;

        const skip = (Number(page) - 1) * Number(limit);

        const [favorites, total] = await Promise.all([
            FavoriteModel.find(filter)
                .populate('storeId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            FavoriteModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                stores: favorites,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Favorite stores retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve favorite stores'
            }
        });
    }
};

// Get user's favorite items
export const getUserFavoriteItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { itemType, page = 1, limit = 20 } = req.query as any;

        const filter: any = { 
            userId, 
            favoriteType: FavoriteType.ITEM 
        };

        if (itemType) filter.itemType = itemType;

        const skip = (Number(page) - 1) * Number(limit);

        const [favorites, total] = await Promise.all([
            FavoriteModel.find(filter)
                .populate('itemId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            FavoriteModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                items: favorites,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Favorite items retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve favorite items'
            }
        });
    }
};

// Add favorite (check duplicate)
export const addFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { favoriteType, storeType, storeId, itemType, itemId } = req.body as AddFavoriteDTO;

        if (!favoriteType) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Favorite type is required'
                }
            });
            return;
        }

        // Build duplicate check filter
        const duplicateFilter: any = { userId, favoriteType };

        if (favoriteType === FavoriteType.STORE) {
            if (!storeType || !storeId) {
                res.status(400).json({
                    data: null,
                    Status: {
                        Code: 400,
                        Message: 'Store type and store ID are required for store favorites'
                    }
                });
                return;
            }
            duplicateFilter.storeType = storeType;
            duplicateFilter.storeId = storeId;
        } else if (favoriteType === FavoriteType.ITEM) {
            if (!itemType || !itemId) {
                res.status(400).json({
                    data: null,
                    Status: {
                        Code: 400,
                        Message: 'Item type and item ID are required for item favorites'
                    }
                });
                return;
            }
            duplicateFilter.itemType = itemType;
            duplicateFilter.itemId = itemId;
        }

        // Check for duplicate
        const existingFavorite = await FavoriteModel.findOne(duplicateFilter);

        if (existingFavorite) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'This item is already in your favorites'
                }
            });
            return;
        }

        // Create favorite
        const favorite = await FavoriteModel.create({
            userId,
            favoriteType,
            storeType,
            storeId,
            itemType,
            itemId
        });

        const populatedFavorite = await FavoriteModel.findById(favorite._id)
            .populate('storeId')
            .populate('itemId');

        res.status(201).json({
            data: populatedFavorite,
            Status: {
                Code: 201,
                Message: 'Added to favorites successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to add favorite'
            }
        });
    }
};

// Remove favorite (by ID)
export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        const favorite = await FavoriteModel.findOneAndDelete({ 
            _id: id, 
            userId 
        });

        if (!favorite) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Favorite not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: favorite,
            Status: {
                Code: 200,
                Message: 'Removed from favorites successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to remove favorite'
            }
        });
    }
};

// Toggle favorite (add if not exists, remove if exists)
export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { favoriteType, storeType, storeId, itemType, itemId } = req.body as AddFavoriteDTO;

        if (!favoriteType) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Favorite type is required'
                }
            });
            return;
        }

        // Build search filter
        const searchFilter: any = { userId, favoriteType };

        if (favoriteType === FavoriteType.STORE) {
            if (!storeType || !storeId) {
                res.status(400).json({
                    data: null,
                    Status: {
                        Code: 400,
                        Message: 'Store type and store ID are required for store favorites'
                    }
                });
                return;
            }
            searchFilter.storeType = storeType;
            searchFilter.storeId = storeId;
        } else if (favoriteType === FavoriteType.ITEM) {
            if (!itemType || !itemId) {
                res.status(400).json({
                    data: null,
                    Status: {
                        Code: 400,
                        Message: 'Item type and item ID are required for item favorites'
                    }
                });
                return;
            }
            searchFilter.itemType = itemType;
            searchFilter.itemId = itemId;
        }

        // Check if already exists
        const existingFavorite = await FavoriteModel.findOne(searchFilter);

        if (existingFavorite) {
            // Remove favorite
            await FavoriteModel.findByIdAndDelete(existingFavorite._id);

            res.status(200).json({
                data: {
                    action: 'removed',
                    favorite: existingFavorite
                },
                Status: {
                    Code: 200,
                    Message: 'Removed from favorites successfully'
                }
            });
        } else {
            // Add favorite
            const favorite = await FavoriteModel.create({
                userId,
                favoriteType,
                storeType,
                storeId,
                itemType,
                itemId
            });

            const populatedFavorite = await FavoriteModel.findById(favorite._id)
                .populate('storeId')
                .populate('itemId');

            res.status(201).json({
                data: {
                    action: 'added',
                    favorite: populatedFavorite
                },
                Status: {
                    Code: 201,
                    Message: 'Added to favorites successfully'
                }
            });
        }
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to toggle favorite'
            }
        });
    }
};

// Check if favorite
export const checkIsFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { favoriteType, storeType, storeId, itemType, itemId } = req.query as any;

        if (!favoriteType) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Favorite type is required'
                }
            });
            return;
        }

        // Build search filter
        const searchFilter: any = { userId, favoriteType };

        if (favoriteType === FavoriteType.STORE) {
            if (!storeType || !storeId) {
                res.status(400).json({
                    data: null,
                    Status: {
                        Code: 400,
                        Message: 'Store type and store ID are required for store favorites'
                    }
                });
                return;
            }
            searchFilter.storeType = storeType;
            searchFilter.storeId = storeId;
        } else if (favoriteType === FavoriteType.ITEM) {
            if (!itemType || !itemId) {
                res.status(400).json({
                    data: null,
                    Status: {
                        Code: 400,
                        Message: 'Item type and item ID are required for item favorites'
                    }
                });
                return;
            }
            searchFilter.itemType = itemType;
            searchFilter.itemId = itemId;
        }

        const favorite = await FavoriteModel.findOne(searchFilter);

        res.status(200).json({
            data: { 
                isFavorite: !!favorite 
            },
            Status: {
                Code: 200,
                Message: 'Favorite status checked successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to check favorite status'
            }
        });
    }
};
