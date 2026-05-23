# Flash Sale Engine Backend

## Overview
This backend is a Node.js + Express API for a flash sale application.

It supports:
- user registration and login
- JWT authentication
- product creation and management
- flash sale purchases
- user order history

## Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file with:

```env
MONGO_URL=mongodb://localhost:27017/flashsale
JWT_SECRET=your_jwt_secret
PORT=5000
```

3. Run the server in development mode:

```bash
npm run dev
```

## API Endpoints

### Auth

- `POST /api/auth/register`
  - Body: `{ "name": "John", "email": "john@example.com", "password": "secret" }`
  - Response: user info + JWT token

- `POST /api/auth/login`
  - Body: `{ "email": "john@example.com", "password": "secret" }`
  - Response: user info + JWT token

- `GET /api/auth/me`
  - Header: `Authorization: Bearer <token>`
  - Response: authenticated user data

### Products

- `GET /api/products`
  - Public: retrieve all products

- `POST /api/products`
  - Protected: create a product
  - Header: `Authorization: Bearer <token>`
  - Body example:
    ```json
    {
      "name": "Flash Sale Item",
      "description": "Limited offer",
      "price": 100,
      "stock": 20,
      "salePrice": 50,
      "saleStart": "2026-05-21T10:00:00.000Z",
      "saleEnd": "2026-05-21T12:00:00.000Z",
      "image": "https://example.com/item.jpg"
    }
    ```

- `GET /api/products/:id`
  - Public: retrieve one product by ID

- `PATCH /api/products/:id`
  - Protected: update a product
  - Header: `Authorization: Bearer <token>`

- `DELETE /api/products/:id`
  - Protected: remove a product
  - Header: `Authorization: Bearer <token>`

### Orders

- `POST /api/orders/buy/:productId`
  - Protected: purchase a flash sale product
  - Header: `Authorization: Bearer <token>`
  - Body: `{ "quantity": 1 }`

- `GET /api/orders`
  - Protected: list current user orders
  - Header: `Authorization: Bearer <token>`

- `GET /api/orders/:id`
  - Protected: get order details
  - Header: `Authorization: Bearer <token>`

## Example curl requests

Register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secret"}'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret"}'
```

Create product:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Flash Item","price":100,"stock":10,"salePrice":50,"saleStart":"2026-05-21T10:00:00.000Z","saleEnd":"2026-05-21T12:00:00.000Z"}'
```

Buy a product:

```bash
curl -X POST http://localhost:5000/api/orders/buy/<productId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"quantity":1}'
```

### Cart reservations

- `POST /api/reservations`
  - Protected: reserve sale inventory for 5 minutes
  - Body: `{ "productId": "<id>", "quantity": 1 }`

- `GET /api/reservations`
  - Protected: list active reservations for the current user

- `POST /api/reservations/:id/checkout`
  - Protected: complete a reserved purchase

- `DELETE /api/reservations/:id`
  - Protected: cancel a reservation and restore inventory

### Analytics

- `GET /api/analytics/sale-report`
  - Protected: get sale performance summary

### Utility

- `GET /api/server-time`
  - Public: return current server time for synchronized countdowns

### Email Reminders

- `POST /api/reminders`
  - Protected: set a 15-minute pre-sale reminder
  - Body: `{ "productId": "<id>" }`

- `GET /api/reminders`
  - Protected: list reminders set by current user

- `DELETE /api/reminders/:id`
  - Protected: delete a reminder

### Webhooks (Admin)

- `POST /api/webhooks`
  - Protected: register a webhook URL
  - Body: `{ "url": "https://example.com/webhook", "event": "order_created" }`
  - Supported events: `sale_started`, `sale_ended`, `product_sold_out`, `order_created`

- `GET /api/webhooks`
  - Protected: list all registered webhooks

- `DELETE /api/webhooks/:id`
  - Protected: remove a webhook

### Admin Functions

- `POST /api/admin/kill-switch`
  - Protected: immediately pause and end a flash sale
  - Body: `{ "productId": "<id>" }`

- `POST /api/admin/reintegrate-stock`
  - Protected: move unsold flash sale inventory back to regular stock
  - Body: `{ "productId": "<id>" }`

- `GET /api/admin/sale-stats`
  - Protected: detailed statistics for a sale (sold units, revenue, avg order value)
  - Query: `?productId=<id>`

## Notes
- Make sure `saleStart` and `saleEnd` are valid ISO timestamps.
- The purchase endpoint uses `salePrice` if available, otherwise the regular `price`.
- Inventory reserved through `/api/reservations` is held for 5 minutes and restored if not checked out.
- Email reminders are sent 15 minutes before a sale starts.
- Webhooks are triggered asynchronously and failures are logged but do not block operations.
