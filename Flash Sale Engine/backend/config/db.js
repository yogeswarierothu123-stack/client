const mongoose = require("mongoose")

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/flashsale"

  try {
    await mongoose.connect(mongoUrl)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error ❌", err));
    console.log("MongoDB Connected ✅")
  } catch (error) {
    console.error("MongoDB connection error ❌", error)
    process.exit(1)
  }
}

module.exports = connectDB
