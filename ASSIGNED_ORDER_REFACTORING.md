# Assigned Order Refactoring - Separate Collection Architecture

## Overview
Refactored the assigned order system from embedded documents in the Rider schema to a separate `AssignedOrder` collection with its own schema, types, routes, controllers, and middleware.

## Architecture Changes

### Before (Embedded Approach)
- **assignedOrders** was an embedded array in the Rider schema
- Order assignments stored as sub-documents within each Rider document
- Limited scalability as rider documents grow with order history
- Harder to query orders independently of riders

### After (Separate Collection Approach)
- **AssignedOrder** is a standalone collection with its own schema
- Rider schema has virtual populate to access assigned orders
- Better scalability and query performance
- Independent order assignment management
- Clear separation of concerns

## New Files Created

### 1. Types (`src/types/assignedOrder.ts`)
```typescript
- AssignedOrderStatus enum (ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED)
- AssignedOrder interface with riderId, orderId, userId references
- CreateAssignedOrderDTO
- UpdateAssignedOrderDTO
- UpdateAssignedOrderStatusDTO
- AssignedOrderFilterDTO
- BulkAssignOrdersDTO
```

### 2. Schema (`src/schemas/AssignedOrder.ts`)
```typescript
- AssignedOrderSchema with riderId, orderId, userId references
- Compound indexes for efficient queries
- Unique index on orderId + riderId to prevent duplicate assignments
- Virtual populate for rider, order, and user details
```

### 3. Controllers (`src/controllers/AssignedOrder.ts`)
**10 Controller Functions:**
1. `getAssignedOrder` - Get single assigned order by ID
2. `getAssignedOrders` - Get all assigned orders with filters and pagination
3. `getRiderAssignedOrders` - Get assigned orders for specific rider
4. `getUserAssignedOrders` - Get assigned orders for specific user
5. `assignOrderToRider` - Assign single order to rider (SADMIN only)
6. `bulkAssignOrdersToRider` - Bulk assign multiple orders (SADMIN only)
7. `updateAssignedOrderStatus` - Update order status with auto rider status management
8. `updateAssignedOrder` - Update assigned order details (SADMIN only)
9. `deleteAssignedOrder` - Delete assigned order (SADMIN only)
10. `getAssignedOrderStats` - Get statistics (total, by status, etc.)

### 4. Middleware (`src/middleware/assignedOrder.ts`)
**5 Middleware Functions:**
1. `checkAssignedOrderExists` - Verify assigned order exists
2. `validateRiderOwnership` - Ensure rider owns the assigned order
3. `validateUserOwnership` - Ensure user owns the assigned order
4. `validateStatusTransition` - Validate order status workflow
5. `validateBulkAssignment` - Validate bulk assignment requests

### 5. Routes (`src/routes/AssignedOrder.ts`)
**11 REST Endpoints:**
- `GET /assigned-orders/stats` - Get statistics (SADMIN)
- `GET /assigned-orders/` - Get all with filters (SADMIN)
- `GET /assigned-orders/:id` - Get single order (SADMIN/RIDER/USER)
- `GET /assigned-orders/rider/:riderId` - Get rider's orders (SADMIN/RIDER)
- `GET /assigned-orders/user/:userId` - Get user's orders (SADMIN/USER)
- `POST /assigned-orders/assign` - Assign single order (SADMIN)
- `POST /assigned-orders/assign-bulk` - Bulk assign (SADMIN)
- `PATCH /assigned-orders/:id/status` - Update status (RIDER)
- `PUT /assigned-orders/:id` - Update details (SADMIN)
- `DELETE /assigned-orders/:id` - Delete (SADMIN)

## Modified Files

### 1. Rider Schema (`src/schemas/Rider.ts`)
**Changes:**
- Removed `AssignedOrderSchema` sub-schema definition
- Removed `assignedOrders` field from RiderSchema
- Removed indexes on `assignedOrders.orderId` and `assignedOrders.userId`
- Added virtual populate for `assignedOrders` from AssignedOrder collection
- Removed `AssignedOrderStatus` import (moved to assignedOrder types)

```typescript
// Virtual populate for assigned orders
RiderSchema.virtual('assignedOrders', {
    ref: 'AssignedOrder',
    localField: '_id',
    foreignField: 'riderId'
});
```

### 2. Rider Types (`src/types/rider.ts`)
**Changes:**
- Removed `AssignedOrderStatus` enum (moved to assignedOrder.ts)
- Removed `AssignedOrder` interface (moved to assignedOrder.ts)
- Removed `assignedOrders` field from Rider interface
- Removed `AssignMultipleOrdersDTO` interface
- Removed `UpdateAssignedOrderStatusDTO` interface

### 3. Rider Controllers (`src/controllers/Rider.ts`)
**Changes:**
- Added import for `AssignedOrderModel`
- Removed imports for `OrderModel` and `Types`
- Removed `AssignedOrderStatus` from rider imports
- **Removed Functions:**
  - `assignOrderToRider` (moved to AssignedOrder controllers)
  - `assignMultipleOrdersToRider` (moved to AssignedOrder controllers)
  - `updateAssignedOrderStatus` (moved to AssignedOrder controllers)
- **Modified Function:**
  - `getRiderAssignedOrders` - Now queries AssignedOrder collection instead of embedded array

```typescript
// Old: Query embedded array
const rider = await RiderModel.findById(id)
    .select('assignedOrders')
    .populate('assignedOrders.orderId');

// New: Query separate collection
const assignedOrders = await AssignedOrderModel.find({ riderId: id })
    .populate('order')
    .populate('user', '-password');
```

### 4. Rider Routes (`src/routes/Rider.ts`)
**Changes:**
- Removed imports for `assignOrderToRider`, `assignMultipleOrdersToRider`, `updateAssignedOrderStatus`
- Removed routes:
  - `POST /riders/assign-order`
  - `POST /riders/assign-orders`
  - `PATCH /riders/order-status`

### 5. Main Routes (`src/routes/mainRoutes.ts`)
**Added:**
```typescript
import assignedOrderRouter from './AssignedOrder';
router.use('/assigned-orders', jwtAuthMiddleware, assignedOrderRouter);
```

### 6. Type Exports (`src/types/index.ts`)
**Added:**
```typescript
export * from './assignedOrder';
```

## Database Schema Changes

### AssignedOrder Collection Indexes
```typescript
1. { riderId: 1 } - Single field index
2. { orderId: 1 } - Single field index
3. { userId: 1 } - Single field index
4. { status: 1 } - Single field index
5. { assignedAt: -1 } - Single field index
6. { riderId: 1, status: 1 } - Compound index
7. { riderId: 1, assignedAt: -1 } - Compound index
8. { orderId: 1, riderId: 1 } - Unique compound index (prevents duplicates)
9. { userId: 1, status: 1 } - Compound index
10. { status: 1, assignedAt: -1 } - Compound index
```

## Benefits of Refactoring

### 1. **Scalability**
- Rider documents remain small regardless of order history
- Better query performance for large order volumes
- Independent scaling of assigned orders collection

### 2. **Query Flexibility**
- Direct queries on assigned orders without loading rider data
- Efficient filtering by user, rider, status, or date ranges
- Better pagination support for order lists

### 3. **Data Integrity**
- Unique constraint on orderId + riderId prevents duplicate assignments
- Clear foreign key relationships via ObjectId references
- Easier to maintain referential integrity

### 4. **Separation of Concerns**
- Order assignments managed independently from rider profiles
- Dedicated middleware for assignment validation
- Clear authorization boundaries (SADMIN vs RIDER access)

### 5. **Audit Trail**
- Complete history of all order assignments
- Timestamp tracking (assignedAt, pickedUpAt, deliveredAt, cancelledAt)
- Better analytics and reporting capabilities

## Status Workflow

### Valid Status Transitions
```
ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED
    ↓           ↓            ↓
CANCELLED   CANCELLED    CANCELLED
```

### Auto Rider Status Management
- **ASSIGNED**: Rider status set to BUSY when order assigned
- **DELIVERED/CANCELLED**: Rider status set to AVAILABLE when all orders completed

### Timestamp Tracking
- `assignedAt`: Set when order assigned
- `pickedUpAt`: Set when status changed to PICKED_UP
- `deliveredAt`: Set when status changed to DELIVERED (increments rider.totalDeliveries)
- `cancelledAt`: Set when status changed to CANCELLED

## Access Control

### SADMIN Operations
- Assign single/multiple orders
- Update assignment details
- Delete assignments
- View all assignments and statistics

### RIDER Operations
- Update assigned order status
- View own assigned orders
- Update delivery timestamps

### USER Operations
- View own assigned orders
- Filter by order status

## Migration Notes

### If Migrating Existing Data
1. Create AssignedOrder documents from embedded Rider.assignedOrders arrays
2. Preserve all timestamps and status values
3. Remove assignedOrders array from Rider documents
4. Update any existing code referencing embedded assignments

### Example Migration Script
```typescript
// Pseudocode for migration
const riders = await RiderModel.find({ 'assignedOrders.0': { $exists: true } });

for (const rider of riders) {
    for (const order of rider.assignedOrders) {
        await AssignedOrderModel.create({
            riderId: rider._id,
            orderId: order.orderId,
            userId: order.userId,
            status: order.status,
            assignedAt: order.assignedAt,
            pickedUpAt: order.pickedUpAt,
            deliveredAt: order.deliveredAt,
            cancelledAt: order.cancelledAt
        });
    }
    
    // Clear embedded array
    rider.assignedOrders = [];
    await rider.save();
}
```

## API Usage Examples

### Assign Single Order (SADMIN)
```typescript
POST /assigned-orders/assign
{
    "riderId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "orderId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k3",
    "notes": "Fragile items, handle with care"
}
```

### Bulk Assign Orders (SADMIN)
```typescript
POST /assigned-orders/assign-bulk
{
    "riderId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "orders": [
        {
            "orderId": "65a1b2c3d4e5f6g7h8i9j0k2",
            "userId": "65a1b2c3d4e5f6g7h8i9j0k3"
        },
        {
            "orderId": "65a1b2c3d4e5f6g7h8i9j0k4",
            "userId": "65a1b2c3d4e5f6g7h8i9j0k5",
            "notes": "Customer prefers evening delivery"
        }
    ]
}
```

### Update Order Status (RIDER)
```typescript
PATCH /assigned-orders/65a1b2c3d4e5f6g7h8i9j0k6/status
{
    "status": "picked-up"
}
```

### Get Rider's Orders (RIDER)
```typescript
GET /assigned-orders/rider/65a1b2c3d4e5f6g7h8i9j0k1?status=in-transit
```

### Get User's Orders (USER)
```typescript
GET /assigned-orders/user/65a1b2c3d4e5f6g7h8i9j0k3?status=assigned
```

## Testing Checklist

- [ ] Create single order assignment
- [ ] Create bulk order assignment
- [ ] Update order status through workflow
- [ ] Verify rider status changes (AVAILABLE ↔ BUSY)
- [ ] Test duplicate assignment prevention
- [ ] Test status transition validation
- [ ] Verify totalDeliveries increment on DELIVERED
- [ ] Test rider ownership validation
- [ ] Test user ownership validation
- [ ] Test pagination and filtering
- [ ] Verify statistics endpoint
- [ ] Test virtual populate on Rider.assignedOrders

## Conclusion

This refactoring transforms the assigned order system into a scalable, maintainable architecture suitable for production use. The separation of concerns, dedicated middleware, and comprehensive validation ensure data integrity while providing flexible query capabilities for all user roles.
