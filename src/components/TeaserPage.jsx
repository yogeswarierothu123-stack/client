import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function TeaserPage({ campaign }) {
  const [timeLeft, setTimeLeft] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const start = new Date(campaign.startAt)
      const diff = start - now

      if (diff <= 0) {
        navigate(`/sale/${campaign.slug}`)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [campaign, navigate])

  if (!timeLeft) return null

  return (
    <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white flex items-center justify-center">
      <div className="max-w-2xl text-center">
        <div className="mb-8 blur-sm grayscale">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {campaign.products.map((product) => (
              <div key={product._id} className="rounded-lg bg-neutral-800 h-32"></div>
            ))}
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-4">Coming Soon!</h1>
        <p className="text-xl text-neutral-300 mb-2">{campaign.name}</p>
        <p className="text-neutral-500 mb-8">Get ready for up to {campaign.discountPercentage}% off</p>

        <div className="mb-8">
          <p className="text-sm text-neutral-400 mb-4">Sale starts in:</p>
          <div className="text-6xl font-black tracking-wider">
            {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
          </div>
        </div>

        <button className="w-full md:w-auto rounded bg-red-500 px-8 py-4 font-black text-white hover:bg-red-600">
          Set Reminder
        </button>

        <p className="mt-8 text-sm text-neutral-500">
          💡 Tip: Refresh the page exactly when the timer hits zero to get instant access!
        </p>
      </div>
    </div>
  )
}

export default TeaserPage
