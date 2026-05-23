const redis = require("redis")

let redisClient = null
let connected = false

const initRedis = async () => {
  try {
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      console.warn("Redis not configured - caching disabled")
      return false
    }

    const options = process.env.REDIS_URL
      ? { url: process.env.REDIS_URL }
      : {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379
      }

    redisClient = redis.createClient(options)
    await redisClient.connect()
    connected = true
    console.log("✅ Redis connected")
    return true
  } catch (error) {
    console.warn("Redis connection failed:", error.message)
    return false
  }
}

const get = async (key) => {
  if (!connected || !redisClient) return null
  try {
    return await redisClient.get(key)
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

const set = async (key, value, expireSecs = 3600) => {
  if (!connected || !redisClient) return false
  try {
    await redisClient.setEx(key, expireSecs, JSON.stringify(value))
    return true
  } catch (error) {
    console.error("Redis set error:", error)
    return false
  }
}

const del = async (key) => {
  if (!connected || !redisClient) return false
  try {
    await redisClient.del(key)
    return true
  } catch (error) {
    console.error("Redis del error:", error)
    return false
  }
}

const getProductCache = async (productId) => {
  const cached = await get(`product:${productId}`)
  return cached ? JSON.parse(cached) : null
}

const setProductCache = async (productId, data, expireSecs = 300) => {
  return set(`product:${productId}`, data, expireSecs)
}

const invalidateProductCache = async (productId) => {
  return del(`product:${productId}`)
}

const getCampaignCache = async (campaignId) => {
  const cached = await get(`campaign:${campaignId}`)
  return cached ? JSON.parse(cached) : null
}

const setCampaignCache = async (campaignId, data, expireSecs = 60) => {
  return set(`campaign:${campaignId}`, data, expireSecs)
}

const invalidateCampaignCache = async (campaignId) => {
  return del(`campaign:${campaignId}`)
}

module.exports = {
  initRedis,
  get,
  set,
  del,
  getProductCache,
  setProductCache,
  invalidateProductCache,
  getCampaignCache,
  setCampaignCache,
  invalidateCampaignCache
}
