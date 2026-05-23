const express = require("express")
const protect = require("../middleware/auth")

const {
  createShareIncentive,
  verifyShare,
  getShareIncentives,
  applyShareDiscount
} = require("../controllers/socialShareController")

const router = express.Router()

router.use(protect)

// Create share incentive
router.post("/", createShareIncentive)

// Get user's share incentives
router.get("/", getShareIncentives)

// Verify social share
router.post("/:incentiveId/verify", verifyShare)

// Apply share discount to order
router.post("/apply-discount", applyShareDiscount)

module.exports = router