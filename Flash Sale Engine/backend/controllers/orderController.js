const Order = require("../models/Order")
const Product = require("../models/Product")
const Campaign = require("../models/Campaign")
const ActivityLog = require("../models/ActivityLog")
const { triggerWebhook, sendEmail, sendSMS } = require("../utils/notificationService")

// Optimistic locking: use version field for conflict detection
const buyProduct = async (req, res) => {
  const session = await Order.startSession()
  session.startTransaction()

  try {
    const { productId, campaignId } = req.params
    const { quantity, botVerified, paymentMethod } = req.validated || req.body

    if (!quantity || quantity <= 0) {
      throw new Error("Quantity must be greater than zero ❌")
    }

    if (!botVerified) {
      throw new Error("Bot verification failed ❌")
    }

    if (!paymentMethod) {
      throw new Error("Payment method is required ❌")
    }

    // Fetch product with locking (pessimistic)
    const product = await Product.findById(productId).session(session)
    if (!product) {
      throw new Error("Product not found ❌")
    }

    let campaign = null
    let purchaseLimit = product.purchaseLimit || 2
    const now = new Date()

    if (campaignId) {
      campaign = await Campaign.findById(campaignId).session(session)
      if (!campaign) {
        throw new Error("Campaign not found ❌")
      }

      if (campaign.isPaused || campaign.status === "ended") {
        throw new Error("Campaign is not active ❌")
      }

      if (now < new Date(campaign.startAt) || now > new Date(campaign.endAt)) {
        throw new Error("Flash sale not active ❌")
      }

      // Find campaign product for this item
      const campaignProduct = campaign.products.find(p => p.productId.toString() === productId)
      if (!campaignProduct) {
        throw new Error("Product not in this campaign ❌")
      }

      if (campaignProduct.allocatedStock - campaignProduct.sold < quantity) {
        throw new Error("Sale stock unavailable ❌")
      }

      purchaseLimit = campaignProduct.purchaseLimit || 2
    } else {
      if (product.isSalePaused) {
        throw new Error("Sale is paused for this product ❌")
      }

      if (!product.saleStart || !product.saleEnd) {
        throw new Error("Sale time not set ❌")
      }

      if (now < new Date(product.saleStart) || now > new Date(product.saleEnd)) {
        throw new Error("Flash sale not active ❌")
      }

      if (!product.saleStock || product.saleStock < quantity) {
        throw new Error("Sale stock unavailable ❌")
      }
    }

    // Check purchase limit
    const previousPurchases = await Order.aggregate([
      { $match: { userId: req.user._id, productId: product._id } },
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
    ]).session(session)

    const alreadyPurchased = previousPurchases[0]?.totalQuantity || 0
    if (alreadyPurchased + quantity > purchaseLimit) {
      throw new Error(`Purchase limit exceeded: max ${purchaseLimit} per user ❌`)
    }

    // Update inventory with atomic operation (optimistic locking)
    const updateQuery = { _id: productId }
    const updateData = {}

    if (campaign) {
      // Update campaign sold count
      await Campaign.findOneAndUpdate(
        { _id: campaignId, "products.productId": productId },
        { $inc: { "products.$.sold": quantity, totalRevenue: (product.salePrice || product.price) * quantity } },
        { session }
      )
    } else {
      updateData.$inc = { saleStock: -quantity, stock: -quantity }
    }

    const updatedProduct = await Product.findOneAndUpdate(updateQuery, updateData, { new: true, session })

    if (!updatedProduct) {
      throw new Error("Unable to reserve inventory ❌")
    }

    // Create order
    const order = await Order.create(
      [{
        userId: req.user._id,
        productId,
        quantity,
        price: (product.salePrice || product.price) * quantity,
        paymentMethod,
        status: "completed"
      }],
      { session }
    )

    // Log activity
    await ActivityLog.create(
      [{
        saleId: campaignId,
        type: "purchase",
        userId: req.user._id,
        productId,
        quantity,
        price: (product.salePrice || product.price) * quantity,
        paymentMethod
      }],
      { session }
    )

    await session.commitTransaction()

    // Broadcast real-time inventory update to all connected clients
    const remainingStock = campaign 
      ? campaign.products.find(p => p.productId.toString() === productId).allocatedStock - (campaign.products.find(p => p.productId.toString() === productId).sold + quantity)
      : updatedProduct.saleStock

    const inventoryUpdate = {
      productId,
      productName: product.name,
      quantity,
      remainingStock,
      soldCount: campaign
        ? campaign.products.find(p => p.productId.toString() === productId).sold + quantity
        : (product.stock - updatedProduct.stock),
      allocatedStock: campaign
        ? campaign.products.find(p => p.productId.toString() === productId).allocatedStock
        : product.saleStock,
      timestamp: new Date(),
      percentageClaimed: campaign
        ? Math.round(((campaign.products.find(p => p.productId.toString() === productId).sold + quantity) / campaign.products.find(p => p.productId.toString() === productId).allocatedStock) * 100)
        : Math.round(((product.saleStock - updatedProduct.saleStock) / product.saleStock) * 100)
    }

    // Broadcast to campaign-specific room
    if (campaignId) {
      global.io?.to(`campaign-${campaignId}`).emit("inventory-update", inventoryUpdate)
      global.io?.to(`product-${productId}`).emit("inventory-update", inventoryUpdate)
    } else {
      global.io?.to(`product-${productId}`).emit("inventory-update", inventoryUpdate)
    }

    // Broadcast purchase notification for social proof
    global.io?.emit("purchase-notification", {
      productName: product.name,
      quantity,
      timestamp: new Date(),
      remaining: remainingStock,
      message: `Someone just bought ${quantity}x ${product.name}! Only ${remainingStock} left!`
    })

    // Send notifications (async, non-blocking)
    triggerWebhook("order_placed", {
      orderId: order[0]._id,
      productId,
      quantity,
      userId: req.user._id,
      campaignId
    })

    res.status(201).json({
      message: "Order placed successfully ⚡",
      order: order[0]
    })
  } catch (error) {
    await session.abortTransaction()
    res.status(400).json({ error: error.message })
  } finally {
    await session.endSession()
  }
}

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate("productId")
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("productId")
    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" })
    }
    if (!order.userId.equals(req.user._id)) {
      return res.status(403).json({ message: "Forbidden ❌" })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  buyProduct,
  getOrders,
  getOrderById
}
