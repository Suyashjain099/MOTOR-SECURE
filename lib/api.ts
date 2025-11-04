// API helper functions for frontend

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'An error occurred',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error',
    }
  }
}

// Auth API calls
export const authApi = {
  signup: async (name: string, email: string, password: string) => {
    return apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
  },

  login: async (email: string, password: string) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    })
  },

  getCurrentUser: async () => {
    return apiRequest('/api/auth/me')
  },
}

// Device API calls
export const deviceApi = {
  getAll: async () => {
    return apiRequest('/api/devices')
  },

  getById: async (id: string) => {
    return apiRequest(`/api/devices/${id}`)
  },

  create: async (name: string, uniqueId: string) => {
    return apiRequest('/api/devices', {
      method: 'POST',
      body: JSON.stringify({ name, uniqueId }),
    })
  },

  update: async (id: string, data: Partial<{ name: string; status: string; location: any }>) => {
    return apiRequest(`/api/devices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/api/devices/${id}`, {
      method: 'DELETE',
    })
  },
}
