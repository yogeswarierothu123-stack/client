const mongoose = require("mongoose")

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  emailNotificationSent: { type: Boolean, default: false },
  smsNotificationSent: { type: Boolean, default: false },
  phoneNumber: { type: String, default: null },
  reminderType: { type: String, enum: ["email", "sms", "both"], default: "email" },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model("Reminder", reminderSchema)
