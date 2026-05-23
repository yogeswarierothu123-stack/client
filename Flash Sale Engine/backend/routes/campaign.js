const express = require("express")
const { createCampaign, getCampaigns, getCampaignById, updateCampaignStatus, pauseCampaign, resumeCampaign } = require("../controllers/campaignController")
const protect = require("../middleware/auth")
const { validateRequest } = require("../middleware/validation")
const { createCampaignSchema } = require("../validation/schemas")

const router = express.Router()

router.use(protect)
router.post("/", validateRequest(createCampaignSchema), createCampaign)
router.get("/", getCampaigns)
router.get("/:id", getCampaignById)
router.post("/:id/status", updateCampaignStatus)
router.post("/:id/pause", pauseCampaign)
router.post("/:id/resume", resumeCampaign)

module.exports = router
