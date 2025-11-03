/**
 * API Client for communicating with the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export class ApiClient {
  private static getAuthHeaders(): HeadersInit {
    if (typeof window === 'undefined') {
      return {
        'Content-Type': 'application/json',
      }
    }

    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  static async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  static async post(endpoint: string, data?: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse(response)
  }

  static async put(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  }

  static async patch(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  }

  static async delete(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  static async uploadFile(endpoint: string, formData: FormData) {
    if (typeof window === 'undefined') {
      throw new Error('File upload only available on client side')
    }

    const token = localStorage.getItem('token')
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    return this.handleResponse(response)
  }

  private static async handleResponse(response: Response) {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }

    return data
  }
}
