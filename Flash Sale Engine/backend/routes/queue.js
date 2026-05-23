const express = require("express")
const { joinQueue, getQueuePosition } = require("../controllers/queueController")
const protect = require("../middleware/auth")
const { validateRequest } = require("../middleware/validation")
const { queueJoinSchema, queuePositionSchema } = require("../validation/schemas")

const router = express.Router()

router.use(protect)
router.post("/join", validateRequest(queueJoinSchema), joinQueue)
router.get("/position", validateRequest(queuePositionSchema, "query"), getQueuePosition)

module.exports = router
