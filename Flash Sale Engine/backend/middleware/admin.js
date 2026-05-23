const ApiError = require("./errorHandler").ApiError

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new ApiError(403, "Admin access required", "ADMIN_ACCESS_DENIED"))
  }
  next()
}

module.exports = requireAdmin
