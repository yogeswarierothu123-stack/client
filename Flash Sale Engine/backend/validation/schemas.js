const Joi = require("joi")

const objectId = Joi.string().hex().length(24)

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(128).required()
})

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(128).required()
})

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().allow(""),
  price: Joi.number().precision(2).min(0).required(),
  stock: Joi.number().integer().min(0).default(0),
  salePrice: Joi.number().precision(2).min(0),
  saleStock: Joi.number().integer().min(0).default(0),
  saleStart: Joi.date().iso(),
  saleEnd: Joi.date().iso(),
  purchaseLimit: Joi.number().integer().min(0).default(0),
  isSalePaused: Joi.boolean().default(false),
  image: Joi.string().uri().allow(""),
  isActive: Joi.boolean().default(true)
}).and("saleStart", "saleEnd")

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  description: Joi.string().trim().allow(""),
  price: Joi.number().precision(2).min(0),
  stock: Joi.number().integer().min(0),
  salePrice: Joi.number().precision(2).min(0),
  saleStock: Joi.number().integer().min(0),
  saleStart: Joi.date().iso(),
  saleEnd: Joi.date().iso(),
  purchaseLimit: Joi.number().integer().min(0),
  isSalePaused: Joi.boolean(),
  image: Joi.string().uri().allow(""),
  isActive: Joi.boolean()
}).min(1).and("saleStart", "saleEnd")

const createCampaignSchema = Joi.object({
  name: Joi.string().trim().min(3).max(120).required(),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]+$/).required(),
  description: Joi.string().trim().allow(""),
  startAt: Joi.date().iso().required(),
  endAt: Joi.date().iso().greater(Joi.ref("startAt")).required(),
  discountPercentage: Joi.number().min(1).max(100).required(),
  guestCheckoutOnly: Joi.boolean().default(false),
  enableQueue: Joi.boolean().default(true),
  maxConcurrentUsers: Joi.number().integer().min(1).default(100),
  products: Joi.array().items(
    Joi.object({
      productId: objectId.required(),
      allocatedStock: Joi.number().integer().min(1).required(),
      purchaseLimit: Joi.number().integer().min(1).default(2)
    })
  ).min(1).required()
})

const buySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
  botVerified: Joi.boolean().required(),
  paymentMethod: Joi.string().valid("credit_card", "upi", "wallet", "net_banking", "emi").required(),
  campaignId: objectId.optional()
})

const queueJoinSchema = Joi.object({
  campaignId: objectId.required()
})

const abandonedCartSchema = Joi.object({
  campaignId: objectId.required(),
  items: Joi.array().items(
    Joi.object({
      productId: objectId.required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().precision(2).min(0).required()
    })
  ).min(1).required()
})

const sendRecoverySchema = Joi.object({
  campaignId: objectId.required()
})

const reservationSchema = Joi.object({
  productId: objectId.required(),
  quantity: Joi.number().integer().min(1).required()
})

const reminderSchema = Joi.object({
  productId: objectId.required()
})

const webhookSchema = Joi.object({
  url: Joi.string().uri().required(),
  event: Joi.string().trim().min(3).max(120).required()
})

const botCheckSchema = Joi.object({
  token: Joi.string().trim().required()
})

const resetRequestSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required()
})

const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required(),
  password: Joi.string().min(6).max(128).required()
})

const queuePositionSchema = Joi.object({
  campaignId: objectId.required()
})

const abandonedCartStatsSchema = Joi.object({
  campaignId: objectId.required()
})

const adminProductPayloadSchema = Joi.object({
  productId: objectId.required()
})

const adminStatsSchema = Joi.object({
  productId: objectId.required()
})

module.exports = {
  registerSchema,
  loginSchema,
  createProductSchema,
  updateProductSchema,
  createCampaignSchema,
  buySchema,
  queueJoinSchema,
  abandonedCartSchema,
  sendRecoverySchema,
  reservationSchema,
  reminderSchema,
  webhookSchema,
  botCheckSchema,
  resetRequestSchema,
  resetPasswordSchema,
  queuePositionSchema,
  abandonedCartStatsSchema,
  adminProductPayloadSchema,
  adminStatsSchema
}
