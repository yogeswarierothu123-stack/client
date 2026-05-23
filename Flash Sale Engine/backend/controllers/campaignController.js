const Campaign = require("../models/Campaign")
const Product = require("../models/Product")
const { triggerWebhook } = require("../utils/notificationService")

const createCampaign = async (req, res) => {
  try {
    const { name, slug, products, startAt, endAt, discountPercentage, purchaseLimit, guestCheckoutOnly } = req.validated || req.body

    if (new Date(startAt) >= new Date(endAt)) {
      return res.status(400).json({ message: "Start time must be before end time ❌" })
    }

    const campaign = new Campaign({
      name,
      slug,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      discountPercentage,
      products: products.map(p => ({
        productId: p.productId,
        allocatedStock: p.allocatedStock,
        purchaseLimit: purchaseLimit || p.purchaseLimit || 2
      })),
      guestCheckoutOnly: guestCheckoutOnly || false,
      status: new Date() < new Date(startAt) ? "upcoming" : "live"
    })

    await campaign.save()
    await triggerWebhook("campaign_created", { campaignId: campaign._id, name, startAt, endAt })

    res.status(201).json({
      message: "Campaign created successfully ✅",
      campaign
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getCampaigns = async (req, res) => {
  try {
    const { status, slug } = req.query
    let query = {}

    if (status) query.status = status
    if (slug) query.slug = slug

    const campaigns = await Campaign.find(query).populate("products.productId")
    res.json(campaigns)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("products.productId")
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found ❌" })
    }
    res.json(campaign)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updateCampaignStatus = async (req, res) => {
  try {
    const { id } = req.params
    const campaign = await Campaign.findById(id)

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found ❌" })
    }

    const now = new Date()
    let newStatus = campaign.status

    if (now < new Date(campaign.startAt)) {
      newStatus = "upcoming"
    } else if (now > new Date(campaign.endAt)) {
      newStatus = "ended"
    } else {
      newStatus = "live"
    }

    campaign.status = newStatus
    await campaign.save()

    res.json({
      message: `Campaign status updated to ${newStatus} ✅`,
      campaign
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const pauseCampaign = async (req, res) => {
  try {
    const { id } = req.params
    const campaign = await Campaign.findByIdAndUpdate(id, { isPaused: true }, { new: true })

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found ❌" })
    }

    await triggerWebhook("campaign_paused", { campaignId: id })

    res.json({
      message: "Campaign paused ⏸️",
      campaign
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const resumeCampaign = async (req, res) => {
  try {
    const { id } = req.params
    const campaign = await Campaign.findByIdAndUpdate(id, { isPaused: false }, { new: true })

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found ❌" })
    }

    await triggerWebhook("campaign_resumed", { campaignId: id })

    res.json({
      message: "Campaign resumed ▶️",
      campaign
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignStatus,
  pauseCampaign,
  resumeCampaign
}
