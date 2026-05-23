const crypto = require("crypto")
const bcrypt = require("bcrypt")
const User = require("../models/User")
const { sendEmail } = require("../utils/notificationService")
const ApiError = require("../middleware/errorHandler").ApiError

const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) {
      return next(new ApiError(400, "Email is required", "VALIDATION_ERROR"))
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(200).json({ message: "If this email exists, a reset link has been sent." })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    user.resetPasswordToken = token
    user.resetPasswordExpires = expires
    await user.save()

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`
    await sendEmail(
      user.email,
      "Password reset request",
      `Use this link to reset your password: ${resetUrl}`
    )

    res.status(200).json({ message: "If this email exists, a reset link has been sent." })
  } catch (error) {
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body
    if (!token || !password) {
     return res.status(400).json({
  message: "Email is required",
  code: "VALIDATION_ERROR"
})
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    })

    if (!user) {
      return next(new ApiError(400, "Invalid or expired reset token", "RESET_TOKEN_INVALID"))
    }

    user.password = await bcrypt.hash(password, 10)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: "Password has been reset successfully." })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  requestPasswordReset,
  resetPassword
}
