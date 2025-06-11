"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Key, Book, Rocket, Code, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApiSpec } from "@/components/api-spec-provider"
import { useToken } from "@/components/token-provider"
import { TokenDialog } from "@/components/token-dialog"

interface SidebarProps {
  selectedSection: string
  selectedEndpoint: string | null
  onSectionSelect: (section: string) => void
  onEndpointSelect: (endpoint: string | null) => void
}

export function Sidebar({ selectedSection, selectedEndpoint, onSectionSelect, onEndpointSelect }: SidebarProps) {
  const { apiSpec } = useApiSpec()
  const { token, isTokenValid, tokenError, isValidating } = useToken()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Folhas de Pagamento", "Fornecedores"]),
  )
  const [showTokenDialog, setShowTokenDialog] = useState(false)

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const getEndpointsByTag = () => {
    if (!apiSpec?.paths) return {}

    const endpointsByTag: Record<string, Array<{ path: string; method: string; operation: any }>> = {}

    Object.entries(apiSpec.paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (typeof operation === "object" && operation.tags) {
          operation.tags.forEach((tag: string) => {
            if (!endpointsByTag[tag]) {
              endpointsByTag[tag] = []
            }
            endpointsByTag[tag].push({ path, method: method.toUpperCase(), operation })
          })
        }
      })
    })

    return endpointsByTag
  }

  const endpointsByTag = getEndpointsByTag()

  const getTokenStatusIcon = () => {
    if (isValidating) {
      return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    }
    if (!token) {
      return <Key className="w-4 h-4 text-gray-500" />
    }
    if (tokenError) {
      return <XCircle className="w-4 h-4 text-red-500" />
    }
    if (isTokenValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  }

  const getTokenStatusText = () => {
    if (isValidating) return "Validando..."
    if (!token) return "Sem Token"
    if (tokenError) return "Token Inválido"
    if (isTokenValid) return "Token Válido"
    return "Token Pendente"
  }

  const getTokenStatusColor = () => {
    if (isValidating) return "text-blue-600"
    if (!token) return "text-gray-600"
    if (tokenError) return "text-red-600"
    if (isTokenValid) return "text-green-600"
    return "text-yellow-600"
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Code className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Managefy API</h1>
        </div>

        {/* Token Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {getTokenStatusIcon()}
              <span className={`text-sm truncate ${getTokenStatusColor()}`}>{getTokenStatusText()}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowTokenDialog(true)} className="shrink-0">
              {token ? "Atualizar" : "Definir Token"}
            </Button>
          </div>

          {tokenError && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded max-h-16 overflow-y-auto">
              <p className="line-clamp-3">{tokenError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <nav className="p-4 space-y-2">
          {/* Main Sections */}
          <div className="space-y-1">
            <Button
              variant={selectedSection === "welcome" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onSectionSelect("welcome")
                onEndpointSelect(null)
              }}
            >
              <Book className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">Bem-vindo</span>
            </Button>

            <Button
              variant={selectedSection === "getting-started" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onSectionSelect("getting-started")
                onEndpointSelect(null)
              }}
            >
              <Rocket className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">Primeiros Passos</span>
            </Button>
          </div>

          {/* API Categories */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">APIs</h3>

            {Object.entries(endpointsByTag).map(([tag, endpoints]) => (
              <div key={tag} className="mb-2">
                <Button variant="ghost" className="w-full justify-start p-2 h-auto" onClick={() => toggleCategory(tag)}>
                  {expandedCategories.has(tag) ? (
                    <ChevronDown className="w-4 h-4 mr-2 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2 shrink-0" />
                  )}
                  <span className="font-medium truncate">{tag}</span>
                  <span className="ml-auto text-xs text-gray-500 shrink-0">{endpoints.length}</span>
                </Button>

                {expandedCategories.has(tag) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {endpoints.map(({ path, method, operation }) => {
                      const endpointId = `${method}:${path}`
                      return (
                        <Button
                          key={endpointId}
                          variant={selectedEndpoint === endpointId ? "secondary" : "ghost"}
                          className="w-full justify-start text-sm p-2 h-auto"
                          onClick={() => {
                            onSectionSelect("api")
                            onEndpointSelect(endpointId)
                          }}
                        >
                          <span
                            className={`inline-block w-12 text-xs font-mono rounded px-1 mr-2 shrink-0 ${
                              method === "GET"
                                ? "bg-green-100 text-green-800"
                                : method === "POST"
                                  ? "bg-blue-100 text-blue-800"
                                  : method === "PUT"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : method === "DELETE"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {method}
                          </span>
                          <span className="truncate">{operation.summary || path}</span>
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>

      <TokenDialog open={showTokenDialog} onOpenChange={setShowTokenDialog} />
    </div>
  )
}
