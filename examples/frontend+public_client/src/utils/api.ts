import axios, { AxiosInstance } from 'axios'
import { getTokenInfo, getOAuthServerUrl } from './oauth'
import type { ApiResponse } from '@/types'

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
  test: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>(
      '/api/v1/transaction/test'
    )
    return response.data
  },
}
