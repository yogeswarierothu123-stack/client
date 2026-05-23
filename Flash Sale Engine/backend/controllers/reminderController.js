const Reminder = require("../models/Reminder")
const Product = require("../models/Product")
const { sendReminderEmail, sendSMS, sendReminderSMS } = require("../utils/notificationService")

const setReminder = async (req, res) => {
  try {
    const { productId, reminderType = "email", phoneNumber } = req.validated || req.body

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" })
    }

    const now = new Date()
    if (!product.saleStart || new Date(product.saleStart) <= now) {
      return res.status(400).json({ message: "This product does not have an upcoming sale start time to remind you about." })
    }

    // Validate SMS requirements if SMS is selected
    if (reminderType === "sms" || reminderType === "both") {
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number required for SMS reminders ❌" })
      }
    }

    const existingReminder = await Reminder.findOne({ userId: req.user._id, productId })
    if (existingReminder) {
      return res.status(400).json({ message: "Reminder already set for this product ❌" })
    }

    const reminder = await Reminder.create({
      userId: req.user._id,
      productId,
      reminderType,
      phoneNumber: phoneNumber || null
    })

    res.status(201).json({
      message: "Reminder set successfully ✅",
      reminder
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).populate("productId")
    res.json(reminders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found ❌" })
    }
    res.json({ message: "Reminder deleted ✅" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const processReminders = async () => {
  try {
    const now = new Date()
    const remindWindowMs = 15 * 60 * 1000
    const pendingReminders = await Reminder.find({ 
      $or: [
        { emailNotificationSent: false, reminderType: { $in: ["email", "both"] } },
        { smsNotificationSent: false, reminderType: { $in: ["sms", "both"] } }
      ]
    }).populate(["userId", "productId"])

    for (const reminder of pendingReminders) {
      const product = reminder.productId
      if (!product || !product.saleStart) {
        continue
      }

      const saleStartDate = new Date(product.saleStart)
      const timeUntilStart = saleStartDate.getTime() - now.getTime()

      if (timeUntilStart > 0 && timeUntilStart <= remindWindowMs) {
        // Send email notification if configured
        if ((reminder.reminderType === "email" || reminder.reminderType === "both") && !reminder.emailNotificationSent) {
          const result = await sendReminderEmail(
            reminder.userId.email,
            product.name,
            saleStartDate
          )

          if (result.success) {
            reminder.emailNotificationSent = true
            if (result.previewUrl) {
              console.log(`Reminder email preview: ${result.previewUrl}`)
            }
          }
        }

        // Send SMS notification if configured
        if ((reminder.reminderType === "sms" || reminder.reminderType === "both") && !reminder.smsNotificationSent && reminder.phoneNumber) {
          const result = await sendReminderSMS(
            reminder.phoneNumber,
            product.name,
            saleStartDate
          )

          if (result) {
            reminder.smsNotificationSent = true
          }
        }

        await reminder.save()
      }
    }
  } catch (error) {
    console.error("Error processing reminders:", error)
  }
}

module.exports = {
  setReminder,
  getReminders,
  deleteReminder,
  processReminders
}
