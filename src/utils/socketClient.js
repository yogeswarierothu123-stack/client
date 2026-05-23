import { io } from "socket.io-client"

let socket = null

export const initializeSocket = () => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"
    socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket"]
    })

    socket.on("connect", () => {
      console.log("✅ Connected to real-time server:", socket.id)
    })

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from real-time server")
    })

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error)
    })
  }
  return socket
}

export const getSocket = () => {
  if (!socket) {
    return initializeSocket()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const joinCampaign = (campaignId) => {
  const socket = getSocket()
  socket.emit("join-campaign", campaignId)
}

export const joinProduct = (productId) => {
  const socket = getSocket()
  socket.emit("join-product", productId)
}

export const onInventoryUpdate = (callback) => {
  const socket = getSocket()
  socket.on("inventory-update", callback)
  
  return () => {
    socket.off("inventory-update", callback)
  }
}

export const onPurchaseNotification = (callback) => {
  const socket = getSocket()
  socket.on("purchase-notification", callback)
  
  return () => {
    socket.off("purchase-notification", callback)
  }
}
