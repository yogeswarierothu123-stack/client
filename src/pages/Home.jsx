import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getProductImage } from "../utils/productImage"
import SocialShareIncentive from "../components/SocialShareIncentive"
import { initializeSocket, joinProduct, onInventoryUpdate, onPurchaseNotification } from "../utils/socketClient"

const RESERVATION_SECONDS = 300

const campaign = {
  name: "Mega Electronics Sale",
  slug: "mega-electronics-sale",
  discount: 55,
  purchaseLimit: 5,
  startAt: Date.now() - 10 * 60 * 1000,
  endAt: Date.now() + 2 * 60 * 60 * 1000,
}

const initialProducts = [
  {
    id: "mouse",
    name: "Logitech G502 Hero Gaming Mouse",
    category: "Accessories",
    price: 3499,
    oldPrice: 5995,
    allocated: 240,
    remaining: 58,
    regularStock: 420,
    color: "from-red-500 to-yellow-400",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "headphones",
    name: "Sony WH-CH720N Wireless Headphones",
    category: "Audio",
    price: 6999,
    oldPrice: 14990,
    allocated: 180,
    remaining: 43,
    regularStock: 310,
    color: "from-cyan-400 to-blue-600",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "watch",
    name: "Apple Watch SE",
    category: "Wearables",
    price: 21999,
    oldPrice: 29900,
    allocated: 95,
    remaining: 17,
    regularStock: 160,
    color: "from-emerald-400 to-teal-700",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "keyboard",
    name: "Keychron K2 Mechanical Keyboard",
    category: "Accessories",
    price: 6499,
    oldPrice: 8999,
    allocated: 130,
    remaining: 29,
    regularStock: 220,
    color: "from-fuchsia-500 to-rose-600",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "speaker",
    name: "JBL Flip 6 Bluetooth Speaker",
    category: "Audio",
    price: 7999,
    oldPrice: 11999,
    allocated: 150,
    remaining: 37,
    regularStock: 260,
    color: "from-orange-400 to-red-600",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "powerbank",
    name: "Anker PowerCore 20000mAh Power Bank",
    category: "Accessories",
    price: 2999,
    oldPrice: 4999,
    allocated: 210,
    remaining: 64,
    regularStock: 500,
    color: "from-indigo-500 to-sky-500",
    image:
      "https://www.penguin.com.bd/wp-content/uploads/2019/09/Anker-PowerCore-Elite-20000mAh-Power-Bank-2.jpg",
  },
  {
    id: "tablet",
    name: "Samsung Galaxy Tab A9+",
    category: "Devices",
    price: 18999,
    oldPrice: 27999,
    allocated: 75,
    remaining: 18,
    regularStock: 95,
    color: "from-violet-500 to-purple-700",
    image:
      "https://img1.cgtrader.com/items/2618554/a586ffd260/samsung-galaxy-tab-a7-10-4-2020-dark-gray-3d-model-max-obj-3ds-fbx-c4d-lwo.jpg",
  },
  {
    id: "camera",
    name: "GoPro HERO12 Black",
    category: "Devices",
    price: 34999,
    oldPrice: 45999,
    allocated: 88,
    remaining: 21,
    regularStock: 140,
    color: "from-lime-400 to-emerald-700",
    image:
      "https://www.notebookcheck.net/fileadmin/Notebooks/News/_nc3/goprohero12black.jpg",
  },
  {
    id: "charger",
    name: "Apple 20W USB-C Power Adapter",
    category: "Accessories",
    price: 1499,
    oldPrice: 1900,
    allocated: 260,
    remaining: 72,
    regularStock: 610,
    color: "from-slate-600 to-slate-900",
    image:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "earbuds",
    name: "Samsung Galaxy Buds FE",
    category: "Audio",
    price: 6499,
    oldPrice: 9999,
    allocated: 170,
    remaining: 45,
    regularStock: 290,
    color: "from-pink-500 to-orange-400",
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "router",
    name: "TP-Link Archer AX23 WiFi 6 Router",
    category: "Networking",
    price: 4499,
    oldPrice: 7999,
    allocated: 105,
    remaining: 26,
    regularStock: 180,
    color: "from-blue-500 to-emerald-500",
    image:
      "https://tse2.mm.bing.net/th/id/OIP.h5wcl6QEPb0nH2k1IF68bQHaHa?cb=thfvnextfalcon&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "monitor",
    name: "LG UltraGear 24-inch Gaming Monitor",
    category: "Displays",
    price: 10999,
    oldPrice: 18999,
    allocated: 60,
    remaining: 12,
    regularStock: 70,
    color: "from-zinc-700 to-cyan-500",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "laptop-stand",
    name: "Portronics My Buddy Laptop Stand",
    category: "Accessories",
    price: 999,
    oldPrice: 1999,
    allocated: 190,
    remaining: 53,
    regularStock: 340,
    color: "from-stone-500 to-zinc-800",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "asus-laptop",
    name: "ASUS VivoBook 15 Laptop",
    category: "Laptops",
    price: 42999,
    oldPrice: 54999,
    allocated: 65,
    remaining: 23,
    regularStock: 85,
    color: "from-indigo-500 to-blue-700",
    image:
      "https://m.media-amazon.com/images/I/71MNXYQ3MAL._SX679_.jpg",
  },
  {
    id: "ssd",
    name: "Samsung T7 1TB Portable SSD",
    category: "Storage",
    price: 7499,
    oldPrice: 12999,
    allocated: 90,
    remaining: 19,
    regularStock: 120,
    color: "from-yellow-400 to-orange-600",
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "webcam",
    name: "Logitech C920 HD Pro Webcam",
    category: "Devices",
    price: 5499,
    oldPrice: 9995,
    allocated: 125,
    remaining: 34,
    regularStock: 220,
    color: "from-sky-500 to-indigo-700",
    image:
      "https://tse3.mm.bing.net/th/id/OIP.cHAploBDR4QKv3BQ5AsrKQHaIR?w=1028&h=1148&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "mic",
    name: "Blue Yeti USB Microphone",
    category: "Audio",
    price: 8999,
    oldPrice: 12995,
    allocated: 82,
    remaining: 16,
    regularStock: 110,
    color: "from-rose-500 to-violet-700",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cooling-pad",
    name: "Cosmic Byte Meteoroid Cooling Pad",
    category: "Accessories",
    price: 1299,
    oldPrice: 2499,
    allocated: 160,
    remaining: 41,
    regularStock: 270,
    color: "from-cyan-300 to-teal-700",
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "vr-headset",
    name: "Meta Quest 3 VR Headset",
    category: "Devices",
    price: 46999,
    oldPrice: 59999,
    allocated: 45,
    remaining: 9,
    regularStock: 55,
    color: "from-purple-600 to-slate-950",
    image:
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "dock",
    name: "Belkin USB-C 7-in-1 Hub",
    category: "Networking",
    price: 3999,
    oldPrice: 6999,
    allocated: 100,
    remaining: 27,
    regularStock: 150,
    color: "from-emerald-500 to-blue-700",
    image:
      "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "printer",
    name: "HP DeskJet 2331 All-in-One Printer",
    category: "Office",
    price: 3999,
    oldPrice: 5999,
    allocated: 58,
    remaining: 14,
    regularStock: 80,
    color: "from-neutral-500 to-red-500",
    image:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "desk-lamp",
    name: "Philips Air Desk LED Lamp",
    category: "Office",
    price: 1299,
    oldPrice: 2499,
    allocated: 220,
    remaining: 69,
    regularStock: 420,
    color: "from-amber-300 to-lime-500",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "graphics-tablet",
    name: "Wacom One Graphics Tablet",
    category: "Devices",
    price: 4999,
    oldPrice: 8999,
    allocated: 70,
    remaining: 15,
    regularStock: 95,
    color: "from-fuchsia-600 to-blue-600",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80",
  },
]

const buyerNames = ["Riya", "Aman", "Noah", "Maya", "Dev", "Ishaan"]

function formatClock(totalSeconds) {
  const seconds = Math.max(0, totalSeconds)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60

  return [hours, minutes, rest].map((part) => String(part).padStart(2, "0")).join(":")
}

function Home({ cart, setCart }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [serverNow, setServerNow] = useState(() => Date.now() + 720)
  const [queuePosition, setQueuePosition] = useState(86)
  const [isInQueue, setIsInQueue] = useState(true)
  const [toast, setToast] = useState("Maya just bought Pulse Wireless Headphones")
  const [reminderEmail, setReminderEmail] = useState("")
  const [reminderSaved, setReminderSaved] = useState(false)
  const [reminderStatus, setReminderStatus] = useState("")
  const [reminderType, setReminderType] = useState("success")
  const [reminderNotificationType, setReminderNotificationType] = useState("email")
  const [reminderPhoneNumber, setReminderPhoneNumber] = useState("")
  const [availableProducts, setAvailableProducts] = useState([])
  const [selectedReminderProductId, setSelectedReminderProductId] = useState("")
  const [isSavingReminder, setIsSavingReminder] = useState(false)
  const [shareApplied, setShareApplied] = useState(false)

  const saleState =
    serverNow < campaign.startAt ? "teaser" : serverNow > campaign.endAt ? "ended" : "live"
  const secondsToStart = Math.ceil((campaign.startAt - serverNow) / 1000)
  const secondsToEnd = Math.ceil((campaign.endAt - serverNow) / 1000)

  const categories = useMemo(
    () => ["All", ...new Set(initialProducts.map((product) => product.category))],
    [],
  )

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "All" || product.category === category
    return matchesSearch && matchesCategory
  })

  const totalAllocated = products.reduce((sum, product) => sum + product.allocated, 0)
  const totalRemaining = products.reduce((sum, product) => sum + product.remaining, 0)
  const claimedPercent = Math.round(((totalAllocated - totalRemaining) / totalAllocated) * 100)

  useEffect(() => {
    const timer = setInterval(() => setServerNow(Date.now() + 720), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (saleState === "ended") {
      const redirect = setTimeout(() => navigate("/ended"), 400)
      return () => clearTimeout(redirect)
    }
  }, [navigate, saleState])

  useEffect(() => {
    if (!isInQueue) return undefined

    const queueTimer = setInterval(() => {
      setQueuePosition((position) => {
        if (position <= 1) {
          setIsInQueue(false)
          return 0
        }
        return Math.max(0, position - Math.ceil(Math.random() * 14))
      })
    }, 1200)

    return () => clearInterval(queueTimer)
  }, [isInQueue])

  useEffect(() => {
    if (saleState !== "live") return undefined

    const stockTimer = setInterval(() => {
      setProducts((currentProducts) => {
        const available = currentProducts.filter((product) => product.remaining > 0)
        if (!available.length) return currentProducts
        const picked = available[Math.floor(Math.random() * available.length)]
        const buyer = buyerNames[Math.floor(Math.random() * buyerNames.length)]

        setToast(`${buyer} just bought ${picked.name}`)

        return currentProducts.map((product) =>
          product.id === picked.id
            ? { ...product, remaining: Math.max(0, product.remaining - 1) }
            : product,
        )
      })
    }, 7000)

    return () => clearInterval(stockTimer)
  }, [saleState])

  useEffect(() => {
    const cleanup = setInterval(() => {
      setCart((items) => items.filter((item) => item.reservedUntil > Date.now()))
    }, 1000)

    return () => clearInterval(cleanup)
  }, [setCart])

  const addToCart = (product) => {
    if (saleState !== "live") return
    if (isInQueue) return
    if (product.remaining <= 0) return

    const currentQuantity = cart.filter((item) => item.id === product.id).length
    if (currentQuantity >= campaign.purchaseLimit) {
      alert(`Purchase limit is ${campaign.purchaseLimit} units for this flash sale item.`)
      return
    }

    setProducts((currentProducts) =>
      currentProducts.map((item) =>
        item.id === product.id ? { ...item, remaining: Math.max(0, item.remaining - 1) } : item,
      ),
    )

    setCart([
      ...cart,
      {
        ...product,
        price: shareApplied ? Math.round(product.price * 0.95) : product.price,
        reservedUntil: serverNow + RESERVATION_SECONDS * 1000,
      },
    ])
  }

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (!response.ok) {
          return
        }

        const products = await response.json()
        setAvailableProducts(products)
        if (products.length) {
          setSelectedReminderProductId(products[0]._id)
        }
      } catch (error) {
        console.warn("Unable to load reminder products:", error)
      }
    }

    loadProducts()
  }, [])

  // Initialize Socket.IO for real-time inventory updates
  useEffect(() => {
    initializeSocket()
  }, [])

  // Listen for inventory updates and update product stock in real-time
  useEffect(() => {
    const unsubscribe = onInventoryUpdate((data) => {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === data.productId || product._id === data.productId
            ? {
                ...product,
                remaining: data.remainingStock,
                allocated: data.allocatedStock,
                saleStock: data.remainingStock
              }
            : product
        )
      )
    })

    return unsubscribe
  }, [])

  // Listen for purchase notifications (social proof)
  useEffect(() => {
    const unsubscribe = onPurchaseNotification((notification) => {
      setToast(notification.message)
      setTimeout(() => setToast(""), 5000)
    })

    return unsubscribe
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("isLoggedIn")
    navigate("/login")
  }

  const saveReminder = async () => {
    if (reminderNotificationType === "email" && !reminderEmail.trim()) {
      setReminderStatus("Please enter a valid email address.")
      setReminderType("error")
      return
    }

    if (reminderNotificationType === "sms" && !reminderPhoneNumber.trim()) {
      setReminderStatus("Please enter a valid phone number.")
      setReminderType("error")
      return
    }

    if (reminderNotificationType === "both") {
      if (!reminderEmail.trim()) {
        setReminderStatus("Please enter a valid email address.")
        setReminderType("error")
        return
      }
      if (!reminderPhoneNumber.trim()) {
        setReminderStatus("Please enter a valid phone number.")
        setReminderType("error")
        return
      }
    }

    if (!selectedReminderProductId) {
      setReminderStatus("No reminder product available. Please make sure the catalog is loaded.")
      setReminderType("error")
      return
    }

    setIsSavingReminder(true)
    setReminderStatus("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          productId: selectedReminderProductId,
          reminderType: reminderNotificationType,
          phoneNumber: reminderPhoneNumber || undefined
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || result.error || "Unable to save reminder")
      }

      setReminderSaved(true)
      const notificationText = 
        reminderNotificationType === "email" ? "email" :
        reminderNotificationType === "sms" ? "SMS message" :
        "email and SMS"
      setReminderStatus(`Reminder set! You will get ${notificationText} 15 minutes before the sale starts.`)
      setReminderType("success")
    } catch (error) {
      setReminderStatus(error.message || "Failed to schedule reminder. Please try again.")
      setReminderType("error")
    } finally {
      setIsSavingReminder(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br light light bg-slate-600 light border-slate-700 to-cyan-100 text-slate-950">
      <header className="sticky top-0 z-20 border-b light border-l-cyan-300 alice to-blue-400/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link to="/home" className="text-3xl font-black tracking-tight text-slate-950">
            Flash Sale Engine
          </Link>

          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700 transition hover:border-red-200 hover:text-red-600" to={`/sale/${campaign.slug}`}>
              Landing URL
            </Link>
            <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700 transition hover:border-red-200 hover:text-red-600" to="/admin">
              Admin
            </Link>
            <Link className="rounded-lg light bg-pink-500 px-4 py-2 font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700" to="/cart">
              Cart {cart.length}
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700 transition hover:border-red-200 hover:text-red-600"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7">
        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-200">
            <div className="h-full w-full bg-sky-800 from-blue-900 to-purple-900" />
            <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/90 to-slate-950/30" />
            <div className="relative">
            <p className="text-sm font-black uppercase tracking-[0.2em] ">Ongoing Flash Salec</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight md:text-6xl">{campaign.name}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  {campaign.discount}% off selected products with server-synced countdown,
                  reserved carts, live stock, and FIFO waiting room controls.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 px-5 py-4 text-center backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                  {saleState === "teaser" ? "Starts in" : "Ends in"}
                </p>
                <p className="font-mono text-4xl font-black text-light white">
                  {formatClock(saleState === "teaser" ? secondsToStart : secondsToEnd)}
                </p>
                <p className="mt-1 text-xs text-slate-400">Synced to server time +720ms</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Flash stock claimed</p>
                <p className="text-3xl font-black">{claimedPercent}%</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Purchase limit</p>
                <p className="text-3xl font-black">{campaign.purchaseLimit} units</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Reservation window</p>
                <p className="text-3xl font-black">5 min</p>
              </div>
            </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
            {isInQueue ? (
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-600">Virtual waiting room</p>
                <h2 className="mt-3 text-3xl font-black">You are in line</h2>
                <p className="mt-2 text-slate-500">
                  FIFO queue is smoothing the traffic spike before checkout access opens.
                </p>
                <div className="mt-6 rounded-xl bg-amber-50 p-5 text-center ring-1 ring-amber-100">
                  <p className="text-sm font-bold text-amber-700">Queue position</p>
                  <p className="font-mono text-5xl font-black text-amber-600">{queuePosition}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-600">Access granted</p>
                <h2 className="mt-3 text-3xl font-black">Checkout lane open</h2>
                <p className="mt-2 text-slate-500">
                  Guest checkout is prioritized and bot verification runs at payment.
                </p>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-700">15-minute reminder</p>
              <div className="mt-3 grid gap-3">
                {availableProducts.length > 0 ? (
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    
                    onChange={(event) => setSelectedReminderProductId(event.target.value)}
                  >
                    {availableProducts.map((product, index) => (
                      <option key={product._id} value={product._id}>
                        {product.name} #{index + 1} — {product.category || "General"} — ₹{product.price}
                        {product.saleStart ? ` — starts ${new Date(product.saleStart).toLocaleString()}` : ""}
                        {product._id ? ` — ${product._id.slice(-6)}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    Reminder scheduling requires at least one backend product. Create a product in Admin and reload.
                  </p>
                )}
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setReminderNotificationType("email")}
                    className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                      reminderNotificationType === "email" || reminderNotificationType === "both"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    📧 Email
                  </button>
                  <button
                    onClick={() => setReminderNotificationType("sms")}
                    className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                      reminderNotificationType === "sms" || reminderNotificationType === "both"
                        ? "bg-green-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    💬 SMS
                  </button>
                  <button
                    onClick={() => setReminderNotificationType("both")}
                    className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                      reminderNotificationType === "both"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    📧💬 Both
                  </button>
                </div>

                {(reminderNotificationType === "email" || reminderNotificationType === "both") && (
                  <input
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    type="email"
                    placeholder="email@example.com"
                    value={reminderEmail}
                    onChange={(event) => setReminderEmail(event.target.value)}
                  />
                )}

                {(reminderNotificationType === "sms" || reminderNotificationType === "both") && (
                  <input
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={reminderPhoneNumber}
                    onChange={(event) => setReminderPhoneNumber(event.target.value)}
                  />
                )}

                <button
                  className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                  onClick={saveReminder}
                  disabled={isSavingReminder || availableProducts.length === 0}
                >
                  {isSavingReminder ? "Saving..." : "Remind"}
                </button>
              </div>
              {reminderStatus && (
                <p className={`mt-2 text-sm font-bold ${reminderType === "success" ? "text-emerald-600" : "text-red-600"}`}>
                  {reminderStatus}
                </p>
              )}
            </div>

            <SocialShareIncentive onApplyDiscount={() => setShareApplied(true)} />
              </aside>
        </section>

        <section className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70 md:grid-cols-4">
          <input
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 md:col-span-2"
            placeholder="Search flash sale products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button
            className={`rounded-lg px-4 py-3 font-black text-white shadow-lg transition ${shareApplied ? "bg-emerald-600 shadow-emerald-600/20" : "bg-cyan-600 shadow-cyan-600/20 hover:bg-cyan-700"}`}
            onClick={() => setShareApplied(true)}
          >
            {shareApplied ? "Extra 5% applied" : "Share for 5% off"}
          </button>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const claimed = Math.round(((product.allocated - product.remaining) / product.allocated) * 100)
            const isSoldOut = product.remaining === 0
            const isInCart = cart.some((item) => item.id === product.id)
            const locked = saleState !== "live" || isInQueue || isSoldOut || isInCart

            return (
              <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-xl">
                <div className={`relative h-44 bg-linear-to-br ${product.color} ${saleState === "teaser" ? "blur-sm" : ""}`}>
                  <img
                    src={product.image || getProductImage(product)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end justify-between bg-linear-to-t from-black/35 via-transparent to-transparent p-4 text-white">
                    <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-black backdrop-blur">
                      {campaign.discount}% OFF
                    </span>
                    <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-black backdrop-blur">
                      {product.remaining} left
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{product.category}</p>
                      <h2 className="mt-1 text-xl font-black">{product.name}</h2>
                    </div>
                    {isSoldOut && <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">Sold out</span>}
                  </div>

                  <div className="mt-4 flex items-end gap-3">
                    <p className="text-3xl font-black text-red-600">INR {shareApplied ? Math.round(product.price * 0.95) : product.price}</p>
                    <p className="pb-1 text-sm text-slate-400 line-through">INR {product.oldPrice}</p>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm font-bold text-slate-500">
                      <span>{claimed}% claimed</span>
                      <span>{product.remaining} left</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-red-600" style={{ width: `${claimed}%` }} />
                    </div>
                  </div>

                  <button
                    className={`mt-5 w-full rounded-lg px-4 py-3 font-black transition ${
                      locked ? "bg-slate-100 text-slate-400" : "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700"
                    }`}
                    disabled={locked}
                    onClick={() => addToCart(product)}
                  >
                    {saleState === "teaser"
                      ? "Coming soon"
                      : saleState === "ended"
                        ? "Sale ended"
                        : isInQueue
                          ? "Waiting room active"
                          : isSoldOut
                            ? "Out of stock"
                            : isInCart
                              ? "Already selected"
                              : "Add to reserved cart"}
                  </button>
                </div>
              </article>
            )
          })}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-lg shadow-slate-200/60">
            <h2 className="text-xl font-black">Pre-sale teaser page</h2>
            <p className="mt-2 text-slate-500">
              Product artwork can remain blurred until the exact launch minute, while reminders collect demand.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
            <h2 className="text-xl font-black">Auto-expiry redirect</h2>
            <p className="mt-2 text-slate-500">
              The page locks and routes to the ended screen immediately when server time passes the end timestamp.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
            <h2 className="text-xl font-black">Live purchase proof</h2>
            <p className="mt-2 font-bold text-emerald-600">{toast}</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
