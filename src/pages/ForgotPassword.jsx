import { useState } from "react"
import { Link } from "react-router-dom"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError("")
    setMessage("")

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        const text = await response.text()
        throw new Error(`Server error: ${text || response.status}`)
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || "Unable to send reset link")
      }

      setMessage(result.message || "If this email exists, a reset link has been sent.")
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyan-950 px-5 py-8 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl text-slate-950">
        <h1 className="text-4xl font-black">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email and we’ll send a link to reset your password.
        </p>

        <div className="mt-8 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-lg border border-emerald-400 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-bold">Email address</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="w-full rounded-xl bg-cyan-700 px-4 py-3 text-base font-black text-white shadow-lg shadow-cyan-700/20 transition hover:bg-cyan-800 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Remembered your password?
          <Link to="/login" className="ml-2 font-bold text-cyan-700 hover:text-cyan-900">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
