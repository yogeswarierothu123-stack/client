function SocialShareBonus() {
  const shareUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin
  const platforms = [
    {
      name: "Twitter",
      url: `https://twitter.com/intent/tweet?text=🔥%20Check%20out%20this%20incredible%20flash%20sale!&url=${shareUrl}`,
      icon: "𝕏"
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      icon: "f"
    },
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=🔥%20Amazing%20flash%20sale%20happening%20now!%20${shareUrl}`,
      icon: "💬"
    }
  ]

  const handleShare = (url) => {
    window.open(url, "_blank", "width=600,height=400")
    // Award 5% extra discount
    localStorage.setItem("socialBonus", "5")
  }

  return (
    <div className="rounded-lg bg-neutral-900 border border-white/10 p-6">
      <h3 className="font-bold mb-4">Share & Get 5% Extra Off! 🎁</h3>
      <div className="grid grid-cols-3 gap-3">
        {platforms.map((platform) => (
          <button
            key={platform.name}
            onClick={() => handleShare(platform.url)}
            className="rounded bg-white/10 px-4 py-3 font-bold hover:bg-white/20 transition"
          >
            <div className="text-2xl mb-1">{platform.icon}</div>
            <div className="text-xs">{platform.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SocialShareBonus
