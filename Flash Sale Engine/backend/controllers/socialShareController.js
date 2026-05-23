const SocialShareIncentive = require("../models/SocialShareIncentive")
const Product = require("../models/Product")
const Campaign = require("../models/Campaign")
const User = require("../models/User")
const { sendSocialShareBonusSMS } = require("../utils/notificationService")

// Create social share incentive record
const createShareIncentive = async (req, res) => {
  try {
    const { platform, productId, campaignId } = req.validated || req.body
    const userId = req.user._id

    // Validate platform
    if (!["twitter", "facebook", "linkedin"].includes(platform)) {
      return res.status(400).json({ message: "Invalid platform. Must be twitter, facebook, or linkedin ❌" })
    }

    // Verify product/campaign exists
    if (productId) {
      const product = await Product.findById(productId)
      if (!product) {
        return res.status(404).json({ message: "Product not found ❌" })
      }
    }

    if (campaignId) {
      const campaign = await Campaign.findById(campaignId)
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found ❌" })
      }
    }

    // Check if already created in last 24 hours
    const existing = await SocialShareIncentive.findOne({
      userId,
      platform,
      productId: productId || null,
      campaignId: campaignId || null,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })

    if (existing && !existing.isVerified) {
      return res.status(400).json({ 
        message: "You already have a pending share incentive for this platform. Please verify your share or wait 24 hours.",
        incentive: existing
      })
    }

    // Create share URL (base URL would be the frontend URL + product/campaign)
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173"
    let shareUrl = baseUrl
    if (productId) {
      shareUrl = `${baseUrl}/home?ref=${userId}&product=${productId}`
    } else if (campaignId) {
      shareUrl = `${baseUrl}/sale/${campaignId}?ref=${userId}`
    }

    const incentive = await SocialShareIncentive.create({
      userId,
      platform,
      productId: productId || null,
      campaignId: campaignId || null,
      shareUrl,
      discountPercentage: 5
    })

    res.status(201).json({
      message: "Share incentive created ✅",
      incentive,
      shareContent: {
        twitter: `Check out this amazing flash sale! Use my referral link for extra 5% off: ${shareUrl}`,
        facebook: `Don't miss this flash sale! Get 5% extra off using my link: ${shareUrl}`,
        linkedin: `Exciting flash sale opportunity! Grab 5% extra discount with my referral: ${shareUrl}`
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Verify social share (backend verification via optional link tracking)
const verifyShare = async (req, res) => {
  try {
    const { incentiveId } = req.params
    const userId = req.user._id

    const incentive = await SocialShareIncentive.findById(incentiveId)
    if (!incentive) {
      return res.status(404).json({ message: "Share incentive not found ❌" })
    }

    if (incentive.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized ❌" })
    }

    if (incentive.isVerified) {
      return res.status(400).json({ message: "Share already verified ✅" })
    }

    // Check if expired
    if (new Date() > incentive.expiresAt) {
      return res.status(400).json({ message: "Share incentive has expired ❌" })
    }

    // Mark as verified
    incentive.isVerified = true
    incentive.verifiedAt = new Date()
    await incentive.save()

    // Send SMS notification if user has phone number
    const user = await User.findById(userId)
    if (user.phoneNumber && !incentive.smsNotified) {
      const smsSent = await sendSocialShareBonusSMS(user.phoneNumber, incentive.discountPercentage)
      if (smsSent) {
        incentive.smsNotified = true
        await incentive.save()
      }
    }

    res.json({
      message: "Share verified ✅ You've earned 5% off!",
      incentive,
      discountCode: `SHARE5-${incentiveId.slice(-6).toUpperCase()}`,
      validUntil: incentive.expiresAt
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get user's share incentives
const getShareIncentives = async (req, res) => {
  try {
    const userId = req.user._id
    const incentives = await SocialShareIncentive.find({ userId })
      .populate("productId", "name saleStart")
      .populate("campaignId", "name")

    const active = incentives.filter(i => new Date() <= i.expiresAt)
    const verified = incentives.filter(i => i.isVerified)

    res.json({
      total: incentives.length,
      active: active.length,
      verified: verified.length,
      incentives,
      pendingVerification: active.filter(i => !i.isVerified)
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Apply share discount to order (called during checkout)
const applyShareDiscount = async (req, res) => {
  try {
    const { incentiveId, orderId } = req.body
    const userId = req.user._id

    const incentive = await SocialShareIncentive.findById(incentiveId)
    if (!incentive) {
      return res.status(404).json({ message: "Share incentive not found ❌" })
    }

    if (incentive.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized ❌" })
    }

    if (!incentive.isVerified) {
      return res.status(400).json({ message: "Share must be verified first ❌" })
    }

    if (new Date() > incentive.expiresAt) {
      return res.status(400).json({ message: "Share incentive has expired ❌" })
    }

    if (incentive.appliedToOrder) {
      return res.status(400).json({ message: "This share incentive has already been used ❌" })
    }

    // Apply discount
    incentive.appliedToOrder = orderId
    await incentive.save()

    res.json({
      message: "Share discount applied ✅",
      discountPercentage: incentive.discountPercentage,
      incentive
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  createShareIncentive,
  verifyShare,
  getShareIncentives,
  applyShareDiscount
}
