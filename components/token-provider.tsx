"use client"

import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from "react"

interface TokenData {
  token: string
  timestamp: number
  isValid: boolean
}

interface TokenContextType {
  token: string
  setToken: (token: string) => Promise<void>
  clearToken: () => void
  validateToken: () => Promise<boolean>
  isTokenValid: boolean
  tokenError: string | null
  isValidating: boolean
}

const TokenContext = createContext<TokenContextType | undefined>(undefined)

// Token cache duration: 1 hour
const TOKEN_CACHE_DURATION = 60 * 60 * 1000

export function TokenProvider({ children }: { children: ReactNode }) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)

  // Validate token by making a test API call through our proxy
  const validateToken = useCallback(
    async (testToken?: string): Promise<boolean> => {
      const tokenToTest = testToken || tokenData?.token
      if (!tokenToTest) return false

      setIsValidating(true)
      setTokenError(null)

      try {
        // Use our proxy API route to test the token
        const response = await fetch("/api/proxy?path=/Suppliers", {
          method: "GET",
          headers: {
            "access-token": tokenToTest,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const result = await response.json()

          // Check if the proxied request was successful
          if (result.status >= 200 && result.status < 300) {
            // Token is valid
            if (tokenToTest === tokenData?.token) {
              setTokenData((prev) => (prev ? { ...prev, isValid: true, timestamp: Date.now() } : null))
            }
            return true
          } else if (result.status === 401 || result.status === 403) {
            // Token is invalid
            setTokenError("Token inválido ou expirado")
            if (tokenToTest === tokenData?.token) {
              setTokenData((prev) => (prev ? { ...prev, isValid: false } : null))
            }
            return false
          } else {
            // Other API error
            setTokenError(`Erro na API: ${result.status} ${result.statusText}`)
            return false
          }
        } else {
          // Proxy error
          const errorData = await response.json().catch(() => ({}))
          setTokenError(`Erro no proxy: ${response.status} ${response.statusText}`)
          console.error("Proxy error:", errorData)
          return false
        }
      } catch (error) {
        console.error("Token validation error:", error)
        if (error instanceof TypeError && error.message.includes("fetch")) {
          setTokenError("Erro de rede: Verifique sua conexão com a internet")
        } else {
          setTokenError("Erro ao validar token")
        }
        return false
      } finally {
        setIsValidating(false)
      }
    },
    [tokenData?.token],
  )

  const setToken = async (newToken: string) => {
    if (!newToken.trim()) {
      setTokenError("Token não pode estar vazio")
      return
    }

    // Validate the new token
    const isValid = await validateToken(newToken)

    const newTokenData: TokenData = {
      token: newToken,
      timestamp: Date.now(),
      isValid,
    }

    setTokenData(newTokenData)

    if (isValid) {
      localStorage.setItem("managefy-token-data", JSON.stringify(newTokenData))
      setTokenError(null)
    }
  }

  const clearToken = () => {
    setTokenData(null)
    setTokenError(null)
    localStorage.removeItem("managefy-token-data")
  }

  // Load token from localStorage on mount and validate if needed
  useEffect(() => {
    const savedTokenData = localStorage.getItem("managefy-token-data")
    if (savedTokenData) {
      try {
        const parsed: TokenData = JSON.parse(savedTokenData)
        const now = Date.now()

        // Check if token is still within cache duration
        if (now - parsed.timestamp < TOKEN_CACHE_DURATION) {
          setTokenData(parsed)

          // If token was previously valid but cache is getting old, revalidate
          if (parsed.isValid && now - parsed.timestamp > TOKEN_CACHE_DURATION / 2) {
            validateToken(parsed.token)
          }
        } else {
          // Token cache expired, validate it
          setTokenData({ ...parsed, isValid: false })
          validateToken(parsed.token)
        }
      } catch (error) {
        console.error("Error parsing saved token:", error)
        localStorage.removeItem("managefy-token-data")
      }
    }
  }, [validateToken])

  // Periodic token validation (every 30 minutes)
  useEffect(() => {
    if (!tokenData?.token) return

    const interval = setInterval(
      () => {
        if (tokenData.isValid) {
          validateToken()
        }
      },
      30 * 60 * 1000,
    ) // 30 minutes

    return () => clearInterval(interval)
  }, [tokenData?.token, tokenData?.isValid, validateToken])

  return (
    <TokenContext.Provider
      value={{
        token: tokenData?.token || "",
        setToken,
        clearToken,
        validateToken: () => validateToken(),
        isTokenValid: tokenData?.isValid || false,
        tokenError,
        isValidating,
      }}
    >
      {children}
    </TokenContext.Provider>
  )
}

export function useToken() {
  const context = useContext(TokenContext)
  if (context === undefined) {
    throw new Error("useToken must be used within a TokenProvider")
  }
  return context
}
