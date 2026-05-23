const mongoose = require("mongoose")

const socialShareIncentiveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  platform: { type: String, enum: ["twitter", "facebook", "linkedin"], required: true },
  shareUrl: { type: String, required: true },
  discountPercentage: { type: Number, default: 5 },
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null },
  appliedToOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  smsNotified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } // 24 hours
}, { timestamps: true })

module.exports = mongoose.model("SocialShareIncentive", socialShareIncentiveSchema)
