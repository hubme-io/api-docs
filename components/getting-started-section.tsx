"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Key, Send, Code } from "lucide-react";

export function GettingStartedSection() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Primeiros Passos
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Aprenda como integrar com a API do Managefy em alguns passos simples.
        </p>
      </div>

      {/* Step 1: Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">
              1
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 shrink-0" />
              <span className="break-words">Autenticação</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Todas as requisições da API requerem autenticação usando um token de
            acesso no cabeçalho access-token.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium">
                Exemplo de Cabeçalho de Requisição
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard("access-token: SEU_TOKEN_DE_ACESSO")
                }
                className="self-start sm:self-auto"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <code className="text-sm break-all">
              access-token: SEU_TOKEN_DE_ACESSO
            </code>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 leading-relaxed">
              💡 <strong>Dica:</strong> Você pode definir seu token de API
              usando o botão "Definir Token" na barra lateral para testar os
              endpoints diretamente nesta documentação.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Making Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">
              2
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 shrink-0" />
              <span className="break-words">
                Fazendo sua Primeira Requisição
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Aqui está um exemplo simples de como fazer uma requisição GET para
            listar fornecedores:
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">cURL</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                  onClick={() =>
                    copyToClipboard(`curl -X GET "/integration/Suppliers" \\
  -H "access-token: SEU_TOKEN_DE_ACESSO" \\
  -H "Content-Type: application/json"`)
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <pre className="text-xs sm:text-sm overflow-x-auto pr-12">
                  {`curl -X GET "/integration/Suppliers" \\
  -H "access-token: SEU_TOKEN_DE_ACESSO" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">JavaScript</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                  onClick={() =>
                    copyToClipboard(`const response = await fetch('/integration/Suppliers', {
  method: 'GET',
  headers: {
    'access-token': 'SEU_TOKEN_DE_ACESSO',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`)
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <pre className="text-xs sm:text-sm overflow-x-auto pr-12">
                  {`const response = await fetch('/integration/Suppliers', {
  method: 'GET',
  headers: {
    'access-token': 'SEU_TOKEN_DE_ACESSO',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Common Use Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">
              3
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 shrink-0" />
              <span className="break-words">Casos de Uso Comuns</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            A API do Managefy oferece endpoints para os principais casos de uso:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📊 Folhas de Pagamento</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Listar folhas de pagamento por mês/ano</li>
                <li>• Obter detalhes de uma folha específica</li>
                <li>• Acessar dados de NFe vinculadas</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🏢 Fornecedores</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Listar fornecedores ativos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-gray-600 leading-relaxed">
              Agora que você entende o básico, explore os endpoints da nossa
              API:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                <span>
                  Navegue pela seção <strong>APIs</strong> na barra lateral para
                  ver todos os endpoints disponíveis
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                <span>
                  Defina seu token de API para testar os endpoints
                  interativamente
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                <span>
                  Confira os exemplos de requisição/resposta para cada endpoint
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
