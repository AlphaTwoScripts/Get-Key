"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Key, Shield, Zap } from "lucide-react"

export default function HomePage() {
  const [step, setStep] = useState<"initial" | "link" | "verify" | "success">("initial")
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [linkId, setLinkId] = useState("")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const completed = urlParams.get("completed")
    const error = urlParams.get("error")

    if (completed) {
      setLinkId(completed)
      setStep("verify")
      // Auto-verify since user came from Linkvertise
      handleVerifyCompletion()
    }

    if (error) {
      setError(getErrorMessage(error))
    }
  }, [])

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "invalid_callback":
        return "Invalid callback from Linkvertise"
      case "expired_link":
        return "Link has expired, please generate a new one"
      case "ip_mismatch":
        return "Security check failed, please try again"
      case "callback_failed":
        return "Callback processing failed"
      default:
        return "An error occurred"
    }
  }

  const handleGetKey = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/generate-link", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to generate link")

      const data = await response.json()
      setLinkId(data.linkId)

      // Simulate opening monetized link
      window.open(data.monetizedUrl, "_blank")
      setStep("link")
    } catch (err) {
      setError("Failed to generate monetized link")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCompletion = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/verify-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Verification failed")
      }

      const data = await response.json()
      setKey(data.key)
      setStep("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
      // Force user back to start if they tried to bypass
      if (err instanceof Error && err.message.includes("bypass")) {
        setStep("initial")
        setLinkId("")
      }
    } finally {
      setLoading(false)
    }
  }

  const copyKey = () => {
    navigator.clipboard.writeText(key)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Key className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Script Key System</h1>
          <p className="text-gray-600 mt-2">Get your license key to access premium scripts</p>
        </div>

        {step === "initial" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Get Your Key
              </CardTitle>
              <CardDescription>Complete a quick task to receive your script license key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  Keys are locked to your device for security
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleGetKey} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Link...
                  </>
                ) : (
                  "Get Key"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "link" && (
          <Card>
            <CardHeader>
              <CardTitle>Complete the Task</CardTitle>
              <CardDescription>
                A new tab has opened. Complete the task and return here to get your key.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleVerifyCompletion} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "I Completed the Task"
                )}
              </Button>

              <Button variant="outline" onClick={() => setStep("initial")} className="w-full">
                Start Over
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "success" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Success!</CardTitle>
              <CardDescription>Your license key has been generated and is ready to use.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">Your License Key</Label>
                <div className="flex gap-2">
                  <Input id="key" value={key} readOnly className="font-mono text-sm" />
                  <Button onClick={copyKey} variant="outline">
                    Copy
                  </Button>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This key is locked to your device. Keep it secure and don't share it.
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => {
                  setStep("initial")
                  setKey("")
                  setLinkId("")
                }}
                variant="outline"
                className="w-full"
              >
                Generate Another Key
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
