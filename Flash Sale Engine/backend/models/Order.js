const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["credit_card", "upi", "wallet", "net_banking", "emi"], required: true },
  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "completed" }
}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema)
