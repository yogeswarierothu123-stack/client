import { Link } from "react-router-dom"

function OrderSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-white">
      <div className="max-w-xl rounded-lg border border-white/10 bg-neutral-900 p-8 text-center">
        <p className="text-sm font-bold uppercase text-emerald-300">Inventory locked</p>
        <h1 className="mt-3 text-4xl font-black">Order successful</h1>
        <p className="mt-3 text-neutral-300">
          The reserved flash-sale stock has been committed and the cart hold was cleared.
        </p>
        <Link to="/">
          <button className="mt-6 rounded bg-red-500 px-5 py-3 font-bold">Back to sale</button>
        </Link>
      </div>
    </div>
  )
}

export default OrderSuccess
