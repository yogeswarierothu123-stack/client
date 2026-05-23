require("dotenv").config()

const express = require("express")
const cors = require("cors")
const http = require("http")
const socketIO = require("socket.io")
const connectDB = require("./config/db")
const { initRedis } = require("./utils/redisCache")
const { generalLimiter } = require("./middleware/rateLimiter")
const { errorHandler } = require("./middleware/errorHandler")
const authRoutes = require("./routes/auth")
const productRoutes = require("./routes/product")
const orderRoutes = require("./routes/order")
const reservationRoutes = require("./routes/reservation")
const analyticsRoutes = require("./routes/analytics")
const reminderRoutes = require("./routes/reminder")
const webhookRoutes = require("./routes/webhook")
const adminRoutes = require("./routes/admin")
const campaignRoutes = require("./routes/campaign")
const queueRoutes = require("./routes/queue")
const abandonedCartRoutes = require("./routes/abandonedCart")
const botCheckRoutes = require("./routes/botCheck")
const passwordResetRoutes = require("./routes/passwordReset")
const socialShareRoutes = require("./routes/socialShare")
const Reservation = require("./models/Reservation")
const Product = require("./models/Product")
const { processReminders } = require("./controllers/reminderController")
const { processAbandonedCarts } = require("./controllers/abandonedCartController")
const app = express();
const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || true,
    methods: ["GET", "POST"]
  }
})

// Make io accessible globally
global.io = io

app.use(cors())
app.use(express.json())
app.use(generalLimiter)

connectDB()
initRedis()

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Join campaign-specific room for real-time updates
  socket.on("join-campaign", (campaignId) => {
    socket.join(`campaign-${campaignId}`)
    console.log(`User ${socket.id} joined campaign: ${campaignId}`)
  })

  // Join product-specific room for inventory updates
  socket.on("join-product", (productId) => {
    socket.join(`product-${productId}`)
    console.log(`User ${socket.id} joined product: ${productId}`)
  })

  // Legacy: support old join-sale event
  socket.on("join-sale", (campaignId) => {
    socket.join(`campaign-${campaignId}`)
    socket.join(`product-${campaignId}`)
    console.log(`User ${socket.id} joined sale: ${campaignId}`)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

const expireReservations = async () => {
  try {
    const expiredReservations = await Reservation.find({ status: "active", expiresAt: { $lte: new Date() } })
    for (const reservation of expiredReservations) {
      const product = await Product.findById(reservation.productId)
      if (product) {
        product.saleStock += reservation.quantity
        product.stock += reservation.quantity
        await product.save()
      }
      reservation.status = "expired"
      await reservation.save()
    }
  } catch (error) {
    console.error("Failed to expire reservations:", error)
  }
}

setInterval(expireReservations, 60 * 1000)
setInterval(processReminders, 60 * 1000)
setInterval(processAbandonedCarts, 5 * 60 * 1000) // Check every 5 minutes
processReminders().catch((error) => console.error("Initial reminder processing failed:", error))
processAbandonedCarts().catch((error) => console.error("Initial abandoned cart processing failed:", error))

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/reservations", reservationRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/reminders", reminderRoutes)
app.use("/api/webhooks", webhookRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/campaigns", campaignRoutes)
app.use("/api/queue", queueRoutes)
app.use("/api/abandoned-cart", abandonedCartRoutes)
app.use("/api/bot-check", botCheckRoutes)
app.use("/api/password", passwordResetRoutes)
app.use("/api/social-share", socialShareRoutes)

app.get("/api/server-time", (req, res) => {
  res.json({ serverTime: new Date().toISOString() })
})

app.get("/", (req, res) => {
  res.json({ message: "Flash Sale Engine backend is running ✅" })
})

app.use((req, res) => {
  res.status(404).json({ error: "Route not found", code: "NOT_FOUND" })
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`)
})



