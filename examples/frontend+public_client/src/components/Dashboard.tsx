import { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { getTokenInfo, clearTokenInfo, refreshToken } from '@/utils/oauth'
import { transactionApi, accountApi } from '@/utils/api'
import {
  LogOut,
  Send,
  Info,
  Menu as MenuIcon,
  User,
  FileCode,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MeResponse } from '@/types'

interface ConsoleLog {
  timestamp: string
  type: 'request' | 'response' | 'error'
  message: string
  data?: unknown
}

type MenuItem = 'token' | 'api-tests'

type ApiTestSubMenu = 'account-query' | 'send-tokens' | 'instantiate-contract'

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
  { id: 'instantiate-contract', label: 'Instantiate Contract' },
]

function formatExpiresIn(seconds: number): string {
  // Handle invalid or negative values
  if (!seconds || seconds < 0) {
    return 'Expired'
  }

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
  if (secs > 0 && parts.length === 0)
    parts.push(`${secs} second${secs > 1 ? 's' : ''}`)

  return parts.length > 0 ? parts.join(', ') : '0 seconds'
}

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
  const [isInstantiatingContract, setIsInstantiatingContract] = useState(false)
  const [instantiateContractForm, setInstantiateContractForm] = useState({
    name: '',
    symbol: '',
    decimals: '6',
    initialBalances: [{ address: '', amount: '' }] as {
      address: string
      amount: string
    }[],
  })
  const [isRefreshingToken, setIsRefreshingToken] = useState(false)

  useEffect(() => {
    const info = getTokenInfo()
    setTokenInfo(info)
    if (!info) {
      addLog('error', 'No valid token found. Please login again.')
    } else {
      const logData: Record<string, unknown> = {
        expiresIn: formatExpiresIn(info.expiresIn),
        expiration: new Date(info.expiration).toLocaleString(),
      }
      if (info.refreshToken) {
        logData.hasRefreshToken = true
      }
      addLog('response', 'Token loaded successfully', logData)
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

  const handleInstantiateContract = async () => {
    if (!accountData?.id) {
      addLog('error', 'Please query account information first to get Meta Account Address')
      return
    }

    if (!instantiateContractForm.name.trim()) {
      addLog('error', 'Please enter a token name')
      return
    }

    if (!instantiateContractForm.symbol.trim()) {
      addLog('error', 'Please enter a token symbol')
      return
    }

    const decimals = parseInt(instantiateContractForm.decimals)
    if (isNaN(decimals) || decimals < 0) {
      addLog('error', 'Please enter a valid decimals value (0 or greater)')
      return
    }

    // Validate and filter initial balances (can be empty)
    const validInitialBalances = instantiateContractForm.initialBalances
      .filter((balance) => balance.address.trim() && balance.amount.trim())
      .map((balance) => ({
        address: balance.address.trim(),
        amount: balance.amount.trim(),
      }))

    const CODE_ID_TESTNET = 510

    try {
      setIsInstantiatingContract(true)
      addLog('request', 'Instantiating CW20 contract...', {
        creatorAddress: accountData.id,
        codeId: CODE_ID_TESTNET,
        name: instantiateContractForm.name,
        symbol: instantiateContractForm.symbol,
        decimals,
        initialBalances: validInitialBalances,
      })

      const response = await transactionApi.instantiateContractCW20(
        accountData.id,
        instantiateContractForm.name.trim(),
        instantiateContractForm.symbol.trim(),
        decimals,
        validInitialBalances
      )

      addLog('response', 'CW20 contract instantiated successfully', response)

      // Reset form on success
      setInstantiateContractForm({
        name: '',
        symbol: '',
        decimals: '6',
        initialBalances: [{ address: '', amount: '' }],
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      addLog('error', `Instantiate contract failed: ${errorMessage}`, error)
    } finally {
      setIsInstantiatingContract(false)
    }
  }

  const addInitialBalance = () => {
    setInstantiateContractForm({
      ...instantiateContractForm,
      initialBalances: [
        ...instantiateContractForm.initialBalances,
        { address: '', amount: '' },
      ],
    })
  }

  const removeInitialBalance = (index: number) => {
    if (instantiateContractForm.initialBalances.length > 1) {
      setInstantiateContractForm({
        ...instantiateContractForm,
        initialBalances: instantiateContractForm.initialBalances.filter(
          (_, i) => i !== index
        ),
      })
    }
  }

  const updateInitialBalance = (
    index: number,
    field: 'address' | 'amount',
    value: string
  ) => {
    const newBalances = [...instantiateContractForm.initialBalances]
    newBalances[index] = { ...newBalances[index], [field]: value }
    setInstantiateContractForm({
      ...instantiateContractForm,
      initialBalances: newBalances,
    })
  }

  const handleRefreshToken = async () => {
    try {
      setIsRefreshingToken(true)
      addLog('request', 'Refreshing access token...')

      const newTokenInfo = await refreshToken()
      setTokenInfo(newTokenInfo)

      const logData: Record<string, unknown> = {
        expiresIn: formatExpiresIn(newTokenInfo.expiresIn),
        expiration: new Date(newTokenInfo.expiration).toLocaleString(),
      }
      if (newTokenInfo.refreshToken) {
        logData.hasRefreshToken = true
      }

      addLog('response', 'Token refreshed successfully', logData)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      addLog('error', `Token refresh failed: ${errorMessage}`, error)
      // If refresh fails, token info might be cleared, update state
      const updatedTokenInfo = getTokenInfo()
      setTokenInfo(updatedTokenInfo)
      if (!updatedTokenInfo) {
        addLog('error', 'Please login again to continue.')
      }
    } finally {
      setIsRefreshingToken(false)
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
                            <div className="space-y-3 text-sm">
                              <div className="grid grid-cols-2 gap-4">
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
                                    {auth.index}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Data:
                                </span>
                                <textarea
                                  readOnly
                                  value={JSON.stringify(auth.data, null, 2)}
                                  className="mt-1 w-full rounded-md border border-white/20 bg-[#0A0A0A]/80 px-3 py-2 font-mono text-xs text-foreground resize-none focus-visible:outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                                  rows={6}
                                />
                              </div>
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

      case 'instantiate-contract':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Instantiate CW20 Contract
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">
                  Creator Address (Meta Account)
                </label>
                <div className="rounded-md border border-white/20 bg-input p-3">
                  <span className="font-mono text-sm text-foreground break-all">
                    {accountData?.id || 'Please query account information first'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">
                  Code ID (Testnet)
                </label>
                <div className="rounded-md border border-white/20 bg-input p-3">
                  <span className="font-mono text-sm text-foreground">510</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">
                  Decimals
                </label>
                <Input
                  type="number"
                  placeholder="6"
                  value={instantiateContractForm.decimals}
                  onChange={(e) =>
                    setInstantiateContractForm({
                      ...instantiateContractForm,
                      decimals: e.target.value,
                    })
                  }
                  disabled={isInstantiatingContract}
                  min="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Token Name
                  </label>
                  <Input
                    type="text"
                    placeholder="My Token"
                    value={instantiateContractForm.name}
                    onChange={(e) =>
                      setInstantiateContractForm({
                        ...instantiateContractForm,
                        name: e.target.value,
                      })
                    }
                    disabled={isInstantiatingContract}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Token Symbol
                  </label>
                  <Input
                    type="text"
                    placeholder="MTK"
                    value={instantiateContractForm.symbol}
                    onChange={(e) =>
                      setInstantiateContractForm({
                        ...instantiateContractForm,
                        symbol: e.target.value,
                      })
                    }
                    disabled={isInstantiatingContract}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-card-foreground">
                    Initial Balances
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addInitialBalance}
                    disabled={isInstantiatingContract}
                    className="h-8"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Balance
                  </Button>
                </div>
                <div className="space-y-3">
                  {instantiateContractForm.initialBalances.map(
                    (balance, index) => (
                      <div
                        key={index}
                        className="flex gap-2 items-start p-3 rounded-md border border-white/20 bg-input"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">
                              Address
                            </label>
                            <Input
                              type="text"
                              placeholder="xion1..."
                              value={balance.address}
                              onChange={(e) =>
                                updateInitialBalance(
                                  index,
                                  'address',
                                  e.target.value
                                )
                              }
                              disabled={isInstantiatingContract}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">
                              Amount
                            </label>
                            <Input
                              type="text"
                              placeholder="1000000"
                              value={balance.amount}
                              onChange={(e) =>
                                updateInitialBalance(
                                  index,
                                  'amount',
                                  e.target.value
                                )
                              }
                              disabled={isInstantiatingContract}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        {instantiateContractForm.initialBalances.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInitialBalance(index)}
                            disabled={isInstantiatingContract}
                            className="h-8 w-8 p-0 mt-6"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
              <Button
                onClick={handleInstantiateContract}
                disabled={isInstantiatingContract}
                variant="outline"
                fullWidth
              >
                <FileCode className="mr-2 h-4 w-4" />
                {isInstantiatingContract
                  ? 'Instantiating...'
                  : 'Instantiate Contract'}
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
                      {formatExpiresIn(tokenInfo.expiresIn)}
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

                {/* Refresh Token Section */}
                {tokenInfo.refreshToken && (
                  <>
                    <div className="border-t border-white/20 pt-4 mt-4">
                      <h3 className="text-lg font-semibold text-card-foreground mb-4">
                        Refresh Token
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Refresh Token
                      </label>
                      <div className="rounded-md border border-white/20 bg-input p-3">
                        <span className="font-mono text-xs break-all text-foreground">
                          {tokenInfo.refreshToken.substring(0, 20)}...
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <Button
                    onClick={handleRefreshToken}
                    disabled={isRefreshingToken || !tokenInfo.refreshToken}
                    variant="outline"
                    fullWidth
                  >
                    <RefreshCw
                      className={cn(
                        'mr-2 h-4 w-4',
                        isRefreshingToken && 'animate-spin'
                      )}
                    />
                    {isRefreshingToken ? 'Refreshing...' : 'Refresh Token'}
                  </Button>
                  {!tokenInfo.refreshToken && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      No refresh token available. Please login again to get a
                      new token.
                    </p>
                  )}
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
              <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar pr-2">{renderApiTestForm()}</div>
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
