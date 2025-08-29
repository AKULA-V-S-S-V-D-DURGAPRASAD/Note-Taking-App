"use client"

import { useState, useEffect, useCallback } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: true,
  })

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    setAuthState((prev) => ({ ...prev, accessToken, refreshToken }))
  }, [])

  const clearTokens = useCallback(() => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setAuthState({ user: null, accessToken: null, refreshToken: null, loading: false })
  }, [])

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      clearTokens()
      return false
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        setTokens(data.accessToken, data.refreshToken)
        return true
      } else {
        clearTokens()
        return false
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      clearTokens()
      return false
    }
  }, [setTokens, clearTokens])

  const fetchUserData = useCallback(
    async (token: string): Promise<User | null> => {
      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const userData = await response.json()
          return userData
        } else if (response.status === 401) {
          // Token might be expired, try to refresh
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            const newToken = localStorage.getItem("accessToken")
            if (newToken) {
              return fetchUserData(newToken)
            }
          }
        }
        return null
      } catch (error) {
        console.error("Error fetching user data:", error)
        return null
      }
    },
    [refreshAccessToken],
  )

  const login = useCallback(
    async (accessToken: string, refreshToken: string, user: User) => {
      setTokens(accessToken, refreshToken)
      setAuthState((prev) => ({ ...prev, user, loading: false }))
    },
    [setTokens],
  )

  const logout = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken")

    // Call logout endpoint to blacklist token
    if (accessToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      } catch (error) {
        console.error("Logout API call failed:", error)
      }
    }

    clearTokens()
  }, [clearTokens])

  const makeAuthenticatedRequest = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      let accessToken = authState.accessToken || localStorage.getItem("accessToken")

      if (!accessToken) {
        throw new Error("No access token available")
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      })

      // If token is expired, try to refresh and retry
      if (response.status === 401) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          accessToken = localStorage.getItem("accessToken")
          if (accessToken) {
            return fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${accessToken}`,
              },
            })
          }
        }
      }

      return response
    },
    [authState.accessToken, refreshAccessToken],
  )

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem("accessToken")
      const refreshToken = localStorage.getItem("refreshToken")

      if (accessToken && refreshToken) {
        const user = await fetchUserData(accessToken)
        if (user) {
          setAuthState({ user, accessToken, refreshToken, loading: false })
        } else {
          clearTokens()
        }
      } else {
        setAuthState((prev) => ({ ...prev, loading: false }))
      }
    }

    initAuth()
  }, [fetchUserData, clearTokens])

  return {
    user: authState.user,
    loading: authState.loading,
    isAuthenticated: !!authState.user,
    login,
    logout,
    refreshAccessToken,
    makeAuthenticatedRequest,
  }
}
