import { useEffect, useState } from "react"

function PurchaseNotification({ notification }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-5 right-5 bg-emerald-600 text-white rounded-lg px-4 py-3 shadow-lg animate-pulse">
      <p className="font-bold text-sm">✅ Someone just bought {notification.quantity}x {notification.productName}</p>
      <p className="text-xs text-emerald-100 mt-1">{notification.remaining} left in stock!</p>
    </div>
  )
}

export default PurchaseNotification
