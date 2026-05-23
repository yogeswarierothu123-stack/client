const Queue = require("../models/Queue")
const Campaign = require("../models/Campaign")

const joinQueue = async (req, res) => {
  try {
    const { campaignId } = req.body
    const userId = req.user._id

    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found ❌" })
    }

    // Check if user already in queue
    const existing = await Queue.findOne({ campaignId, userId, status: "waiting" })
    if (existing) {
      return res.status(400).json({ message: "Already in queue ❌", position: existing.position })
    }

    // Get current queue position
    const queueCount = await Queue.countDocuments({ campaignId, status: "waiting" })
    const position = queueCount + 1

    // Check if queue is enabled and user can be admitted immediately
    const admittedCount = await Queue.countDocuments({ campaignId, status: "admitted" })
    const status = admittedCount < campaign.maxConcurrentUsers ? "admitted" : "waiting"

    const queueEntry = new Queue({
      userId,
      saleId: campaignId,
      position,
      status,
      admittedAt: status === "admitted" ? new Date() : null
    })

    await queueEntry.save()

    res.status(201).json({
      message: status === "admitted" ? "Admitted to sale! ✅" : "Added to waiting room 📍",
      position: status === "waiting" ? position : 0,
      status,
      queueEntry
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getQueuePosition = async (req, res) => {
  try {
    const { campaignId } = req.query
    const userId = req.user._id

    const entry = await Queue.findOne({ campaignId, userId })
    if (!entry) {
      return res.status(404).json({ message: "Not in queue ❌" })
    }

    // Count how many are ahead
    const ahead = await Queue.countDocuments({
      campaignId,
      position: { $lt: entry.position },
      status: "waiting"
    })

    res.json({
      position: entry.position,
      status: entry.status,
      ahead,
      admittedAt: entry.admittedAt
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const processQueue = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId)
    if (!campaign) return

    const admittedCount = await Queue.countDocuments({ campaignId, status: "admitted" })
    const slotsAvailable = Math.max(0, campaign.maxConcurrentUsers - admittedCount)

    if (slotsAvailable > 0) {
      const waiting = await Queue.find({ campaignId, status: "waiting" })
        .sort({ position: 1 })
        .limit(slotsAvailable)

      for (const entry of waiting) {
        entry.status = "admitted"
        entry.admittedAt = new Date()
        await entry.save()
      }
    }

    // Expire entries that have been waiting too long (24 hours)
    const expireTime = new Date(Date.now() - 24 * 60 * 60 * 1000)
    await Queue.updateMany(
      { campaignId, status: "waiting", joinedAt: { $lte: expireTime } },
      { status: "expired" }
    )
  } catch (error) {
    console.error("Error processing queue:", error)
  }
}

// Cleanup expired entries every minute
setInterval(async () => {
  const campaigns = await Campaign.find({ status: "live" })
  for (const campaign of campaigns) {
    await processQueue(campaign._id)
  }
}, 60 * 1000)

module.exports = {
  joinQueue,
  getQueuePosition,
  processQueue
}
