const { OAuth2Client } = require("google-auth-library")

const recaptchaClient = new OAuth2Client()

const verifyRecaptchaToken = async (token) => {
  try {
    const response = await recaptchaClient.request({
      url: "https://www.google.com/recaptcha/api/siteverify",
      method: "POST",
      data: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token
      }
    })

    const { success, score, action } = response.data

    return {
      success: success && score > 0.5,
      score,
      action
    }
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return { success: false, score: 0 }
  }
}

module.exports = {
  verifyRecaptchaToken
}
