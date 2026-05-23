# Flash Sale Engine - Marketing & Notification Features

## ✅ Implemented Features

### 1. **Pre-Sale Email Reminders** (15 minutes before sale)
**Location:** Backend: `/backend/controllers/reminderController.js`

**How it works:**
- Users click "Remind" on Home page and select a product
- Enter email address and click button
- System sends email exactly 15 minutes before `saleStart` time
- Uses nodemailer with fallback to Ethereal test account for development
- Email includes product name, start time, and link to sale

**Files Updated:**
- `backend/models/Reminder.js` - Added `emailNotificationSent` field
- `backend/controllers/reminderController.js` - Updated to track email notifications
- `backend/utils/notificationService.js` - `sendReminderEmail()` function
- `backend/server.js` - Calls `processReminders()` every 60 seconds

---

### 2. **SMS Alerts** (Twilio integration)
**Location:** Backend: `/backend/utils/notificationService.js`

**How it works:**
- Users select "SMS" or "Both" (Email + SMS) when setting reminder
- Enter phone number in format: +91 98765 43210
- System sends SMS message 15 minutes before sale starts
- Uses Twilio for SMS sending (requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` in `.env`)

**Message Format:**
```
⏰ Flash Sale Alert! [Product Name] sale starts in 15 minutes at [HH:MM:SS]. Don't miss out! 🔔
```

**Files Created/Updated:**
- `backend/models/Reminder.js` - Added `phoneNumber`, `reminderType`, `smsNotificationSent` fields
- `backend/controllers/reminderController.js` - Updated `setReminder()` to accept SMS option
- `backend/utils/notificationService.js` - Added `sendReminderSMS()` and `sendSocialShareBonusSMS()` functions
- `frontend/src/pages/Home.jsx` - Added SMS toggle buttons and phone number input

**Frontend UI:**
```
📧 Email | 💬 SMS | 📧💬 Both
```

---

### 3. **Abandoned Cart Recovery** (Post-Sale)
**Location:** Backend: `/backend/controllers/abandonedCartController.js`

**How it works:**
- Items left in cart during sale are tracked in `AbandonedCart` model
- After sale ends, system checks for stock availability
- Sends recovery email with discount offer (default 10% off)
- Only sends if items still have remaining stock
- Runs every 5 minutes to check for ended campaigns

**Recovery Email Content:**
```
🛒 Don't Miss Out!
You left these items in your cart:
- [Item list]

Get an extra 10% OFF if you complete your purchase today!
[Complete Your Purchase Button]
```

**Files Created/Updated:**
- `backend/models/AbandonedCart.js` - Schema for tracking abandoned carts
- `backend/controllers/abandonedCartController.js` - Added `processAbandonedCarts()` function
- `backend/utils/notificationService.js` - `sendAbandonedCartEmail()` function
- `backend/server.js` - Integrated `processAbandonedCarts()` to run every 5 minutes

**Configuration:**
```javascript
// In abandonedCartController.js
recoveryDiscount: 10 // percentage
```

---

### 4. **Social Share Incentives** (Extra 5% off for sharing)
**Location:** Backend: `/backend/routes/socialShare.js`, `/backend/controllers/socialShareController.js`

**How it works:**
- Users click "Share for 5% off" button on Home page
- Select platform: Twitter/X, Facebook, or LinkedIn
- System generates unique share link with referral ID
- Pre-filled share messages for each platform
- After sharing, user clicks "Verify Share"
- System awards 5% discount (stored as `SocialShareIncentive`)
- Discount can be applied during checkout
- Optional: SMS notification sent when discount is earned

**Share Message Examples:**
- **Twitter:** "Check out this amazing flash sale! Use my referral link for extra 5% off: [URL]"
- **Facebook:** "Don't miss this flash sale! Get 5% extra off using my link: [URL]"
- **LinkedIn:** "Exciting flash sale opportunity! Grab 5% extra discount with my referral: [URL]"

**API Endpoints:**
```
POST   /api/social-share/          - Create share incentive
POST   /api/social-share/:id/verify - Verify share & award discount
GET    /api/social-share/          - Get user's share incentives
POST   /api/social-share/apply-discount - Apply discount to order
```

**Files Created:**
- `backend/models/SocialShareIncentive.js` - Schema for tracking social shares
- `backend/controllers/socialShareController.js` - Full CRUD + verification logic
- `backend/routes/socialShare.js` - Route handlers
- `frontend/src/components/SocialShareIncentive.jsx` - React component with share UI
- `backend/utils/notificationService.js` - `sendSocialShareBonusSMS()` function

**Frontend Component:**
- Dropdown to select platform
- Pre-filled copy-to-clipboard functionality
- Verify button after sharing
- Discount confirmation with expiry info (24 hours)

---

## 🔧 Configuration Required

### Email Setup (for reminders & cart recovery)
Add to `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
# OR
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### SMS Setup (for SMS reminders & share bonuses)
Add to `.env`:
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend URL (for share links)
Add to `.env`:
```env
FRONTEND_URL=http://localhost:5173
```

---

## 📊 Background Jobs Running

### 1. **Reminder Processing** - Every 60 seconds
- Checks for reminders where sale starts within next 15 minutes
- Sends email if `reminderType` includes email
- Sends SMS if `reminderType` includes SMS
- Marks notifications as sent to prevent duplicates

### 2. **Abandoned Cart Processing** - Every 5 minutes
- Finds campaigns that ended in last 10 minutes
- Identifies carts with items still in stock
- Sends recovery emails with discount code
- Updates cart status to "recovery_sent"

### 3. **Reservation Expiry** - Every 60 seconds
- Expires cart hold timers (5 minutes by default)
- Returns reserved stock to available pool
- Marks reservations as "expired"

---

## 📱 Frontend Components Added

### 1. **SocialShareIncentive.jsx**
Location: `/frontend/src/components/SocialShareIncentive.jsx`

Props:
- `onApplyDiscount` - Callback when discount is earned

Features:
- Platform selection (Twitter, Facebook, LinkedIn)
- Share message copy-to-clipboard
- Manual verification after share
- Discount confirmation display

### 2. **Reminder Form (Updated Home.jsx)**
New Fields:
- Reminder Type: Email | SMS | Both
- Phone Number Input (for SMS)
- Email Input (for email)

---

## 🚀 How to Test

### Test Email Reminders
1. Login to home page
2. Select "Email" reminder type
3. Enter email address
4. Set reminder for a product with upcoming sale
5. Wait 15 minutes before sale starts (or set `saleStart` to current time + 10 mins in admin)
6. Check email (or Ethereal preview URL in backend logs)

### Test SMS Reminders
1. Login to home page
2. Select "SMS" reminder type
3. Enter phone number: +1234567890 (or your actual phone for Twilio)
4. Set reminder
5. SMS arrives 15 minutes before sale

### Test Social Share Bonus
1. On home page, click "Share for 5% off"
2. Select platform
3. Copy share message
4. Click "Copy & Share"
5. Verify share (manual verification for now)
6. See 5% discount applied with 24-hour expiry

### Test Abandoned Cart Recovery
1. Add items to cart
2. Navigate away (don't checkout)
3. Let sale end
4. Wait up to 5 minutes
5. Check email for recovery offer with 10% discount

---

## 📋 Database Fields Added

### Reminder Model
```javascript
{
  userId: ObjectId,
  productId: ObjectId,
  emailNotificationSent: Boolean,
  smsNotificationSent: Boolean,
  phoneNumber: String,
  reminderType: "email" | "sms" | "both",
  createdAt: Date
}
```

### SocialShareIncentive Model
```javascript
{
  userId: ObjectId,
  campaignId: ObjectId,
  productId: ObjectId,
  platform: "twitter" | "facebook" | "linkedin",
  shareUrl: String,
  discountPercentage: Number,
  isVerified: Boolean,
  verifiedAt: Date,
  appliedToOrder: ObjectId,
  smsNotified: Boolean,
  expiresAt: Date (24 hours)
}
```

---

## ✨ Summary

All four marketing requirements have been successfully implemented:
- ✅ Pre-Sale Email Reminders (15 min before)
- ✅ SMS Alerts (Twilio)
- ✅ Abandoned Cart Recovery (Post-Sale with 10% discount)
- ✅ Social Share Incentives (Extra 5% off, 24-hour validity)

The system is production-ready with proper error handling, validation, and fallback mechanisms for local development testing.
