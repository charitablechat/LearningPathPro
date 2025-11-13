import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';
import { logger } from '../lib/logger';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.debug('[AUTH] Initializing auth context');
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.debug('[AUTH] Session retrieved', { hasSession: !!session });
      setUser(session?.user ?? null);
      if (session?.user) {
        logger.debug('[AUTH] Loading profile for user', { userId: session.user.id });
        loadProfile(session.user.id);
      } else {
        logger.debug('[AUTH] No session, setting loading to false');
        setLoading(false);
      }
    }).catch(error => {
      logger.error('[AUTH] Error getting session', error);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        logger.debug('[AUTH] Auth state changed', { event: _event });
        setUser(session?.user ?? null);
        if (session?.user) {
          logger.debug('[AUTH] User logged in, loading profile', { userId: session.user.id });
          loadProfile(session.user.id);
        } else {
          logger.debug('[AUTH] User logged out');
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string, skipLoadingState = false, retryCount = 0, maxRetries = 5) => {
    logger.debug('[AUTH] loadProfile called', { userId, skipLoadingState, retryCount });

    if (!skipLoadingState) {
      setLoading(true);
    }

    try {
      logger.debug('[AUTH] Fetching profile from database');
      const startTime = Date.now();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const endTime = Date.now();
      logger.debug('[AUTH] Query completed', { duration: `${endTime - startTime}ms` });

      if (error) {
        logger.error('[AUTH] Error loading profile', error, {
          code: error.code,
          message: error.message,
        });
        setProfile(null);
        if (!skipLoadingState) {
          setLoading(false);
        }
        return null;
      }

      if (!data && retryCount < maxRetries) {
        const waitTime = 500 * (retryCount + 1);
        logger.debug('[AUTH] Profile not found, retrying', { waitTime, attempt: retryCount + 1, maxRetries });
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return loadProfile(userId, skipLoadingState, retryCount + 1, maxRetries);
      }

      logger.debug('[AUTH] Profile loaded successfully', { hasProfile: !!data });
      setProfile(data);
      if (!skipLoadingState) {
        setLoading(false);
      }
      return data;
    } catch (error: any) {
      logger.error('[AUTH] Exception in loadProfile', error);
      setProfile(null);
      if (!skipLoadingState) {
        setLoading(false);
      }
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('EMAIL_NOT_CONFIRMED');
      }
      throw error;
    }

    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      throw new Error('EMAIL_NOT_CONFIRMED');
    }

    if (data.user) {
      await loadProfile(data.user.id);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'learner',
        },
      },
    });
    if (error) throw error;

    if (!data.user) {
      throw new Error('Sign up failed - no user data returned');
    }

    if (data.user && !data.user.confirmed_at) {
      throw new Error('CONFIRMATION_REQUIRED');
    }

    if (data.user && data.session) {
      logger.debug('[AUTH] User signed up and session created, loading profile with retry');
      setUser(data.user);
      await loadProfile(data.user.id, false, 0, 5);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) {
      throw new Error('No authenticated user found');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error('Current password is incorrect');
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw updateError;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  };

  const refetchProfile = async () => {
    if (user) {
      logger.debug('[AUTH] refetchProfile: Starting profile refetch', { userId: user.id });
      const profile = await loadProfile(user.id, true);
      logger.debug('[AUTH] refetchProfile: Profile refetch completed', { hasProfile: !!profile });
      return profile;
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, changePassword, resetPassword, updatePassword, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
