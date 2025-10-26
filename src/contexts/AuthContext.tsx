import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

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
    console.log('[AUTH] Initializing auth context...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] Session retrieved:', session ? 'User logged in' : 'No user');
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('[AUTH] Loading profile for user:', session.user.id);
        loadProfile(session.user.id);
      } else {
        console.log('[AUTH] No session, setting loading to false');
        setLoading(false);
      }
    }).catch(error => {
      console.error('[AUTH] Error getting session:', error);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        console.log('[AUTH] Auth state changed:', _event);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('[AUTH] User logged in, loading profile:', session.user.id);
          loadProfile(session.user.id);
        } else {
          console.log('[AUTH] User logged out');
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    console.log('[AUTH] loadProfile called for userId:', userId);

    const timeoutId = setTimeout(() => {
      console.error('[AUTH] Profile loading timeout after 10 seconds');
      setLoading(false);
    }, 10000);

    try {
      console.log('[AUTH] Fetching profile from database...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      clearTimeout(timeoutId);

      if (error) {
        console.error('[AUTH] Error loading profile:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log('[AUTH] Profile loaded successfully:', data ? 'Profile found' : 'No profile');
      console.log('[AUTH] Profile data:', data);
      setProfile(data);
    } catch (error: any) {
      console.error('[AUTH] Exception in loadProfile:', error);
      clearTimeout(timeoutId);
    } finally {
      console.log('[AUTH] Setting loading to false');
      setLoading(false);
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
      await loadProfile(user.id);
    }
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
