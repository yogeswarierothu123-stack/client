const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  salePrice: { type: Number },
  saleStock: { type: Number, default: 0 },
  saleStart: { type: Date },
  saleEnd: { type: Date },
  purchaseLimit: { type: Number, default: 0 },
  isSalePaused: { type: Boolean, default: false },
  image: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model("Product", productSchema)
