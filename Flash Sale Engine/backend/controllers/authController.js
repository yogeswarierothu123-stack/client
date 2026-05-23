const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"

const signToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })
}

const register = async (req, res) => {
  try {
    const { name, email, password } = req.validated || req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required ❌" })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists ❌" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    })

    await newUser.save()
    const token = signToken(newUser)

    res.status(201).json({
      message: "User Registered Successfully ✅",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const login = async (req, res) => {
  try {
    console.log(req.body)
    const { email, password } = req.validated || req.body
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required ❌" })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password ❌" })
    }

    const token = signToken(user)
    res.json({
      message: "Login successful ✅",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getMe = async (req, res) => {
  res.json({ user: req.user })
}

module.exports = {
  register,
  login,
  getMe
}
