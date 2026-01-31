import { Request, Response } from 'express';
import CouponModel from '../schemas/Coupon';
import CouponUsageModel from '../schemas/CouponUsage';
import { DefaultResponseBody } from '../types/default';
import { CreateCouponDTO, UpdateCouponDTO, ValidateCouponDTO, ApplyCouponDTO } from '../types/coupon';

// Get single coupon by ID
export const getCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const coupon = await CouponModel.findById(id);

        if (!coupon) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Coupon not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: coupon,
            Status: {
                Code: 200,
                Message: 'Coupon retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve coupon'
            }
        });
    }
};

// Get all coupons with filters
export const getCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            isActive, 
            applicableOn,
            page = 1, 
            limit = 20 
        } = req.query as any;

        const filter: any = {};

        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (applicableOn) filter.applicableOn = applicableOn;

        const skip = (Number(page) - 1) * Number(limit);

        const [coupons, total] = await Promise.all([
            CouponModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            CouponModel.countDocuments(filter)
        ]);

        res.status(200).json({
            data: {
                coupons,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Coupons retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve coupons'
            }
        });
    }
};

// Get available coupons (active + valid dates + usage not exceeded)
export const getAvailableCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
        const { applicableOn, page = 1, limit = 20 } = req.query as any;

        const currentDate = new Date();
        const filter: any = {
            isActive: true,
            validFrom: { $lte: currentDate },
            validUntil: { $gte: currentDate }
        };

        if (applicableOn && applicableOn !== 'all') {
            filter.$or = [
                { applicableOn: applicableOn },
                { applicableOn: 'all' }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [coupons, total] = await Promise.all([
            CouponModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            CouponModel.countDocuments(filter)
        ]);

        // Filter out coupons that have exceeded their usage limit
        const availableCoupons = coupons.filter(coupon => {
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                return false;
            }
            return true;
        });

        res.status(200).json({
            data: {
                coupons: availableCoupons,
                pagination: {
                    total: availableCoupons.length,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(availableCoupons.length / Number(limit))
                }
            },
            Status: {
                Code: 200,
                Message: 'Available coupons retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve available coupons'
            }
        });
    }
};

// Create coupon (SADMIN only)
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            code, 
            title, 
            description, 
            type, 
            value, 
            maxDiscount, 
            minOrderAmount, 
            applicableOn, 
            usageLimit, 
            usagePerUser, 
            validFrom, 
            validUntil 
        } = req.body as CreateCouponDTO;

        // Check if coupon code already exists
        const existingCoupon = await CouponModel.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Coupon code already exists'
                }
            });
            return;
        }

        const coupon = await CouponModel.create({
            code: code.toUpperCase(),
            title,
            description,
            type,
            value,
            maxDiscount,
            minOrderAmount,
            applicableOn,
            usageLimit,
            usagePerUser,
            validFrom,
            validUntil,
            usedCount: 0,
            isActive: true
        });

        res.status(201).json({
            data: coupon,
            Status: {
                Code: 201,
                Message: 'Coupon created successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to create coupon'
            }
        });
    }
};

// Update coupon (SADMIN only)
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body as UpdateCouponDTO;

        const coupon = await CouponModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!coupon) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Coupon not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: coupon,
            Status: {
                Code: 200,
                Message: 'Coupon updated successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to update coupon'
            }
        });
    }
};

// Delete coupon (SADMIN only)
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const coupon = await CouponModel.findByIdAndDelete(id);

        if (!coupon) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Coupon not found'
                }
            });
            return;
        }

        res.status(200).json({
            data: coupon,
            Status: {
                Code: 200,
                Message: 'Coupon deleted successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to delete coupon'
            }
        });
    }
};

// Toggle coupon status
export const toggleCouponStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const coupon = await CouponModel.findById(id);

        if (!coupon) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Coupon not found'
                }
            });
            return;
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.status(200).json({
            data: coupon,
            Status: {
                Code: 200,
                Message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to toggle coupon status'
            }
        });
    }
};

// Validate coupon (checks all conditions)
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, orderAmount, storeType } = req.body as ValidateCouponDTO;
        const userId = (req as any).userId;

        // Find coupon by code
        const coupon = await CouponModel.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Coupon code not found'
                }
            });
            return;
        }

        // Check if coupon is active
        if (!coupon.isActive) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Coupon is not active'
                }
            });
            return;
        }

        // Check valid dates
        const currentDate = new Date();
        if (currentDate < coupon.validFrom) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Coupon is not yet valid'
                }
            });
            return;
        }

        if (currentDate > coupon.validUntil) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Coupon has expired'
                }
            });
            return;
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Coupon usage limit exceeded'
                }
            });
            return;
        }

        // Check min order amount
        if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
                }
            });
            return;
        }

        // Check applicable store type
        if (coupon.applicableOn !== 'all' && coupon.applicableOn !== storeType) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: `Coupon is only applicable for ${coupon.applicableOn}`
                }
            });
            return;
        }

        // Check user usage limit
        if (coupon.usagePerUser) {
            const userUsageCount = await CouponUsageModel.countDocuments({
                couponId: coupon._id,
                userId: userId
            });

            if (userUsageCount >= coupon.usagePerUser) {
                res.status(400).json({
                    data: null,
                    Status: {
                        Code: 400,
                        Message: 'You have already used this coupon maximum times'
                    }
                });
                return;
            }
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = (orderAmount * coupon.value) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else if (coupon.type === 'fixed') {
            discountAmount = coupon.value;
        } else if (coupon.type === 'free_delivery') {
            discountAmount = 0; // Delivery charge will be handled separately
        }

        res.status(200).json({
            data: {
                isValid: true,
                coupon,
                discountAmount,
                finalAmount: orderAmount - discountAmount
            },
            Status: {
                Code: 200,
                Message: 'Coupon is valid'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to validate coupon'
            }
        });
    }
};

// Apply coupon (creates CouponUsage)
export const applyCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { couponId, orderId } = req.body as ApplyCouponDTO;
        const userId = (req as any).userId;

        const coupon = await CouponModel.findById(couponId);

        if (!coupon) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Coupon not found'
                }
            });
            return;
        }

        // Check if already applied to this order
        const existingUsage = await CouponUsageModel.findOne({
            couponId,
            orderId
        });

        if (existingUsage) {
            res.status(400).json({
                data: null,
                Status: {
                    Code: 400,
                    Message: 'Coupon already applied to this order'
                }
            });
            return;
        }

        // Calculate discount amount (this should ideally come from previous validation)
        const { discountAmount } = req.body;

        // Create coupon usage record
        const couponUsage = await CouponUsageModel.create({
            couponId,
            userId,
            orderId,
            discountAmount
        });

        // Increment coupon used count
        await CouponModel.findByIdAndUpdate(couponId, {
            $inc: { usedCount: 1 }
        });

        // TODO: Send notification to user about coupon applied
        // await createNotification({ userId, type: 'COUPON_APPLIED', ... });

        const populatedUsage = await CouponUsageModel.findById(couponUsage._id)
            .populate('coupon')
            .populate('user', 'name')
            .populate('order');

        res.status(201).json({
            data: populatedUsage,
            Status: {
                Code: 201,
                Message: 'Coupon applied successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to apply coupon'
            }
        });
    }
};

// Get coupon usage statistics
export const getCouponStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const coupon = await CouponModel.findById(id);

        if (!coupon) {
            res.status(404).json({
                data: null,
                Status: {
                    Code: 404,
                    Message: 'Coupon not found'
                }
            });
            return;
        }

        const usageCount = await CouponUsageModel.countDocuments({ couponId: id });
        const totalDiscount = await CouponUsageModel.aggregate([
            { $match: { couponId: coupon._id } },
            { $group: { _id: null, total: { $sum: '$discountAmount' } } }
        ]);

        const uniqueUsers = await CouponUsageModel.distinct('userId', { couponId: id });

        res.status(200).json({
            data: {
                coupon,
                stats: {
                    totalUsage: usageCount,
                    uniqueUsers: uniqueUsers.length,
                    totalDiscountGiven: totalDiscount[0]?.total || 0,
                    remainingUsage: coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : 'Unlimited'
                }
            },
            Status: {
                Code: 200,
                Message: 'Coupon statistics retrieved successfully'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            data: null,
            Status: {
                Code: 500,
                Message: error.message || 'Failed to retrieve coupon statistics'
            }
        });
    }
};
