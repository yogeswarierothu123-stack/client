const mongoose = require("mongoose")

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ["active", "completed", "cancelled", "expired"], default: "active" },
  expiresAt: { type: Date, required: true }
}, { timestamps: true })

module.exports = mongoose.model("Reservation", reservationSchema)
