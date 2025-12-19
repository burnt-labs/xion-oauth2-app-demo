import axios, { AxiosInstance } from 'axios'
import { getTokenInfo, getOAuthServerUrl } from './oauth'
import type { ApiResponse, MeResponse } from '@/types'
import {
  createInstantiateCW20ContractMessage,
  createSendTokensMessage,
} from './transactions'

const createApiClient = (): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: getOAuthServerUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  apiClient.interceptors.request.use(
    (config) => {
      const tokenInfo = getTokenInfo()
      if (tokenInfo) {
        config.headers['Authorization'] = `Bearer ${tokenInfo.accessToken}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data)
      } else if (error.request) {
        console.error('API Request Error:', error.request)
      } else {
        console.error('API Error:', error.message)
      }
      return Promise.reject(error)
    }
  )

  return apiClient
}

export const apiClient = createApiClient()

export const transactionApi = {
  sendTokens: async (
    toAddress: string,
    amount: number,
    denom: string | undefined
  ): Promise<ApiResponse> => {
    const targetDenom = denom || 'uxion'
    const response = await apiClient.post<ApiResponse>('/api/v1/transaction', {
      messages: [createSendTokensMessage(toAddress, amount, targetDenom)],
    })
    return response.data
  },
  instantiateContractCW20: async (
    creatorAddress: string,
    name: string,
    symbol: string,
    decimals: number,
    initialBalances: { address: string; amount: string }[]
  ): Promise<ApiResponse> => {
    const CODE_ID_TESTNET = 510 // Code ID for the CW20 contract on Testnet
    const response = await apiClient.post<ApiResponse>('/api/v1/transaction', {
      messages: [
        createInstantiateCW20ContractMessage(
          creatorAddress,
          CODE_ID_TESTNET,
          name,
          symbol,
          decimals,
          initialBalances
        ),
      ],
    })
    return response.data
  },
}

export const accountApi = {
  getMe: async (): Promise<MeResponse> => {
    const response = await apiClient.get<MeResponse>('/api/v1/me')
    return response.data
  },
}
