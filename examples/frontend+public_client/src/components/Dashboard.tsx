import { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { getTokenInfo, clearTokenInfo } from '@/utils/oauth'
import { transactionApi, accountApi } from '@/utils/api'
import { LogOut, Send, Info, Menu as MenuIcon, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MeResponse } from '@/types'

interface ConsoleLog {
  timestamp: string
  type: 'request' | 'response' | 'error'
  message: string
  data?: unknown
}

type MenuItem = 'token' | 'api-tests'

type ApiTestSubMenu = 'account-query' | 'send-tokens'

interface MenuOption {
  id: MenuItem
  label: string
  icon: React.ReactNode
}

const menuOptions: MenuOption[] = [
  { id: 'token', label: 'Token Info', icon: <Info className="h-4 w-4" /> },
  {
    id: 'api-tests',
    label: 'API Tests',
    icon: <Send className="h-4 w-4" />,
  },
]

const apiTestSubMenus: { id: ApiTestSubMenu; label: string }[] = [
  { id: 'account-query', label: 'Account Query' },
  { id: 'send-tokens', label: 'Send Tokens' },
]

export function Dashboard() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('token')
  const [activeApiTestSubMenu, setActiveApiTestSubMenu] =
    useState<ApiTestSubMenu>('account-query')
  const [tokenInfo, setTokenInfo] = useState(getTokenInfo())
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [isSendingTokens, setIsSendingTokens] = useState(false)
  const [isLoadingAccount, setIsLoadingAccount] = useState(false)
  const [accountData, setAccountData] = useState<MeResponse | null>(null)
  const [sendTokensForm, setSendTokensForm] = useState({
    toAddress: '',
    amount: '',
    denom: 'uxion',
  })

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

  const addLog = (
    type: ConsoleLog['type'],
    message: string,
    data?: unknown
  ) => {
    const log: ConsoleLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data,
    }
    setConsoleLogs((prev) => [...prev, log])
  }

  const handleQueryAccount = async () => {
    try {
      setIsLoadingAccount(true)
      addLog('request', 'Querying account information from /api/v1/me...')

      const response = await accountApi.getMe()
      setAccountData(response)

      addLog('response', 'Account information retrieved successfully', response)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      addLog('error', `Account query failed: ${errorMessage}`, error)
      setAccountData(null)
    } finally {
      setIsLoadingAccount(false)
    }
  }

  const handleSendTokens = async () => {
    if (!sendTokensForm.toAddress.trim()) {
      addLog('error', 'Please enter a recipient address')
      return
    }

    const amount = parseFloat(sendTokensForm.amount)
    if (isNaN(amount) || amount <= 0) {
      addLog('error', 'Please enter a valid amount (greater than 0)')
      return
    }

    try {
      setIsSendingTokens(true)
      addLog('request', 'Sending tokens...', {
        toAddress: sendTokensForm.toAddress,
        amount,
        denom: sendTokensForm.denom || 'uxion',
      })

      const response = await transactionApi.sendTokens(
        sendTokensForm.toAddress.trim(),
        amount,
        sendTokensForm.denom || undefined
      )

      addLog('response', 'Tokens sent successfully', response)

      // Reset form on success
      setSendTokensForm({
        toAddress: '',
        amount: '',
        denom: 'uxion',
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      addLog('error', `Send tokens failed: ${errorMessage}`, error)
    } finally {
      setIsSendingTokens(false)
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

  const renderApiTestForm = () => {
    switch (activeApiTestSubMenu) {
      case 'account-query':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Account Query
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">
                  API Endpoint
                </label>
                <div className="rounded-md border border-white/20 bg-input p-3">
                  <span className="font-mono text-sm text-foreground">
                    /api/v1/me
                  </span>
                </div>
              </div>
              <Button
                onClick={handleQueryAccount}
                disabled={isLoadingAccount}
                variant="outline"
                fullWidth
              >
                <User className="mr-2 h-4 w-4" />
                {isLoadingAccount ? 'Querying...' : 'Query Account'}
              </Button>

              {accountData && (
                <div className="space-y-6 mt-6">
                  {/* Meta Account Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-card-foreground">
                      Meta Account Address
                    </label>
                    <div className="rounded-md border border-white/20 bg-input p-3">
                      <span className="font-mono text-sm text-foreground break-all">
                        {accountData.id}
                      </span>
                    </div>
                  </div>

                  {/* Balances */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-card-foreground">
                      Balances
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-md border border-white/20 bg-input p-4">
                        <div className="text-xs text-muted-foreground mb-1">
                          XION
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {accountData.balances.xion.amount}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {accountData.balances.xion.denom} (
                          {accountData.balances.xion.microAmount} micro)
                        </div>
                      </div>
                      <div className="rounded-md border border-white/20 bg-input p-4">
                        <div className="text-xs text-muted-foreground mb-1">
                          USDC
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {accountData.balances.usdc.amount}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {accountData.balances.usdc.denom} (
                          {accountData.balances.usdc.microAmount} micro)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Authenticators */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-card-foreground">
                      Authenticators ({accountData.authenticators.length})
                    </label>
                    {accountData.authenticators.length > 0 ? (
                      <div className="space-y-2">
                        {accountData.authenticators.map((auth, index) => (
                          <div
                            key={auth.id || index}
                            className="rounded-md border border-white/20 bg-input p-4"
                          >
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Type:
                                </span>{' '}
                                <span className="text-foreground font-medium">
                                  {auth.type}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Index:
                                </span>{' '}
                                <span className="text-foreground font-medium">
                                  {auth.authenticatorIndex}
                                </span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">
                                  Authenticator:
                                </span>
                                <div className="mt-1 font-mono text-xs break-all text-foreground">
                                  {auth.authenticator}
                                </div>
                              </div>
                              {auth.id && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">
                                    ID:
                                  </span>
                                  <div className="mt-1 font-mono text-xs break-all text-foreground">
                                    {auth.id}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border border-white/20 bg-input p-4 text-muted-foreground">
                        No authenticators found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'send-tokens':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Send Tokens
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">
                  Recipient Address
                </label>
                <Input
                  type="text"
                  placeholder="xion1..."
                  value={sendTokensForm.toAddress}
                  onChange={(e) =>
                    setSendTokensForm({
                      ...sendTokensForm,
                      toAddress: e.target.value,
                    })
                  }
                  disabled={isSendingTokens}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={sendTokensForm.amount}
                    onChange={(e) =>
                      setSendTokensForm({
                        ...sendTokensForm,
                        amount: e.target.value,
                      })
                    }
                    disabled={isSendingTokens}
                    min="0"
                    step="0.000001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Denom (optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="uxion"
                    value={sendTokensForm.denom}
                    onChange={(e) =>
                      setSendTokensForm({
                        ...sendTokensForm,
                        denom: e.target.value,
                      })
                    }
                    disabled={isSendingTokens}
                  />
                </div>
              </div>
              <Button
                onClick={handleSendTokens}
                disabled={isSendingTokens}
                variant="outline"
                fullWidth
              >
                <Send className="mr-2 h-4 w-4" />
                {isSendingTokens ? 'Sending...' : 'Send Tokens'}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'token':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-card-foreground">
              Token Information
            </h2>
            {tokenInfo ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Access Token
                  </label>
                  <div className="rounded-md border border-white/20 bg-input p-3">
                    <span className="font-mono text-xs break-all text-foreground">
                      {tokenInfo.accessToken.substring(0, 20)}...
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Expires In
                  </label>
                  <div className="rounded-md border border-white/20 bg-input p-3">
                    <span className="text-foreground">
                      {Math.floor(tokenInfo.expiresIn / 60)} minutes
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Expiration
                  </label>
                  <div className="rounded-md border border-white/20 bg-input p-3">
                    <span className="text-foreground">
                      {new Date(tokenInfo.expiration).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                No token information available
              </div>
            )}
          </div>
        )

      case 'api-tests':
        return (
          <div className="flex flex-col h-full space-y-6">
            {/* Top Section: APIs Section with left submenu and right form */}
            <div className="flex-1 flex gap-6 min-h-0">
              {/* Left Submenu */}
              <div className="w-48 border-r border-white/20 pr-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                  APIs Section
                </h3>
                <nav className="space-y-2">
                  {apiTestSubMenus.map((subMenu) => (
                    <button
                      key={subMenu.id}
                      onClick={() => setActiveApiTestSubMenu(subMenu.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors text-sm',
                        activeApiTestSubMenu === subMenu.id
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-card-foreground hover:bg-white/5'
                      )}
                    >
                      {subMenu.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Right Form Area */}
              <div className="flex-1 min-w-0">{renderApiTestForm()}</div>
            </div>

            {/* Bottom Section: Console */}
            <div className="flex-shrink-0 border-t border-white/20 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Console Output
                </h3>
                <Button variant="ghost" size="sm" onClick={clearConsole}>
                  Clear
                </Button>
              </div>
              <div className="h-64 overflow-y-auto rounded-md border border-white/20 bg-[#0A0A0A] p-4 font-mono text-sm custom-scrollbar">
                {consoleLogs.length === 0 ? (
                  <div className="text-muted-foreground">No logs yet...</div>
                ) : (
                  <div className="space-y-3">
                    {consoleLogs.map((log, index) => (
                      <div key={index} className="flex flex-col gap-1">
                        <div className="flex gap-2 items-center">
                          <span className="text-muted-foreground">
                            [{log.timestamp}]
                          </span>
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
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left Sidebar Menu */}
        <div className="w-64 border-r border-white/20 bg-card flex flex-col">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <MenuIcon className="h-5 w-5 text-foreground" />
              <h1 className="text-xl font-black text-foreground">
                XION OAUTH2
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">Demo Dashboard</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveMenu(option.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                  activeMenu === option.id
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-card-foreground hover:bg-white/5'
                )}
              >
                {option.icon}
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/20">
            <Button
              variant="outline"
              onClick={handleLogout}
              fullWidth
              className="justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 h-full">
            <div className="max-w-6xl mx-auto h-full">
              <div className="rounded-lg border border-white/20 bg-card p-6 h-full flex flex-col">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
