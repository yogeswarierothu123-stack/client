import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function WaitingRoom({ campaignId }) {
  const [position, setPosition] = useState(null)
  const [admitted, setAdmitted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkQueue = async () => {
      const response = await fetch(`/api/queue/position?campaignId=${campaignId}`)
      const data = await response.json()

      if (data.status === "admitted") {
        setAdmitted(true)
        navigate("/home")
      } else {
        setPosition(data.position)
        setAdmitted(false)
      }
    }

    checkQueue()
    const interval = setInterval(checkQueue, 5000)
    return () => clearInterval(interval)
  }, [campaignId, navigate])

  if (admitted) {
    return (
      <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-black mb-2">You're In!</h1>
          <p className="text-neutral-400">Redirecting to the sale...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="text-7xl font-black mb-4 text-red-400">⏳</div>
          <h1 className="text-4xl font-black">In Queue</h1>
        </div>

        <div className="rounded-lg bg-neutral-900 border border-white/10 p-6 mb-6">
          <p className="text-neutral-400 mb-2">Your Position</p>
          <p className="text-6xl font-black text-red-400">#{position}</p>
          <p className="text-neutral-400 mt-2">Check back in a few moments</p>
        </div>

        <div className="space-y-3 text-sm text-neutral-400">
          <p>⏱️ We're processing users as fast as possible</p>
          <p>📱 Keep this page open for real-time updates</p>
          <p>⚡ You'll be admitted automatically when it's your turn</p>
        </div>
      </div>
    </div>
  )
}

export default WaitingRoom
