import { getAssetErc20ByChainAndSymbol, getAssetPriceInfo } from '@funkit/api-base'
import { perfMonitor } from '../utils/performance'

const API_KEY = import.meta.env['VITE_FUNKIT_API_KEY']

if (!API_KEY) {
  console.warn('VITE_FUNKIT_API_KEY is not set in environment variables')
}

// Cache for API responses
interface CacheEntry<T> {
  data: T
  timestamp: number
}

class ResponseCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) {
      perfMonitor.recordCacheMiss()
      return null
    }

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      perfMonitor.recordCacheMiss()
      return null
    }

    perfMonitor.recordCacheHit()
    return entry.data
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

const apiCache = new ResponseCache()

export interface Token {
  symbol: string
  name: string
  price: number
  icon: string
  chainId: string
  address?: string
}

// Notable tokens with their chain IDs from the screenshot
export const SUPPORTED_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', chainId: '1', icon: '💵' },
  { symbol: 'USDT', name: 'Tether USD', chainId: '137', icon: '💵' },
  { symbol: 'ETH', name: 'Ethereum', chainId: '8453', icon: 'Ξ' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', chainId: '1', icon: '₿' },
]

export const getTokenInfo = async (chainId: string, symbol: string): Promise<Token | null> => {
  const cacheKey = `token-${chainId}-${symbol}`

  // Check cache first
  const cached = apiCache.get<Token>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const tokenInfo = await getAssetErc20ByChainAndSymbol({
      chainId,
      symbol,
      apiKey: API_KEY,
    })

    if (!tokenInfo) {
      return null
    }

    // Get price info if we have the token address
    let price = 0
    if (tokenInfo.address) {
      try {
        const priceInfo = await getAssetPriceInfo({
          chainId,
          assetTokenAddress: tokenInfo.address,
          apiKey: API_KEY,
        })
        price = priceInfo?.unitPrice || 0
      } catch (error) {
        console.error('Error fetching price:', error)
      }
    }

    const token: Token = {
      symbol: tokenInfo.symbol || symbol,
      name: tokenInfo.name || symbol,
      price,
      icon: getTokenIcon(symbol),
      chainId,
      address: tokenInfo.address,
    }

    // Cache the result
    apiCache.set(cacheKey, token)

    return token
  } catch (error) {
    console.error('Error fetching token info:', error)
    return null
  }
}

export const getAllTokensInfo = async (): Promise<Token[]> => {
  // Check if we have all tokens cached
  const cachedTokens: Token[] = []
  let allCached = true

  for (const token of SUPPORTED_TOKENS) {
    const cached = apiCache.get<Token>(`token-${token.chainId}-${token.symbol}`)
    if (cached) {
      cachedTokens.push(cached)
    } else {
      allCached = false
      break
    }
  }

  if (allCached) {
    return cachedTokens
  }

  const tokenPromises = SUPPORTED_TOKENS.map((token) => getTokenInfo(token.chainId, token.symbol))

  const results = await Promise.all(tokenPromises)

  // Filter out null results and add fallback data for any failed requests
  return SUPPORTED_TOKENS.map((token, index) => {
    const result = results[index]
    if (result) {
      return result
    }
    // Fallback data if API fails
    return {
      symbol: token.symbol,
      name: token.name,
      price: getDefaultPrice(token.symbol),
      icon: token.icon,
      chainId: token.chainId,
    }
  })
}

function getTokenIcon(symbol: string): string {
  const iconMap: { [key: string]: string } = {
    BTC: '₿',
    WBTC: '₿',
    ETH: 'Ξ',
    USDC: '💵',
    USDT: '💵',
    BNB: '🟡',
    SOL: '◎',
  }
  return iconMap[symbol.toUpperCase()] || '🪙'
}

function getDefaultPrice(symbol: string): number {
  // Default prices as fallback
  const priceMap: { [key: string]: number } = {
    USDC: 1,
    USDT: 1,
    ETH: 2500,
    WBTC: 45000,
  }
  return priceMap[symbol] || 0
}
