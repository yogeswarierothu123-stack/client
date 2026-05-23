const Product = require("../models/Product")
const Order = require("../models/Order")
const { triggerWebhook } = require("../utils/notificationService")

const killSwitch = async (req, res) => {
  try {
    const { productId } = req.validated || req.body

    const product = await Product.findByIdAndUpdate(productId, { isSalePaused: true, saleEnd: new Date() }, { new: true })
    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" })
    }

    await triggerWebhook("sale_ended", { productId, reason: "admin_kill_switch" })

    res.json({
      message: "Flash sale terminated immediately ⚠️",
      product
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const reintegrateStock = async (req, res) => {
  try {
    const { productId } = req.validated || req.body

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" })
    }

    if (new Date() <= new Date(product.saleEnd)) {
      return res.status(400).json({ message: "Sale is still active. Use kill switch to end it first. ❌" })
    }

    const unsoldStock = product.saleStock || 0
    product.stock += unsoldStock
    product.saleStock = 0
    await product.save()

    res.json({
      message: `Unsold inventory (${unsoldStock} units) reintegrated to regular stock ✅`,
      product
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getSaleStats = async (req, res) => {
  try {
    const { productId } = req.validated || req.query

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required ❌" })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" })
    }

    const orders = await Order.find({ productId })
    const totalSold = orders.reduce((sum, order) => sum + order.quantity, 0)
    const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0)

    res.json({
      product: {
        id: product._id,
        name: product.name,
        originalStock: product.saleStock + totalSold,
        soldUnits: totalSold,
        remainingStock: product.saleStock,
        salePrice: product.salePrice,
        totalRevenue,
        avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        orderCount: orders.length
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  killSwitch,
  reintegrateStock,
  getSaleStats
}
