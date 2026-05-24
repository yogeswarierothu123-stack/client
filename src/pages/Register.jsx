import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

function Register() {

  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setError("")

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email, and password are required")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      })

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        const text = await response.text()
        throw new Error(`Server error: ${text || response.status}`)
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || "Registration failed")
      }

      alert("Registration Successful")
      navigate("/login")
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="min-h-screen bg-black flex items-center justify-center">

      <div className="bg-gray-900 p-10 rounded-xl w-100px">

        <h1 className="text-4xl font-bold text-red-500 text-center mb-8">
          Register
        </h1>

        {error && (
          <div className="mb-5 rounded-lg border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Name */}
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 text-white mb-5"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 text-white mb-5"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 text-white mb-5"
        />

        {/* Register Button */}
        <button
          disabled={loading}
          onClick={handleRegister}
          className="w-full bg-red-500 py-3 rounded-lg text-xl font-bold text-white disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Login Link */}
        <p className="text-gray-400 mt-5 text-center">

          Already have an account?

          <Link
            to="/login"
            className="text-red-500 ml-2"
          >
            Login
          </Link>

        </p>

      </div>

    </div>

  )
}

export default Register