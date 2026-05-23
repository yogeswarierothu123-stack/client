const express = require("express")
const { killSwitch, reintegrateStock, getSaleStats } = require("../controllers/adminController")
const protect = require("../middleware/auth")
const requireAdmin = require("../middleware/admin")
const { validateRequest } = require("../middleware/validation")
const { adminProductPayloadSchema, adminStatsSchema } = require("../validation/schemas")

const router = express.Router()

router.use(protect)
router.use(requireAdmin)
router.post("/kill-switch", validateRequest(adminProductPayloadSchema), killSwitch)
router.post("/reintegrate-stock", validateRequest(adminProductPayloadSchema), reintegrateStock)
router.get("/sale-stats", validateRequest(adminStatsSchema, "query"), getSaleStats)

module.exports = router
