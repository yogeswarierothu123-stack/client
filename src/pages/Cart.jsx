import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { getProductImage } from "../utils/productImage"

function formatClock(totalSeconds) {
  const seconds = Math.max(0, totalSeconds)
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
}

function Cart({ cart, setCart, paymentMethod, setPaymentMethod }) {
  const [now, setNow] = useState(() => Date.now())
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

  useEffect(() => {
    const timer = setInterval(() => {
      const current = Date.now()
      setNow(current)
      setCart((items) => items.filter((item) => item.reservedUntil > current))
    }, 1000)

    return () => clearInterval(timer)
  }, [setCart])

  const groupedCart = useMemo(() => {
    return cart.reduce((groups, item) => {
      const existing = groups.find((group) => group.id === item.id)
      if (existing) {
        existing.quantity += 1
        existing.total += item.price
        existing.reservedUntil = Math.min(existing.reservedUntil, item.reservedUntil)
      } else {
        groups.push({ ...item, quantity: 1, total: item.price })
      }
      return groups
    }, [])
  }, [cart])

  const totalPrice = cart.reduce((total, item) => total + item.price, 0)

  const removeFromCart = (productId) => {
    const indexToRemove = cart.findIndex((item) => item.id === productId)
    setCart(cart.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-red-300">Reserved cart</p>
            <h1 className="text-4xl font-black">Checkout hold</h1>
          </div>
          <Link className="rounded bg-white/10 px-4 py-3 font-bold" to="/home">
            Back to sale
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="mt-8 rounded-lg border border-white/10 bg-neutral-900 p-8">
            <h2 className="text-2xl font-black">Your reservation is empty</h2>
            <p className="mt-2 text-neutral-300">
              Add an item during the live drop to start the 5-minute reservation timer.
            </p>
            <div className="mt-6 rounded-lg border border-white/10 bg-black/40 p-5">
              <p className="text-sm font-bold uppercase text-emerald-300">Choose payment method</p>
              <label className="mt-3 block">
                <span className="text-sm font-bold text-neutral-300">Payment method</span>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
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
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Card number</span>
                    <input
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-bold text-neutral-300">Expiry</span>
                      <input
                        value={cardExpiry}
                        onChange={(event) => setCardExpiry(event.target.value)}
                        placeholder="MM/YY"
                        className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-bold text-neutral-300">CVV</span>
                      <input
                        value={cardCVV}
                        onChange={(event) => setCardCVV(event.target.value)}
                        placeholder="123"
                        className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                      />
                    </label>
                  </div>
                </>
              )}

              {paymentMethod === "upi" && (
                <label className="mt-4 block">
                  <span className="text-sm font-bold text-neutral-300">UPI ID</span>
                  <input
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    placeholder="user@bank"
                    className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                  />
                </label>
              )}

              {paymentMethod === "wallet" && (
                <>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Wallet provider</span>
                    <input
                      value={walletProvider}
                      onChange={(event) => setWalletProvider(event.target.value)}
                      placeholder="Paytm, PhonePe, Google Pay"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Mobile number</span>
                    <input
                      value={walletMobile}
                      onChange={(event) => setWalletMobile(event.target.value)}
                      placeholder="Enter mobile number"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                </>
              )}

              {paymentMethod === "net_banking" && (
                <>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Bank name</span>
                    <input
                      value={bankName}
                      onChange={(event) => setBankName(event.target.value)}
                      placeholder="Bank name"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Login ID / customer number</span>
                    <input
                      value={bankLogin}
                      onChange={(event) => setBankLogin(event.target.value)}
                      placeholder="User ID"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                </>
              )}

              {paymentMethod === "emi" && (
                <>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Card number</span>
                    <input
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-bold text-neutral-300">Expiry</span>
                      <input
                        value={cardExpiry}
                        onChange={(event) => setCardExpiry(event.target.value)}
                        placeholder="MM/YY"
                        className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-bold text-neutral-300">CVV</span>
                      <input
                        value={cardCVV}
                        onChange={(event) => setCardCVV(event.target.value)}
                        placeholder="123"
                        className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                      />
                    </label>
                  </div>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">EMI plan</span>
                    <select
                      value={emiPlan}
                      onChange={(event) => setEmiPlan(event.target.value)}
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
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

              <p className="mt-3 text-sm text-neutral-400">
                Your selected payment method will be saved for the next checkout.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <section className="space-y-4">
              {groupedCart.map((item) => {
                const secondsLeft = Math.ceil((item.reservedUntil - now) / 1000)

                return (
                  <article key={item.id} className="rounded-lg border border-white/10 bg-neutral-900 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-1 gap-4">
                        <img
                          src={item.image || getProductImage(item)}
                          alt={item.name}
                          className="h-24 w-28 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                        <p className="text-sm font-bold uppercase text-neutral-400">{item.category}</p>
                        <h2 className="mt-1 text-2xl font-black">{item.name}</h2>
                        <p className="mt-2 text-neutral-300">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-400">Reservation expires</p>
                        <p className="font-mono text-3xl font-black text-amber-300">
                          {formatClock(secondsLeft)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xl font-black text-red-400">INR {item.total}</p>
                      <button
                        className="rounded bg-red-500 px-4 py-2 font-bold"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Release one unit
                      </button>
                    </div>
                  </article>
                )
              })}
            </section>

            <aside className="h-fit rounded-lg border border-white/10 bg-neutral-900 p-5">
              <p className="text-sm font-bold uppercase text-emerald-300">One-page checkout ready</p>
              <h2 className="mt-2 text-3xl font-black">INR {totalPrice}</h2>
              <p className="mt-3 text-neutral-300">
                Reserved stock returns automatically if the timer reaches zero before payment.
              </p>
              <label className="mt-5 block">
                <span className="text-sm font-bold text-neutral-300">Payment method</span>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
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
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Card number</span>
                    <input
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-bold text-neutral-300">Expiry</span>
                      <input
                        value={cardExpiry}
                        onChange={(event) => setCardExpiry(event.target.value)}
                        placeholder="MM/YY"
                        className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-bold text-neutral-300">CVV</span>
                      <input
                        value={cardCVV}
                        onChange={(event) => setCardCVV(event.target.value)}
                        placeholder="123"
                        className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                      />
                    </label>
                  </div>
                </>
              )}

              {paymentMethod === "upi" && (
                <label className="mt-4 block">
                  <span className="text-sm font-bold text-neutral-300">UPI ID</span>
                  <input
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    placeholder="user@bank"
                    className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                  />
                </label>
              )}

              {paymentMethod === "wallet" && (
                <>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Wallet provider</span>
                    <input
                      value={walletProvider}
                      onChange={(event) => setWalletProvider(event.target.value)}
                      placeholder="Paytm, PhonePe, Google Pay"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Mobile number</span>
                    <input
                      value={walletMobile}
                      onChange={(event) => setWalletMobile(event.target.value)}
                      placeholder="Enter mobile number"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                </>
              )}

              {paymentMethod === "net_banking" && (
                <>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Bank name</span>
                    <input
                      value={bankName}
                      onChange={(event) => setBankName(event.target.value)}
                      placeholder="Bank name"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Login ID / customer number</span>
                    <input
                      value={bankLogin}
                      onChange={(event) => setBankLogin(event.target.value)}
                      placeholder="User ID"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                </>
              )}

              {paymentMethod === "emi" && (
                <>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">Card number</span>
                    <input
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                    />
                  </label>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-bold text-neutral-300">Expiry</span>
                      <input
                        value={cardExpiry}
                        onChange={(event) => setCardExpiry(event.target.value)}
                        placeholder="MM/YY"
                        className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-bold text-neutral-300">CVV</span>
                      <input
                        value={cardCVV}
                        onChange={(event) => setCardCVV(event.target.value)}
                        placeholder="123"
                        className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
                      />
                    </label>
                  </div>
                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-neutral-300">EMI plan</span>
                    <select
                      value={emiPlan}
                      onChange={(event) => setEmiPlan(event.target.value)}
                      className="mt-2 w-full rounded bg-black/80 px-4 py-3 text-white outline-none"
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

              <Link to="/checkout">
                <button className="mt-5 w-full rounded bg-emerald-500 px-4 py-3 font-black text-black">
                  Proceed to checkout
                </button>
              </Link>
              <p className="mt-3 text-sm text-neutral-400">
                Selected payment method will be applied during checkout.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
