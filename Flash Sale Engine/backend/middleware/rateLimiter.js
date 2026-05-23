const rateLimit = require("express-rate-limit")

// General API rate limit (100 requests per 15 minutes)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false
})

// Authentication rate limit (20 failed attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts, please try again later",
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
})

// Checkout rate limit (10 requests per minute to prevent abuse)
const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many checkout attempts, slow down",
  standardHeaders: true,
  legacyHeaders: false
})

// Webhook rate limit (1000 requests per minute)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
})

module.exports = {
  generalLimiter,
  authLimiter,
  checkoutLimiter,
  webhookLimiter
}
