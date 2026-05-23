import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function SaleEnded() {
  const [stats, setStats] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch post-sale stats
    const fetchStats = async () => {
      const response = await fetch("/api/analytics/post-sale")
      const data = await response.json()
      setStats(data.summary)
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">✅</div>
          <h1 className="text-5xl font-black mb-2">Sale Ended</h1>
          <p className="text-neutral-400">Thank you for shopping with us!</p>
        </div>

        {stats && (
          <div className="space-y-4">
            <div className="rounded-lg bg-neutral-900 border border-white/10 p-6">
              <p className="text-neutral-400">Total Orders</p>
              <p className="text-4xl font-black">{stats.totalOrders}</p>
            </div>

            <div className="rounded-lg bg-neutral-900 border border-white/10 p-6">
              <p className="text-neutral-400">Total Revenue</p>
              <p className="text-4xl font-black">₹{stats.totalRevenue}</p>
            </div>

            <div className="rounded-lg bg-neutral-900 border border-white/10 p-6">
              <p className="text-neutral-400">Conversion Rate</p>
              <p className="text-4xl font-black">{stats.conversionRate}%</p>
            </div>

            <div className="rounded-lg bg-neutral-900 border border-white/10 p-6">
              <p className="text-neutral-400">Average Order Value</p>
              <p className="text-4xl font-black">₹{stats.avgOrderValue}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/home")}
          className="mt-8 w-full rounded bg-red-500 px-6 py-4 font-bold"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

export default SaleEnded
