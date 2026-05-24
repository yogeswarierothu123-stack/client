import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import heroImage from "../assets/hero.png"

function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        const text = await response.text()
        throw new Error(`Server error: ${text || response.status}`)
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || "Login failed")
      }


      
      localStorage.setItem("token", result.token)
      localStorage.setItem("user", JSON.stringify(result.user))
      localStorage.setItem("isLoggedIn", "true")

      navigate("/home")
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="min-h-screen bg-cyan-950 caret-cyan-800 px-5 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden min-h-full bg-slate-900 lg:block">
          <img
            src={heroImage}
            alt="Flash sale products"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/35 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-10">
            <p className="text-sm font-light uppercase tracking-tight text-blue-300">Flash Sale Engine
            </p>
            <h1 className="mt-3 max-w-md text-5xl font-black tracking-tight">
              Get Ready for the Drop 🔥
            </h1>
            <div className="mt-6 grid max-w-md grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
                <p className="text-2xl font-black">55%</p>
                <p className="text-xs text-white/70">Drop deals</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
                <p className="text-2xl font-black">5m</p>
                <p className="text-xs text-white/70">Cart hold</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
                <p className="text-2xl font-black">Live</p>
                <p className="text-xs text-white/70">Stock sync</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-fuchsia-300 px-3 py-10 border border-amber-950 text-slate-950 sm:px-20">
          <div className="w-full max-w-md">
            <Link to="/" className="text-shadow-blue-600 font-black uppercase tracking-[0.75em] text-cyan-950">
              Flash Sale Engine
            </Link>
            <h2 className="mt-5 text-4xl font-black tracking-tight">Welcome To Flash Sale</h2>
            <p className="mt-2.5 text-gray-900">
              Log in to reserve products, track queue access, and complete checkout faster.
            </p>

            <div className="mt-8 space-y-5">
              {error && (
                <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-bold text-black">Email address</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-b-amber-700 bg-white px-4 py-3 text-slate-950 outline-2 transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-shadow-black">Password</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-3 w-full rounded-lg border border-b-amber-700 bg-white px-4 py-3 text-slate-950 outline-2 transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </label>

              <button
                disabled={loading}
                onClick={handleLogin}
                className="w-full rounded-lg bg-red-600 px-4 py-3 text-base font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>

            <div className="mt-4 text-right text-sm text-slate-700">
              <Link to="/forgot-password" className="font-bold text-red-600 hover:text-red-700">
                Forgot password?
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-black">
              Don't have an account?
              <Link
                to="/register"
                className="ml-2 font-black text-red-600 hover:text-red-700"
              >
                Register
              </Link>
            </p>
          </div>
          <div className ="login-box">
            
          </div>
           
          
        </section>
      </div>
    </div>

  )
}

export default Login
