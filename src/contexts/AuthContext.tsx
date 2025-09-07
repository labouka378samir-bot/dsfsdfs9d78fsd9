import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContextType, User } from '../types';
import toast from 'react-hot-toast';
import { adminAuth } from '../services/AdminAuthService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata?.username,
          phone: session.user.user_metadata?.phone,
          created_at: session.user.created_at,
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata?.username,
          phone: session.user.user_metadata?.phone,
          created_at: session.user.created_at,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, phone?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            phone: phone
          }
        }
      });

      if (error) throw error;
      // Don't show toast here, let the signup page handle the confirmation message
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check for admin login using AdminAuthService
      if (adminAuth.authenticate(email, password)) {
        const adminUser: User = {
          id: 'admin-user-id',
          email: adminAuth.getAdminEmail()!,
          phone: undefined,
          created_at: new Date().toISOString(),
        };
        setUser(adminUser);
        toast.success('Admin signed in successfully!');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // Handle admin logout using AdminAuthService
      if (user?.id === 'admin-user-id') {
        adminAuth.logout();
        setUser(null);
        toast.success('Admin signed out successfully!');
        return;
      }

      // Check if there's an active session before attempting to sign out
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        try {
          const { error } = await supabase.auth.signOut();
          if (error && 
              error.message !== 'Session from session_id claim in JWT does not exist' &&
              !error.message?.includes('session_not_found')) {
            throw error;
          }
        } catch (error: any) {
          // If session doesn't exist on server, that's fine - we still want to clear local state
          if (error.status !== 403 &&
              !error.message?.includes('session_not_found') && 
              !error.message?.includes('Session from session_id claim in JWT does not exist') &&
              !error.message?.includes('Auth session missing')) {
            throw error;
          }
        }
      } else {
        // No active session, just clear local state
        setUser(null);
      }
      
      // Always clear local state regardless of server response
      setUser(null);
      toast.success('Signed out successfully!');
    } catch (error: any) {
      // Even if there's an error, clear local state and show success
      // This prevents the app from getting stuck in inconsistent auth state
      setUser(null);
      console.warn('Sign out error (handled gracefully):', error.message);
      toast.success('Signed out successfully!');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}