import { useState, useEffect, useCallback, ReactElement, ChangeEvent } from 'react'
import './App.css'
import { Token, getAllTokensInfo, SUPPORTED_TOKENS } from './services/tokenService'
import { useDebounce } from './hooks/useDebounce'

function App(): ReactElement {
  const [tokens, setTokens] = useState<Token[]>([])
  const [leftToken, setLeftToken] = useState<Token | null>(null)
  const [rightToken, setRightToken] = useState<Token | null>(null)
  const [leftAmount, setLeftAmount] = useState<string>('1')
  const [rightAmount, setRightAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const debouncedLeftAmount = useDebounce(leftAmount, 300)

  useEffect(() => {
    const fetchTokens = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        const tokenData = await getAllTokensInfo()
        setTokens(tokenData)

        // Set initial tokens
        const usdcToken = tokenData.find((t) => t.symbol === 'USDC')
        const ethToken = tokenData.find((t) => t.symbol === 'ETH')
        if (usdcToken) setLeftToken(usdcToken)
        if (ethToken) setRightToken(ethToken)
      } catch (error) {
        console.error('Failed to fetch tokens:', error)
        setError('Failed to load token data')
        // Set fallback data
        const fallbackTokens = SUPPORTED_TOKENS.map((token) => ({
          symbol: token.symbol,
          name: token.name,
          price: 1,
          icon: token.icon,
          chainId: token.chainId,
        }))
        setTokens(fallbackTokens)
        if (fallbackTokens[0]) setLeftToken(fallbackTokens[0])
        if (fallbackTokens[2]) setRightToken(fallbackTokens[2])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [])

  useEffect(() => {
    if (leftToken && rightToken && debouncedLeftAmount) {
      const leftValue = parseFloat(debouncedLeftAmount) * leftToken.price
      const rightValue = leftValue / rightToken.price
      setRightAmount(isNaN(rightValue) ? '0' : rightValue.toFixed(6))
    } else {
      setRightAmount('')
    }
  }, [debouncedLeftAmount, leftToken, rightToken])

  const handleLeftAmountChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setLeftAmount(value)
    }
  }, [])

  const handleRightAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setRightAmount(value)
        // Calculate left amount based on right
        if (leftToken && rightToken && value) {
          const rightValue = parseFloat(value) * rightToken.price
          const leftValue = rightValue / leftToken.price
          setLeftAmount(isNaN(leftValue) ? '0' : leftValue.toFixed(6))
        }
      }
    },
    [leftToken, rightToken]
  )

  const handleSwap = useCallback((): void => {
    const tempToken = leftToken
    const tempAmount = leftAmount
    setLeftToken(rightToken)
    setRightToken(tempToken)
    setLeftAmount(rightAmount)
    setRightAmount(tempAmount)
  }, [leftToken, rightToken, leftAmount, rightAmount])

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="container" id="main-content">
        <div className="header-section">
          <h1 className="title">Token Price Explorer</h1>
          <p className="subtitle">Real-time cryptocurrency conversion with live market data</p>
        </div>

        {/* Error Message */}
        {error && <div className="error-banner">{error}</div>}

        {/* Token Comparison Cards */}
        <div className="comparison-container">
          {/* Left Token Card */}
          <div className="token-card">
            {isLoading ? (
              <div className="loading-state">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-price"></div>
                <div className="skeleton skeleton-input"></div>
              </div>
            ) : leftToken ? (
              <>
                {/* Token Selector */}
                <div className="card-token-selector">
                  <select
                    className="card-token-dropdown"
                    value={leftToken?.symbol || 'USDC'}
                    onChange={(e) => {
                      const token = tokens.find((t) => t.symbol === e.target.value)
                      if (token) setLeftToken(token)
                    }}
                    disabled={isLoading}
                    aria-label="Select source token"
                  >
                    {SUPPORTED_TOKENS.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.icon} {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="token-header">
                  <div className="token-identity">
                    <span className="token-emoji">{leftToken.icon}</span>
                    <div className="token-details">
                      <h2 className="token-symbol">{leftToken.symbol}</h2>
                      <p className="token-name">{leftToken.name}</p>
                    </div>
                  </div>
                  <div className="token-price">${leftToken.price.toLocaleString()}</div>
                </div>

                <div className="token-input-section">
                  <label className="input-label" htmlFor="left-amount">
                    Amount
                  </label>
                  <input
                    id="left-amount"
                    type="text"
                    className="token-input"
                    value={leftAmount}
                    onChange={handleLeftAmountChange}
                    placeholder="0.00"
                    aria-label="Source token amount"
                    inputMode="decimal"
                  />
                  <div className="token-value">
                    ≈ $
                    {leftToken.price && leftAmount
                      ? (parseFloat(leftAmount) * leftToken.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : '0.00'}{' '}
                    USD
                  </div>
                </div>

                <div className="token-meta">
                  <div className="meta-item">
                    <span className="meta-label">Chain ID:</span>
                    <span className="meta-value">{leftToken.chainId}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">24h:</span>
                    <span className="meta-value" style={{ color: 'var(--success-color)' }}>
                      +2.4%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">Select a token</div>
            )}
          </div>

          {/* Arrow/Swap Button */}
          <button
            className="swap-arrow"
            onClick={handleSwap}
            disabled={isLoading}
            aria-label="Swap tokens"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Right Token Card */}
          <div className="token-card">
            {isLoading ? (
              <div className="loading-state">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-price"></div>
                <div className="skeleton skeleton-input"></div>
              </div>
            ) : rightToken ? (
              <>
                {/* Token Selector */}
                <div className="card-token-selector">
                  <select
                    className="card-token-dropdown"
                    value={rightToken?.symbol || 'ETH'}
                    onChange={(e) => {
                      const token = tokens.find((t) => t.symbol === e.target.value)
                      if (token) setRightToken(token)
                    }}
                    disabled={isLoading}
                    aria-label="Select target token"
                  >
                    {SUPPORTED_TOKENS.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.icon} {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="token-header">
                  <div className="token-identity">
                    <span className="token-emoji">{rightToken.icon}</span>
                    <div className="token-details">
                      <h2 className="token-symbol">{rightToken.symbol}</h2>
                      <p className="token-name">{rightToken.name}</p>
                    </div>
                  </div>
                  <div className="token-price">${rightToken.price.toLocaleString()}</div>
                </div>

                <div className="token-input-section">
                  <label className="input-label" htmlFor="right-amount">
                    Amount
                  </label>
                  <input
                    id="right-amount"
                    type="text"
                    className="token-input"
                    value={rightAmount}
                    onChange={handleRightAmountChange}
                    placeholder="0.00"
                    aria-label="Target token amount"
                    inputMode="decimal"
                  />
                  <div className="token-value">
                    ≈ $
                    {rightToken.price && rightAmount
                      ? (parseFloat(rightAmount) * rightToken.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : '0.00'}{' '}
                    USD
                  </div>
                </div>

                <div className="token-meta">
                  <div className="meta-item">
                    <span className="meta-label">Chain ID:</span>
                    <span className="meta-value">{rightToken.chainId}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">24h:</span>
                    <span className="meta-value" style={{ color: 'var(--danger-color)' }}>
                      -1.2%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">Select a token</div>
            )}
          </div>
        </div>

        {/* Exchange Rate Info */}
        {leftToken && rightToken && (
          <div className="exchange-info">
            <div className="rate-display">
              <div className="rate-item">
                <span className="rate-label">Exchange Rate:</span>
                <span className="rate-value">
                  1 {leftToken.symbol} = {(leftToken.price / rightToken.price).toFixed(6)}{' '}
                  {rightToken.symbol}
                </span>
              </div>
              <div className="rate-badge">
                <span>⚡</span>
                <span>Live</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
