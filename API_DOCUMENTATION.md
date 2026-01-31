# Complete API Documentation - Food Delivery Platform

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Authentication](#authentication)
3. [Store Management APIs](#store-management-apis)
4. [Order Management APIs](#order-management-apis)
5. [Delivery Management APIs](#delivery-management-apis)
6. [Review & Rating APIs](#review--rating-apis)
7. [Notification APIs](#notification-apis)
8. [Coupon & Promotion APIs](#coupon--promotion-apis)
9. [Favorites/Wishlist APIs](#favoriteswishlist-apis)
10. [Customer Support APIs](#customer-support-apis)
11. [Search APIs](#search-apis)
12. [Analytics & Reports APIs](#analytics--reports-apis)
13. [Workflows](#workflows)
14. [Wireframe Structure](#wireframe-structure)

---

## 🏗️ System Overview

### Architecture Components
- **4 Store Types**: Restaurant, Medical, Grocery, Clothes
- **User Roles**: Customer, Store Owner, Rider, SADMIN
- **Authentication**: JWT-based
- **Base URL**: `/api/v1`

### Core Modules
1. **Store Management** - Manage stores and their items
2. **Order Processing** - Complete order lifecycle
3. **Delivery System** - Rider assignment and tracking
4. **Review System** - Multi-entity ratings
5. **Notification System** - Real-time updates
6. **Coupon System** - Discount management
7. **Favorites** - User wishlists
8. **Support** - Ticket-based help desk
9. **Search** - Global search functionality
10. **Analytics** - Admin dashboards

---

## 🔐 Authentication

All APIs require JWT authentication via header:
```
Authorization: Bearer <jwt_token>
```

**Middleware**: `jwtAuthMiddleware`  
**User ID Access**: Available as `req.userId` after authentication

---

## 🏪 Store Management APIs

### Store Types
- Restaurant (`/stores/restaurents`)
- Medical (`/stores/medical`)
- Grocery (`/stores/grocery`)
- Clothes (`/stores/clothes`)

### Store Endpoints (Pattern applies to all store types)

#### 1. Get All Stores
```http
GET /api/v1/stores/{storeType}
```
**Query Parameters**:
- `name` - Search by name
- `category` - Filter by category
- `rating` - Minimum rating
- `isOpen` - Filter by open status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response**:
```json
{
  "data": {
    "stores": [...],
    "total": 50,
    "page": 1,
    "limit": 10
  },
  "Status": {
    "Code": 200,
    "Message": "Stores retrieved successfully"
  }
}
```

#### 2. Get Single Store
```http
GET /api/v1/stores/{storeType}/:id
```

#### 3. Create Store (SADMIN)
```http
POST /api/v1/stores/{storeType}
```
**Body**:
```json
{
  "name": "Store Name",
  "description": "Description",
  "address": "Full Address",
  "phone": "1234567890",
  "email": "store@example.com",
  "category": ["category1", "category2"],
  "images": ["url1", "url2"],
  "operatingHours": {
    "monday": { "open": "09:00", "close": "21:00" },
    ...
  }
}
```

#### 4. Update Store
```http
PUT /api/v1/stores/{storeType}/:id
```

#### 5. Delete Store (SADMIN)
```http
DELETE /api/v1/stores/{storeType}/:id
```

#### 6. Toggle Store Status
```http
PATCH /api/v1/stores/{storeType}/:id/toggle-status
```

### Store Items Endpoints

#### 1. Get Store Items
```http
GET /api/v1/stores/{itemType}
```
**Query**: `storeId`, `category`, `isAvailable`, `minPrice`, `maxPrice`, `page`, `limit`

#### 2. Get Popular Items (NEW)
```http
GET /api/v1/stores/{itemType}/popular
```
Returns items with rating ≥ 4, sorted by rating (limit 20)

#### 3. Get Items by Store
```http
GET /api/v1/stores/{itemType}/store/:storeId
```

#### 4. Get Items by Category
```http
GET /api/v1/stores/{itemType}/store/:storeId/category/:category
```

#### 5. Create Item
```http
POST /api/v1/stores/{itemType}
```

#### 6. Bulk Create Items
```http
POST /api/v1/stores/{itemType}/bulk
```

#### 7. Update Item
```http
PUT /api/v1/stores/{itemType}/:id
```

#### 8. Delete Item
```http
DELETE /api/v1/stores/{itemType}/:id
```

#### 9. Toggle Item Availability
```http
PATCH /api/v1/stores/{itemType}/:id/toggle-availability
```

---

## 📦 Order Management APIs

Base: `/api/v1/orders`

### Core Order Endpoints

#### 1. Create Order
```http
POST /api/v1/orders
```
**Body**:
```json
{
  "storeType": "Restaurent",
  "storeId": "65a...",
  "items": [
    {
      "itemId": "65b...",
      "itemType": "MenuItem",
      "quantity": 2,
      "price": 299,
      "specialInstructions": "Extra spicy"
    }
  ],
  "deliveryAddress": {
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "phone": "9876543210",
    "instructions": "Ring doorbell twice"
  },
  "paymentMethod": "online",
  "subTotal": 598,
  "deliveryCharge": 50,
  "tax": 59.80,
  "discount": 0,
  "totalAmount": 707.80
}
```

#### 2. Get Orders
```http
GET /api/v1/orders
```
**Query**: `userId`, `storeType`, `storeId`, `status`, `minAmount`, `maxAmount`, `fromDate`, `toDate`, `page`, `limit`

#### 3. Get Single Order
```http
GET /api/v1/orders/:id
```

#### 4. Get User Orders
```http
GET /api/v1/orders/user/:userId
```

#### 5. Get Store Orders
```http
GET /api/v1/orders/store/:storeId
```

#### 6. Get Store Order History (NEW)
```http
GET /api/v1/orders/store/:storeId/history
```
**Query**: `fromDate`, `toDate`, `status`, `page`, `limit`

#### 7. Update Order
```http
PUT /api/v1/orders/:id
```

#### 8. Update Order Items (NEW)
```http
PATCH /api/v1/orders/:id/items
```
**Note**: Only allowed when status = "pending"

**Body**:
```json
{
  "items": [...]
}
```

#### 9. Update Order Status
```http
PATCH /api/v1/orders/:id/status
```
**Body**:
```json
{
  "status": "confirmed|preparing|out-for-delivery|delivered|cancelled"
}
```

#### 10. Add Delivery Instructions (NEW)
```http
PATCH /api/v1/orders/:id/delivery-instructions
```
**Body**:
```json
{
  "instructions": "Leave at door"
}
```

#### 11. Update Transaction
```http
PATCH /api/v1/orders/:id/transaction
```
**Body**:
```json
{
  "transactionId": "TXN123456",
  "paymentStatus": "success|failed|pending",
  "paidAt": "2026-01-31T10:30:00Z"
}
```

#### 12. Cancel Order
```http
PATCH /api/v1/orders/:id/cancel
```

#### 13. Estimate Delivery Time (NEW)
```http
POST /api/v1/orders/estimate-delivery
```
**Body**:
```json
{
  "storeId": "65a...",
  "deliveryAddress": {...}
}
```
**Response**:
```json
{
  "data": {
    "estimatedTime": "30-45 mins",
    "estimatedDeliveryAt": "2026-01-31T11:15:00Z"
  },
  "Status": {
    "Code": 200,
    "Message": "Delivery time estimated"
  }
}
```

#### 14. Delete Order (SADMIN)
```http
DELETE /api/v1/orders/:id
```

#### 15. Get Order Statistics
```http
GET /api/v1/orders/stats
```
**Query**: `storeId`, `fromDate`, `toDate`

**Response**:
```json
{
  "data": {
    "totalOrders": 1234,
    "totalRevenue": 456789,
    "avgOrderValue": 370,
    "pendingOrders": 45,
    "confirmedOrders": 23,
    "preparingOrders": 12,
    "outForDeliveryOrders": 8,
    "deliveredOrders": 1000,
    "cancelledOrders": 146
  },
  "Status": {...}
}
```

---

## 🛵 Delivery Management APIs

### Riders

Base: `/api/v1/riders`

#### 1. Get Riders
```http
GET /api/v1/riders
```
**Query**: `name`, `phone`, `status`, `vehicleType`, `isActive`, `minRating`, `page`, `limit`

#### 2. Get Available Riders
```http
GET /api/v1/riders/available
```

#### 3. Get Rider
```http
GET /api/v1/riders/:id
```

#### 4. Get Rider Orders
```http
GET /api/v1/riders/:id/orders
```

#### 5. Create Rider (SADMIN)
```http
POST /api/v1/riders
```

#### 6. Update Rider (SADMIN)
```http
PUT /api/v1/riders/:id
```

#### 7. Update Rider Location
```http
PATCH /api/v1/riders/:id/location
```
**Body**:
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "address": "Current location"
}
```

#### 8. Toggle Rider Status (SADMIN)
```http
PATCH /api/v1/riders/:id/toggle-status
```

#### 9. Delete Rider (SADMIN)
```http
DELETE /api/v1/riders/:id
```

#### 10. Get Rider Statistics
```http
GET /api/v1/riders/stats
```

### Assigned Orders

Base: `/api/v1/assigned-orders`

#### 1. Assign Order to Rider (SADMIN)
```http
POST /api/v1/assigned-orders/assign
```
**Body**:
```json
{
  "riderId": "65a...",
  "orderId": "65b...",
  "userId": "65c...",
  "notes": "Fragile items"
}
```

#### 2. Bulk Assign Orders (SADMIN)
```http
POST /api/v1/assigned-orders/assign-bulk
```
**Body**:
```json
{
  "riderId": "65a...",
  "orders": [
    {
      "orderId": "65b...",
      "userId": "65c...",
      "notes": "..."
    }
  ]
}
```

#### 3. Get Assigned Orders
```http
GET /api/v1/assigned-orders
```
**Query**: `riderId`, `orderId`, `userId`, `status`, `fromDate`, `toDate`, `page`, `limit`

#### 4. Get Single Assignment
```http
GET /api/v1/assigned-orders/:id
```

#### 5. Get Rider Assignments
```http
GET /api/v1/assigned-orders/rider/:riderId
```

#### 6. Get User Assignments
```http
GET /api/v1/assigned-orders/user/:userId
```

#### 7. Get Tracking Info (NEW)
```http
GET /api/v1/assigned-orders/:id/tracking
```
**Response**:
```json
{
  "data": {
    "assignedOrder": {...},
    "rider": {
      "name": "John Doe",
      "phone": "9876543210",
      "currentLocation": {
        "latitude": 19.0760,
        "longitude": 72.8777
      },
      "vehicleType": "bike"
    },
    "order": {...},
    "statusHistory": [
      {
        "status": "assigned",
        "timestamp": "..."
      }
    ]
  },
  "Status": {...}
}
```

#### 8. Update Assignment Status
```http
PATCH /api/v1/assigned-orders/:id/status
```
**Body**:
```json
{
  "status": "picked-up|in-transit|delivered|cancelled"
}
```

#### 9. Reassign Order (SADMIN) (NEW)
```http
PATCH /api/v1/assigned-orders/:id/reassign
```
**Body**:
```json
{
  "newRiderId": "65d..."
}
```

#### 10. Add Delivery Proof (RIDER) (NEW)
```http
POST /api/v1/assigned-orders/:id/delivery-proof
```
**Body**:
```json
{
  "deliveryProof": ["image_url1", "signature_url"]
}
```

#### 11. Verify Pickup with OTP (RIDER) (NEW)
```http
POST /api/v1/assigned-orders/:id/verify-pickup
```
**Body**:
```json
{
  "otp": "1234"
}
```
**Note**: OTP is last 4 digits of order ID

#### 12. Update Assignment (SADMIN)
```http
PUT /api/v1/assigned-orders/:id
```

#### 13. Delete Assignment (SADMIN)
```http
DELETE /api/v1/assigned-orders/:id
```

#### 14. Get Assignment Statistics
```http
GET /api/v1/assigned-orders/stats
```

---

## ⭐ Review & Rating APIs

Base: `/api/v1/reviews`

### Review Types
- Store Review (`reviewType: "store"`)
- Rider Review (`reviewType: "rider"`)
- Order Review (`reviewType: "order"`)

#### 1. Create Review
```http
POST /api/v1/reviews
```
**Body (Store Review)**:
```json
{
  "reviewType": "store",
  "storeType": "Restaurent",
  "storeId": "65a...",
  "rating": 5,
  "comment": "Excellent food!",
  "images": ["url1", "url2"]
}
```

**Body (Rider Review)**:
```json
{
  "reviewType": "rider",
  "riderId": "65b...",
  "orderId": "65c...",
  "rating": 4,
  "comment": "Professional delivery"
}
```

#### 2. Get Reviews
```http
GET /api/v1/reviews
```
**Query**: `reviewType`, `storeType`, `storeId`, `riderId`, `orderId`, `userId`, `rating`, `minRating`, `isVerifiedPurchase`, `isApproved`, `isFlagged`, `page`, `limit`

#### 3. Get Single Review
```http
GET /api/v1/reviews/:id
```

#### 4. Get Store Reviews
```http
GET /api/v1/reviews/store/:storeId
```

#### 5. Get Rider Reviews
```http
GET /api/v1/reviews/rider/:riderId
```

#### 6. Get User Reviews
```http
GET /api/v1/reviews/user/:userId
```

#### 7. Update Review
```http
PUT /api/v1/reviews/:id
```
**Note**: User can only update their own review

#### 8. Delete Review
```http
DELETE /api/v1/reviews/:id
```

#### 9. Reply to Review (Store Owner/SADMIN)
```http
POST /api/v1/reviews/:id/reply
```
**Body**:
```json
{
  "reply": "Thank you for your feedback!"
}
```

#### 10. Mark Review Helpful
```http
POST /api/v1/reviews/:id/helpful
```
**Body**:
```json
{
  "helpful": true
}
```

#### 11. Flag Review
```http
POST /api/v1/reviews/:id/flag
```
**Body**:
```json
{
  "reason": "Inappropriate content"
}
```

#### 12. Moderate Review (SADMIN)
```http
PATCH /api/v1/reviews/:id/moderate
```
**Body**:
```json
{
  "isApproved": false
}
```

#### 13. Get Review Statistics
```http
GET /api/v1/reviews/stats
```
**Query**: `storeId`, `riderId`

**Response**:
```json
{
  "data": {
    "totalReviews": 234,
    "averageRating": 4.3,
    "ratingDistribution": {
      "5": 120,
      "4": 80,
      "3": 20,
      "2": 10,
      "1": 4
    },
    "verifiedPurchases": 200,
    "withComments": 180,
    "withImages": 45
  },
  "Status": {...}
}
```

---

## 🔔 Notification APIs

Base: `/api/v1/notifications`

### Notification Types
- Order updates
- Rider updates
- Review replies
- Coupon availability
- Support ticket responses
- System announcements

#### 1. Get Notifications
```http
GET /api/v1/notifications
```
**Query**: `type`, `isRead`, `fromDate`, `toDate`, `page`, `limit`

**Response**:
```json
{
  "data": {
    "notifications": [
      {
        "_id": "65a...",
        "type": "order_out_for_delivery",
        "title": "Order on the way",
        "message": "Your order #12345 is out for delivery",
        "data": {
          "orderId": "65b...",
          "riderId": "65c..."
        },
        "isRead": false,
        "createdAt": "2026-01-31T10:30:00Z"
      }
    ],
    "pagination": {...}
  },
  "Status": {...}
}
```

#### 2. Get Unread Count
```http
GET /api/v1/notifications/unread-count
```
**Response**:
```json
{
  "data": {
    "unreadCount": 5
  },
  "Status": {...}
}
```

#### 3. Get Single Notification
```http
GET /api/v1/notifications/:id
```

#### 4. Get User Notifications (SADMIN)
```http
GET /api/v1/notifications/user/:userId
```

#### 5. Create Notification (System/SADMIN)
```http
POST /api/v1/notifications
```
**Body**:
```json
{
  "userId": "65a...",
  "type": "system_announcement",
  "title": "New Feature",
  "message": "Check out our new feature!",
  "data": {}
}
```

#### 6. Mark as Read
```http
PATCH /api/v1/notifications/:id/read
```

#### 7. Mark All as Read
```http
PATCH /api/v1/notifications/mark-all-read
```
**Body (optional)**:
```json
{
  "notificationIds": ["65a...", "65b..."]
}
```
**Note**: If no IDs provided, marks all user notifications as read

#### 8. Delete Notification
```http
DELETE /api/v1/notifications/:id
```

---

## 🎫 Coupon & Promotion APIs

Base: `/api/v1/coupons`

### Coupon Types
- `percentage` - Percentage discount
- `fixed` - Fixed amount discount
- `free_delivery` - Free delivery

#### 1. Get Available Coupons
```http
GET /api/v1/coupons/available
```
**Query**: `applicableOn`, `minOrderAmount`

Returns active coupons with valid dates and usage not exceeded

#### 2. Get Coupons
```http
GET /api/v1/coupons
```
**Query**: `isActive`, `applicableOn`, `page`, `limit`

#### 3. Get Single Coupon
```http
GET /api/v1/coupons/:id
```

#### 4. Create Coupon (SADMIN)
```http
POST /api/v1/coupons/create
```
**Body**:
```json
{
  "code": "SAVE20",
  "title": "20% Off",
  "description": "Get 20% off on all orders",
  "type": "percentage",
  "value": 20,
  "maxDiscount": 200,
  "minOrderAmount": 500,
  "applicableOn": "all",
  "usageLimit": 1000,
  "usagePerUser": 1,
  "validFrom": "2026-01-01T00:00:00Z",
  "validUntil": "2026-12-31T23:59:59Z"
}
```

#### 5. Update Coupon (SADMIN)
```http
PUT /api/v1/coupons/:id
```

#### 6. Toggle Coupon Status (SADMIN)
```http
PATCH /api/v1/coupons/:id/toggle-status
```

#### 7. Delete Coupon (SADMIN)
```http
DELETE /api/v1/coupons/:id
```

#### 8. Validate Coupon
```http
POST /api/v1/coupons/validate
```
**Body**:
```json
{
  "code": "SAVE20",
  "userId": "65a...",
  "orderAmount": 1000,
  "storeType": "Restaurent"
}
```
**Response**:
```json
{
  "data": {
    "isValid": true,
    "coupon": {...},
    "discountAmount": 200,
    "message": "Coupon applied successfully"
  },
  "Status": {...}
}
```

#### 9. Apply Coupon
```http
POST /api/v1/coupons/apply
```
**Body**:
```json
{
  "couponId": "65a...",
  "orderId": "65b..."
}
```
Creates CouponUsage record and increments coupon.usedCount

#### 10. Get Coupon Statistics
```http
GET /api/v1/coupons/stats
```

---

## ❤️ Favorites/Wishlist APIs

Base: `/api/v1/favorites`

### Favorite Types
- Store favorites
- Item favorites

#### 1. Get Favorites
```http
GET /api/v1/favorites
```
**Query**: `favoriteType`, `storeType`, `itemType`, `page`, `limit`

#### 2. Get Favorite Stores
```http
GET /api/v1/favorites/stores
```

#### 3. Get Favorite Items
```http
GET /api/v1/favorites/items
```

#### 4. Get Single Favorite
```http
GET /api/v1/favorites/:id
```

#### 5. Add Favorite
```http
POST /api/v1/favorites
```
**Body (Store)**:
```json
{
  "favoriteType": "store",
  "storeType": "Restaurent",
  "storeId": "65a..."
}
```

**Body (Item)**:
```json
{
  "favoriteType": "item",
  "itemType": "MenuItem",
  "itemId": "65b..."
}
```

#### 6. Toggle Favorite
```http
POST /api/v1/favorites/toggle
```
**Body**: Same as Add Favorite

**Response**:
```json
{
  "data": {
    "action": "added",
    "favorite": {...}
  },
  "Status": {...}
}
```

#### 7. Check if Favorite
```http
POST /api/v1/favorites/check
```
**Body**:
```json
{
  "favoriteType": "store",
  "storeId": "65a..."
}
```
**Response**:
```json
{
  "data": {
    "isFavorite": true
  },
  "Status": {...}
}
```

#### 8. Remove Favorite
```http
DELETE /api/v1/favorites/:id
```

---

## 🎧 Customer Support APIs

Base: `/api/v1/support`

### Ticket Categories
- Order Issue
- Payment Issue
- Delivery Issue
- Product Quality
- Rider Behavior
- Technical Issue
- Account Issue
- Other

#### 1. Create Ticket
```http
POST /api/v1/support
```
**Body**:
```json
{
  "orderId": "65a...",
  "category": "delivery_issue",
  "subject": "Late delivery",
  "description": "My order is delayed by 2 hours",
  "attachments": ["url1", "url2"]
}
```
Auto-generates ticket number (TKT-000001)

#### 2. Get User Tickets
```http
GET /api/v1/support
```
**Query**: `status`, `priority`, `category`, `page`, `limit`

#### 3. Get All Tickets (SADMIN)
```http
GET /api/v1/support/all
```
**Query**: `userId`, `status`, `priority`, `category`, `assignedTo`, `page`, `limit`

#### 4. Get Single Ticket
```http
GET /api/v1/support/:id
```

#### 5. Add Message to Ticket
```http
POST /api/v1/support/:id/messages
```
**Body**:
```json
{
  "message": "I'm still waiting for delivery",
  "attachments": []
}
```

#### 6. Update Ticket (SADMIN)
```http
PUT /api/v1/support/:id
```
**Body**:
```json
{
  "status": "in_progress",
  "priority": "high",
  "assignedTo": "65a..."
}
```

#### 7. Resolve Ticket
```http
PATCH /api/v1/support/:id/resolve
```

#### 8. Close Ticket
```http
PATCH /api/v1/support/:id/close
```

#### 9. Delete Ticket (SADMIN)
```http
DELETE /api/v1/support/:id
```

#### 10. Get Ticket Statistics
```http
GET /api/v1/support/stats
```
**Response**:
```json
{
  "data": {
    "totalTickets": 500,
    "openTickets": 45,
    "inProgressTickets": 30,
    "resolvedTickets": 380,
    "closedTickets": 45,
    "lowPriority": 200,
    "mediumPriority": 250,
    "highPriority": 40,
    "urgentPriority": 10
  },
  "Status": {...}
}
```

---

## 🔍 Search APIs

Base: `/api/v1/search`

#### 1. Global Search
```http
GET /api/v1/search?q=pizza&page=1&limit=20
```
Searches across all stores and items

**Response**:
```json
{
  "data": {
    "stores": [
      {
        "type": "Restaurent",
        "store": {...}
      }
    ],
    "items": [
      {
        "type": "MenuItem",
        "item": {...}
      }
    ],
    "pagination": {...}
  },
  "Status": {...}
}
```

#### 2. Search Stores
```http
GET /api/v1/search/stores?q=medical&page=1&limit=20
```
Searches only stores (all types)

#### 3. Search Items
```http
GET /api/v1/search/items?q=shirt&page=1&limit=20
```
Searches only items (all types)

---

## 📊 Analytics & Reports APIs

Base: `/api/v1/analytics`

**Note**: All analytics endpoints require SADMIN access

#### 1. Dashboard Summary
```http
GET /api/v1/analytics/admin/dashboard
```
**Response**:
```json
{
  "data": {
    "totalUsers": 10000,
    "totalStores": 250,
    "totalOrders": 50000,
    "totalRevenue": 2500000,
    "activeRiders": 150,
    "todayOrders": 234,
    "todayRevenue": 87650,
    "pendingOrders": 45,
    "activeStores": 230
  },
  "Status": {...}
}
```

#### 2. Revenue Report
```http
GET /api/v1/analytics/admin/revenue
```
**Query**: `fromDate`, `toDate`, `groupBy` (day/week/month), `storeType`

**Response**:
```json
{
  "data": {
    "totalRevenue": 500000,
    "totalOrders": 2000,
    "avgOrderValue": 250,
    "timeSeries": [
      {
        "date": "2026-01-01",
        "revenue": 50000,
        "orders": 200
      }
    ]
  },
  "Status": {...}
}
```

#### 3. Store Performance
```http
GET /api/v1/analytics/admin/stores/performance
```
**Query**: `sortBy` (revenue/orders/rating), `page`, `limit`

**Response**:
```json
{
  "data": {
    "stores": [
      {
        "storeId": "65a...",
        "storeName": "Pizza Palace",
        "storeType": "Restaurent",
        "totalOrders": 1234,
        "totalRevenue": 456789,
        "avgRating": 4.5,
        "reviewCount": 234
      }
    ],
    "pagination": {...}
  },
  "Status": {...}
}
```

#### 4. Rider Performance
```http
GET /api/v1/analytics/admin/riders/performance
```
**Query**: `sortBy` (deliveries/rating), `page`, `limit`

**Response**:
```json
{
  "data": {
    "riders": [
      {
        "riderId": "65a...",
        "riderName": "John Doe",
        "totalDeliveries": 567,
        "avgRating": 4.7,
        "onTimeDeliveryRate": 95
      }
    ],
    "pagination": {...}
  },
  "Status": {...}
}
```

#### 5. Category Sales
```http
GET /api/v1/analytics/admin/category-sales
```
**Query**: `fromDate`, `toDate`

**Response**:
```json
{
  "data": {
    "byStoreType": {
      "Restaurent": 1000000,
      "Grocery": 800000,
      "Medical": 500000,
      "Clothes": 200000
    },
    "byCategory": [
      {
        "category": "Pizza",
        "storeType": "Restaurent",
        "totalSales": 250000,
        "orderCount": 1000
      }
    ]
  },
  "Status": {...}
}
```

---

## 🔄 Workflows

### 1. Customer Order Flow

```
┌─────────────────┐
│  Browse Stores  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Select Items   │ ← Add to Cart (localStorage)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Apply Coupon   │ ← Validate & Calculate Discount
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Place Order    │ → POST /orders
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Make Payment   │ → PATCH /orders/:id/transaction
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Order Confirmed  │ → Notification sent
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Rider Assigned │ → POST /assigned-orders/assign
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Track Delivery  │ → GET /assigned-orders/:id/tracking
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Order Delivered  │ → PATCH /assigned-orders/:id/status
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Rate & Review  │ → POST /reviews
└─────────────────┘
```

### 2. Rider Delivery Flow

```
┌─────────────────┐
│ Rider Available │ → status: AVAILABLE
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Order Assigned  │ → POST /assigned-orders/assign
│                 │    status: BUSY
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verify Pickup   │ → POST /assigned-orders/:id/verify-pickup
│ (with OTP)      │    status: PICKED_UP
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Update Location  │ → PATCH /riders/:id/location
│  (Real-time)    │    (every 30 seconds)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  In Transit     │ → PATCH /assigned-orders/:id/status
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Add Delivery     │ → POST /assigned-orders/:id/delivery-proof
│   Proof         │    (photo/signature)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Delivered     │ → PATCH /assigned-orders/:id/status
│                 │    Increment totalDeliveries
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Rider Available │ → status: AVAILABLE (if no more orders)
└─────────────────┘
```

### 3. Support Ticket Flow

```
┌─────────────────┐
│  Create Ticket  │ → POST /support
│                 │    Auto-generate TKT-000001
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Notification to │
│     Admin       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Admin Assigns   │ → PUT /support/:id
│   to Staff      │    assignedTo, priority
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Staff Replies  │ → POST /support/:id/messages
│                 │    isStaff: true
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Notified   │
│ & Can Reply     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Issue Resolved  │ → PATCH /support/:id/resolve
│                 │    status: RESOLVED
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Ticket Closed   │ → PATCH /support/:id/close
│                 │    status: CLOSED
└─────────────────┘
```

### 4. Review & Rating Flow

```
┌─────────────────┐
│ Order Delivered │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Prompted   │
│  to Review      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Submit Review  │ → POST /reviews
│ (Store/Rider)   │    rating, comment, images
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Auto-approve    │ → isApproved: true
│  (unless spam)  │    isVerifiedPurchase: true
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Update Avg Rating│ → Update Store/Rider rating
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Store Owner Gets │
│  Notification   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Owner Can Reply │ → POST /reviews/:id/reply
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ User Notified   │
│  of Reply       │
└─────────────────┘
```

---

## 📱 Wireframe Structure

### Customer App

#### 1. Home Screen
```
┌─────────────────────────────────────┐
│  🏠 Food Delivery                   │
│  ────────────────────────────────   │
│  🔔 (3)  ❤️   👤                    │
├─────────────────────────────────────┤
│  📍 Delivery Location               │
│  123 Main St, Mumbai                │
│  ─────────────────────────────────  │
│  🔍 Search for food, groceries...   │
├─────────────────────────────────────┤
│  [🍕 Food] [💊 Medical] [🛒 Grocery]│
│  [👕 Clothes]                       │
├─────────────────────────────────────┤
│  Popular Near You                   │
│  ┌────┐ ┌────┐ ┌────┐              │
│  │ 🍕 │ │ 🍔 │ │ 🌮 │  → Swipe     │
│  │4.5★│ │4.3★│ │4.7★│              │
│  └────┘ └────┘ └────┘              │
├─────────────────────────────────────┤
│  All Restaurants                    │
│  ┌───────────────────────┐          │
│  │ 🍕 Pizza Palace  4.5★ │          │
│  │ Italian • $$ • 30 mins│          │
│  └───────────────────────┘          │
│  ┌───────────────────────┐          │
│  │ 🍔 Burger King   4.3★ │          │
│  └───────────────────────┘          │
└─────────────────────────────────────┘
```

#### 2. Store Detail Screen
```
┌─────────────────────────────────────┐
│  ← 🍕 Pizza Palace       ❤️  ℹ️     │
├─────────────────────────────────────┤
│  [Image Carousel]                   │
│  ● ○ ○                              │
├─────────────────────────────────────┤
│  4.5 ★★★★★ (234 reviews)           │
│  Italian • $$ • 30-40 mins          │
│  ─────────────────────────────────  │
│  📍 5.2 km away                     │
│  🎫 50% off up to ₹100              │
├─────────────────────────────────────┤
│  [Popular] [Pizza] [Pasta] [Sides] │
├─────────────────────────────────────┤
│  Popular Items                      │
│  ┌─────────────────────────┐        │
│  │ 🍕 Margherita     ₹299  │ +      │
│  │ Classic cheese pizza     │        │
│  │ ⭐4.7 (89)              │        │
│  └─────────────────────────┘        │
│  ┌─────────────────────────┐        │
│  │ 🍕 Pepperoni      ₹349  │ +      │
│  └─────────────────────────┘        │
├─────────────────────────────────────┤
│  [View Cart (2 items) ₹648 →]      │
└─────────────────────────────────────┘
```

#### 3. Cart Screen
```
┌─────────────────────────────────────┐
│  ← Cart                             │
├─────────────────────────────────────┤
│  📍 Delivery to:                    │
│  123 Main St, Apt 4B   [Change]     │
├─────────────────────────────────────┤
│  🍕 Pizza Palace                    │
│  ┌─────────────────────────┐        │
│  │ Margherita         ₹299 │        │
│  │ [−] 1 [+]              │        │
│  │ Extra cheese +₹50       │        │
│  └─────────────────────────┘        │
│  ┌─────────────────────────┐        │
│  │ Pepperoni          ₹349 │        │
│  │ [−] 1 [+]              │        │
│  └─────────────────────────┘        │
├─────────────────────────────────────┤
│  🎫 Apply Coupon [SAVE20 →]        │
├─────────────────────────────────────┤
│  Bill Details                       │
│  Item total:           ₹698         │
│  Delivery charge:      ₹50          │
│  Coupon discount:     -₹100         │
│  Tax:                  ₹54.8        │
│  ─────────────────────────────────  │
│  Total:               ₹702.8        │
├─────────────────────────────────────┤
│  [Proceed to Payment →]             │
└─────────────────────────────────────┘
```

#### 4. Live Tracking Screen
```
┌─────────────────────────────────────┐
│  ← Order #12345                     │
├─────────────────────────────────────┤
│  [Map with rider location]          │
│  📍──────🛵──────🏠                │
│  Store  Rider   You                 │
├─────────────────────────────────────┤
│  ✅ Order Confirmed                 │
│  ✅ Preparing                       │
│  🔵 Out for Delivery (Current)      │
│  ○  Delivered                       │
├─────────────────────────────────────┤
│  Delivery Partner                   │
│  ┌───────────────────────┐          │
│  │ 👤 John Doe   4.7★    │          │
│  │ 🏍️ Bike • MH12AB1234 │          │
│  │ 📞 Call  💬 Chat      │          │
│  └───────────────────────┘          │
├─────────────────────────────────────┤
│  Arriving in 12 mins                │
│  🎯 Track location updated 30s ago  │
└─────────────────────────────────────┘
```

#### 5. Review Screen
```
┌─────────────────────────────────────┐
│  ← Rate your experience             │
├─────────────────────────────────────┤
│  How was the food?                  │
│  ★ ★ ★ ★ ★                         │
├─────────────────────────────────────┤
│  How was the delivery?              │
│  ★ ★ ★ ★ ☆                         │
├─────────────────────────────────────┤
│  Share your feedback                │
│  ┌─────────────────────────┐        │
│  │ Tell us more...         │        │
│  │                         │        │
│  └─────────────────────────┘        │
├─────────────────────────────────────┤
│  Add Photos (optional)              │
│  [📷 +] [📷 +] [📷 +]              │
├─────────────────────────────────────┤
│  [Submit Review]                    │
└─────────────────────────────────────┘
```

### Rider App

#### 1. Rider Home
```
┌─────────────────────────────────────┐
│  🛵 Rider Dashboard                 │
│  ────────────────────────────────   │
│  John Doe              [Go Offline] │
├─────────────────────────────────────┤
│  Today's Stats                      │
│  ┌─────┬─────┬─────┬─────┐         │
│  │ 12  │₹1.2k│ 4.7★│ 95% │         │
│  │Dlvr │Earn │Rate │OnTime│         │
│  └─────┴─────┴─────┴─────┘         │
├─────────────────────────────────────┤
│  Active Deliveries (2)              │
│  ┌───────────────────────┐          │
│  │ 🍕 Order #12345       │          │
│  │ Pizza Palace → 2.3 km │          │
│  │ ₹299 • COD            │          │
│  │ [View Details →]      │          │
│  └───────────────────────┘          │
│  ┌───────────────────────┐          │
│  │ 🛒 Order #12346       │          │
│  │ Grocery Store → 1.5 km│          │
│  │ ₹450 • Paid           │          │
│  │ [View Details →]      │          │
│  └───────────────────────┘          │
├─────────────────────────────────────┤
│  [Navigate]  [Call Customer]        │
└─────────────────────────────────────┘
```

#### 2. Order Detail (Rider)
```
┌─────────────────────────────────────┐
│  ← Order #12345                     │
├─────────────────────────────────────┤
│  🍕 Pizza Palace                    │
│  📍 123 Store St                    │
│  [Navigate] [Call Store]            │
├─────────────────────────────────────┤
│  Pickup OTP: 1234                   │
│  [Verify Pickup]                    │
├─────────────────────────────────────┤
│  Customer Details                   │
│  👤 Jane Smith                      │
│  📍 456 Customer Ave, Apt 4B        │
│  📞 +91 98765 43210                 │
│  [Navigate] [Call]                  │
├─────────────────────────────────────┤
│  Order Items (2)                    │
│  • Margherita x1                    │
│  • Pepperoni x1                     │
├─────────────────────────────────────┤
│  Payment: ₹702.8 (COD)              │
│  Delivery Instructions:              │
│  "Ring doorbell twice"              │
├─────────────────────────────────────┤
│  Current Status: In Transit         │
│  [Mark Picked Up]                   │
│  [Mark Delivered]                   │
└─────────────────────────────────────┘
```

### Admin Panel (Web)

#### 1. Dashboard
```
┌──────────────────────────────────────────────────────────┐
│  🏠 Admin Dashboard         john@admin.com [Logout]      │
├─────┬────────────────────────────────────────────────────┤
│ 📊  │  Overview                                          │
│ Dash│  ┌─────────┬─────────┬─────────┬─────────┐       │
│     │  │ 10,000  │  250    │ 50,000  │ ₹25L    │       │
│ 🏪  │  │ Users   │ Stores  │ Orders  │ Revenue │       │
│Stores│  └─────────┴─────────┴─────────┴─────────┘       │
│     │                                                    │
│ 🛵  │  Today's Activity                                 │
│Riders│  Orders: 234 | Revenue: ₹87,650 | Active: 150   │
│     │                                                    │
│ 📦  │  Revenue Chart (Last 7 Days)                      │
│Orders│  [Line Chart]                                     │
│     │  ┌───────────────────────────────────────┐        │
│ 💬  │  │        /\                             │        │
│Support  │       /  \    /\                     │        │
│     │  │  /\  /    \  /  \                    │        │
│ ⭐  │  │ /  \/      \/    \                   │        │
│Reviews  └───────────────────────────────────────┘        │
│     │  Mon  Tue  Wed  Thu  Fri  Sat  Sun               │
│ 🎫  │                                                    │
│Coupons  Top Performing Stores                             │
│     │  1. Pizza Palace     - ₹456K (1,234 orders)       │
│ 📊  │  2. Medical Store    - ₹345K (890 orders)         │
│Analytics 3. Grocery Mart     - ₹234K (678 orders)         │
│     │                                                    │
│ ⚙️  │  Recent Support Tickets                           │
│Settings │  • TKT-001234 - Late delivery (Open)            │
│     │  • TKT-001235 - Payment issue (In Progress)       │
└─────┴────────────────────────────────────────────────────┘
```

#### 2. Order Management
```
┌──────────────────────────────────────────────────────────┐
│  Orders Management                                       │
├──────────────────────────────────────────────────────────┤
│  [All] [Pending] [Confirmed] [Delivering] [Delivered]   │
│  [Search...] [Date Range] [Store Type] [Export CSV]     │
├──────────────────────────────────────────────────────────┤
│  Order ID    │ Customer │ Store    │ Amount │ Status    │
│──────────────┼──────────┼──────────┼────────┼───────────┤
│  #12345      │ Jane S.  │ Pizza P. │ ₹702   │🟢 Delivering
│  #12344      │ John D.  │ Medical  │ ₹450   │🔵 Confirmed│
│  #12343      │ Sarah M. │ Grocery  │ ₹1,234 │⚪ Pending │
│  #12342      │ Mike R.  │ Clothes  │ ₹2,999 │✅ Delivered│
├──────────────────────────────────────────────────────────┤
│  Showing 1-10 of 234    [Previous] Page 1 of 24 [Next]  │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Summary

### Total API Endpoints: **150+**

#### By Module:
- **Stores**: 40 endpoints (4 store types × 10 endpoints)
- **Store Items**: 36 endpoints (4 item types × 9 endpoints)
- **Orders**: 15 endpoints
- **Riders**: 10 endpoints
- **Assigned Orders**: 14 endpoints
- **Reviews**: 13 endpoints
- **Notifications**: 8 endpoints
- **Coupons**: 10 endpoints
- **Favorites**: 8 endpoints
- **Support**: 10 endpoints
- **Search**: 3 endpoints
- **Analytics**: 5 endpoints

### Key Features Implemented:
✅ Multi-store type support (Restaurant, Medical, Grocery, Clothes)  
✅ Complete order lifecycle management  
✅ Rider assignment and tracking  
✅ Review and rating system  
✅ Real-time notifications  
✅ Coupon and promotion engine  
✅ Favorites/wishlist functionality  
✅ Support ticket system  
✅ Global search across entities  
✅ Comprehensive analytics dashboard  
✅ Order tracking with real-time location  
✅ Delivery proof system  
✅ OTP-based pickup verification  

### Security & Access Control:
- JWT authentication on all endpoints
- Role-based access (Customer, Store Owner, Rider, SADMIN)
- User-specific data isolation
- SADMIN-only administrative functions

### Data Consistency:
- Automatic rating recalculation for stores/riders
- Coupon usage tracking
- Order status workflow validation
- Notification triggers on key events

---

## 📞 Support

For API issues or questions, create a support ticket:
```http
POST /api/v1/support
```

**Response Format** (All APIs):
```json
{
  "data": {...},
  "Status": {
    "Code": 200,
    "Message": "Success message"
  }
}
```

**Error Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

*Last Updated: January 31, 2026*  
*Version: 1.0.0*
