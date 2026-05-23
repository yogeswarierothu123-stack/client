import { useEffect, useState } from "react"
import { BrowserRouter, Link, Route, Routes } from "react-router-dom"

import Admin from "./pages/Admin"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import OrderSuccess from "./pages/OrderSuccess"
import ProtectedRoute from "./components/ProtectedRoute"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"

function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart")
    return savedCart ? JSON.parse(savedCart) : []
  })
  const [paymentMethod, setPaymentMethod] = useState(() => {
    return localStorage.getItem("paymentMethod") || "credit_card"
  })

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
    localStorage.setItem("paymentMethod", paymentMethod)
  }, [cart, paymentMethod])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home cart={cart} setCart={setCart} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sale/:slug"
          element={
            <ProtectedRoute>
              <Home cart={cart} setCart={setCart} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart cart={cart} setCart={setCart} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout cart={cart} setCart={setCart} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/ended" element={<Ended />} />
        <Route path="/success" element={<OrderSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

function Ended() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-white">
      <div className="max-w-xl rounded-lg border border-white/10 bg-neutral-900 p-8 text-center">
        <p className="text-sm font-bold uppercase text-red-300">Sale ended</p>
        <h1 className="mt-3 text-4xl font-black">This flash sale is locked</h1>
        <p className="mt-3 text-neutral-300">
          Unsold flash allocation is being reintegrated into regular store inventory at normal prices.
        </p>
        <Link to="/admin">
          <button className="mt-6 rounded bg-red-500 px-5 py-3 font-bold">View post-sale report</button>
        </Link>
      </div>
    </div>
  )
}

export default App
