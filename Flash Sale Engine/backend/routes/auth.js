const express = require("express")
const { register, login, getMe } = require("../controllers/authController")
const protect = require("../middleware/auth")
const { validateRequest } = require("../middleware/validation")
const { authLimiter } = require("../middleware/rateLimiter")
const { registerSchema, loginSchema } = require("../validation/schemas")

const router = express.Router()

router.post("/register", authLimiter, validateRequest(registerSchema), register)
router.post("/login", authLimiter, validateRequest(loginSchema), login)
router.get("/me", protect, getMe)

module.exports = router
