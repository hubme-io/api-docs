"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToken } from "@/components/token-provider";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

interface TokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TokenDialog({ open, onOpenChange }: TokenDialogProps) {
  const {
    token,
    setToken,
    clearToken,
    isTokenValid,
    tokenError,
    isValidating,
  } = useToken();
  const [inputToken, setInputToken] = useState(token);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (open) {
      setInputToken(token);
    }
  }, [open, token]);

  const handleSave = async () => {
    if (inputToken.trim()) {
      await setToken(inputToken.trim());
      // Only close if token is valid
      if (!tokenError) {
        onOpenChange(false);
      }
    }
  };

  const handleClear = () => {
    clearToken();
    setInputToken("");
    onOpenChange(false);
  };

  const handleTestToken = () => {
    if (inputToken.trim()) {
      setToken(inputToken.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Token de Acesso da API</DialogTitle>
          <DialogDescription>
            Digite seu token de acesso da API Managefy para testar endpoints
            diretamente da documentação. Este token será incluído no cabeçalho
            access-token de todas as requisições.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Token Status */}
          {token && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : isTokenValid ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">
                Status:{" "}
                {isValidating
                  ? "Validando..."
                  : isTokenValid
                  ? "Token válido"
                  : "Token inválido"}
              </span>
            </div>
          )}

          {/* Error Display */}
          {tokenError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{tokenError}</AlertDescription>
            </Alert>
          )}

          {/* Token Input */}
          <div className="space-y-2">
            <Label htmlFor="token">Access Token</Label>
            <div className="relative">
              <Input
                id="token"
                type={showToken ? "text" : "password"}
                placeholder="$2b$10$kkFV0hki4OcWVTz.g...."
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                className="pr-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 px-2 text-xs"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Exemplo: $2b$10$kkFV0hki4OcWVTz.g....
            </p>
          </div>

          {/* Test Token Button */}
          {inputToken && inputToken !== token && (
            <Button
              variant="outline"
              onClick={handleTestToken}
              disabled={isValidating}
              className="w-full"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando Token...
                </>
              ) : (
                "Testar Token"
              )}
            </Button>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClear}>
              Limpar Token
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isValidating || !inputToken.trim()}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  "Salvar Token"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
