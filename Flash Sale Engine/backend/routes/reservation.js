const express = require("express")
const {
  createReservation,
  listReservations,
  cancelReservation,
  checkoutReservation
} = require("../controllers/reservationController")
const protect = require("../middleware/auth")
const { validateRequest } = require("../middleware/validation")
const { reservationSchema } = require("../validation/schemas")

const router = express.Router()

router.use(protect)
router.post("/", validateRequest(reservationSchema), createReservation)
router.get("/", listReservations)
router.post("/:id/checkout", checkoutReservation)
router.delete("/:id", cancelReservation)

module.exports = router
