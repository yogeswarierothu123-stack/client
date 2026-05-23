import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

const products = [
  { id: "mouse", name: "Apex Gaming Mouse", regularStock: 420, allocated: 240, sold: 182 },
  { id: "headphones", name: "Pulse Wireless Headphones", regularStock: 310, allocated: 180, sold: 137 },
  { id: "watch", name: "Nova Smart Watch", regularStock: 160, allocated: 95, sold: 78 },
  { id: "keyboard", name: "Forge RGB Keyboard", regularStock: 220, allocated: 130, sold: 101 },
]

const checklist = [
  "Campaign builder with product selection, minute-level start/end time, and discount",
  "Dedicated landing URL plus pre-sale teaser and ended-state routing",
  "Inventory allocation, purchase limits, and automatic unsold stock reintegration",
  "Server-synced countdown, live stock bars, social proof, and cart reservation timer",
  "FIFO waiting room, guest checkout priority, bot check, and one-page checkout",
  "Email reminders, SMS alerts, abandoned cart recovery, and social share incentive",
  "Live analytics, post-sale report, caching layer, webhooks, and admin kill switch",
]

function Admin() {
  const [selectedProducts, setSelectedProducts] = useState(["mouse", "headphones", "watch"])
  const [discount, setDiscount] = useState(55)
  const [purchaseLimit, setPurchaseLimit] = useState(2)
  const [guestOnly, setGuestOnly] = useState(true)
  const [killSwitch, setKillSwitch] = useState(false)
  const [startAt, setStartAt] = useState("2026-05-18T20:00")
  const [endAt, setEndAt] = useState("2026-05-18T22:00")

  const stats = useMemo(() => {
    const allocated = products.reduce((sum, product) => sum + product.allocated, 0)
    const sold = products.reduce((sum, product) => sum + product.sold, 0)
    const revenue = products.reduce((sum, product) => sum + product.sold * 1499, 0)

    return {
      activeVisitors: 18420,
      activeCarts: 932,
      revenuePerMinute: 286000,
      conversionRate: Math.round((sold / 12600) * 1000) / 10,
      allocated,
      sold,
      revenue,
    }
  }, [])

  const toggleProduct = (id) => {
    setSelectedProducts((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-red-300">Merchant console</p>
            <h1 className="text-4xl font-black">Flash sale admin</h1>
          </div>
          <Link className="rounded bg-white/10 px-4 py-3 font-bold" to="/">
            View storefront
          </Link>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-lg border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-2xl font-black">Campaign builder</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-neutral-300">Campaign name</span>
                <input
                  className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                  defaultValue="Mega Electronics Sale"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-neutral-300">Landing URL</span>
                <input
                  className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                  defaultValue="/sale/mega-electronics-sale"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-neutral-300">Start time</span>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(event) => setStartAt(event.target.value)}
                  className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-neutral-300">End time</span>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(event) => setEndAt(event.target.value)}
                  className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-neutral-300">Discount percentage</span>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                  className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-neutral-300">Purchase limit</span>
                <select
                  value={purchaseLimit}
                  onChange={(event) => setPurchaseLimit(event.target.value)}
                  className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                >
                  <option value="1">1 unit per buyer</option>
                  <option value="2">2 units per buyer</option>
                </select>
              </label>
            </div>

            <div className="mt-6">
              <h3 className="font-black">Product selection and flash allocation</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {products.map((product) => {
                  const unsold = product.allocated - product.sold

                  return (
                    <label key={product.id} className="rounded border border-white/10 bg-black/40 p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold">{product.name}</p>
                          <p className="mt-1 text-sm text-neutral-400">
                            Flash allocation {product.allocated} units. Regular stock {product.regularStock}.
                          </p>
                          <p className="mt-1 text-sm text-emerald-300">
                            Unsold reintegration preview: {unsold} units back to regular store.
                          </p>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-2xl font-black">Emergency controls</h2>
            <button
              className={`mt-5 w-full rounded px-4 py-4 text-lg font-black ${
                killSwitch ? "bg-amber-400 text-black" : "bg-red-600 text-white"
              }`}
              onClick={() => setKillSwitch((current) => !current)}
            >
              {killSwitch ? "Sale paused by kill switch" : "Abort / pause sale"}
            </button>
            <p className="mt-3 text-sm text-neutral-400">
              Use this for critical pricing errors or suspected checkout abuse.
            </p>

            <div className="mt-6 rounded border border-white/10 bg-black/40 p-4">
              <h3 className="font-black">Checkout protection</h3>
              <label className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={guestOnly}
                  onChange={(event) => setGuestOnly(event.target.checked)}
                />
                <span>Force guest checkout during sale</span>
              </label>
              <p className="mt-3 text-sm text-neutral-400">
                reCAPTCHA v3 or Cloudflare Turnstile is required on the checkout button.
              </p>
            </div>

            <div className="mt-6 rounded border border-white/10 bg-black/40 p-4">
              <h3 className="font-black">Scalability policy</h3>
              <p className="mt-2 text-sm text-neutral-300">
                Redis catalog cache, FIFO queue admission, and optimistic inventory version locks
                are enabled for high-concurrency sale windows.
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-4">
          <Metric label="Active visitors" value={stats.activeVisitors.toLocaleString("en-IN")} />
          <Metric label="Active carts" value={stats.activeCarts.toLocaleString("en-IN")} />
          <Metric label="Revenue / min" value={`INR ${stats.revenuePerMinute.toLocaleString("en-IN")}`} />
          <Metric label="Conversion" value={`${stats.conversionRate}%`} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-2xl font-black">Real-time analytics dashboard</h2>
            <div className="mt-5 space-y-4">
              {products.map((product) => {
                const percent = Math.round((product.sold / product.allocated) * 100)

                return (
                  <div key={product.id}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span>{product.name}</span>
                      <span>{percent}% sold</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded bg-white/10">
                      <div className="h-full bg-red-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-2xl font-black">Post-sale report</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Metric label="Total revenue" value={`INR ${stats.revenue.toLocaleString("en-IN")}`} compact />
              <Metric label="Units sold" value={stats.sold.toLocaleString("en-IN")} compact />
              <Metric label="Fastest item" value="Nova Smart Watch" compact />
              <Metric label="Recovery offer" value="10% email queued" compact />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-2xl font-black">Marketing automations</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Status label="Pre-sale email reminders" value="15 minutes before launch" />
              <Status label="Twilio SMS alerts" value="Instant drop notifications" />
              <Status label="Abandoned cart recovery" value="Post-sale if stock remains" />
              <Status label="Social share incentive" value="Extra 5% before checkout" />
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-2xl font-black">External systems</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Status label="Caching layer" value="Redis product catalog reads" />
              <Status label="Webhook integration" value="Shopify / ERP inventory feed" />
              <Status label="Database locking" value="Optimistic version check" />
              <Status label="Queue service" value="First-in, first-out admission" />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-neutral-900 p-6">
          <h2 className="text-2xl font-black">Requirement coverage</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {checklist.map((item) => (
              <div key={item} className="rounded border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Metric({ label, value, compact = false }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900 p-5">
      <p className="text-sm font-bold uppercase text-neutral-400">{label}</p>
      <p className={`${compact ? "text-2xl" : "text-3xl"} mt-2 font-black`}>{value}</p>
    </div>
  )
}

function Status({ label, value }) {
  return (
    <div className="rounded border border-white/10 bg-black/40 p-4">
      <p className="font-bold">{label}</p>
      <p className="mt-1 text-sm text-emerald-300">{value}</p>
    </div>
  )
}

export default Admin
