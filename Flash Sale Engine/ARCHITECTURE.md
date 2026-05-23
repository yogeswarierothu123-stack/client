# Flash Sale Engine - Architecture & Technology Stack

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ TeaserPage │ SalePage │ Checkout │ WaitingRoom │ Admin  │  │
│  │     +       +          +           +             +        │  │
│  │  StockBar   PurchaseNotifications  reCAPTCHA     ...    │  │
│  └──────────────────────────────────────────────────────────┘  │
│            Socket.IO ↔ Axios HTTP ↔ reCAPTCHA API             │
└─────────────────────────────────────────────────────────────────┘
                           ↓ ↑
                    WebSockets + REST
                           ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                Backend (Node.js + Express)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes: /campaigns, /queue, /orders, /analytics, ...   │  │
│  │  Controllers: Campaign, Queue, Order, Analytics, Admin  │  │
│  │  Middleware: Auth (JWT), Error Handling                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │    Socket.IO Server (Real-time: purchases, queue, ...) │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services:                                              │  │
│  │  • Notification (Email/SMS) → Nodemailer/Twilio       │  │
│  │  • Webhook Triggers → Axios                            │  │
│  │  • Bot Detection → reCAPTCHA v3                        │  │
│  │  • Caching → Redis                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           ↓ ↑
              MongoDB + Redis + External APIs
                           ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                      Data & Integrations                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ MongoDB:    Campaigns, Users, Orders, Queue, Webhooks  │  │
│  │ Redis:      Product Cache, Campaign Cache (TTL)        │  │
│  │ Twilio:     SMS Notifications                          │  │
│  │ Sendgrid:   Email Service (or Gmail SMTP)             │  │
│  │ Google:     reCAPTCHA v3 Bot Detection                │  │
│  │ Webhooks:    3rd party integrations (Shopify, ERP)     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 19 + Vite | Component library & bundler |
| Routing | React Router 7 | Page navigation |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| HTTP | Axios | API requests |
| WebSockets | Socket.IO Client | Real-time events |
| Verification | reCAPTCHA v3 | Bot detection |

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js | JavaScript server |
| Framework | Express 5 | HTTP server |
| WebSockets | Socket.IO | Real-time communication |
| Database | MongoDB 9 | Document storage |
| Cache | Redis | High-speed caching |
| Auth | JWT + bcrypt | Authentication |
| Email | Nodemailer | Email delivery |
| SMS | Twilio | SMS notifications |
| Bot Detection | reCAPTCHA v3 | Bot filtering |
| Webhooks | Axios | External integrations |

---

## 💾 Database Schema

```
Users
├── _id (ObjectId)
├── name (String)
├── email (String)
├── password (bcrypt hash)
├── createdAt
└── updatedAt

Campaigns
├── _id (ObjectId)
├── name (String)
├── slug (String, unique)
├── startAt (Date)
├── endAt (Date)
├── discountPercentage (Number)
├── products: [{
│   ├── productId (Ref: Product)
│   ├── allocatedStock (Number)
│   ├── purchaseLimit (Number)
│   └── sold (Number)
├── status (enum: upcoming|live|ended)
├── isPaused (Boolean)
├── maxConcurrentUsers (Number)
├── guestCheckoutOnly (Boolean)
├── totalRevenue (Number)
└── timestamps

Products
├── _id (ObjectId)
├── name (String)
├── description (String)
├── price (Number)
├── salePrice (Number)
├── stock (Number)
├── saleStock (Number)
├── image (String, URL)
├── purchaseLimit (Number)
├── saleStart (Date)
├── saleEnd (Date)
├── isSalePaused (Boolean)
├── isActive (Boolean)
└── timestamps

Orders
├── _id (ObjectId)
├── userId (Ref: User)
├── productId (Ref: Product)
├── quantity (Number)
├── price (Number)
├── status (enum: pending|completed|cancelled)
└── timestamps

Queue
├── _id (ObjectId)
├── userId (Ref: User)
├── saleId (Ref: Campaign)
├── position (Number)
├── joinedAt (Date)
├── status (enum: waiting|admitted|expired)
├── admittedAt (Date)
└── timestamps

Reservations
├── _id (ObjectId)
├── userId (Ref: User)
├── productId (Ref: Product)
├── quantity (Number)
├── status (enum: active|expired)
├── expiresAt (Date)
└── timestamps

AbandonedCart
├── _id (ObjectId)
├── userId (Ref: User)
├── saleId (Ref: Campaign)
├── items: [{
│   ├── productId (Ref: Product)
│   ├── quantity (Number)
│   └── price (Number)
├── totalValue (Number)
├── abandonedAt (Date)
├── recoveryEmailSent (Boolean)
├── recoveryDiscount (Number)
├── status (enum: abandoned|recovered|ignored)
└── timestamps

ActivityLog
├── _id (ObjectId)
├── saleId (Ref: Campaign)
├── type (enum: purchase|add_to_cart|view|checkout_start)
├── userId (Ref: User)
├── productId (Ref: Product)
├── quantity (Number)
├── price (Number)
└── timestamp (Date)

Webhooks
├── _id (ObjectId)
├── url (String, URL)
├── event (String)
├── isActive (Boolean)
└── timestamps

Reminders
├── _id (ObjectId)
├── userId (Ref: User)
├── campaignId (Ref: Campaign)
├── phoneNumber (String)
├── status (enum: pending|sent|failed)
├── createdAt
└── sentAt (Date)
```

---

## 🔄 Key Workflows

### 1. Sale Creation Flow
```
Admin → POST /campaigns
↓
Create Campaign document
↓
Validate products exist
↓
Set status to 'upcoming' (if future)
↓
Trigger webhook: campaign_created
↓
Return campaign with slug
```

### 2. Pre-Sale Flow
```
User visits /sale/slug
↓
Check sale start time
↓
If future → Show TeaserPage
↓
Countdown timer (server-synced)
↓
When time expires → Auto-redirect to /sale/slug (live)
```

### 3. Sale Live Flow
```
User joins sale → SalePage loads
↓
Check if queue enabled
├─ NO: Show all products
└─ YES: Check queue position
   ├─ Admitted: Show products
   └─ Waiting: Show WaitingRoom

User sees:
• Synchronized countdown to end time
• Live stock bars per product
• Real-time purchase notifications
• Social share bonus section
```

### 4. Queue Management Flow
```
User joins sale (queue enabled)
↓
POST /queue/join
↓
Check queue count
├─ Under max → Status: admitted
└─ Over max → Position in queue, Status: waiting

Every 60 seconds:
Check admitted count vs max
├─ Slots available → Auto-admit waiting users
└─ Full → Keep in queue

After 24 hours → Auto-expire queue entry
```

### 5. Add to Cart Flow
```
User clicks "Add to Cart"
↓
Create Reservation (5 min expiry)
↓
Add to localStorage cart
↓
Show "Reserved until HH:MM:SS" countdown
↓
On cart expiry → Remove from cart, return stock
```

### 6. Checkout Flow
```
User clicks "Checkout"
↓
Go to /checkout
↓
Show: Reservation countdown, reserved items
↓
Fill: Name, Phone, Address, Card (simple)
↓
Toggle: Guest checkout, Bot verification
↓
Click "Place Order"
↓
Verify bot detection:
   GET reCAPTCHA token
   → POST /bot-check/verify
   → Score > 0.5? Continue : Reject
↓
POST /orders/:productId/:campaignId
(MongoDB transaction with pessimistic locking)
↓
Update Campaign.sold, Order.created
↓
Log ActivityLog entry
↓
Emit Socket.IO 'purchase' event
↓
Trigger webhook: order_placed
↓
Navigate to /success
```

### 7. High-Concurrency Locking Flow
```
10 users buy same item simultaneously
↓
All hit: POST /orders/:productId/:campaignId
↓
Database transaction starts
├─ Lock product document
├─ Check: allocatedStock >= quantity?
├─ Lock campaign.products[]
├─ Check: sold + quantity <= allocated?
├─ If YES: Decrement sold, create Order
├─ If NO: Reject with 400
└─ Unlock documents
↓
Result: Only exactly allocated items sold
(No overselling possible)
```

### 8. Real-Time Notifications
```
User A places order
↓
Backend emits Socket.IO event:
socket.to(`sale-${campaignId}`).emit('purchase', {
  productName: "Gaming Mouse",
  quantity: 2,
  remaining: 45
})
↓
All users on that sale see:
PurchaseNotification popup: "✅ Someone bought 2x Gaming Mouse"
↓
Stock bar updates automatically
└─ Signal urgency to other buyers
```

### 9. Abandoned Cart Recovery
```
User adds items but doesn't checkout
↓
Sale ends
↓
POST /abandoned-cart/send-recovery
↓
Find all AbandonedCart docs
↓
For each:
   Get user email → sendAbandonedCartEmail()
   ├─ Compose recovery email
   ├─ Offer 10% discount
   ├─ Include product list
   └─ Send via Nodemailer
↓
Mark recoveryEmailSent = true
```

### 10. Admin Kill Switch
```
Admin detects pricing error
↓
POST /admin/kill-switch
├─ Set campaign.isPaused = true
├─ Set campaign.status = ended
└─ Trigger webhook: campaign_paused
↓
All clients see: "Sale has been paused"
↓
Products disappear from UI
↓
Active reservations → Auto-expire within 5 mins
│   → Inventory returned
```

---

## 📊 Performance Characteristics

| Operation | Latency | Throughput | Scalability |
|-----------|---------|-----------|-------------|
| POST /orders (locking) | 50-200ms | 100/sec | 1000/sec (with clustering) |
| GET /products (cached) | 5-20ms | 10,000/sec | Redis cluster |
| GET /analytics/live | 10-50ms | 1,000/sec | In-memory (updates via Socket.IO) |
| Queue admit (per minute) | N/A | Unlimited | O(queue_size) |
| Email send (async) | 1-5 sec | 100/min | Depends on Nodemailer |

---

## 🔐 Security Layers

```
User Request
    ↓
[CORS] Check origin domain
    ↓
[Auth] Verify JWT token (if protected route)
    ↓
[Rate Limit] Check IP-based limits (can add)
    ↓
[Input Validation] Sanitize request body
    ↓
[Bot Detection] reCAPTCHA v3 for checkout
    ↓
[Database Lock] MongoDB transaction for order
    ↓
[HTTPS] All production traffic encrypted
    ↓
Response (sanitized, no secrets)
```

---

## 🚀 Scaling Strategy

### 1. Vertical Scaling (Same Server)
- Increase Node.js worker threads
- Increase MongoDB cache size
- Optimize database indexes

### 2. Horizontal Scaling (Multiple Servers)
```
Load Balancer (Nginx/HAProxy)
├─ Node Server 1
├─ Node Server 2
├─ Node Server 3
└─ Node Server N

All connect to:
├─ MongoDB Replica Set (3+ nodes)
└─ Redis Cluster (3+ nodes)

Socket.IO Adapter: Redis pub/sub for cross-server events
```

### 3. Cloud Deployment
- **Kubernetes**: Auto-scaling Pod replicas
- **AWS**: Lambda for serverless (if stateless), RDS for DB
- **GCP**: Cloud Run for containers
- **Vercel**: Frontend deployment (zero-config)

---

## 📈 Monitoring & Observability

```
Application Metrics (Prometheus)
├─ orders_created_total
├─ checkout_success_rate
├─ queue_size_gauge
├─ socket_connections_gauge
└─ database_query_duration_ms

Error Tracking (Sentry)
├─ 400 Bad Request (invalid orders)
├─ 403 Forbidden (bot detection fail)
├─ 500 Server (transaction failures)
└─ Socket disconnect (connection drops)

Logs (ELK Stack / CloudWatch)
├─ Purchase events
├─ Queue movements
├─ Email send status
└─ Webhook deliveries

APM (DataDog / New Relic)
├─ API latency percentiles (p50, p95, p99)
├─ Database transaction times
├─ Cache hit rates
└─ CPU/Memory usage
```

---

## 🔄 Integration Points

### External Services
1. **MongoDB Atlas** - Managed database
2. **Redis Cloud** - Managed caching
3. **Twilio** - SMS delivery
4. **SendGrid / AWS SES** - Email delivery
5. **Google reCAPTCHA** - Bot detection
6. **Webhook Endpoints** - Shopify, ERP systems

### Webhook Events Sent
- `campaign_created`
- `campaign_paused`
- `campaign_resumed`
- `campaign_ended`
- `order_placed`
- `sale_ended`
- `queue_admitted`
