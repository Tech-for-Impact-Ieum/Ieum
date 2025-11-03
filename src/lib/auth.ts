/**
 * Authentication utilities
 */

import { ApiClient } from './api-client'

export interface User {
  id: number
  name: string
  email?: string
  profileImage?: string
  isOnline: boolean
  lastSeenAt?: string
}

export interface AuthResponse {
  ok: boolean
  user: User
  token: string
}

export class Auth {
  static async register(
    name: string,
    email?: string,
    password?: string,
  ): Promise<AuthResponse> {
    const data = await ApiClient.post('/auth/register', {
      name,
      email,
      password,
    })

    if (data.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    }

    return data
  }

  static async login(name: string, password?: string): Promise<AuthResponse> {
    const data = await ApiClient.post('/auth/login', { name, password })

    if (data.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    }

    return data
  }

  static async logout(): Promise<void> {
    try {
      await ApiClient.post('/auth/logout')
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const data = await ApiClient.get('/auth/me')
      return data.user
    } catch (error) {
      return null
    }
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  static getUserId(): number | null {
    const user = this.getUser()
    return user ? user.id : null
  }
}
