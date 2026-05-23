const mongoose = require("mongoose")

const abandonedCartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalValue: { type: Number, required: true },
  abandonedAt: { type: Date, default: Date.now },
  recoveryEmailSent: { type: Boolean, default: false },
  recoveryDiscount: { type: Number, default: 0 },
  status: { type: String, enum: ["abandoned", "recovered", "ignored"], default: "abandoned" }
}, { timestamps: true })

module.exports = mongoose.model("AbandonedCart", abandonedCartSchema)
