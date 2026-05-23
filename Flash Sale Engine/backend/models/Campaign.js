const mongoose = require("mongoose")

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  discountPercentage: { type: Number, required: true },
  maxCheckoutTime: { type: Number, default: 5 * 60 * 1000 }, // 5 minutes in ms
  isActive: { type: Boolean, default: true },
  isPaused: { type: Boolean, default: false },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    allocatedStock: { type: Number, required: true },
    purchaseLimit: { type: Number, default: 2 },
    sold: { type: Number, default: 0 }
  }],
  status: { type: String, enum: ["upcoming", "live", "ended"], default: "upcoming" },
  guestCheckoutOnly: { type: Boolean, default: false },
  enableQueue: { type: Boolean, default: true },
  maxConcurrentUsers: { type: Number, default: 100 },
  totalRevenue: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model("Campaign", campaignSchema)
