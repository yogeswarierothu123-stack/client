const express = require("express")
const { createWebhook, listWebhooks, deleteWebhook } = require("../controllers/webhookController")
const protect = require("../middleware/auth")
const { validateRequest } = require("../middleware/validation")
const { webhookSchema } = require("../validation/schemas")

const router = express.Router()

router.use(protect)
router.post("/", validateRequest(webhookSchema), createWebhook)
router.get("/", listWebhooks)
router.delete("/:id", deleteWebhook)

module.exports = router
