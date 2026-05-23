import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function Checkout({ cart, setCart, paymentMethod, setPaymentMethod }) {
  const navigate = useNavigate()
  const [guestCheckout, setGuestCheckout] = useState(true)
  const [botVerified, setBotVerified] = useState(false)
  const [paymentLocked, setPaymentLocked] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCVV, setCardCVV] = useState("")
  const [upiId, setUpiId] = useState("")
  const [walletProvider, setWalletProvider] = useState("")
  const [walletMobile, setWalletMobile] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankLogin, setBankLogin] = useState("")
  const [emiPlan, setEmiPlan] = useState("")
  const paymentOptions = [
    { value: "credit_card", label: "Credit / debit card" },
    { value: "upi", label: "UPI" },
    { value: "wallet", label: "Wallet" },
    { value: "net_banking", label: "Net banking" },
    { value: "emi", label: "EMI / installment" }
  ]
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const validCart = useMemo(() => cart.filter((item) => item.reservedUntil > now), [cart, now])
  const totalPrice = validCart.reduce((total, item) => total + item.price, 0)
  const soonestExpiry = validCart.reduce(
    (soonest, item) => Math.min(soonest, item.reservedUntil),
    Number.POSITIVE_INFINITY,
  )
  const secondsLeft =
    soonestExpiry === Number.POSITIVE_INFINITY ? 0 : Math.max(0, Math.ceil((soonestExpiry - now) / 1000))

  const placeOrder = () => {
    if (!paymentMethod) {
      alert("Select a payment method before placing your order.")
      return
    }

    if (paymentMethod === "credit_card" && (!cardNumber || !cardExpiry || !cardCVV)) {
      alert("Please complete your credit card details.")
      return
    }

    if (paymentMethod === "upi" && !upiId) {
      alert("Please enter your UPI ID.")
      return
    }

    if (paymentMethod === "wallet" && (!walletProvider || !walletMobile)) {
      alert("Please enter your wallet provider and mobile number.")
      return
    }

    if (paymentMethod === "net_banking" && (!bankName || !bankLogin)) {
      alert("Please enter your bank name and login ID.")
      return
    }

    if (paymentMethod === "emi" && (!cardNumber || !cardExpiry || !cardCVV || !emiPlan)) {
      alert("Please complete your EMI payment details.")
      return
    }

    if (!botVerified) {
      alert("Complete the checkout bot verification first.")
      return
    }
    if (!validCart.length) {
      alert("Your reserved stock expired. Return to the sale page.")
      return
    }

    setPaymentLocked(true)
    setTimeout(() => {
      setCart([])
      navigate("/success")
    }, 700)
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-red-300">Optimized checkout</p>
            <h1 className="text-4xl font-black">Single-step payment</h1>
          </div>
          <Link className="rounded bg-white/10 px-4 py-3 font-bold" to="/cart">
            Back to cart
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-white/10 bg-neutral-900 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-neutral-300">Full name</span>
                <input className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-neutral-300">Phone for SMS alert</span>
                <input className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-neutral-300">Delivery address</span>
                <input className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-neutral-300">Payment method</span>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {paymentMethod === "credit_card" && (
                <>
                  <label className="block">
                    <span className="text-sm font-bold text-neutral-300">Card number</span>
                    <input
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-neutral-300">CVV</span>
                    <input
                      value={cardCVV}
                      onChange={(event) => setCardCVV(event.target.value)}
                      placeholder="123"
                      className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-neutral-300">Expiry date</span>
                    <input
                      value={cardExpiry}
                      onChange={(event) => setCardExpiry(event.target.value)}
                      placeholder="MM/YY"
                      className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                    />
                  </label>
                </>
              )}

              {paymentMethod === "upi" && (
                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-neutral-300">UPI ID</span>
                  <input
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    placeholder="user@bank"
                    className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                  />
                </label>
              )}

              {paymentMethod === "wallet" && (
                <>
                  <label className="block">
                    <span className="text-sm font-bold text-neutral-300">Wallet provider</span>
                    <input
                      value={walletProvider}
                      onChange={(event) => setWalletProvider(event.target.value)}
                      placeholder="Paytm, PhonePe, Google Pay"
                      className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-neutral-300">Mobile number</span>
                    <input
                      value={walletMobile}
                      onChange={(event) => setWalletMobile(event.target.value)}
                      placeholder="Enter mobile number"
                      className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                    />
                  </label>
                </>
              )}

              {paymentMethod === "net_banking" && (
                <>
                  <label className="block">
                    <span className="text-sm font-bold text-neutral-300">Bank name</span>
                    <input
                      value={bankName}
                      onChange={(event) => setBankName(event.target.value)}
                      placeholder="Bank name"
                      className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-neutral-300">Login ID / customer number</span>
                    <input
                      value={bankLogin}
                      onChange={(event) => setBankLogin(event.target.value)}
                      placeholder="User ID"
                      className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                    />
                  </label>
                </>
              )}

              {paymentMethod === "emi" && (
                <>
                  <label className="block">
                    <span className="text-sm font-bold text-neutral-300">Card number</span>
                    <input
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-neutral-300">CVV</span>
                    <input
                      value={cardCVV}
                      onChange={(event) => setCardCVV(event.target.value)}
                      placeholder="123"
                      className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-neutral-300">Expiry date</span>
                    <input
                      value={cardExpiry}
                      onChange={(event) => setCardExpiry(event.target.value)}
                      placeholder="MM/YY"
                      className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-bold text-neutral-300">EMI plan</span>
                    <select
                      value={emiPlan}
                      onChange={(event) => setEmiPlan(event.target.value)}
                      className="mt-2 w-full rounded bg-white px-4 py-3 text-black outline-none"
                    >
                      <option value="">Select a plan</option>
                      <option value="3_months">3 months</option>
                      <option value="6_months">6 months</option>
                      <option value="9_months">9 months</option>
                      <option value="12_months">12 months</option>
                    </select>
                  </label>
                </>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded border border-white/10 bg-black/40 p-4">
                <input
                  type="checkbox"
                  checked={guestCheckout}
                  onChange={(event) => setGuestCheckout(event.target.checked)}
                />
                <span>
                  <span className="block font-bold">Guest checkout priority</span>
                  <span className="text-sm text-neutral-400">Skip account creation during the traffic spike.</span>
                </span>
              </label>
              <label className="flex items-center gap-3 rounded border border-white/10 bg-black/40 p-4">
                <input
                  type="checkbox"
                  checked={botVerified}
                  onChange={(event) => setBotVerified(event.target.checked)}
                />
                <span>
                  <span className="block font-bold">Turnstile / reCAPTCHA v3</span>
                  <span className="text-sm text-neutral-400">Bot score required before final purchase.</span>
                </span>
              </label>
            </div>
          </section>

          <aside className="h-fit rounded-lg border border-white/10 bg-neutral-900 p-6">
            <p className="text-sm font-bold uppercase text-amber-300">Reservation timer</p>
            <p className="mt-2 font-mono text-5xl font-black">
              {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </p>
            <div className="mt-5 space-y-3">
              {validCart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex justify-between gap-3 text-sm">
                  <span>{item.name}</span>
                  <span className="font-bold">INR {item.price}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-white/10 pt-5">
              <div className="flex justify-between text-xl font-black">
                <span>Total</span>
                <span>INR {totalPrice}</span>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-black/40 px-4 py-3 text-sm text-neutral-300">
                <span>Selected payment method</span>
                <span className="font-semibold text-white">{paymentOptions.find((option) => option.value === paymentMethod)?.label || "None"}</span>
              </div>
            </div>
            <button
              className="mt-5 w-full rounded bg-emerald-500 px-4 py-3 font-black text-black disabled:bg-neutral-700 disabled:text-neutral-400"
              disabled={paymentLocked || !validCart.length}
              onClick={placeOrder}
            >
              {paymentLocked ? "Locking inventory..." : "Place order"}
            </button>
            <p className="mt-4 text-sm text-neutral-400">
              Order submission represents an atomic inventory lock so two buyers cannot claim the same unit.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Checkout
