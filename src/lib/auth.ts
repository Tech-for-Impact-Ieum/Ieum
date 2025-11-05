/**
 * Authentication utilities
 * Updated to use email/password authentication
 */

import { ApiClient } from './api-client'
import { User } from './interface'

export interface AuthResponse {
  ok: boolean
  user: User
  token: string
}

export interface RegisterParams {
  name: string
  email: string
  password: string
  phone?: string
  nickname?: string
  imageUrl?: string
  isSpecial?: boolean
}

export class Auth {
  /**
   * Register a new user
   * @param params Registration parameters (name, email, password required)
   */
  static async register(params: RegisterParams): Promise<AuthResponse> {
    const data = await ApiClient.post('/auth/register', params)

    if (data.token && data.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    }

    return data
  }

  /**
   * Login with email and password
   * @param email User email
   * @param password User password
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const data = await ApiClient.post('/auth/login', { email, password })

    if (data.token && data.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    }

    return data
  }

  /**
   * Logout current user
   */
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

  /**
   * Get current user from API
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const data = await ApiClient.get('/auth/me')
      return data.user
    } catch (error) {
      return null
    }
  }

  /**
   * Get JWT token from localStorage
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  /**
   * Get user from localStorage
   */
  static getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * Get current user ID
   */
  static getUserId(): number | null {
    const user = this.getUser()
    return user ? user.id : null
  }

  /**
   * Get profile image URL (from UserSetting)
   */
  static getProfileImage(): string | null {
    const user = this.getUser()
    return user?.setting?.imageUrl || null
  }

  /**
   * Check if user is special needs user
   */
  static isSpecialUser(): boolean {
    const user = this.getUser()
    return user?.setting?.isSpecial || false
  }
}
