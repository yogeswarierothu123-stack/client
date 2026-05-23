const AbandonedCart = require("../models/AbandonedCart")
const Order = require("../models/Order")
const Product = require("../models/Product")
const User = require("../models/User")
const { sendAbandonedCartEmail } = require("../utils/notificationService")

const trackAbandonedCart = async (req, res) => {
  try {
    const { campaignId, items } = req.body
    const userId = req.user._id

    const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const abandonedCart = new AbandonedCart({
      userId,
      saleId: campaignId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalValue,
      recoveryDiscount: 10 // 10% discount for recovery
    })

    await abandonedCart.save()

    res.status(201).json({
      message: "Cart tracked for recovery ✅",
      abandonedCart
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const sendRecoveryEmails = async (req, res) => {
  try {
    const { campaignId } = req.body

    // Find carts abandoned after sale ends
    const abandonedCarts = await AbandonedCart.find({
      saleId: campaignId,
      status: "abandoned",
      recoveryEmailSent: false
    }).populate("userId").populate("items.productId")

    let sent = 0
    for (const cart of abandonedCarts) {
      const user = cart.userId
      const itemsList = cart.items.map(item => ({
        productName: item.productId?.name || "Product",
        quantity: item.quantity,
        price: item.price
      }))

      const success = await sendAbandonedCartEmail(
        user.email,
        itemsList,
        cart.recoveryDiscount
      )

      if (success) {
        cart.recoveryEmailSent = true
        await cart.save()
        sent++
      }
    }

    res.json({
      message: `Recovery emails sent: ${sent} ✅`,
      total: abandonedCarts.length,
      sent
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getAbandonedCartStats = async (req, res) => {
  try {
    const { campaignId } = req.query

    const abandoned = await AbandonedCart.find({ saleId: campaignId, status: "abandoned" })
    const recovered = await AbandonedCart.find({ saleId: campaignId, status: "recovered" })

    const totalValue = abandoned.reduce((sum, cart) => sum + cart.totalValue, 0)
    const recoveredValue = recovered.reduce((sum, cart) => sum + cart.totalValue, 0)

    res.json({
      stats: {
        totalAbandoned: abandoned.length,
        totalRecovered: recovered.length,
        recoveryRate: abandoned.length > 0 ? ((recovered.length / abandoned.length) * 100).toFixed(2) : 0,
        totalAbandonedValue: totalValue,
        recoveredValue,
        potentialRecovery: (totalValue - recoveredValue).toFixed(2)
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Process abandoned carts post-sale (called after sale ends)
const processAbandonedCarts = async () => {
  try {
    const Campaign = require("../models/Campaign")
    
    // Find campaigns that have ended in the last 10 minutes
    const now = new Date()
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
    
    const endedCampaigns = await Campaign.find({
      endAt: { $gte: tenMinutesAgo, $lte: now },
      status: "ended"
    })

    let totalProcessed = 0

    for (const campaign of endedCampaigns) {
      // Find abandoned carts from this campaign that haven't been sent recovery emails yet
      const abandonedCarts = await AbandonedCart.find({
        saleId: campaign._id,
        recoveryEmailSent: false
      }).populate("userId").populate("items.productId")

      for (const cart of abandonedCarts) {
        // Check if any items still have stock
        let hasRemainingStock = false
        for (const item of cart.items) {
          const product = await Product.findById(item.productId)
          if (product && product.stock > 0) {
            hasRemainingStock = true
            break
          }
        }

        // Only send recovery email if stock is still available
        if (hasRemainingStock) {
          const itemsList = cart.items.map(item => ({
            productName: item.productId?.name || "Product",
            quantity: item.quantity,
            price: item.price
          }))

          const success = await sendAbandonedCartEmail(
            cart.userId.email,
            itemsList,
            cart.recoveryDiscount
          )

          if (success) {
            cart.recoveryEmailSent = true
            cart.status = "recovery_sent"
            await cart.save()
            totalProcessed++
          }
        }
      }
    }

    if (totalProcessed > 0) {
      console.log(`✅ Processed ${totalProcessed} abandoned carts for recovery`)
    }
  } catch (error) {
    console.error("Error processing abandoned carts:", error)
  }
}

module.exports = {
  trackAbandonedCart,
  sendRecoveryEmails,
  getAbandonedCartStats,
  processAbandonedCarts
}
