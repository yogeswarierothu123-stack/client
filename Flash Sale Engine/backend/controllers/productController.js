const Product = require("../models/Product")

const createProduct = async (req, res) => {
  try {
    const payload = req.validated || req.body
    const product = new Product(payload)
    await product.save()

    res.status(201).json({
      message: "Product created ✅",
      product
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updateProduct = async (req, res) => {
  try {
    const update = req.validated || req.body
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" })
    }
    res.json({ message: "Product updated ✅", product })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" })
    }
    res.json({ message: "Product deleted ✅" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const pauseProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isSalePaused: true }, { new: true })
    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" })
    }
    res.json({ message: "Flash sale paused ✅", product })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const resumeProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isSalePaused: false }, { new: true })
    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" })
    }
    res.json({ message: "Flash sale resumed ✅", product })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  pauseProduct,
  resumeProduct
}
