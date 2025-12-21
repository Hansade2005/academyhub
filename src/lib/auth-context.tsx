'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { pipilotAuthService, PipilotUser } from '@/lib/pipilot-auth-service';

interface AuthContextType {
  user: PipilotUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, full_name: string, avatar_url?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  initialized: boolean;
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
  const [user, setUser] = useState<PipilotUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        const authenticatedUser = await pipilotAuthService.getAuthenticatedUser();
        if (authenticatedUser) {
          setUser(authenticatedUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
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
      const response = await pipilotAuthService.login(email, password);
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
      const response = await pipilotAuthService.signup(email, password, full_name, avatar_url);
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
      await pipilotAuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on the backend, clear local state
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};