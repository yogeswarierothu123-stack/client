const express = require("express")
const { requestPasswordReset, resetPassword } = require("../controllers/passwordResetController")
const { validateRequest } = require("../middleware/validation")
const { resetRequestSchema, resetPasswordSchema } = require("../validation/schemas")

const router = express.Router()

router.post("/request", validateRequest(resetRequestSchema), requestPasswordReset)
router.post("/reset", validateRequest(resetPasswordSchema), resetPassword)

module.exports = router
