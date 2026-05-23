import { Link } from "react-router-dom"


function Navbar({ cart, handleLogout }) {

return (


<div className="flex justify-between items-center p-5 bg-gray-900">

  <h1 className="text-3xl font-bold text-red-500">
    Flash Sale
  </h1>

  <div className="flex gap-5">

    <Link to="/cart">

      <button className="bg-red-500 px-4 py-2 rounded">

        Cart {cart.length}

      </button>

    </Link>

    <button
      onClick={handleLogout}
      className="bg-white text-black px-4 py-2 rounded"
    >
      Logout
    </button>

  </div>

</div>


)

}

export default Navbar
