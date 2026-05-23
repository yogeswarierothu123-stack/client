import { useState } from "react"

function SocialShareIncentive({ onApplyDiscount }) {
  const [showShare, setShowShare] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("twitter")
  const [shareIncentive, setShareIncentive] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const platforms = [
    { id: "twitter", name: "Twitter/X", icon: "𝕏", color: "bg-black" },
    { id: "facebook", name: "Facebook", icon: "f", color: "bg-blue-600" },
    { id: "linkedin", name: "LinkedIn", icon: "in", color: "bg-blue-700" }
  ]

  const createShareIncentive = async () => {
    setLoading(true)
    setMessage("")
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/social-share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ platform: selectedPlatform })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to create share incentive")
      }

      setShareIncentive(result.incentive)
      setMessage("Share incentive created! Copy the content and share it now.")
    } catch (error) {
      setMessage(error.message || "Failed to create share incentive")
    } finally {
      setLoading(false)
    }
  }

  const getShareContent = () => {
    if (!shareIncentive) return ""
    const platform = platforms.find(p => p.id === shareIncentive.platform)
    const content = {
      twitter: `Check out this amazing flash sale! Use my referral link for extra 5% off: ${shareIncentive.shareUrl}`,
      facebook: `Don't miss this flash sale! Get 5% extra off using my link: ${shareIncentive.shareUrl}`,
      linkedin: `Exciting flash sale opportunity! Grab 5% extra discount with my referral: ${shareIncentive.shareUrl}`
    }
    return content[shareIncentive.platform] || ""
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareContent())
    setMessage("Copied to clipboard! ✅ Share it now on " + platforms.find(p => p.id === shareIncentive.platform).name)
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-amber-900">🎉 Bonus: Share for 5% Extra Off</p>
          <p className="mt-1 text-xs text-amber-800">Share the sale link and get an additional 5% discount!</p>
        </div>
        <button
          onClick={() => setShowShare(!showShare)}
          className="whitespace-nowrap rounded-lg bg-amber-600 px-3 py-2 text-sm font-black text-white transition hover:bg-amber-700"
        >
          {showShare ? "Hide" : "Share"}
        </button>
      </div>

      {showShare && (
        <div className="mt-4 space-y-3 border-t border-amber-200 pt-4">
          {!shareIncentive ? (
            <>
              <p className="text-xs font-bold text-amber-900">Select a platform to share:</p>
              <div className="grid grid-cols-3 gap-2">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`rounded-lg px-3 py-2 text-sm font-black text-white transition ${
                      selectedPlatform === platform.id
                        ? platform.color
                        : "bg-slate-300 hover:" + platform.color
                    }`}
                  >
                    {platform.name}
                  </button>
                ))}
              </div>
              <button
                onClick={createShareIncentive}
                disabled={loading}
                className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-black text-white transition hover:bg-emerald-700 disabled:bg-slate-400"
              >
                {loading ? "Creating..." : "Generate Share Link"}
              </button>
            </>
          ) : (
            <>
              <div className="rounded-lg bg-white p-3">
                <p className="text-xs font-bold text-slate-600">Share message:</p>
                <p className="mt-2 break-words text-sm text-slate-900">{getShareContent()}</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-black text-white transition hover:bg-blue-700"
              >
                📋 Copy & Share
              </button>
              <button
                onClick={() => {
                  setShareIncentive(null)
                  setMessage("")
                }}
                className="w-full rounded-lg bg-slate-300 px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-400"
              >
                Back
              </button>
            </>
          )}
          {message && (
            <p className={`text-xs font-bold ${message.includes("Failed") ? "text-red-600" : "text-emerald-600"}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default SocialShareIncentive
