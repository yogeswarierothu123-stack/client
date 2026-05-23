const express = require("express")
const { setReminder, getReminders, deleteReminder } = require("../controllers/reminderController")
const protect = require("../middleware/auth")
const { validateRequest } = require("../middleware/validation")
const { reminderSchema } = require("../validation/schemas")

const router = express.Router()

router.use(protect)
router.post("/", validateRequest(reminderSchema), setReminder)
router.get("/", getReminders)
router.delete("/:id", deleteReminder)

module.exports = router
