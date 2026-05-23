# Flash Sale Engine - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Clone and Install
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Configure Environment
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and other keys

# Frontend
cd frontend
cp .env.example .env.local
# Edit .env.local with RECAPTCHA_SITE_KEY
```

### 3. Start Services
```bash
# Terminal 1: Start Backend
cd backend
npm run dev
# Output: Server running on http://localhost:5000

# Terminal 2: Start Frontend
cd frontend
npm run dev
# Output: App running on http://localhost:5173
```

### 4. Access the App
- **Store**: http://localhost:5173
- **Admin Console**: http://localhost:5173 (after login as admin)
- **API Docs**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 📋 First Sale Setup

### Create Test Campaign
```bash
curl -X POST http://localhost:5000/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Flash Sale",
    "slug": "test-sale",
    "startAt": "2026-05-21T20:00:00Z",
    "endAt": "2026-05-21T22:00:00Z",
    "discountPercentage": 50,
    "products": [
      {
        "productId": "PRODUCT_ID",
        "allocatedStock": 100,
        "purchaseLimit": 2
      }
    ]
  }'
```

### Access Sale
1. Go to http://localhost:5173/sale/test-sale
2. See countdown timer
3. When sale is live, products appear with real-time stock
4. Add to cart → triggers 5-min reservation
5. Checkout → bot verification required
6. Orders create atomic transactions with locking

---

## 🎯 Key Features to Test

### 1. Countdown Timer
- ✅ Server-synced (not client time)
- ✅ Countdown every second
- ✅ Auto-redirect when expires

### 2. Live Stock Bar
- Shows allocated vs sold
- Updates in real-time
- Percentage display

### 3. Queue System
- Join waiting room during spike
- See queue position
- Auto-admit when slot available

### 4. Cart Reservation
- Add item = 5 min lock
- Expiry notification
- Item returned if not purchased

### 5. Checkout
- One-page form
- Bot verification required
- Reservation countdown in sidebar

### 6. Real-time Notifications
- See "Someone bought X" popups
- Socket.IO from other users
- Live stock updates

### 7. Abandoned Cart Recovery
- Don't complete checkout
- Get recovery email in 1 hour
- 10% discount offer

### 8. Admin Kill Switch
- **Admin Panel** → Kill Switch
- Instantly pause sale
- Move unsold stock back

### 9. Analytics
- **Admin Panel** → Live Analytics
- Watch revenue per minute
- See conversion funnel
- Post-sale report

### 10. Social Share Bonus
- Click social share button
- Get 5% bonus off
- Tracked in cart

---

## 🔍 Testing Tips

### Test Bot Detection
```javascript
// In browser console
const token = await grecaptcha.execute('YOUR_SITE_KEY', {action: 'checkout'})
fetch('/api/bot-check/verify', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({token})
}).then(r => r.json()).then(console.log)
```

### Test Queue with Multiple Users
1. Open 3 browsers in incognito
2. Login as different users
3. All click "Join Sale" → Queue endpoints
4. See auto-admission process

### Load Test with K6
```bash
npm install -g k6

# Create load-test.js
import http from 'k6/http';
export default function() {
  http.get('http://localhost:5000/api/products');
}

k6 run load-test.js --vus=100 --duration=30s
```

### Monitor Real-time Events
```javascript
// In browser console
const socket = io('http://localhost:5000')
socket.emit('join-sale', 'campaign_id')
socket.on('purchase', console.log)
socket.on('stock-update', console.log)
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
Solution: Ensure MongoDB is running
macOS: brew services start mongodb-community
Ubuntu: sudo systemctl start mongod
```

### Email Not Sending
```
Solution: Check EMAIL_PASSWORD is app-specific password, not Gmail password
Gmail: https://myaccount.google.com → App Passwords
```

### reCAPTCHA Error
```
Solution: Ensure RECAPTCHA_SITE_KEY matches production key
Check: https://www.google.com/recaptcha/admin
```

### Socket.IO Connection Failed
```
Solution: Ensure backend is running and CORS is configured
Check: Backend logs for connection messages
```

### Queue Position Not Updating
```
Solution: Check Redis is running (if caching enabled)
redis-server should be running
```

---

## 📚 Documentation

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Feature checklist
- Backend README.md - Setup details
- Frontend README.md - Build & deploy

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel deploy
```

### Heroku (Backend)
```bash
cd backend
heroku create your-app-name
heroku config:set MONGODB_URI=...
git push heroku main
```

### Docker (Both)
```bash
# From root directory
docker-compose up -d
```

---

## 💡 Next Steps

1. ✅ Test with sample campaign
2. ✅ Configure email service
3. ✅ Set up reCAPTCHA
4. ✅ Test with 100+ concurrent users
5. ✅ Deploy to production
6. ✅ Monitor with Sentry/DataDog
7. ✅ Collect feedback & iterate

---

Questions? Check API_DOCUMENTATION.md or test endpoints with Postman!
