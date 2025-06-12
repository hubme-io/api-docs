"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiSpec } from "@/components/api-spec-provider";
import { useToken } from "@/components/token-provider";
import {
  Copy,
  Play,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  FileText,
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ApiEndpointSectionProps {
  endpointId: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  requestUrl: string;
  requestHeaders: Record<string, string>;
  requestTime: number;
  error?: string;
}

export function ApiEndpointSection({ endpointId }: ApiEndpointSectionProps) {
  const { apiSpec } = useApiSpec();
  const { token, isTokenValid, tokenError } = useToken();
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("request");

  const [method, path] = endpointId.split(":");
  const operation = apiSpec?.paths?.[path]?.[method.toLowerCase()];

  if (!operation) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">
          Endpoint não encontrado
        </h2>
        <p className="text-gray-500">
          O endpoint selecionado não pôde ser carregado.
        </p>
      </div>
    );
  }

  const handleParameterChange = (name: string, value: string) => {
    setParameters((prev) => ({ ...prev, [name]: value }));
  };

  const executeRequest = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      let targetPath = path;

      // Replace path parameters
      Object.entries(parameters).forEach(([key, value]) => {
        targetPath = targetPath.replace(`{${key}}`, encodeURIComponent(value));
      });

      // Build query parameters
      const queryParams = new URLSearchParams();
      operation.parameters?.forEach((param: any) => {
        if (param.in === "query" && parameters[param.name]) {
          queryParams.append(param.name, parameters[param.name]);
        }
      });

      // Build the proxy URL
      let proxyUrl = `/api/proxy?path=${encodeURIComponent(targetPath)}`;
      if (queryParams.toString()) {
        proxyUrl += `&${queryParams.toString()}`;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["access-token"] = token;
      }

      const requestOptions: RequestInit = {
        method,
        headers,
      };

      if (["POST", "PUT", "PATCH"].includes(method) && requestBody) {
        requestOptions.body = requestBody;
      }

      console.log("Making proxied API request:", {
        proxyUrl,
        headers: { ...headers, "access-token": token ? "***" : "not set" },
        method,
        body: requestBody,
      });

      const response = await fetch(proxyUrl, requestOptions);
      const requestTime = Date.now() - startTime;

      let result: any;
      try {
        result = await response.json();
      } catch (parseError) {
        result = {
          error: `Error parsing proxy response: ${parseError}`,
          status: response.status,
          statusText: response.statusText,
          headers: {},
          data: null,
        };
      }

      // The proxy returns the actual API response wrapped in a result object
      setResponse({
        status: result.status || response.status,
        statusText: result.statusText || response.statusText,
        headers: result.headers || {},
        data: result.data,
        requestUrl: `https://devapi.managefy.com.br/integration${targetPath}${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`,
        requestHeaders: headers,
        requestTime,
        error: result.error,
      });

      // Switch to response tab after successful request
      setActiveTab("response");
    } catch (error) {
      console.error("Proxied API request error:", error);

      let errorMessage = "Request failed";
      if (error instanceof TypeError) {
        if (error.message.includes("fetch")) {
          errorMessage = "Erro de rede: Verifique sua conexão com a internet";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Falha na requisição: Servidor indisponível";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setResponse({
        status: 0,
        statusText: "Network Error",
        headers: {},
        data: null,
        requestUrl: `https://devapi.managefy.com.br/integration${path}`,
        requestHeaders: { "access-token": token ? "***" : "not set" },
        requestTime: Date.now() - startTime,
        error: errorMessage,
      });

      // Switch to response tab to show error
      setActiveTab("response");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateCurlCommand = () => {
    let url = `https://devapi.managefy.com.br/integration${path}`;

    // Replace path parameters
    Object.entries(parameters).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });

    // Add query parameters
    const queryParams = new URLSearchParams();
    operation.parameters?.forEach((param: any) => {
      if (param.in === "query" && parameters[param.name]) {
        queryParams.append(param.name, parameters[param.name]);
      }
    });

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    let curl = `curl -X '${method}' \\\n  '${url}' \\\n  -H 'accept: */*'`;

    if (token) {
      curl += ` \\\n  -H 'access-token: ${token}'`;
    }

    if (["POST", "PUT", "PATCH"].includes(method) && requestBody) {
      curl += ` \\\n  -H 'Content-Type: application/json' \\\n  -d '${requestBody}'`;
    }

    return curl;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800";
      case "POST":
        return "bg-blue-100 text-blue-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Extract schema properties for field explanations
  const getRequestSchema = () => {
    if (!operation.requestBody?.content?.["application/json"]?.schema)
      return null;
    return operation.requestBody.content["application/json"].schema;
  };

  const getResponseSchema = () => {
    if (!operation.responses?.["200"]?.content?.["application/json"]?.schema)
      return null;
    return operation.responses["200"].content["application/json"].schema;
  };

  const renderSchemaProperties = (schema: any) => {
    if (!schema || !schema.properties) return null;

    return (
      <div className="space-y-4">
        {Object.entries(schema.properties).map(
          ([name, prop]: [string, any]) => (
            <div
              key={name}
              className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{name}</span>
                  <Badge variant="outline" className="text-xs">
                    {prop.type || "object"}
                  </Badge>
                  {schema.required?.includes(name) && (
                    <Badge variant="destructive" className="text-xs">
                      Obrigatório
                    </Badge>
                  )}
                </div>
              </div>
              {prop.description && (
                <p className="mt-1 text-sm text-gray-600">{prop.description}</p>
              )}
              {prop.enum && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-gray-500">
                    Valores permitidos:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {prop.enum.map((value: string) => (
                      <Badge
                        key={value}
                        variant="secondary"
                        className="text-xs"
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {prop.example && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-gray-500">
                    Exemplo:
                  </span>
                  <code className="ml-2 text-xs text-gray-800">
                    {JSON.stringify(prop.example)}
                  </code>
                </div>
              )}
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header - Endpoint Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Badge className={`font-mono w-fit ${getMethodColor(method)}`}>
            {method}
          </Badge>
          <code className="text-base sm:text-lg font-mono bg-gray-100 px-3 py-1 rounded break-all">
            {path}
          </code>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">
            {operation.summary || `${method} ${path}`}
          </h1>
          {operation.description && (
            <p className="text-gray-600 leading-relaxed">
              {operation.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column - Request & Response */}
        <div className="lg:col-span-7 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle>Testar Endpoint</CardTitle>
                <div className="flex items-center gap-2">
                  {!token && (
                    <Badge
                      variant="outline"
                      className="gap-1 text-amber-600 border-amber-200 bg-amber-50"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>Sem Token</span>
                    </Badge>
                  )}
                  {token && !isTokenValid && (
                    <Badge
                      variant="outline"
                      className="gap-1 text-red-600 border-red-200 bg-red-50"
                    >
                      <XCircle className="h-3 w-3" />
                      <span>Token Inválido</span>
                    </Badge>
                  )}
                  {token && isTokenValid && (
                    <Badge
                      variant="outline"
                      className="gap-1 text-green-600 border-green-200 bg-green-50"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Token Válido</span>
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <TabsList className="w-full rounded-none border-b px-6">
                <TabsTrigger value="request" className="text-sm">
                  Requisição
                </TabsTrigger>
                <TabsTrigger value="response" className="text-sm">
                  Resposta
                  {response && (
                    <Badge
                      variant={
                        response.error || response.status >= 400
                          ? "destructive"
                          : "default"
                      }
                      className="ml-2 text-xs"
                    >
                      {response.error ? "Erro" : response.status}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="request"
                className="flex-1 flex flex-col p-0 m-0"
              >
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Parameters */}
                  {operation.parameters && operation.parameters.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Parâmetros
                      </h3>
                      <div className="space-y-4">
                        {operation.parameters.map((param: any) => (
                          <div key={param.name} className="space-y-2">
                            <Label
                              htmlFor={param.name}
                              className="flex flex-wrap items-center gap-2"
                            >
                              <span className="break-words">{param.name}</span>
                              {param.required && (
                                <span className="text-red-500">*</span>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {param.in}
                              </Badge>
                            </Label>
                            <Input
                              id={param.name}
                              placeholder={
                                param.schema?.example ||
                                param.description ||
                                `Digite ${param.name}`
                              }
                              value={parameters[param.name] || ""}
                              onChange={(e) =>
                                handleParameterChange(
                                  param.name,
                                  e.target.value
                                )
                              }
                              className="w-full"
                            />
                            {param.description && (
                              <p className="text-xs text-gray-500 leading-relaxed">
                                {param.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Execute Button */}
                  <div className="border-t p-4">
                    <Button
                      onClick={executeRequest}
                      disabled={loading}
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {loading ? "Enviando Requisição..." : "Enviar Requisição"}
                    </Button>
                  </div>

                  {/* Request Body */}
                  {["POST", "PUT", "PATCH"].includes(method) &&
                    operation.requestBody && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Corpo da Requisição
                        </h3>
                        <Textarea
                          placeholder="Digite o JSON do corpo da requisição..."
                          value={requestBody}
                          onChange={(e) => setRequestBody(e.target.value)}
                          rows={8}
                          className="font-mono text-sm w-full resize-y"
                        />
                      </div>
                    )}
                </div>
              </TabsContent>

              <TabsContent
                value="response"
                className="flex-1 flex flex-col p-0 m-0"
              >
                {response ? (
                  <div className="flex-1 flex flex-col">
                    <div className="border-b bg-gray-50 px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            response.error || response.status >= 400
                              ? "destructive"
                              : "default"
                          }
                        >
                          {response.error ? "Erro" : response.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {response.statusText}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {response.requestTime}ms
                      </span>
                    </div>

                    <Tabs defaultValue="body" className="flex-1 flex flex-col">
                      <TabsList className="w-full rounded-none border-b px-6">
                        <TabsTrigger value="body" className="text-xs">
                          Corpo
                        </TabsTrigger>
                        <TabsTrigger value="headers" className="text-xs">
                          Cabeçalhos
                        </TabsTrigger>
                        <TabsTrigger value="request" className="text-xs">
                          Detalhes da Requisição
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="body" className="flex-1 p-0 m-0">
                        <div className="bg-gray-900 text-gray-100 h-full">
                          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-4">
                            <pre className="text-xs sm:text-sm whitespace-pre-wrap">
                              {response.error
                                ? `Error: ${response.error}`
                                : JSON.stringify(response.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="headers" className="flex-1 p-0 m-0">
                        <div className="bg-gray-900 text-gray-100 h-full">
                          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-4">
                            <pre className="text-xs sm:text-sm">
                              {JSON.stringify(response.headers, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="request" className="flex-1 p-0 m-0">
                        <div className="bg-gray-900 text-gray-100 h-full">
                          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-4 space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-200">
                                URL
                              </h4>
                              <code className="text-xs sm:text-sm bg-gray-800 p-2 rounded block break-all">
                                {response.requestUrl}
                              </code>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-200">
                                Cabeçalhos da Requisição
                              </h4>
                              <div className="bg-gray-800 p-4 rounded-lg">
                                <pre className="text-xs sm:text-sm">
                                  {JSON.stringify(
                                    response.requestHeaders,
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>Envie uma requisição para ver a resposta</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column - Documentation & Field Explanations */}
        <div className="lg:col-span-5 space-y-6">
          {/* Documentation & cURL */}
          <Card>
            <CardHeader className="border-b px-6 py-4">
              <CardTitle>Documentação</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="examples" className="w-full">
                <TabsList className="w-full rounded-none border-b">
                  <TabsTrigger value="examples" className="text-xs">
                    Exemplos
                  </TabsTrigger>
                  <TabsTrigger value="curl" className="text-xs">
                    cURL
                  </TabsTrigger>
                  <TabsTrigger value="errors" className="text-xs">
                    Erros
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="examples" className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Resposta de Sucesso (200 OK)
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(
                              {
                                data: { id: "123", name: "Exemplo" },
                                message: "Sucesso",
                              },
                              null,
                              2
                            )
                          )
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        <pre className="text-xs sm:text-sm">
                          {JSON.stringify(
                            {
                              data: { id: "123", name: "Exemplo" },
                              message: "Sucesso",
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="curl" className="p-6">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                      onClick={() => copyToClipboard(generateCurlCommand())}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <pre className="text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap pr-12 max-h-60 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                      {generateCurlCommand()}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="errors" className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <h3 className="text-sm font-semibold text-gray-700">
                        400 Bad Request
                      </h3>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-transparent">
                        <pre className="text-xs sm:text-sm">
                          {JSON.stringify(
                            {
                              error: {
                                code: "VALIDATION_ERROR",
                                message: "Parâmetros de requisição inválidos",
                              },
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <h3 className="text-sm font-semibold text-gray-700">
                        401 Unauthorized
                      </h3>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-transparent">
                        <pre className="text-xs sm:text-sm">
                          {JSON.stringify(
                            {
                              error: {
                                code: "UNAUTHORIZED",
                                message:
                                  "Token de autenticação inválido ou ausente",
                              },
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Field Explanations */}
          {/* <Card>
            <CardHeader className="border-b px-6 py-4">
              <CardTitle>Campos e Definições</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="request-fields" className="w-full">
                <TabsList className="w-full rounded-none border-b">
                  <TabsTrigger value="request-fields" className="text-xs">
                    Campos de Requisição
                  </TabsTrigger>
                  <TabsTrigger value="response-fields" className="text-xs">
                    Campos de Resposta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="request-fields" className="p-6">
                  {getRequestSchema() ? (
                    renderSchemaProperties(getRequestSchema())
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>Nenhum campo de requisição documentado</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="response-fields" className="p-6">
                  {getResponseSchema() ? (
                    renderSchemaProperties(getResponseSchema())
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>Nenhum campo de resposta documentado</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card> */}

          {/* Additional Information */}
          <Card>
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                Informações Adicionais
              </CardTitle>
              <Info className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent className="px-6 py-4 space-y-4">
              <Collapsible className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Autenticação</h4>
                  <CollapsibleTrigger className="hover:bg-gray-100 p-1 rounded-md">
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="text-sm text-gray-600 space-y-2">
                  <p>Este endpoint requer autenticação via token.</p>
                  <p className="text-xs bg-gray-50 p-2 rounded font-mono">
                    access-token: SEU_TOKEN_DE_ACESSO
                  </p>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Limitações</h4>
                  <CollapsibleTrigger className="hover:bg-gray-100 p-1 rounded-md">
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="text-sm text-gray-600">
                  <p>Limite de requisições: 100 por minuto.</p>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Versões Suportadas</h4>
                  <CollapsibleTrigger className="hover:bg-gray-100 p-1 rounded-md">
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="text-sm text-gray-600">
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">v1.0</Badge>
                    <Badge variant="outline">v1.1</Badge>
                    <Badge variant="secondary">v1.2 (atual)</Badge>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
