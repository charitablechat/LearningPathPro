import { useState, useEffect } from 'react';
import { Building2, Palette, Globe, CreditCard, Users as UsersIcon, Save } from 'lucide-react';
import { useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { updateOrganization, getOrganizationSubscription, getOrganizationUsage } from '../lib/organization';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';

export function OrganizationSettingsPage() {
  const { organization, refetchOrganization } = useOrganization();
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'subscription' | 'team'>('general');
  const [name, setName] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#1E40AF');
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'instructor' | 'learner'>('learner');

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setCustomDomain(organization.custom_domain || '');
      setPrimaryColor(organization.primary_color);
      setSecondaryColor(organization.secondary_color);

      const fetchData = async () => {
        const [subData, usageData] = await Promise.all([
          getOrganizationSubscription(organization.id),
          getOrganizationUsage(organization.id),
        ]);
        setSubscriptionData(subData);
        setUsage(usageData);
      };
      fetchData();
    }
  }, [organization]);

  const isOwner = profile?.id === organization?.owner_id;
  const isAdmin = profile?.role === 'admin' || isOwner;

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-8 text-center">
          <p className="text-slate-400">You don't have permission to access organization settings.</p>
        </Card>
      </div>
    );
  }

  const handleSaveGeneral = async () => {
    if (!organization) return;

    setLoading(true);
    const updated = await updateOrganization(organization.id, { name, custom_domain: customDomain || null });
    setLoading(false);

    if (updated) {
      showToast('Organization settings updated successfully', 'success');
      await refetchOrganization();
    } else {
      showToast('Failed to update organization settings', 'error');
    }
  };

  const handleSaveBranding = async () => {
    if (!organization) return;

    setLoading(true);
    const updated = await updateOrganization(organization.id, {
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    });
    setLoading(false);

    if (updated) {
      showToast('Branding updated successfully', 'success');
      await refetchOrganization();
    } else {
      showToast('Failed to update branding', 'error');
    }
  };

  const handleInviteUser = async () => {
    if (!organization || !inviteEmail.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('organization_invitations').insert({
      organization_id: organization.id,
      email: inviteEmail.toLowerCase(),
      role: inviteRole,
      invited_by: profile!.id,
    });
    setLoading(false);

    if (error) {
      console.error('Error creating invitation:', error);
      showToast('Failed to send invitation', 'error');
    } else {
      showToast(`Invitation sent to ${inviteEmail}`, 'success');
      setInviteEmail('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      trial: 'bg-blue-600/20 text-blue-400 border-blue-500/50',
      active: 'bg-green-600/20 text-green-400 border-green-500/50',
      lifetime: 'bg-purple-600/20 text-purple-400 border-purple-500/50',
      past_due: 'bg-orange-600/20 text-orange-400 border-orange-500/50',
      canceled: 'bg-red-600/20 text-red-400 border-red-500/50',
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
          statusColors[status] || statusColors.canceled
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Organization Settings</h1>
        <p className="text-slate-400">Manage your organization configuration and preferences</p>
      </div>

      <div className="flex items-center space-x-2 border-b border-slate-700 mb-8">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'general'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          General
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'branding'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Branding
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'subscription'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Subscription
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'team'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <UsersIcon className="w-4 h-4 inline mr-2" />
          Team
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Organization Name
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subdomain</label>
                <div className="flex items-center space-x-2">
                  <Input value={organization?.slug || ''} disabled className="flex-1" />
                  <span className="text-slate-400 text-sm">.clearcoursestudio.com</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Subdomain cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Custom Domain
                  <span className="ml-2 text-xs text-blue-400">(Enterprise plan only)</span>
                </label>
                <Input
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="learn.yourcompany.com"
                  disabled={!subscriptionData?.plan?.features?.custom_domain}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Configure your DNS to point to our servers
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={handleSaveGeneral} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Brand Colors</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-600"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Secondary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-600"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div
              className="p-8 rounded-lg mb-6"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              <p className="text-white font-semibold text-lg text-center">Color Preview</p>
            </div>

            <Button onClick={handleSaveBranding} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Branding
            </Button>
          </Card>
        </div>
      )}

      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Subscription</h2>
            {subscriptionData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Plan</span>
                  <span className="text-white font-semibold">{subscriptionData.plan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Status</span>
                  {getStatusBadge(organization?.subscription_status || 'trial')}
                </div>
                {organization?.trial_ends_at && organization.subscription_status === 'trial' && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Trial Ends</span>
                    <span className="text-white">{formatDate(organization.trial_ends_at)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Billing Cycle</span>
                  <span className="text-white capitalize">{subscriptionData.subscription.billing_cycle}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-4">No active subscription</p>
                <Button href="/pricing">View Plans</Button>
              </div>
            )}
          </Card>

          {usage && subscriptionData && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Usage</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300">Courses</span>
                    <span className="text-white">
                      {usage.courses} / {subscriptionData.plan.max_courses || 'Unlimited'}
                    </span>
                  </div>
                  {subscriptionData.plan.max_courses && (
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((usage.courses / subscriptionData.plan.max_courses) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300">Instructors</span>
                    <span className="text-white">
                      {usage.instructors} / {subscriptionData.plan.max_instructors || 'Unlimited'}
                    </span>
                  </div>
                  {subscriptionData.plan.max_instructors && (
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((usage.instructors / subscriptionData.plan.max_instructors) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300">Learners</span>
                    <span className="text-white">
                      {usage.learners} / {subscriptionData.plan.max_learners?.toLocaleString()}
                    </span>
                  </div>
                  {subscriptionData.plan.max_learners && (
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((usage.learners / subscriptionData.plan.max_learners) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Invite Team Members</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'instructor' | 'learner')}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>

              <Button onClick={handleInviteUser} disabled={loading}>
                <UsersIcon className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
