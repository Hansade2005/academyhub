'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseAuthService, SupabaseUser } from '@/lib/supabase-auth-service';
import type { UserRole } from '@/lib/t3a-types';

interface AuthContextType {
  user: SupabaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, full_name: string, avatar_url?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<SupabaseUser, 'full_name' | 'avatar_url' | 'profile_completed'>>) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        // First try to get cached user for faster initial render
        const cachedUser = supabaseAuthService.getCachedUser();
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Then verify with the server
        const authenticatedUser = await supabaseAuthService.getAuthenticatedUser();
        if (authenticatedUser) {
          setUser(authenticatedUser);
        } else if (cachedUser) {
          // Cached user was invalid, clear it
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await supabaseAuthService.login(email, password);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, full_name: string, avatar_url?: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await supabaseAuthService.signup(email, password, full_name, avatar_url);
      setUser(response.user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabaseAuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
    }
  };

  const updateProfile = async (updates: Partial<Pick<SupabaseUser, 'full_name' | 'avatar_url' | 'profile_completed'>>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }
    try {
      const updatedUser = await supabaseAuthService.updateProfile(user.id, updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const authenticatedUser = await supabaseAuthService.getAuthenticatedUser();
      if (authenticatedUser) {
        setUser(authenticatedUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    refreshUser,
    loading,
    initialized,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Re-export the user type for convenience
export type { SupabaseUser };
