"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Copy, Download, RefreshCw, CheckCircle, XCircle, Info, ArrowRightLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TextBase64Converter() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [error, setError] = useState("")
  const [lastOperation, setLastOperation] = useState<"encode" | "decode" | null>(null)
  const { toast } = useToast()

  const encodeToBase64 = () => {
    setError("")

    try {
      if (!inputText.trim()) {
        throw new Error("Por favor ingresa texto para codificar")
      }

      // Encode text to Base64 with proper UTF-8 handling
      const result = btoa(unescape(encodeURIComponent(inputText)))
      setOutputText(result)
      setLastOperation("encode")

      toast({
        title: "Codificación exitosa",
        description: "El texto ha sido codificado a Base64",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al codificar")
    }
  }

  const decodeFromBase64 = () => {
    setError("")

    try {
      if (!inputText.trim()) {
        throw new Error("Por favor ingresa texto Base64 para decodificar")
      }

      // Validate Base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
      const cleanInput = inputText.replace(/\s/g, "")

      if (!base64Regex.test(cleanInput)) {
        throw new Error("El texto no tiene un formato Base64 válido")
      }

      // Decode Base64 to text with proper UTF-8 handling
      const decoded = atob(cleanInput)
      const result = decodeURIComponent(escape(decoded))

      setOutputText(result)
      setLastOperation("decode")

      toast({
        title: "Decodificación exitosa",
        description: "El Base64 ha sido decodificado a texto",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al decodificar")
    }
  }

  const swapInputOutput = () => {
    const temp = inputText
    setInputText(outputText)
    setOutputText(temp)
    setLastOperation(null)
    setError("")

    toast({
      title: "Intercambiado",
      description: "Entrada y salida han sido intercambiadas",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Contenido copiado al portapapeles",
    })
  }

  const downloadAsFile = (content: string, filename: string) => {
    if (!content) return

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Descarga iniciada",
      description: `Descargando ${filename}`,
    })
  }

  const clearAll = () => {
    setInputText("")
    setOutputText("")
    setError("")
    setLastOperation(null)
  }

  const isValidBase64 = (str: string) => {
    try {
      const cleanStr = str.replace(/\s/g, "")
      if (cleanStr === "") return false
      return btoa(atob(cleanStr)) === cleanStr
    } catch {
      return false
    }
  }

  const getTextStats = (text: string) => {
    const bytes = new TextEncoder().encode(text).length
    const lines = text.split("\n").length
    return { chars: text.length, bytes, lines }
  }

  const inputStats = getTextStats(inputText)
  const outputStats = getTextStats(outputText)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Codificador/Decodificador Base64 para Texto</h1>
        <p className="text-muted-foreground">
          Convierte texto a Base64 y viceversa. Soporta caracteres UTF-8 incluyendo acentos, emojis y símbolos
          especiales.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Texto de Entrada
                {inputText && isValidBase64(inputText) && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Base64 detectado
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Ingresa el texto que quieres codificar o el Base64 que quieres decodificar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input-text">Texto</Label>
                <Textarea
                  id="input-text"
                  placeholder="Ingresa tu texto aquí... Soporta acentos (José), emojis (🚀) y cualquier carácter UTF-8"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[150px] font-mono text-sm"
                />
                {inputText && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {inputStats.chars} caracteres
                    </span>
                    <span>{inputStats.bytes} bytes</span>
                    <span>{inputStats.lines} líneas</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={encodeToBase64} className="flex-1">
                  Codificar a Base64
                </Button>
                <Button onClick={decodeFromBase64} variant="outline" className="flex-1 bg-transparent">
                  Decodificar Base64
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Resultado
                {lastOperation && (
                  <Badge variant="default">{lastOperation === "encode" ? "Codificado" : "Decodificado"}</Badge>
                )}
              </CardTitle>
              <CardDescription>El texto convertido aparecerá aquí</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="output-text">Resultado</Label>
                <Textarea
                  id="output-text"
                  value={outputText}
                  onChange={(e) => setOutputText(e.target.value)}
                  placeholder="El resultado aparecerá aquí..."
                  className="min-h-[150px] font-mono text-sm"
                />
                {outputText && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {outputStats.chars} caracteres
                    </span>
                    <span>{outputStats.bytes} bytes</span>
                    <span>{outputStats.lines} líneas</span>
                  </div>
                )}
              </div>

              {outputText && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(outputText)} className="flex-1">
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadAsFile(outputText, lastOperation === "encode" ? "encoded.txt" : "decoded.txt")
                    }
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={swapInputOutput}
                className="w-full bg-transparent"
                disabled={!inputText && !outputText}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Intercambiar Entrada ↔ Salida
              </Button>

              <Button variant="outline" onClick={clearAll} className="w-full bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar Todo
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1">Soporte UTF-8 completo:</h4>
                <p className="text-muted-foreground">
                  Maneja correctamente acentos (José), símbolos (€), emojis (🚀) y cualquier carácter Unicode.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Detección automática:</h4>
                <p className="text-muted-foreground">
                  La app detecta si el texto de entrada es Base64 válido y muestra una indicación visual.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Casos de uso:</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Codificar datos para APIs</li>
                  <li>• Decodificar tokens y configuraciones</li>
                  <li>• Transmitir texto con caracteres especiales</li>
                  <li>• Debug de aplicaciones web</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
