const express = require("express")
const { getSaleReport, getLiveAnalytics, getPostSaleReport, getConversionFunnel } = require("../controllers/analyticsController")
const protect = require("../middleware/auth")

const router = express.Router()

router.get("/sale-report", protect, getSaleReport)
router.get("/live", protect, getLiveAnalytics)
router.get("/post-sale", protect, getPostSaleReport)
router.get("/funnel", protect, getConversionFunnel)

module.exports = router
