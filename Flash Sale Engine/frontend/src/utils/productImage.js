const categoryThemes = {
  Accessories: {
    bg: "#fff7ed",
    accent: "#f97316",
    dark: "#7c2d12",
  },
  Audio: {
    bg: "#eff6ff",
    accent: "#2563eb",
    dark: "#1e3a8a",
  },
  Wearables: {
    bg: "#ecfdf5",
    accent: "#10b981",
    dark: "#064e3b",
  },
  Devices: {
    bg: "#f5f3ff",
    accent: "#7c3aed",
    dark: "#3b0764",
  },
  Networking: {
    bg: "#ecfeff",
    accent: "#0891b2",
    dark: "#164e63",
  },
  Displays: {
    bg: "#f8fafc",
    accent: "#475569",
    dark: "#0f172a",
  },
  Storage: {
    bg: "#fefce8",
    accent: "#ca8a04",
    dark: "#713f12",
  },
  Office: {
    bg: "#fdf2f8",
    accent: "#db2777",
    dark: "#831843",
  },
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function getCategoryShape(category, theme) {
  if (category === "Audio") {
    return `
      <circle cx="148" cy="120" r="42" fill="${theme.accent}" opacity="0.16"/>
      <path d="M112 135v-25c0-30 24-54 54-54s54 24 54 54v25" fill="none" stroke="${theme.dark}" stroke-width="13" stroke-linecap="round"/>
      <rect x="90" y="126" width="42" height="66" rx="18" fill="${theme.accent}"/>
      <rect x="200" y="126" width="42" height="66" rx="18" fill="${theme.accent}"/>
    `
  }

  if (category === "Displays") {
    return `
      <rect x="82" y="58" width="156" height="100" rx="14" fill="${theme.dark}"/>
      <rect x="98" y="74" width="124" height="68" rx="8" fill="${theme.accent}" opacity="0.82"/>
      <path d="M144 158h32l8 34h-48z" fill="${theme.dark}" opacity="0.72"/>
      <rect x="120" y="192" width="80" height="12" rx="6" fill="${theme.dark}"/>
    `
  }

  if (category === "Wearables") {
    return `
      <rect x="132" y="36" width="56" height="48" rx="20" fill="${theme.dark}" opacity="0.22"/>
      <rect x="132" y="156" width="56" height="48" rx="20" fill="${theme.dark}" opacity="0.22"/>
      <rect x="102" y="78" width="116" height="92" rx="32" fill="${theme.dark}"/>
      <rect x="121" y="96" width="78" height="56" rx="18" fill="${theme.accent}"/>
    `
  }

  if (category === "Networking") {
    return `
      <rect x="84" y="122" width="152" height="58" rx="18" fill="${theme.dark}"/>
      <circle cx="126" cy="151" r="8" fill="${theme.accent}"/>
      <circle cx="160" cy="151" r="8" fill="${theme.accent}"/>
      <circle cx="194" cy="151" r="8" fill="${theme.accent}"/>
      <path d="M115 102c24-22 66-22 90 0M135 82c14-12 36-12 50 0" fill="none" stroke="${theme.accent}" stroke-width="12" stroke-linecap="round"/>
    `
  }

  if (category === "Storage") {
    return `
      <rect x="88" y="72" width="144" height="112" rx="24" fill="${theme.dark}"/>
      <rect x="112" y="100" width="96" height="36" rx="12" fill="${theme.accent}"/>
      <circle cx="124" cy="160" r="7" fill="${theme.accent}"/>
      <circle cx="148" cy="160" r="7" fill="${theme.accent}"/>
      <circle cx="172" cy="160" r="7" fill="${theme.accent}"/>
    `
  }

  if (category === "Office") {
    return `
      <rect x="94" y="126" width="132" height="58" rx="16" fill="${theme.dark}"/>
      <rect x="116" y="78" width="88" height="64" rx="12" fill="white"/>
      <rect x="126" y="94" width="68" height="8" rx="4" fill="${theme.accent}" opacity="0.75"/>
      <rect x="126" y="112" width="48" height="8" rx="4" fill="${theme.accent}" opacity="0.45"/>
      <rect x="122" y="158" width="76" height="12" rx="6" fill="${theme.accent}"/>
    `
  }

  if (category === "Devices") {
    return `
      <rect x="90" y="48" width="140" height="156" rx="28" fill="${theme.dark}"/>
      <rect x="108" y="72" width="104" height="106" rx="16" fill="${theme.accent}" opacity="0.82"/>
      <circle cx="160" cy="190" r="6" fill="white" opacity="0.9"/>
    `
  }

  return `
    <rect x="82" y="78" width="156" height="96" rx="26" fill="${theme.dark}"/>
    <circle cx="120" cy="126" r="24" fill="${theme.accent}"/>
    <rect x="156" y="102" width="52" height="48" rx="14" fill="${theme.accent}" opacity="0.76"/>
    <path d="M110 70h100" stroke="${theme.accent}" stroke-width="14" stroke-linecap="round"/>
  `
}

export function getProductImage(product) {
  const theme = categoryThemes[product.category] || categoryThemes.Accessories
  const initials = getInitials(product.name)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" role="img" aria-label="${product.name}">
      <rect width="320" height="240" rx="28" fill="${theme.bg}"/>
      <circle cx="272" cy="38" r="54" fill="${theme.accent}" opacity="0.14"/>
      <circle cx="48" cy="210" r="70" fill="${theme.accent}" opacity="0.12"/>
      ${getCategoryShape(product.category, theme)}
      <rect x="28" y="24" width="72" height="34" rx="17" fill="white" opacity="0.88"/>
      <text x="64" y="47" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="${theme.dark}">${initials}</text>
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
