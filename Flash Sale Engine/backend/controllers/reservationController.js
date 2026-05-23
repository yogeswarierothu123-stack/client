const Product = require("../models/Product")
const Reservation = require("../models/Reservation")
const Order = require("../models/Order")

const RESERVATION_MINUTES = 5

const createReservation = async (req, res) => {
  try {
    const { productId, quantity } = req.validated || req.body

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Product and quantity are required ❌" })
    }

    const product = await Product.findOne({
      _id: productId,
      isSalePaused: false,
      saleStock: { $gte: quantity },
      stock: { $gte: quantity },
      saleStart: { $lte: new Date() },
      saleEnd: { $gte: new Date() }
    })

    if (!product) {
      return res.status(400).json({ message: "Product cannot be reserved at this time ❌" })
    }

    if (product.purchaseLimit && quantity > product.purchaseLimit) {
      return res.status(400).json({ message: `Maximum purchase limit is ${product.purchaseLimit} ❌` })
    }

    product.saleStock -= quantity
    product.stock -= quantity
    await product.save()

    const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000)
    const reservation = await Reservation.create({
      userId: req.user._id,
      productId,
      quantity,
      expiresAt
    })

    res.status(201).json({
      message: `Reserved ${quantity} item(s) for ${RESERVATION_MINUTES} minutes ✅`,
      reservation
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const listReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user._id, status: "active" }).populate("productId")
    res.json(reservations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, userId: req.user._id, status: "active" })
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found or already closed ❌" })
    }

    const product = await Product.findById(reservation.productId)
    if (product) {
      product.saleStock += reservation.quantity
      product.stock += reservation.quantity
      await product.save()
    }

    reservation.status = "cancelled"
    await reservation.save()

    res.json({ message: "Reservation cancelled and inventory returned ✅" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const checkoutReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, userId: req.user._id, status: "active" })
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found or expired ❌" })
    }

    const product = await Product.findById(reservation.productId)
    if (!product) {
      reservation.status = "cancelled"
      await reservation.save()
      return res.status(400).json({ message: "Product no longer available ❌" })
    }

    const order = await Order.create({
      userId: req.user._id,
      productId: reservation.productId,
      quantity: reservation.quantity,
      price: (product.salePrice || product.price) * reservation.quantity
    })

    reservation.status = "completed"
    await reservation.save()

    res.status(201).json({
      message: "Reservation checked out successfully ⚡",
      order
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  createReservation,
  listReservations,
  cancelReservation,
  checkoutReservation
}
