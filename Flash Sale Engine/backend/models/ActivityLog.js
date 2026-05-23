const mongoose = require("mongoose")

const activityLogSchema = new mongoose.Schema({
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  type: { type: String, enum: ["purchase", "add_to_cart", "view", "checkout_start"], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, default: 1 },
  price: { type: Number },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false })

module.exports = mongoose.model("ActivityLog", activityLogSchema)
