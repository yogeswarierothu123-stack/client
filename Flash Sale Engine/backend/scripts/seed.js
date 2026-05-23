require("dotenv").config()
const connectDB = require("../config/db")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const User = require("../models/User")
const Product = require("../models/Product")

const run = async () => {
  try {
    await connectDB()

    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com"
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "password123"

    let admin = await User.findOne({ email: adminEmail })
    if (!admin) {
      const hashed = await bcrypt.hash(adminPassword, 10)
      admin = await User.create({ name: "Admin", email: adminEmail, password: hashed, role: "admin" })
      console.log("Admin user created:", adminEmail)
    } else {
      console.log("Admin user already exists:", adminEmail)
    }

    const sampleProduct = await Product.findOne({ name: "Sample Product" })
    if (!sampleProduct) {
      await Product.create({
        name: "Sample Product",
        description: "Seeded sample product",
        price: 9.99,
        stock: 100,
        salePrice: 4.99,
        saleStock: 50,
        saleStart: new Date(Date.now() - 60 * 60 * 1000),
        saleEnd: new Date(Date.now() + 24 * 60 * 60 * 1000)
      })
      console.log("Sample product created")
    } else {
      console.log("Sample product already exists")
    }

    // close connection
    await mongoose.connection.close()
    process.exit(0)
  } catch (err) {
    console.error("Seed failed", err)
    process.exit(1)
  }
}

run()
