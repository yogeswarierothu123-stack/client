const express = require("express")
const { trackAbandonedCart, sendRecoveryEmails, getAbandonedCartStats } = require("../controllers/abandonedCartController")
const protect = require("../middleware/auth")
const { validateRequest } = require("../middleware/validation")
const { abandonedCartSchema, sendRecoverySchema, abandonedCartStatsSchema } = require("../validation/schemas")

const router = express.Router()

router.use(protect)
router.post("/track", validateRequest(abandonedCartSchema), trackAbandonedCart)
router.post("/send-recovery", validateRequest(sendRecoverySchema), sendRecoveryEmails)
router.get("/stats", validateRequest(abandonedCartStatsSchema, "query"), getAbandonedCartStats)

module.exports = router
