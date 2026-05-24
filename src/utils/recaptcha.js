// reCAPTCHA v3 Integration
export const loadRecaptcha = async () => {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`
    script.onload = () => {
      resolve(window.grecaptcha)
    }
    document.head.appendChild(script)
  })
}

export const verifyRecaptcha = async (action = "checkout") => {
  try {
    const grecaptcha = await loadRecaptcha()
    const token = await grecaptcha.execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action })
    return token
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error)
    return null
  }
}

export const verifyTokenOnBackend = async (token) => {
  try {
    const response = await fetch("/api/bot-check/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
    const data = await response.json()
    return data.success && data.score > 0.5 // reCAPTCHA v3 returns score 0-1
  } catch (error) {
    console.error("Token verification failed:", error)
    return false
  }
}
