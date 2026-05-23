# Flash Sale Engine - Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

---

## 🔐 Authentication Endpoints

### POST /auth/register
Register new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## 📦 Campaign Management Endpoints

### POST /campaigns
Create new campaign
```json
{
  "name": "Summer Flash Sale",
  "slug": "summer-flash-sale",
  "startAt": "2026-05-21T20:00:00Z",
  "endAt": "2026-05-21T22:00:00Z",
  "discountPercentage": 50,
  "products": [
    {
      "productId": "product_id",
      "allocatedStock": 100,
      "purchaseLimit": 2
    }
  ],
  "guestCheckoutOnly": true
}
```

### GET /campaigns
List all campaigns (with optional filters)
```
?status=live
?slug=summer-flash-sale
```

### GET /campaigns/:id
Get specific campaign details

### POST /campaigns/:id/pause
Pause a live campaign

### POST /campaigns/:id/resume
Resume a paused campaign

---

## 🛒 Products Endpoints

### GET /products
Get all products with optional filters
```
?saleActive=true
?category=Electronics
```

### GET /products/:id
Get product details

### POST /products
Create new product
```json
{
  "name": "Gaming Mouse",
  "description": "High precision gaming mouse",
  "price": 5995,
  "stock": 500,
  "image": "url"
}
```

---

## 🛍️ Shopping Endpoints

### POST /orders/:productId/:campaignId
Place an order (with high-concurrency locking)
```json
{
  "quantity": 1,
  "botVerified": true
}
```

### GET /orders
Get user's orders

### POST /reservations
Add item to cart with 5-minute reservation
```json
{
  "productId": "product_id",
  "campaignId": "campaign_id",
  "quantity": 1
}
```

### GET /reservations
Get user's reserved items

---

## 📊 Analytics Endpoints

### GET /analytics/live?campaignId={id}
Get real-time analytics during sale
```json
{
  "realTime": {
    "totalRevenue": 500000,
    "revenueLastMinute": 15000,
    "totalOrders": 245,
    "activeViewers": 1234,
    "activeCartsAdded": 89
  },
  "products": [...]
}
```

### GET /analytics/post-sale?campaignId={id}
Get post-sale report
```json
{
  "summary": {
    "totalOrders": 500,
    "totalRevenue": 1500000,
    "conversionRate": 42.5,
    "avgOrderValue": 3000
  },
  "fastestSelling": {...},
  "productStats": [...]
}
```

### GET /analytics/funnel?campaignId={id}
Get conversion funnel data

### GET /analytics/sale-report
Get overall sales report

---

## ⏳ Queue Management Endpoints

### POST /queue/join
Join waiting room during traffic spike
```json
{
  "campaignId": "campaign_id"
}
```

### GET /queue/position?campaignId={id}
Get current queue position
```json
{
  "position": 125,
  "status": "waiting|admitted",
  "ahead": 124
}
```

---

## 🛑 Abandoned Cart Endpoints

### POST /abandoned-cart/track
Track abandoned cart for recovery
```json
{
  "campaignId": "campaign_id",
  "items": [
    {
      "productId": "product_id",
      "quantity": 1,
      "price": 5995
    }
  ]
}
```

### POST /abandoned-cart/send-recovery
Send recovery emails to users
```json
{
  "campaignId": "campaign_id"
}
```

### GET /abandoned-cart/stats?campaignId={id}
Get abandoned cart statistics
```json
{
  "totalAbandoned": 245,
  "totalRecovered": 45,
  "recoveryRate": 18.4,
  "potentialRecovery": 450000
}
```

---

## 📧 Reminder Endpoints

### POST /reminders/set
Set sale reminder (15 mins before)
```json
{
  "campaignId": "campaign_id"
}
```

### GET /reminders
Get user's reminders

---

## 🔍 Bot Detection Endpoints

### POST /bot-check/verify
Verify reCAPTCHA v3 token
```json
{
  "token": "recaptcha_token"
}
```
Response:
```json
{
  "success": true,
  "score": 0.95,
  "action": "checkout"
}
```

---

## 🪝 Webhook Endpoints

### POST /webhooks/register
Register webhook for events
```json
{
  "url": "https://your-domain.com/webhook",
  "event": "order_placed|campaign_created|sale_ended",
  "isActive": true
}
```

### GET /webhooks
List registered webhooks

### DELETE /webhooks/:id
Remove webhook

---

## 🔔 Reminder Endpoints

### POST /reminders/set
Set email reminder before sale
```json
{
  "campaignId": "campaign_id",
  "phoneNumber": "+1234567890"
}
```

---

## 🛡️ Admin Endpoints

### POST /admin/kill-switch
Instantly pause/end a sale
```json
{
  "productId": "product_id"
}
```

### GET /admin/sale-stats?productId={id}
Get sale statistics
```json
{
  "product": {
    "name": "Gaming Mouse",
    "originalStock": 240,
    "soldUnits": 182,
    "remainingStock": 58,
    "totalRevenue": 872690,
    "orderCount": 182
  }
}
```

### POST /admin/reintegrate-stock
Move unsold stock back to regular store
```json
{
  "productId": "product_id"
}
```

---

## Real-Time Events (Socket.IO)

### Connection
```javascript
const socket = io("http://localhost:5000")
socket.emit("join-sale", campaignId)
```

### Events
- `purchase` - Someone made a purchase
  ```json
  {
    "productName": "Gaming Mouse",
    "quantity": 2,
    "remaining": 45
  }
  ```

- `stock-update` - Stock changed
- `user-admitted` - User admitted from queue
- `campaign-ended` - Sale ended

---

## Error Responses

All error responses follow format:
```json
{
  "error": "Error message",
  "code": 400
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden (bot detection failed)
- `404` - Not found
- `500` - Server error

---

## Environment Variables Required

```env
# Database
MONGODB_URI=mongodb://...

# JWT
JWT_SECRET=your-secret-key

# Email (for reminders & abandoned cart)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SMS (optional)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Bot Detection
RECAPTCHA_SECRET_KEY=...

# Redis (optional, for caching)
REDIS_URL=redis://...

# Frontend
FRONTEND_URL=http://localhost:5173
```
