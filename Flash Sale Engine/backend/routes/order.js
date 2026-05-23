const express = require("express")
const { buyProduct, getOrders, getOrderById } = require("../controllers/orderController")
const protect = require("../middleware/auth")
const { validateRequest } = require("../middleware/validation")
const { checkoutLimiter } = require("../middleware/rateLimiter")
const { buySchema } = require("../validation/schemas")

const router = express.Router()

router.post(
  "/buy/:productId/:campaignId",
  protect,
  checkoutLimiter,
  validateRequest(buySchema),
  buyProduct
)

router.get("/", protect, getOrders)
router.get("/:id", protect, getOrderById)

module.exports = router