const mongoose = require("mongoose")

const queueSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  position: { type: Number, required: true },
  joinedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["waiting", "admitted", "expired"], default: "waiting" },
  admittedAt: { type: Date }
}, { timestamps: true })

module.exports = mongoose.model("Queue", queueSchema)
