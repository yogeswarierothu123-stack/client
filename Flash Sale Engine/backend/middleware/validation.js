// Request validation middleware
const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const payload = req[source] || {}
    const { error, value } = schema.validate(payload, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join("."),
        message: d.message
      }))
      return res.status(400).json({
        error: "Validation failed",
        details,
        code: "VALIDATION_ERROR"
      })
    }

    req.validated = value
    next()
  }
}

module.exports = {
  validateRequest
}
