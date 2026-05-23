const axios = require("axios")
const nodemailer = require("nodemailer")
const Webhook = require("../models/Webhook")

// Initialize Twilio (optional, requires env vars)
let twilio = null
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilio = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  }
} catch (error) {
  console.warn("Twilio not configured")
}

// Initialize Nodemailer lazily so we can fallback to Ethereal in local development.
let emailTransporter = null

const getEmailTransporter = async () => {
  if (emailTransporter) {
    return emailTransporter
  }

  const configuredUser = process.env.EMAIL_USER || process.env.SMTP_USER
  const configuredPass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS

  if (configuredUser && configuredPass) {
    emailTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: configuredUser,
        pass: configuredPass
      }
    })
    return emailTransporter
  }

  const testAccount = await nodemailer.createTestAccount()
  emailTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  })

  console.warn("Email service not configured; using Ethereal test account for local development.")
  return emailTransporter
}

const triggerWebhook = async (event, payload) => {
  try {
    const webhooks = await Webhook.find({ event, isActive: true })
    for (const webhook of webhooks) {
      axios.post(webhook.url, { event, ...payload }).catch(err => {
        console.error(`Webhook failed for ${webhook.url}:`, err.message)
      })
    }
  } catch (error) {
    console.error("Error triggering webhooks:", error)
  }
}

const sendEmail = async (to, subject, body, htmlBody = null) => {
  try {
    const transporter = await getEmailTransporter()
    if (!transporter) {
      console.warn("Email transporter is not configured")
      return { success: false }
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.SMTP_USER || "flashsale@example.com",
      to,
      subject,
      text: body,
      html: htmlBody || `<p>${body}</p>`
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Email sent to ${to}`)

    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) {
      console.log(`📨 Preview URL: ${previewUrl}`)
    }

    return {
      success: true,
      previewUrl: previewUrl || null
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false }
  }
}

const sendSMS = async (phoneNumber, message) => {
  try {
    if (!twilio || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn("SMS service not configured")
      return false
    }

    await twilio.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    })
    console.log(`✅ SMS sent to ${phoneNumber}`)
    return true
  } catch (error) {
    console.error("Error sending SMS:", error)
    return false
  }
}

const sendReminderEmail = async (userEmail, campaignName, startTime) => {
  const htmlBody = `
    <div style="font-family: Arial, sans-serif;">
      <h2>⏰ Flash Sale Reminder!</h2>
      <p>Hi there!</p>
      <p>The <strong>${campaignName}</strong> flash sale starts in 15 minutes!</p>
      <p style="color: #e74c3c; font-size: 18px; font-weight: bold;">
        Start time: ${new Date(startTime).toLocaleString()}
      </p>
      <p>Don't miss out on amazing deals. Click the link below to get ready:</p>
      <a href="${process.env.FRONTEND_URL}/home" style="background-color: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Go to Sale
      </a>
    </div>
  `
  return sendEmail(userEmail, `⏰ Reminder: ${campaignName} Sale Starting Soon!`, `Flash sale ${campaignName} starts in 15 minutes!`, htmlBody)
}

const sendAbandonedCartEmail = async (userEmail, items, recoveryDiscount) => {
  const itemsHtml = items.map(item => `<li>${item.quantity}x ${item.productName} - ₹${item.price}</li>`).join("")
  const htmlBody = `
    <div style="font-family: Arial, sans-serif;">
      <h2>🛒 Don't Miss Out!</h2>
      <p>You left these items in your cart:</p>
      <ul>${itemsHtml}</ul>
      <p style="font-size: 18px; font-weight: bold;">
        Get an extra <span style="color: #27ae60;">${recoveryDiscount}% OFF</span> if you complete your purchase today!
      </p>
      <a href="${process.env.FRONTEND_URL}/cart" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Complete Your Purchase
      </a>
    </div>
  `
  return sendEmail(userEmail, "🛒 Don't Miss Your Items - Special Discount Inside!", "", htmlBody)
}

const sendOrderConfirmation = async (userEmail, orderId, items, totalPrice) => {
  const itemsHtml = items.map(item => `<li>${item.quantity}x ${item.productName} - ₹${item.price}</li>`).join("")
  const htmlBody = `
    <div style="font-family: Arial, sans-serif;">
      <h2>✅ Order Confirmed!</h2>
      <p>Your order #${orderId} has been placed successfully.</p>
      <h3>Order Details:</h3>
      <ul>${itemsHtml}</ul>
      <p style="font-size: 18px; font-weight: bold;">Total: ₹${totalPrice}</p>
      <p>Thank you for your purchase! 🎉</p>
    </div>
  `
  return sendEmail(userEmail, `✅ Order Confirmed - #${orderId}`, "", htmlBody)
}

const sendReminderSMS = async (phoneNumber, productName, startTime) => {
  const smsMessage = `⏰ Flash Sale Alert! ${productName} sale starts in 15 minutes at ${new Date(startTime).toLocaleTimeString()}. Don't miss out! 🔔`
  return sendSMS(phoneNumber, smsMessage)
}

const sendSocialShareBonusSMS = async (phoneNumber, discountPercentage) => {
  const smsMessage = `🎉 Social Share Bonus! You've earned an extra ${discountPercentage}% off by sharing the flash sale. Happy shopping! 🛍️`
  return sendSMS(phoneNumber, smsMessage)
}

module.exports = {
  triggerWebhook,
  sendEmail,
  sendSMS,
  sendReminderEmail,
  sendAbandonedCartEmail,
  sendOrderConfirmation,
  sendReminderSMS,
  sendSocialShareBonusSMS
}
