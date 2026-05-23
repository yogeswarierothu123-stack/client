const express = require("express")
const { verifyRecaptchaToken } = require("../utils/botDetection")
const { validateRequest } = require("../middleware/validation")
const { botCheckSchema } = require("../validation/schemas")

const router = express.Router()

router.post("/verify", validateRequest(botCheckSchema), async (req, res) => {
  try {
    const { token } = req.validated || req.body

    const result = await verifyRecaptchaToken(token)

    if (!result.success) {
      return res.status(403).json({
        message: "Bot detection failed ❌",
        success: false,
        score: result.score
      })
    }

    res.json({
      message: "Verification successful ✅",
      success: true,
      score: result.score,
      action: result.action
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
