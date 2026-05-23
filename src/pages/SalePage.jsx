import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import StockBar from "../components/StockBar"
import PurchaseNotification from "../components/PurchaseNotification"
import SocialShareBonus from "../components/SocialShareBonus"
import { initializeSocket, joinCampaign, joinProduct, onInventoryUpdate, onPurchaseNotification } from "../utils/socketClient"

function SalePage({ campaign, products, cart, setCart }) {
  const [saleEnded, setSaleEnded] = useState(false)
  const [saleStarted, setSaleStarted] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [liveProducts, setLiveProducts] = useState(products)
  const navigate = useNavigate()

  // Initialize Socket.IO and join campaign room
  useEffect(() => {
    const socket = initializeSocket()
    if (campaign?._id) {
      joinCampaign(campaign._id)
    }
    
    // Also join individual product rooms
    products?.forEach(product => {
      joinProduct(product._id || product.id)
    })
  }, [campaign, products])

  // Listen for real-time inventory updates
  useEffect(() => {
    const unsubscribe = onInventoryUpdate((data) => {
      setLiveProducts((prevProducts) =>
        prevProducts.map((product) =>
          (product._id === data.productId || product.id === data.productId)
            ? {
                ...product,
                remaining: data.remainingStock,
                allocated: data.allocatedStock,
                percentageClaimed: data.percentageClaimed,
                saleStock: data.remainingStock
              }
            : product
        )
      )
    })

    return unsubscribe
  }, [])

  // Listen for purchase notifications for social proof
  useEffect(() => {
    const unsubscribe = onPurchaseNotification((notification) => {
      setNotifications((prev) => [
        ...prev,
        {
          ...notification,
          id: Date.now()
        }
      ])
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.slice(1))
      }, 5000)
    })

    return unsubscribe
  }, [])

  // Update local products when liveProducts changes
  useEffect(() => {
    if (liveProducts && liveProducts.length > 0) {
      // Already using liveProducts
    }
  }, [liveProducts])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()

      const startTime = new Date(campaign.startAt)
      const endTime = new Date(campaign.endAt)

      // PRE-SALE COUNTDOWN
      if (now < startTime) {
        const diff = startTime - now

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setCountdown({ hours, minutes, seconds })
        setSaleStarted(false)
      }

      // SALE LIVE
      else if (now >= startTime && now < endTime) {
        setSaleStarted(true)

        const diff = endTime - now

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setCountdown({ hours, minutes, seconds })
      }

      // SALE ENDED
      else {
        setSaleEnded(true)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [campaign])

  // SALE ENDED PAGE
  if (saleEnded) {
    return (
      <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-black mb-4">⏱️ Sale Ended</h1>
          <p className="text-neutral-400 mb-8">
            Thank you for participating!
          </p>

          <button
            onClick={() => navigate("/home")}
            className="rounded bg-red-500 px-6 py-3 font-bold"
          >
            Back to Store
          </button>
        </div>
      </div>
    )
  }

  if (!countdown) return null

  // PRE-SALE TEASER PAGE
  if (!saleStarted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5">
        <h1 className="text-6xl font-black mb-6 text-red-500">
          🔥 Coming Soon
        </h1>

        <p className="mb-3 text-lg text-neutral-400">
          Flash Sale Starts In
        </p>

        <div className="mb-10 text-5xl font-black font-mono">
          {String(countdown.hours).padStart(2, "0")}:
          {String(countdown.minutes).padStart(2, "0")}:
          {String(countdown.seconds).padStart(2, "0")}
        </div>

        {/* Blurred Products */}
        <div className="grid gap-6 md:grid-cols-3">
          {liveProducts.map((product) => (
            <div
              key={product.id}
              className="w-64 overflow-hidden rounded-lg border border-white/10 bg-neutral-900"
            >
              <div className="h-48 bg-gradient-to-b from-neutral-700 to-neutral-900 blur-sm"></div>

              <div className="p-4">
                <div className="h-4 w-32 rounded bg-neutral-700 blur-sm mb-3"></div>

                <div className="h-4 w-20 rounded bg-neutral-700 blur-sm"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // MAIN SALE PAGE
  return (
    <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header with countdown */}
        <div className="mb-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black">{campaign.name}</h1>

              <p className="text-white/80">
                Up to {campaign.discountPercentage}% OFF
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-white/80 mb-2">
                Sale ends in
              </p>

              <p className="text-5xl font-black font-mono">
                {String(countdown.hours).padStart(2, "0")}:
                {String(countdown.minutes).padStart(2, "0")}:
                {String(countdown.seconds).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>

        {/* Social Share Bonus */}
        <div className="mb-8">
          <SocialShareBonus />
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {liveProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border border-white/10 bg-neutral-900 overflow-hidden"
            >
              <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 h-48"></div>

              <div className="p-4">
                <h3 className="font-bold mb-2">{product.name}</h3>

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-2xl font-black text-red-400">
                      ₹{product.price}
                    </p>

                    <p className="text-sm line-through text-neutral-500">
                      ₹{product.oldPrice}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-green-400">
                    Save{" "}
                    {Math.round(
                      (1 - product.price / product.oldPrice) * 100
                    )}
                    %
                  </p>
                </div>

                <StockBar
                  remaining={product.remaining}
                  total={product.allocated}
                />

                <button
                  onClick={() => {
                    setCart([
                      ...cart,
                      {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        reservedUntil:
                          Date.now() + 5 * 60 * 1000,
                      },
                    ])
                  }}
                  disabled={product.remaining === 0}
                  className="mt-4 w-full rounded bg-red-500 px-4 py-3 font-bold disabled:bg-neutral-700 disabled:text-neutral-400"
                >
                  {product.remaining === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Notifications */}
      {notifications.map((notif, idx) => (
        <PurchaseNotification
          key={idx}
          notification={notif}
        />
      ))}
    </div>
  )
}

export default SalePage