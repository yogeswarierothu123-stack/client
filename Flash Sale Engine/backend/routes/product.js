const express = require("express")
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  pauseProduct,
  resumeProduct
} = require("../controllers/productController")
const protect = require("../middleware/auth")
const { validateRequest } = require("../middleware/validation")
const { createProductSchema, updateProductSchema } = require("../validation/schemas")

const router = express.Router()

router.route("/")
  .get(getProducts)
  .post(protect, validateRequest(createProductSchema), createProduct)

router.route("/:id")
  .get(getProductById)
  .patch(protect, validateRequest(updateProductSchema), updateProduct)
  .delete(protect, deleteProduct)

router.post("/:id/pause", protect, pauseProduct)
router.post("/:id/resume", protect, resumeProduct)

module.exports = router
