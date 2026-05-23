const ActivityLog = require("../models/ActivityLog")
const Campaign = require("../models/Campaign")
const Order = require("../models/Order")
const Product = require("../models/Product")

const getSaleReport = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    const totalRevenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$price" }, totalQuantity: { $sum: "$quantity" } } }
    ])
    const topProduct = await Order.aggregate([
      { $group: { _id: "$productId", totalSold: { $sum: "$quantity" }, totalRevenue: { $sum: "$price" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 1 }
    ])

    const report = {
      totalOrders,
      totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
      totalQuantitySold: totalRevenueResult[0]?.totalQuantity || 0,
      fastestSelling: null
    }

    if (topProduct.length > 0) {
      const product = await Product.findById(topProduct[0]._id)
      report.fastestSelling = {
        productId: topProduct[0]._id,
        name: product?.name || "Unknown",
        totalSold: topProduct[0].totalSold,
        totalRevenue: topProduct[0].totalRevenue
      }
    }

    res.json(report)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getLiveAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.query

    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found ❌" })
    }

    // Real-time metrics
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    const activities = await ActivityLog.find({
      saleId: campaignId,
      timestamp: { $gte: fiveMinutesAgo }
    })

    const purchases = activities.filter(a => a.type === "purchase")
    const addToCart = activities.filter(a => a.type === "add_to_cart")
    const views = activities.filter(a => a.type === "view")

    const totalRevenue = campaign.totalRevenue || 0
    const revenueLastMinute = purchases
      .filter(p => p.timestamp > new Date(now.getTime() - 60 * 1000))
      .reduce((sum, p) => sum + (p.price || 0), 0)

    res.json({
      campaign: {
        name: campaign.name,
        status: campaign.status,
        startAt: campaign.startAt,
        endAt: campaign.endAt
      },
      realTime: {
        totalRevenue,
        revenueLastMinute,
        totalOrders: purchases.length,
        ordersLastMinute: purchases.filter(p => p.timestamp > new Date(now.getTime() - 60 * 1000)).length,
        activeViewers: views.length,
        activeCartsAdded: addToCart.length
      },
      products: campaign.products.map(p => ({
        id: p.productId,
        allocated: p.allocatedStock,
        sold: p.sold,
        remaining: p.allocatedStock - p.sold,
        conversionRate: p.allocatedStock > 0 ? (p.sold / p.allocatedStock * 100).toFixed(2) : 0
      }))
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getPostSaleReport = async (req, res) => {
  try {
    const { campaignId } = req.query

    const campaign = await Campaign.findById(campaignId).populate("products.productId")
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found ❌" })
    }

    const orders = await Order.find({ productId: { $in: campaign.products.map(p => p.productId) } })
    const totalOrders = orders.length
    const totalRevenue = campaign.totalRevenue || 0
    const conversionRate = campaign.products.reduce((sum, p) => sum + (p.allocatedStock > 0 ? p.sold / p.allocatedStock : 0), 0) / campaign.products.length * 100

    const productStats = campaign.products.map(p => ({
      name: p.productId?.name,
      allocated: p.allocatedStock,
      sold: p.sold,
      remaining: p.allocatedStock - p.sold,
      conversionRate: p.allocatedStock > 0 ? (p.sold / p.allocatedStock * 100).toFixed(2) : 0,
      revenue: (p.sold * (p.productId?.salePrice || p.productId?.price || 0)).toFixed(2)
    }))

    const fastestSelling = productStats.sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate))[0]

    res.json({
      summary: {
        campaign: campaign.name,
        duration: `${new Date(campaign.startAt).toLocaleString()} - ${new Date(campaign.endAt).toLocaleString()}`,
        totalOrders,
        totalRevenue,
        conversionRate: conversionRate.toFixed(2),
        avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
      },
      fastestSelling,
      productStats
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getConversionFunnel = async (req, res) => {
  try {
    const { campaignId } = req.query

    const views = await ActivityLog.countDocuments({ saleId: campaignId, type: "view" })
    const addToCart = await ActivityLog.countDocuments({ saleId: campaignId, type: "add_to_cart" })
    const checkouts = await ActivityLog.countDocuments({ saleId: campaignId, type: "checkout_start" })
    const purchases = await ActivityLog.countDocuments({ saleId: campaignId, type: "purchase" })

    res.json({
      funnel: {
        views,
        viewToCartRate: views > 0 ? ((addToCart / views) * 100).toFixed(2) : 0,
        addToCart,
        cartToCheckoutRate: addToCart > 0 ? ((checkouts / addToCart) * 100).toFixed(2) : 0,
        checkouts,
        checkoutToPurchaseRate: checkouts > 0 ? ((purchases / checkouts) * 100).toFixed(2) : 0,
        purchases
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  getSaleReport,
  getLiveAnalytics,
  getPostSaleReport,
  getConversionFunnel
}
