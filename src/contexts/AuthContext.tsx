import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile, isSupabaseConfigured } from '../lib/supabase';
import { logger } from '../lib/logger';

interface ImpersonationSession {
  sessionId: string;
  impersonatedUserId: string;
  impersonatedEmail: string;
  impersonatedFullName: string;
  impersonatedRole: string;
  startedAt: string;
  reason: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isImpersonating: boolean;
  impersonatedProfile: Profile | null;
  originalProfile: Profile | null;
  activeImpersonation: ImpersonationSession | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refetchProfile: () => Promise<Profile | null>;
  startImpersonation: (userId: string, reason?: string) => Promise<void>;
  endImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedProfile, setImpersonatedProfile] = useState<Profile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
  const [activeImpersonation, setActiveImpersonation] = useState<ImpersonationSession | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      logger.warn('[AUTH] Supabase not configured, skipping auth initialization');
      setLoading(false);
      return;
    }

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

    if (!isSupabaseConfigured()) {
      logger.warn('[AUTH] Cannot load profile: Supabase not configured');
      if (!skipLoadingState) {
        setLoading(false);
      }
      return null;
    }

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

  const checkSupabaseAvailable = () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Service temporarily unavailable. Please contact support.');
    }
  };

  const signIn = async (email: string, password: string) => {
    checkSupabaseAvailable();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message || 'Authentication failed');
    }

    if (data.user) {
      await loadProfile(data.user.id);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    checkSupabaseAvailable();
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

    if (data.user && data.session) {
      logger.debug('[AUTH] User signed up and session created, loading profile with retry');
      setUser(data.user);
      await loadProfile(data.user.id, false, 0, 5);
    }
  };

  const signOut = async () => {
    checkSupabaseAvailable();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    checkSupabaseAvailable();
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
    checkSupabaseAvailable();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    checkSupabaseAvailable();
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

  const checkActiveImpersonation = async () => {
    if (!isSupabaseConfigured() || !user) return;

    try {
      const { data, error } = await supabase.rpc('get_active_impersonation');

      if (error) {
        logger.error('[AUTH] Error checking active impersonation', error);
        return;
      }

      if (data && data.length > 0) {
        const session = data[0];
        logger.debug('[AUTH] Active impersonation found', session);

        const { data: impersonatedProfileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.impersonated_user_id)
          .maybeSingle();

        if (impersonatedProfileData) {
          setIsImpersonating(true);
          setImpersonatedProfile(impersonatedProfileData);
          setOriginalProfile(profile);
          setActiveImpersonation({
            sessionId: session.session_id,
            impersonatedUserId: session.impersonated_user_id,
            impersonatedEmail: session.impersonated_email,
            impersonatedFullName: session.impersonated_full_name,
            impersonatedRole: session.impersonated_role,
            startedAt: session.started_at,
            reason: session.reason,
          });
        }
      }
    } catch (error) {
      logger.error('[AUTH] Exception checking active impersonation', error);
    }
  };

  const startImpersonation = async (userId: string, reason?: string) => {
    checkSupabaseAvailable();

    if (!profile?.is_super_admin) {
      throw new Error('Only super admins can impersonate users');
    }

    try {
      logger.debug('[AUTH] Starting impersonation', { userId, reason });

      const { data: sessionId, error } = await supabase.rpc('start_impersonation', {
        target_user_id: userId,
        impersonation_reason: reason || null,
      });

      if (error) {
        throw error;
      }

      logger.debug('[AUTH] Impersonation session created', { sessionId });

      const { data: impersonatedProfileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!impersonatedProfileData) {
        throw new Error('Failed to load impersonated user profile');
      }

      setIsImpersonating(true);
      setImpersonatedProfile(impersonatedProfileData);
      setOriginalProfile(profile);

      await checkActiveImpersonation();

      logger.debug('[AUTH] Impersonation started successfully');
    } catch (error: any) {
      logger.error('[AUTH] Error starting impersonation', error);
      throw new Error(error.message || 'Failed to start impersonation');
    }
  };

  const endImpersonation = async () => {
    checkSupabaseAvailable();

    if (!isImpersonating) {
      return;
    }

    try {
      logger.debug('[AUTH] Ending impersonation');

      const { error } = await supabase.rpc('end_impersonation');

      if (error) {
        throw error;
      }

      setIsImpersonating(false);
      setImpersonatedProfile(null);
      setOriginalProfile(null);
      setActiveImpersonation(null);

      logger.debug('[AUTH] Impersonation ended successfully');
    } catch (error: any) {
      logger.error('[AUTH] Error ending impersonation', error);
      throw new Error(error.message || 'Failed to end impersonation');
    }
  };

  useEffect(() => {
    if (profile?.is_super_admin) {
      checkActiveImpersonation();
    }
  }, [profile]);

  return (
    <AuthContext.Provider value={{
      user,
      profile: isImpersonating ? impersonatedProfile : profile,
      loading,
      isImpersonating,
      impersonatedProfile,
      originalProfile,
      activeImpersonation,
      signIn,
      signUp,
      signOut,
      changePassword,
      resetPassword,
      updatePassword,
      refetchProfile,
      startImpersonation,
      endImpersonation
    }}>
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
