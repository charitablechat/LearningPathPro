import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Organization, getOrganization, checkFeatureLimit } from '../lib/organization';
import { supabase } from '../lib/supabase';

interface OrganizationContextType {
  organization: Organization | null;
  loading: boolean;
  refetchOrganization: () => Promise<void>;
  canCreateCourse: () => Promise<boolean>;
  canInviteInstructor: () => Promise<boolean>;
  canInviteLearner: () => Promise<boolean>;
  isTrialExpired: boolean;
  isSubscriptionActive: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrganization = async () => {
    if (!profile?.organization_id) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const org = await getOrganization(profile.organization_id);
    setOrganization(org);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganization();
  }, [profile?.organization_id]);

  const canCreateCourse = async (): Promise<boolean> => {
    if (!organization) return false;
    const result = await checkFeatureLimit(organization.id, 'courses');
    return result.allowed;
  };

  const canInviteInstructor = async (): Promise<boolean> => {
    if (!organization) return false;
    const result = await checkFeatureLimit(organization.id, 'instructors');
    return result.allowed;
  };

  const canInviteLearner = async (): Promise<boolean> => {
    if (!organization) return false;
    const result = await checkFeatureLimit(organization.id, 'learners');
    return result.allowed;
  };

  const isTrialExpired =
    organization?.subscription_status === 'trial' &&
    organization?.trial_ends_at &&
    new Date(organization.trial_ends_at) < new Date();

  const isSubscriptionActive =
    organization?.subscription_status === 'active' || organization?.subscription_status === 'lifetime';

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        loading,
        refetchOrganization: fetchOrganization,
        canCreateCourse,
        canInviteInstructor,
        canInviteLearner,
        isTrialExpired,
        isSubscriptionActive,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
