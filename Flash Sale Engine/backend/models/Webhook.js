const mongoose = require("mongoose")

const webhookSchema = new mongoose.Schema({
  url: { type: String, required: true },
  event: { type: String, enum: ["sale_started", "sale_ended", "product_sold_out", "order_created"], required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model("Webhook", webhookSchema)
