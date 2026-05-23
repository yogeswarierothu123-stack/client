const errorHandler = (err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  })

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({
      error: "Validation failed",
      details: messages,
      code: "VALIDATION_ERROR"
    })
  }

  // Mongoose cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
      code: "CAST_ERROR"
    })
  }

  // MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      error: `${field} already exists`,
      code: "DUPLICATE_ERROR"
    })
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      code: "JWT_ERROR"
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      code: "TOKEN_EXPIRED"
    })
  }

  // Custom API errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code || "API_ERROR"
    })
  }

  // Default error
  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
    code: "SERVER_ERROR"
  })
}

// Custom error class
class ApiError extends Error {
  constructor(statusCode, message, code = "API_ERROR") {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

module.exports = {
  errorHandler,
  ApiError
}
