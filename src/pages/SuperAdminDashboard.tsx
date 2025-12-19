import { useState, useEffect } from 'react';
import { Shield, Building2, Users, CreditCard, TrendingUp, Search, UserCog, Tag, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase, Profile, UserRole } from '../lib/supabase';
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
            currentUserId={profile?.id}
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

function UsersTab({ users, searchQuery, setSearchQuery, loading, onPromoteToSuperAdmin, currentUserId }: any) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const { success: showToast } = useToast();

  const filteredUsers = users.filter(
    (user: Profile) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = async (newRole: UserRole) => {
    if (!selectedUser) return;

    try {
      const { data, error } = await supabase.rpc('update_organization_user_role', {
        target_user_id: selectedUser.id,
        new_role: newRole,
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          showToast('User role updated successfully');
          setShowRoleChangeModal(false);
          setSelectedUser(null);
          window.location.reload();
        } else {
          showToast(data.error || 'Failed to update user role');
        }
      }
    } catch (error: any) {
      console.error('Error updating user role:', error);
      showToast(error.message || 'Failed to update user role');
    }
  };

  return (
    <>
      <Card className="p-6 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">All Platform Users</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 w-64 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-green-600 hover:bg-green-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
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
                    {user.id === currentUserId ? (
                      <span
                        className="px-2 py-1 bg-slate-600/20 text-slate-400 rounded-full text-xs font-medium capitalize cursor-not-allowed"
                        title="You cannot change your own role"
                      >
                        {user.role}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleChangeModal(true);
                        }}
                        className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium capitalize hover:bg-blue-600/30 transition-colors"
                      >
                        {user.role}
                      </button>
                    )}
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

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            window.location.reload();
          }}
        />
      )}

      {showRoleChangeModal && selectedUser && (
        <ChangeRoleModal
          user={selectedUser}
          onClose={() => {
            setShowRoleChangeModal(false);
            setSelectedUser(null);
          }}
          onConfirm={handleRoleChange}
        />
      )}
    </>
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

function CreateUserModal({ onClose, onSuccess }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('learner');
  const [organizationId, setOrganizationId] = useState('');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { success: showToast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const { data } = await supabase
      .from('organizations')
      .select('id, name')
      .order('name');
    if (data) {
      setOrganizations(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            role,
            organization_id: organizationId || undefined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      if (result.success) {
        showToast('User created successfully');
        onSuccess();
      } else {
        throw new Error(result.error || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      showToast(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Create New User</h2>
          <p className="text-slate-400 text-sm mt-1">Add a new user to the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Secure password"
              required
              minLength={6}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="learner">Learner</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Organization (Optional)
            </label>
            <select
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangeRoleModal({ user, onClose, onConfirm }: any) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      learner: 'bg-blue-600/20 text-blue-400 border-blue-500/50',
      instructor: 'bg-green-600/20 text-green-400 border-green-500/50',
      admin: 'bg-orange-600/20 text-orange-400 border-orange-500/50',
    };
    return colors[role];
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Change User Role</h2>
          <p className="text-slate-400 text-sm mt-1">
            Update role for {user.full_name || user.email}
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {(['learner', 'instructor', 'admin'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedRole === role
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-700/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium capitalize">{role}</div>
                    <div className="text-slate-400 text-sm">
                      {role === 'learner' && 'Can enroll in and take courses'}
                      {role === 'instructor' && 'Can create and manage courses'}
                      {role === 'admin' && 'Can manage organization settings'}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                      role
                    )}`}
                  >
                    {role}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700 mt-6">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(selectedRole)}
              disabled={selectedRole === user.role}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Role
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
