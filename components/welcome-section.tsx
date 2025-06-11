"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApiSpec } from "@/components/api-spec-provider"
import { Code, Zap, Shield, Globe } from "lucide-react"

export function WelcomeSection() {
  const { apiSpec } = useApiSpec()

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Managefy API</h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Documentação completa da API do Managefy para integração com folhas de pagamento e gestão de fornecedores
        </p>
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-sm">
            Versão {apiSpec?.info.version || "1.0"}
          </Badge>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="h-full">
          <CardHeader className="text-center pb-4">
            <Code className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <CardTitle className="text-lg">Testes Interativos</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Teste os endpoints da API diretamente na documentação com seu token de acesso.
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="text-center pb-4">
            <Zap className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
            <CardTitle className="text-lg">Exemplos em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Veja exemplos de requisições e respostas com dados reais da sua API.
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="text-center pb-4">
            <Shield className="w-8 h-8 mx-auto text-green-600 mb-2" />
            <CardTitle className="text-lg">Autenticação Segura</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Armazene e gerencie seus tokens de API de forma segura para requisições autenticadas.
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="text-center pb-4">
            <Globe className="w-8 h-8 mx-auto text-purple-600 mb-2" />
            <CardTitle className="text-lg">Integração Simples</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Documentação clara e exemplos práticos para facilitar a integração.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Overview */}
      {apiSpec && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl lg:text-2xl">API Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 text-lg">Base URLs</h4>
              <div className="space-y-2">
                {apiSpec.servers?.map((server, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">{server.url}</code>
                    {server.description && <span className="text-sm text-gray-600">- {server.description}</span>}
                  </div>
                ))}
              </div>
            </div>

            {apiSpec.tags && (
              <div>
                <h4 className="font-semibold mb-3 text-lg">Available Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {apiSpec.tags.map((tag) => (
                    <Badge key={tag.name} variant="outline" className="text-sm">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
