import { useState, useEffect } from 'react';
import { Shield, Building2, Users, CreditCard, TrendingUp, Search, UserCog, Tag, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase, Profile } from '../lib/supabase';
import { useToast } from '../hooks/useToast';

type TabView = 'overview' | 'users' | 'organizations' | 'subscriptions' | 'promos' | 'superadmins';

export function SuperAdminDashboard() {
  const { profile } = useAuth();
  const { success: showToast } = useToast();
  const [currentTab, setCurrentTab] = useState<TabView>('overview');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [superAdmins, setSuperAdmins] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.is_super_admin) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);

    const [orgsResult, usersResult, subsResult, allUsersResult, superAdminsResult] = await Promise.all([
      supabase
        .from('organizations')
        .select('*, profiles!organizations_owner_id_fkey(email, full_name), subscriptions(*, subscription_plans(*))')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .in('status', ['active', 'trialing']),
      supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('*')
        .eq('is_super_admin', true)
        .order('created_at', { ascending: false }),
    ]);

    if (orgsResult.data) {
      setOrganizations(orgsResult.data);
      setStats({
        totalOrgs: orgsResult.data.length,
        totalUsers: usersResult.count || 0,
        activeSubscriptions: subsResult.data?.length || 0,
        totalRevenue: 0,
      });
    }

    if (allUsersResult.data) {
      setAllUsers(allUsersResult.data);
    }

    if (superAdminsResult.data) {
      setSuperAdmins(superAdminsResult.data);
    }

    setLoading(false);
  };

  const promoteToSuperAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('promote_to_superadmin', {
        target_user_id: userId,
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          showToast('User promoted to superadmin successfully');
          await fetchData();
        } else {
          showToast(data.error || 'Failed to promote user');
        }
      }
    } catch (error: any) {
      console.error('Error promoting user:', error);
      showToast(error.message || 'Failed to promote user to superadmin');
    }
  };

  const demoteFromSuperAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('demote_from_superadmin', {
        target_user_id: userId,
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          showToast('User demoted from superadmin successfully');
          await fetchData();
        } else {
          showToast(data.error || 'Failed to demote user');
        }
      }
    } catch (error: any) {
      console.error('Error demoting user:', error);
      showToast(error.message || 'Failed to demote user from superadmin');
    }
  };

  if (!profile?.is_super_admin) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-8 text-center bg-slate-800 border-slate-700">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">You don't have permission to access the super admin dashboard.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
          </div>
          <p className="text-slate-400">Platform-wide administration and monitoring</p>
        </div>

        <div className="flex space-x-2 mb-8 overflow-x-auto">
          <TabButton
            active={currentTab === 'overview'}
            onClick={() => setCurrentTab('overview')}
            icon={<TrendingUp className="w-4 h-4" />}
          >
            Overview
          </TabButton>
          <TabButton
            active={currentTab === 'organizations'}
            onClick={() => setCurrentTab('organizations')}
            icon={<Building2 className="w-4 h-4" />}
          >
            Organizations
          </TabButton>
          <TabButton
            active={currentTab === 'users'}
            onClick={() => setCurrentTab('users')}
            icon={<Users className="w-4 h-4" />}
          >
            All Users
          </TabButton>
          <TabButton
            active={currentTab === 'superadmins'}
            onClick={() => setCurrentTab('superadmins')}
            icon={<UserCog className="w-4 h-4" />}
          >
            Super Admins
          </TabButton>
          <TabButton
            active={currentTab === 'subscriptions'}
            onClick={() => setCurrentTab('subscriptions')}
            icon={<CreditCard className="w-4 h-4" />}
          >
            Subscriptions
          </TabButton>
          <TabButton
            active={currentTab === 'promos'}
            onClick={() => setCurrentTab('promos')}
            icon={<Tag className="w-4 h-4" />}
          >
            Promo Codes
          </TabButton>
        </div>

        {currentTab === 'overview' && (
          <OverviewTab stats={stats} organizations={organizations} />
        )}
        {currentTab === 'organizations' && (
          <OrganizationsTab
            organizations={organizations}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            loading={loading}
            fetchData={fetchData}
          />
        )}
        {currentTab === 'users' && (
          <UsersTab
            users={allUsers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            loading={loading}
            onPromoteToSuperAdmin={promoteToSuperAdmin}
          />
        )}
        {currentTab === 'superadmins' && (
          <SuperAdminsTab
            superAdmins={superAdmins}
            allUsers={allUsers}
            loading={loading}
            onPromote={promoteToSuperAdmin}
            onDemote={demoteFromSuperAdmin}
          />
        )}
        {currentTab === 'subscriptions' && <SubscriptionsTab />}
        {currentTab === 'promos' && <PromosTab />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function OverviewTab({ stats, organizations }: any) {
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
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
          statusColors[status] || statusColors.canceled
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.totalOrgs}</span>
          </div>
          <p className="text-slate-400 text-sm">Total Organizations</p>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
          </div>
          <p className="text-slate-400 text-sm">Total Users</p>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">{stats.activeSubscriptions}</span>
          </div>
          <p className="text-slate-400 text-sm">Active Subscriptions</p>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            <span className="text-2xl font-bold text-white">
              {stats.totalOrgs > 0 ? ((stats.activeSubscriptions / stats.totalOrgs) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <p className="text-slate-400 text-sm">Conversion Rate</p>
        </Card>
      </div>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Organizations</h2>
        <div className="space-y-3">
          {organizations.slice(0, 5).map((org: any) => (
            <div key={org.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex-1">
                <div className="text-white font-medium">{org.name}</div>
                <div className="text-slate-400 text-sm">{org.profiles?.email}</div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(org.subscription_status)}
                <span className="text-slate-400 text-sm">
                  {new Date(org.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OrganizationsTab({ organizations, searchQuery, setSearchQuery, loading, fetchData }: any) {
  const filteredOrgs = organizations.filter(
    (org: any) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
          statusColors[status] || statusColors.canceled
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">All Organizations</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organizations..."
              className="pl-10 w-64 bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading organizations...</p>
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No organizations found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Organization</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Owner</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Plan</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.map((org: any) => (
                <tr key={org.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-white font-medium">{org.name}</div>
                      <div className="text-slate-400 text-sm">{org.slug}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-slate-300">{org.profiles?.full_name || 'N/A'}</div>
                      <div className="text-slate-400 text-sm">{org.profiles?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(org.subscription_status)}</td>
                  <td className="py-4 px-4">
                    <div className="text-slate-300">
                      {org.subscriptions && org.subscriptions.length > 0
                        ? org.subscriptions[0].subscription_plans?.name || 'N/A'
                        : 'Trial'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-slate-300">{formatDate(org.created_at)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function UsersTab({ users, searchQuery, setSearchQuery, loading, onPromoteToSuperAdmin }: any) {
  const filteredUsers = users.filter(
    (user: Profile) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">All Platform Users</h2>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="pl-10 w-64 bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">User</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Email</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Role</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Super Admin</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: Profile) => (
                <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-4 px-4">
                    <div className="text-white font-medium">{user.full_name || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-slate-300">{user.email}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {user.is_super_admin ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-600" />
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {!user.is_super_admin && (
                      <Button
                        size="sm"
                        onClick={() => onPromoteToSuperAdmin(user.id)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Promote to Super Admin
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function SuperAdminsTab({ superAdmins, allUsers, loading, onPromote, onDemote }: any) {
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const nonSuperAdminUsers = allUsers.filter((u: Profile) => !u.is_super_admin);


  const confirmPromote = () => {
    if (selectedUser) {
      onPromote(selectedUser.id);
      setShowPromoteModal(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Current Super Admins</h2>
            <p className="text-slate-400 text-sm mt-1">
              Users with platform-wide administrative access
            </p>
          </div>
          <Button onClick={() => setShowPromoteModal(true)}>
            <UserCog className="w-4 h-4 mr-2" />
            Promote User
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading super admins...</p>
          </div>
        ) : superAdmins.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No super admins found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {superAdmins.map((admin: Profile) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-orange-500/20"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{admin.full_name || 'N/A'}</div>
                    <div className="text-slate-400 text-sm">{admin.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full border border-orange-500/50">
                    Super Admin
                  </span>
                  {admin.email !== 'mydogkenna@gmail.com' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDemote(admin.id)}
                      className="text-red-400 border-red-500/50 hover:bg-red-900/20"
                    >
                      Demote
                    </Button>
                  )}
                  {admin.email === 'mydogkenna@gmail.com' && (
                    <span className="text-xs px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/50">
                      Original Super Admin
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showPromoteModal && (
        <PromoteSuperAdminModal
          users={nonSuperAdminUsers}
          onClose={() => setShowPromoteModal(false)}
          onConfirm={confirmPromote}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      )}
    </div>
  );
}

function PromoteSuperAdminModal({ users, onClose, onConfirm, selectedUser, setSelectedUser }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(
    (user: Profile) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-700 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Promote User to Super Admin</h2>
          <p className="text-slate-400 text-sm mt-1">
            Select a user to grant platform-wide administrative access
          </p>
        </div>

        <div className="p-6 border-b border-slate-700">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user: Profile) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedUser?.id === user.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-700/30'
                  }`}
                >
                  <div className="text-white font-medium">{user.full_name || 'N/A'}</div>
                  <div className="text-slate-400 text-sm">{user.email}</div>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!selectedUser}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Promote to Super Admin
          </Button>
        </div>
      </div>
    </div>
  );
}

function SubscriptionsTab() {
  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-4">Subscription Management</h2>
      <p className="text-slate-400">Subscription management features coming soon.</p>
    </Card>
  );
}

function PromosTab() {
  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-4">Promo Code Management</h2>
      <p className="text-slate-400">Promo code management features coming soon.</p>
    </Card>
  );
}
