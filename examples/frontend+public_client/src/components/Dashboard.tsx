import { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { getTokenInfo, clearTokenInfo } from '@/utils/oauth'
import { transactionApi } from '@/utils/api'
import { LogOut, TestTube } from 'lucide-react'

interface ConsoleLog {
  timestamp: string
  type: 'request' | 'response' | 'error'
  message: string
  data?: unknown
}

export function Dashboard() {
  const [tokenInfo, setTokenInfo] = useState(getTokenInfo())
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const info = getTokenInfo()
    setTokenInfo(info)
    if (!info) {
      addLog('error', 'No valid token found. Please login again.')
    } else {
      addLog('response', 'Token loaded successfully', {
        expiresIn: `${Math.floor(info.expiresIn / 60)} minutes`,
        expiration: new Date(info.expiration).toLocaleString(),
      })
    }
  }, [])

  const addLog = (type: ConsoleLog['type'], message: string, data?: unknown) => {
    const log: ConsoleLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data,
    }
    setConsoleLogs((prev) => [...prev, log])
  }

  const handleTestApi = async () => {
    try {
      setIsLoading(true)
      addLog('request', 'Testing transaction API...')
      
      const response = await transactionApi.test()
      
      addLog('response', 'API call successful', response)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addLog('error', `API call failed: ${errorMessage}`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearTokenInfo()
    addLog('response', 'Logged out successfully')
    window.location.href = '/'
  }

  const clearConsole = () => {
    setConsoleLogs([])
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-foreground">XION OAUTH2 DEMO</h1>
            <p className="mt-2 text-muted-foreground">
              OAuth2 authenticated dashboard
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {tokenInfo && (
          <div className="rounded-lg border border-white/20 bg-card p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Token Information
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Access Token:</span>
                <span className="font-mono text-xs break-all">
                  {tokenInfo.accessToken.substring(0, 20)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires In:</span>
                <span>{Math.floor(tokenInfo.expiresIn / 60)} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expiration:</span>
                <span>{new Date(tokenInfo.expiration).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-white/20 bg-card p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">
            API Test Functions
          </h2>
          <div className="space-y-3">
            <Button
              onClick={handleTestApi}
              disabled={isLoading}
              variant="outline"
              fullWidth
            >
              <TestTube className="mr-2 h-4 w-4" />
              {isLoading ? 'Testing...' : 'Test Transaction API'}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-white/20 bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-card-foreground">
              Console Output
            </h2>
            <Button variant="ghost" size="sm" onClick={clearConsole}>
              Clear
            </Button>
          </div>
          <div className="h-96 overflow-y-auto rounded-md bg-[#0A0A0A] p-4 font-mono text-sm custom-scrollbar">
            {consoleLogs.length === 0 ? (
              <div className="text-muted-foreground">No logs yet...</div>
            ) : (
              <div className="space-y-3">
                {consoleLogs.map((log, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <div className="flex gap-2 items-center">
                      <span className="text-muted-foreground">[{log.timestamp}]</span>
                      <span
                        className={
                          log.type === 'error'
                            ? 'text-red-500 font-semibold'
                            : log.type === 'request'
                            ? 'text-yellow-500 font-semibold'
                            : 'text-green-500 font-semibold'
                        }
                      >
                        [{log.type.toUpperCase()}]
                      </span>
                      <span className="text-foreground">{log.message}</span>
                    </div>
                    {log.data !== undefined && (
                      <pre className="ml-6 text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

