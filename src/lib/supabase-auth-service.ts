// Supabase Authentication Service
// Replaces PiPilot authentication with Supabase-based custom auth

import { supabase } from './supabase-client'
import type { UserRole } from './t3a-types'

// User interface matching our users table
export interface SupabaseUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  is_verified: boolean
  profile_completed: boolean
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface AuthResponse {
  message: string
  user: SupabaseUser
  tokens: AuthTokens
}

// Simple JWT-like token generation (for client-side session management)
// In production, you'd want to use proper JWT with jose or jsonwebtoken
const generateToken = (userId: string, email: string): string => {
  const payload = {
    userId,
    email,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }
  // Base64 encode the payload (simple token for client-side use)
  return btoa(JSON.stringify(payload))
}

const generateRefreshToken = (userId: string): string => {
  const payload = {
    userId,
    type: 'refresh',
    iat: Date.now(),
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }
  return btoa(JSON.stringify(payload))
}

const decodeToken = (token: string): any => {
  try {
    return JSON.parse(atob(token))
  } catch {
    return null
  }
}

// Simple password hashing using Web Crypto API (browser-compatible)
// For production, use bcrypt on the server side
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + process.env.NEXT_PUBLIC_AUTH_SALT || 'T3A_SECURE_SALT_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const computedHash = await hashPassword(password)
  return computedHash === hash
}

class SupabaseAuthService {
  private tokenKey = 't3a_access_token'
  private refreshTokenKey = 't3a_refresh_token'
  private userKey = 't3a_user'

  /**
   * Sign up a new user
   */
  async signup(
    email: string,
    password: string,
    full_name: string,
    avatar_url?: string
  ): Promise<AuthResponse> {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      throw new Error('An account with this email already exists')
    }

    // Hash the password
    const password_hash = await hashPassword(password)

    // Create the user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name,
        avatar_url,
        role: 'candidate' as UserRole,
        is_verified: false,
        profile_completed: false
      })
      .select('id, email, full_name, avatar_url, role, is_verified, profile_completed, created_at, updated_at')
      .single()

    if (error) {
      console.error('Signup error:', error)
      throw new Error(error.message || 'Failed to create account')
    }

    // Generate tokens
    const tokens = this.generateTokens(newUser.id, newUser.email)
    this.storeTokens(tokens)
    this.storeUser(newUser)

    return {
      message: 'Account created successfully',
      user: newUser as SupabaseUser,
      tokens
    }
  }

  /**
   * Log in an existing user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Find the user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name, avatar_url, role, is_verified, profile_completed, created_at, updated_at')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      throw new Error('Invalid email or password')
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email)
    this.storeTokens(tokens)

    // Remove password_hash from user object before returning
    const { password_hash, ...safeUser } = user
    this.storeUser(safeUser as SupabaseUser)

    return {
      message: 'Login successful',
      user: safeUser as SupabaseUser,
      tokens
    }
  }

  /**
   * Verify an access token
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user: SupabaseUser | null }> {
    const payload = decodeToken(token)

    if (!payload || !payload.userId || !payload.exp) {
      return { valid: false, user: null }
    }

    // Check if token is expired
    if (Date.now() > payload.exp) {
      return { valid: false, user: null }
    }

    // Fetch fresh user data
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, role, is_verified, profile_completed, created_at, updated_at')
      .eq('id', payload.userId)
      .single()

    if (error || !user) {
      return { valid: false, user: null }
    }

    return { valid: true, user: user as SupabaseUser }
  }

  /**
   * Refresh the access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const payload = decodeToken(refreshToken)

    if (!payload || !payload.userId || payload.type !== 'refresh') {
      throw new Error('Invalid refresh token')
    }

    // Check if refresh token is expired
    if (Date.now() > payload.exp) {
      throw new Error('Refresh token expired')
    }

    // Fetch user data
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, role, is_verified, profile_completed, created_at, updated_at')
      .eq('id', payload.userId)
      .single()

    if (error || !user) {
      throw new Error('User not found')
    }

    // Generate new tokens
    const tokens = this.generateTokens(user.id, user.email)
    this.storeTokens(tokens)
    this.storeUser(user as SupabaseUser)

    return {
      message: 'Token refreshed successfully',
      user: user as SupabaseUser,
      tokens
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    this.clearTokens()
    this.clearUser()
  }

  /**
   * Get the currently authenticated user
   */
  async getAuthenticatedUser(): Promise<SupabaseUser | null> {
    const { accessToken } = this.retrieveTokens()

    if (!accessToken) {
      return null
    }

    try {
      const result = await this.verifyToken(accessToken)
      if (result.valid && result.user) {
        return result.user
      }

      // Try to refresh the token
      const { refreshToken } = this.retrieveTokens()
      if (refreshToken) {
        try {
          const refreshedData = await this.refreshToken(refreshToken)
          return refreshedData.user
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          this.clearTokens()
          this.clearUser()
          return null
        }
      }
      return null
    } catch (error) {
      console.error('Error getting authenticated user:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Pick<SupabaseUser, 'full_name' | 'avatar_url' | 'profile_completed'>>): Promise<SupabaseUser> {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, full_name, avatar_url, role, is_verified, profile_completed, created_at, updated_at')
      .single()

    if (error) {
      throw new Error(error.message || 'Failed to update profile')
    }

    this.storeUser(user as SupabaseUser)
    return user as SupabaseUser
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get current user with password hash
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password_hash)
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const password_hash = await hashPassword(newPassword)

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      throw new Error('Failed to update password')
    }
  }

  // Token management helpers
  private generateTokens(userId: string, email: string): AuthTokens {
    return {
      access_token: generateToken(userId, email),
      refresh_token: generateRefreshToken(userId),
      expires_in: 24 * 60 * 60, // 24 hours in seconds
      token_type: 'Bearer'
    }
  }

  private storeTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, tokens.access_token)
      localStorage.setItem(this.refreshTokenKey, tokens.refresh_token)
    }
  }

  retrieveTokens(): { accessToken: string | null; refreshToken: string | null } {
    if (typeof window === 'undefined') {
      return { accessToken: null, refreshToken: null }
    }
    const accessToken = localStorage.getItem(this.tokenKey)
    const refreshToken = localStorage.getItem(this.refreshTokenKey)
    return { accessToken, refreshToken }
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey)
      localStorage.removeItem(this.refreshTokenKey)
    }
  }

  private storeUser(user: SupabaseUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user))
    }
  }

  private clearUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.userKey)
    }
  }

  /**
   * Get cached user from localStorage (faster than API call)
   */
  getCachedUser(): SupabaseUser | null {
    if (typeof window === 'undefined') {
      return null
    }
    const userJson = localStorage.getItem(this.userKey)
    if (!userJson) {
      return null
    }
    try {
      return JSON.parse(userJson)
    } catch {
      return null
    }
  }

  /**
   * Check if user is authenticated (quick check without API call)
   */
  isAuthenticated(): boolean {
    const { accessToken } = this.retrieveTokens()
    if (!accessToken) {
      return false
    }
    const payload = decodeToken(accessToken)
    if (!payload || !payload.exp) {
      return false
    }
    return Date.now() < payload.exp
  }

  /**
   * Get the current user's ID from token (without API call)
   */
  getCurrentUserId(): string | null {
    const { accessToken } = this.retrieveTokens()
    if (!accessToken) {
      return null
    }
    const payload = decodeToken(accessToken)
    return payload?.userId || null
  }
}

// Export singleton instance
export const supabaseAuthService = new SupabaseAuthService()
