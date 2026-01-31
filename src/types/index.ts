export interface GSTDetails {
    gstNo: string;
    gstName: string;
    gstAddress: {
        address: string;
        state: string;
        pincode: string;
    };
}

export * from './order';
export * from './rider';
export * from './assignedOrder';
export * from './review';
export * from './notification';
export * from './coupon';
export * from './favorite';
export * from './support';