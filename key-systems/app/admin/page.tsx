"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Key, Users, BarChart3, Trash2, Copy } from "lucide-react"

interface KeyData {
  id: string
  key: string
  ip_lock?: string
  hwid_lock?: string
  created_at: string
  expires_at?: string
  used_count: number
  status: "active" | "expired" | "revoked"
}

interface UsageLog {
  id: string
  key_id: string
  ip: string
  hwid?: string
  timestamp: string
  success: boolean
}

interface Analytics {
  totalKeys: number
  activeKeys: number
  totalUsage: number
  todayUsage: number
}

export default function AdminPage() {
  const [keys, setKeys] = useState<KeyData[]>([])
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    totalKeys: 0,
    activeKeys: 0,
    totalUsage: 0,
    todayUsage: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Key generation form
  const [keyCount, setKeyCount] = useState(1)
  const [lockType, setLockType] = useState<"none" | "ip" | "hwid">("none")
  const [expiryDays, setExpiryDays] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [keysRes, logsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/keys"),
        fetch("/api/admin/logs"),
        fetch("/api/admin/analytics"),
      ])

      if (keysRes.ok) setKeys(await keysRes.json())
      if (logsRes.ok) setLogs(await logsRes.json())
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
    } catch (err) {
      setError("Failed to load admin data")
    }
  }

  const generateKeys = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/generate-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: keyCount,
          lockType,
          expiryDays: expiryDays ? Number.parseInt(expiryDays) : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate keys")

      const data = await response.json()
      setSuccess(`Generated ${data.count} keys successfully`)
      loadData()
    } catch (err) {
      setError("Failed to generate keys")
    } finally {
      setLoading(false)
    }
  }

  const deleteKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/admin/keys/${keyId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete key")

      setSuccess("Key deleted successfully")
      loadData()
    } catch (err) {
      setError("Failed to delete key")
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setSuccess("Key copied to clipboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your script key system</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalKeys}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeKeys}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsage}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.todayUsage}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="keys">Key Management</TabsTrigger>
            <TabsTrigger value="logs">Usage Logs</TabsTrigger>
            <TabsTrigger value="generate">Generate Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <CardTitle>License Keys</CardTitle>
                <CardDescription>Manage all generated license keys</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Lock Type</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-mono text-sm">{key.key.substring(0, 16)}...</TableCell>
                        <TableCell>
                          {key.ip_lock && <Badge variant="outline">IP</Badge>}
                          {key.hwid_lock && <Badge variant="outline">HWID</Badge>}
                          {!key.ip_lock && !key.hwid_lock && <Badge variant="secondary">None</Badge>}
                        </TableCell>
                        <TableCell>{key.used_count}</TableCell>
                        <TableCell>
                          <Badge variant={key.status === "active" ? "default" : "destructive"}>{key.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => copyKey(key.key)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteKey(key.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Usage Logs</CardTitle>
                <CardDescription>Track key verification attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>HWID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.key_id.substring(0, 8)}...</TableCell>
                        <TableCell>{log.ip}</TableCell>
                        <TableCell>{log.hwid || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={log.success ? "default" : "destructive"}>
                            {log.success ? "Success" : "Failed"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Keys</CardTitle>
                <CardDescription>Create new license keys with custom settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyCount">Number of Keys</Label>
                    <Input
                      id="keyCount"
                      type="number"
                      min="1"
                      max="100"
                      value={keyCount}
                      onChange={(e) => setKeyCount(Number.parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lockType">Lock Type</Label>
                    <Select value={lockType} onValueChange={(value: any) => setLockType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Lock</SelectItem>
                        <SelectItem value="ip">IP Address</SelectItem>
                        <SelectItem value="hwid">Hardware ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDays">Expiry (Days)</Label>
                    <Input
                      id="expiryDays"
                      type="number"
                      placeholder="Never expires"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={generateKeys} disabled={loading} className="w-full">
                  {loading ? "Generating..." : `Generate ${keyCount} Key${keyCount > 1 ? "s" : ""}`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
