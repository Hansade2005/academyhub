// Supabase Authentication Service
// Uses Supabase's built-in email/password authentication

import { supabase } from './supabase-client'
import type { User, Session } from '@supabase/supabase-js'
import type { UserRole } from './t3a-types'

// Extended user interface with profile data from our users table
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

export interface AuthResponse {
  message: string
  user: SupabaseUser
  session: Session | null
}

class SupabaseAuthService {
  /**
   * Sign up a new user with email and password
   */
  async signup(
    email: string,
    password: string,
    full_name: string,
    avatar_url?: string
  ): Promise<AuthResponse> {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          full_name,
          avatar_url
        }
      }
    })

    if (authError) {
      console.error('Supabase Auth signup error:', authError)
      throw new Error(authError.message || 'Failed to create account')
    }

    if (!authData.user) {
      throw new Error('Failed to create account')
    }

    // Create/update the user profile in our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: email.toLowerCase(),
        full_name,
        avatar_url,
        role: 'candidate' as UserRole,
        is_verified: !!authData.user.email_confirmed_at,
        profile_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select('id, email, full_name, avatar_url, role, is_verified, profile_completed, created_at, updated_at')
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail signup if profile creation fails - auth was successful
    }

    const user: SupabaseUser = userProfile || {
      id: authData.user.id,
      email: authData.user.email!,
      full_name,
      avatar_url,
      role: 'candidate' as UserRole,
      is_verified: !!authData.user.email_confirmed_at,
      profile_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return {
      message: 'Account created successfully',
      user,
      session: authData.session
    }
  }

  /**
   * Log in an existing user with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    })

    if (authError) {
      console.error('Supabase Auth login error:', authError)
      throw new Error(authError.message || 'Invalid email or password')
    }

    if (!authData.user || !authData.session) {
      throw new Error('Login failed')
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, role, is_verified, profile_completed, created_at, updated_at')
      .eq('id', authData.user.id)
      .single()

    // If profile doesn't exist, create it
    let user: SupabaseUser
    if (profileError || !userProfile) {
      const { data: newProfile } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: authData.user.email!,
          full_name: authData.user.user_metadata?.full_name || '',
          avatar_url: authData.user.user_metadata?.avatar_url,
          role: 'candidate' as UserRole,
          is_verified: !!authData.user.email_confirmed_at,
          profile_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select('id, email, full_name, avatar_url, role, is_verified, profile_completed, created_at, updated_at')
        .single()

      user = newProfile || {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: authData.user.user_metadata?.full_name || '',
        avatar_url: authData.user.user_metadata?.avatar_url,
        role: 'candidate' as UserRole,
        is_verified: !!authData.user.email_confirmed_at,
        profile_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } else {
      user = userProfile as SupabaseUser
    }

    return {
      message: 'Login successful',
      user,
      session: authData.session
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
      // Don't throw - we want to clear local state even if server logout fails
    }
  }

  /**
   * Get the currently authenticated user
   */
  async getAuthenticatedUser(): Promise<SupabaseUser | null> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return null
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, role, is_verified, profile_completed, created_at, updated_at')
      .eq('id', session.user.id)
      .single()

    if (profileError || !userProfile) {
      // Return basic user info from Supabase Auth if profile not found
      return {
        id: session.user.id,
        email: session.user.email!,
        full_name: session.user.user_metadata?.full_name || '',
        avatar_url: session.user.user_metadata?.avatar_url,
        role: 'candidate' as UserRole,
        is_verified: !!session.user.email_confirmed_at,
        profile_completed: false,
        created_at: session.user.created_at,
        updated_at: session.user.updated_at || session.user.created_at
      }
    }

    return userProfile as SupabaseUser
  }

  /**
   * Get cached user from Supabase Auth (faster than full profile fetch)
   */
  getCachedUser(): SupabaseUser | null {
    // Supabase handles caching internally, but we can provide a sync version
    // by checking localStorage for the auth state
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
      const storedSession = localStorage.getItem(storageKey)
      if (!storedSession) return null

      const parsed = JSON.parse(storedSession)
      const user = parsed?.user
      if (!user) return null

      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url,
        role: 'candidate' as UserRole,
        is_verified: !!user.email_confirmed_at,
        profile_completed: false,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      }
    } catch {
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<SupabaseUser, 'full_name' | 'avatar_url' | 'profile_completed'>>
  ): Promise<SupabaseUser> {
    // Update Supabase Auth user metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: updates.full_name,
        avatar_url: updates.avatar_url
      }
    })

    if (authError) {
      console.error('Auth metadata update error:', authError)
    }

    // Update our users table
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

    return user as SupabaseUser
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new Error(error.message || 'Failed to update password')
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      throw new Error(error.message || 'Failed to send password reset email')
    }
  }

  /**
   * Get the current session
   */
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  /**
   * Get the current access token (for API calls)
   */
  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  /**
   * Retrieve tokens for API authentication
   * Returns the current session tokens from Supabase Auth
   */
  retrieveTokens(): { accessToken: string | null; refreshToken: string | null } {
    if (typeof window === 'undefined') {
      return { accessToken: null, refreshToken: null }
    }

    try {
      const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
      const storedSession = localStorage.getItem(storageKey)
      if (!storedSession) return { accessToken: null, refreshToken: null }

      const parsed = JSON.parse(storedSession)
      return {
        accessToken: parsed?.access_token || null,
        refreshToken: parsed?.refresh_token || null
      }
    } catch {
      return { accessToken: null, refreshToken: null }
    }
  }

  /**
   * Clear auth tokens (for logout scenarios)
   */
  clearTokens(): void {
    // Supabase handles this internally via signOut
    // This method exists for compatibility
    if (typeof window !== 'undefined') {
      try {
        const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
        localStorage.removeItem(storageKey)
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Check if user is authenticated (quick check)
   */
  isAuthenticated(): boolean {
    const { accessToken } = this.retrieveTokens()
    return !!accessToken
  }

  /**
   * Get the current user's ID
   */
  getCurrentUserId(): string | null {
    const cachedUser = this.getCachedUser()
    return cachedUser?.id || null
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  }

  /**
   * Verify a session/token on the server side
   * This can be used in API routes
   */
  async verifySession(accessToken: string): Promise<{ valid: boolean; user: SupabaseUser | null }> {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return { valid: false, user: null }
    }

    // Get user profile from our users table
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, role, is_verified, profile_completed, created_at, updated_at')
      .eq('id', user.id)
      .single()

    const supabaseUser: SupabaseUser = userProfile || {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || '',
      avatar_url: user.user_metadata?.avatar_url,
      role: 'candidate' as UserRole,
      is_verified: !!user.email_confirmed_at,
      profile_completed: false,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at
    }

    return { valid: true, user: supabaseUser }
  }
}

// Export singleton instance
export const supabaseAuthService = new SupabaseAuthService()
