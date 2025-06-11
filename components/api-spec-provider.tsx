"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface ApiSpec {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers: Array<{
    url: string
    description?: string
  }>
  paths: Record<string, any>
  components?: {
    schemas?: Record<string, any>
    securitySchemes?: Record<string, any>
  }
  tags?: Array<{
    name: string
    description?: string
  }>
}

interface ApiSpecContextType {
  apiSpec: ApiSpec | null
  loading: boolean
  error: string | null
  loadApiSpec: (url: string) => Promise<void>
}

const ApiSpecContext = createContext<ApiSpecContextType | undefined>(undefined)

export function ApiSpecProvider({ children }: { children: ReactNode }) {
  const [apiSpec, setApiSpec] = useState<ApiSpec | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadApiSpec = async (url: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to load API spec: ${response.statusText}`)
      }
      const spec = await response.json()

      // Override the server URL to use the correct production endpoint
      spec.servers = [
        {
          url: "https://devapi.managefy.com.br/integration",
          description: "Managefy Development API",
        },
      ]

      setApiSpec(spec)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API spec")
    } finally {
      setLoading(false)
    }
  }

  // Load default API spec
  useEffect(() => {
    // Load the swagger.json file from the public directory
    loadApiSpec("/swagger.json").catch((err) => {
      console.error("Failed to load swagger.json:", err)
      setError("Failed to load API specification")
    })
  }, [])

  return <ApiSpecContext.Provider value={{ apiSpec, loading, error, loadApiSpec }}>{children}</ApiSpecContext.Provider>
}

export function useApiSpec() {
  const context = useContext(ApiSpecContext)
  if (context === undefined) {
    throw new Error("useApiSpec must be used within an ApiSpecProvider")
  }
  return context
}
