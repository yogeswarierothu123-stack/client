const Webhook = require("../models/Webhook")

const createWebhook = async (req, res) => {
  try {
    const { url, event } = req.validated || req.body

    if (!url || !event) {
      return res.status(400).json({ message: "URL and event are required ❌" })
    }

    const webhook = await Webhook.create({ url, event })

    res.status(201).json({
      message: "Webhook created ✅",
      webhook
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const listWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.find()
    res.json(webhooks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deleteWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findByIdAndDelete(req.params.id)
    if (!webhook) {
      return res.status(404).json({ message: "Webhook not found ❌" })
    }
    res.json({ message: "Webhook deleted ✅" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  createWebhook,
  listWebhooks,
  deleteWebhook
}
