import { useState, useEffect } from 'react';
import { Shield, Building2, Users, CreditCard, TrendingUp, Search, UserCog, Tag, CheckCircle, XCircle, UserPlus, TestTube2, Edit2, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase, Profile, UserRole } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { navigateTo } from '../lib/router';
import { createOrganization, updateOrganization, deleteOrganization, slugify, Organization } from '../lib/organization';

type TabView = 'overview' | 'users' | 'organizations' | 'subscriptions' | 'promos' | 'superadmins' | 'role-testing';

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
          <TabButton
            active={currentTab === 'role-testing'}
            onClick={() => setCurrentTab('role-testing')}
            icon={<TestTube2 className="w-4 h-4" />}
          >
            Role Testing
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
        {currentTab === 'role-testing' && <RoleTestingTab users={allUsers} />}
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  const filteredOrgs = organizations.filter(
    (org: any) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (org: any) => {
    setSelectedOrg(org);
    setShowEditModal(true);
  };

  const handleDelete = (org: any) => {
    setSelectedOrg(org);
    setShowDeleteModal(true);
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
    <>
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
            <Button onClick={() => setShowCreateModal(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
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
                <th className="text-right py-3 px-4 text-slate-300 font-semibold">Actions</th>
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
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(org)}
                        className="text-blue-400 border-blue-500/50 hover:bg-blue-900/20"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(org)}
                        className="text-red-400 border-red-500/50 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </Card>

      {showCreateModal && (
        <CreateOrganizationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}

      {showEditModal && selectedOrg && (
        <EditOrganizationModal
          organization={selectedOrg}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOrg(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedOrg(null);
            fetchData();
          }}
        />
      )}

      {showDeleteModal && selectedOrg && (
        <DeleteOrganizationModal
          organization={selectedOrg}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedOrg(null);
          }}
          onSuccess={() => {
            setShowDeleteModal(false);
            setSelectedOrg(null);
            fetchData();
          }}
        />
      )}
    </>
  );
}

function UsersTab({ users, searchQuery, setSearchQuery, loading, onPromoteToSuperAdmin, currentUserId }: any) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const { success: showToast } = useToast();
  const { profile } = useAuth();

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

  const handleEdit = (user: Profile) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = (user: Profile) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleRefresh = () => {
    window.location.reload();
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
                <th className="text-right py-3 px-4 text-slate-300 font-semibold">Actions</th>
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
                    {user.id === currentUserId && profile?.email !== 'kale@charitablechat.com' ? (
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
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                        className="text-blue-400 border-blue-500/50 hover:bg-blue-900/20"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(user)}
                        className="text-red-400 border-red-500/50 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            handleRefresh();
          }}
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
            handleRefresh();
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

function RoleTestingTab({ users }: { users: Profile[] }) {
  const { startImpersonation } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | UserRole>('all');
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const { success: showToast, error: showError } = useToast();

  const nonSuperAdminUsers = users.filter((u) => !u.is_super_admin);

  const filteredUsers = nonSuperAdminUsers.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const usersByRole = {
    learner: filteredUsers.filter((u) => u.role === 'learner'),
    instructor: filteredUsers.filter((u) => u.role === 'instructor'),
    admin: filteredUsers.filter((u) => u.role === 'admin'),
  };

  const handleStartImpersonation = async (user: Profile, reason: string) => {
    try {
      await startImpersonation(user.id, reason);
      showToast(`Now impersonating ${user.full_name || user.email}`);
      setTimeout(() => {
        navigateTo('/dashboard');
      }, 500);
    } catch (error: any) {
      console.error('Error starting impersonation:', error);
      showError(error.message || 'Failed to start impersonation');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      learner: 'bg-blue-600/20 text-blue-400 border-blue-500/50',
      instructor: 'bg-green-600/20 text-green-400 border-green-500/50',
      admin: 'bg-orange-600/20 text-orange-400 border-orange-500/50',
    };
    return colors[role];
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Role Testing & Impersonation</h2>
            <p className="text-slate-400">
              Select a user to impersonate and test their role-specific dashboard and features
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedRole('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedRole === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => setSelectedRole('learner')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedRole === 'learner'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Learners
              </button>
              <button
                onClick={() => setSelectedRole('instructor')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedRole === 'instructor'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Instructors
              </button>
              <button
                onClick={() => setSelectedRole('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Admins
              </button>
            </div>
          </div>

          {selectedRole === 'all' ? (
            <div className="space-y-6">
              {(['learner', 'instructor', 'admin'] as UserRole[]).map((role) => (
                <div key={role}>
                  <h3 className="text-lg font-semibold text-white mb-3 capitalize flex items-center gap-2">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                        role
                      )}`}
                    >
                      {role}s
                    </span>
                    <span className="text-slate-400 text-sm">({usersByRole[role].length})</span>
                  </h3>
                  {usersByRole[role].length === 0 ? (
                    <div className="text-center py-8 bg-slate-700/30 rounded-lg">
                      <p className="text-slate-400">No {role}s found</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {usersByRole[role].map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onImpersonate={() => {
                            setSelectedUser(user);
                            setShowImpersonateModal(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 bg-slate-700/30 rounded-lg">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No users found</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onImpersonate={() => {
                        setSelectedUser(user);
                        setShowImpersonateModal(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {showImpersonateModal && selectedUser && (
        <ImpersonateModal
          user={selectedUser}
          onClose={() => {
            setShowImpersonateModal(false);
            setSelectedUser(null);
          }}
          onConfirm={handleStartImpersonation}
        />
      )}
    </>
  );
}

function UserCard({ user, onImpersonate }: { user: Profile; onImpersonate: () => void }) {
  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      learner: 'bg-blue-600/20 text-blue-400 border-blue-500/50',
      instructor: 'bg-green-600/20 text-green-400 border-green-500/50',
      admin: 'bg-orange-600/20 text-orange-400 border-orange-500/50',
    };
    return colors[role];
  };

  return (
    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium truncate">{user.full_name || 'N/A'}</div>
          <div className="text-slate-400 text-sm truncate">{user.email}</div>
        </div>
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
            user.role
          )} capitalize ml-2 flex-shrink-0`}
        >
          {user.role}
        </span>
      </div>
      <Button onClick={onImpersonate} size="sm" className="w-full bg-amber-600 hover:bg-amber-700">
        <TestTube2 className="w-4 h-4 mr-2" />
        Test as {user.role}
      </Button>
    </div>
  );
}

function ImpersonateModal({
  user,
  onClose,
  onConfirm,
}: {
  user: Profile;
  onClose: () => void;
  onConfirm: (user: Profile, reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(user, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Start Impersonation</h2>
          <p className="text-slate-400 text-sm mt-1">
            You are about to impersonate {user.full_name || user.email}
          </p>
        </div>

        <div className="p-6">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-200">
                <p className="font-medium mb-1">Important:</p>
                <ul className="space-y-1 text-amber-200/80">
                  <li>• You will see their dashboard and data</li>
                  <li>• Actions you take will affect their account</li>
                  <li>• This session is logged for security</li>
                  <li>• You can exit anytime using the banner</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Reason for Impersonation (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Testing course creation workflow, debugging enrollment issue..."
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700 mt-6">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-amber-600 hover:bg-amber-700">
              <TestTube2 className="w-4 h-4 mr-2" />
              Start Testing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateOrganizationModal({ onClose, onSuccess }: any) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#1E40AF');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { success: showToast, error: showError } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .order('email');
    if (data) {
      setUsers(data);
    }
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    setSlug(slugify(newName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const org = await createOrganization({
        name,
        slug,
        owner_id: ownerId,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });

      if (org) {
        await supabase
          .from('profiles')
          .update({ organization_id: org.id, role: 'admin' })
          .eq('id', ownerId);

        showToast('Organization created successfully');
        onSuccess();
      } else {
        showError('Failed to create organization');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Create New Organization</h2>
          <p className="text-slate-400 text-sm mt-1">Set up a new organization on the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Organization Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Acme Corporation"
              required
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Slug (URL identifier)
            </label>
            <Input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="acme-corporation"
              required
              className="bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-slate-400 text-xs mt-1">
              Used in URLs and must be unique
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Owner
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select an owner...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-slate-600 cursor-pointer"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-slate-600 cursor-pointer"
                />
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
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
              {loading ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditOrganizationModal({ organization, onClose, onSuccess }: any) {
  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);
  const [ownerId, setOwnerId] = useState(organization.owner_id);
  const [primaryColor, setPrimaryColor] = useState(organization.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(organization.secondary_color);
  const [subscriptionStatus, setSubscriptionStatus] = useState(organization.subscription_status);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { success: showToast, error: showError } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .order('email');
    if (data) {
      setUsers(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await updateOrganization(organization.id, {
        name,
        slug,
        owner_id: ownerId,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        subscription_status: subscriptionStatus as any,
      });

      if (updated) {
        if (ownerId !== organization.owner_id) {
          await supabase
            .from('profiles')
            .update({ organization_id: null })
            .eq('id', organization.owner_id);

          await supabase
            .from('profiles')
            .update({ organization_id: organization.id, role: 'admin' })
            .eq('id', ownerId);
        }

        showToast('Organization updated successfully');
        onSuccess();
      } else {
        showError('Failed to update organization');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Edit Organization</h2>
          <p className="text-slate-400 text-sm mt-1">Update organization settings</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Organization Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corporation"
              required
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Slug (URL identifier)
            </label>
            <Input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="acme-corporation"
              required
              className="bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-slate-400 text-xs mt-1">
              Used in URLs and must be unique
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Owner
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select an owner...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subscription Status
            </label>
            <select
              value={subscriptionStatus}
              onChange={(e) => setSubscriptionStatus(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-slate-600 cursor-pointer"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-slate-600 cursor-pointer"
                />
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Updating...' : 'Update Organization'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteOrganizationModal({ organization, onClose, onSuccess }: any) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const { success: showToast, error: showError } = useToast();

  const handleDelete = async () => {
    if (confirmText !== organization.name) {
      showError('Organization name does not match');
      return;
    }

    setLoading(true);

    try {
      const success = await deleteOrganization(organization.id);

      if (success) {
        showToast('Organization deleted successfully');
        onSuccess();
      } else {
        showError('Failed to delete organization');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to delete organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Delete Organization</h2>
          <p className="text-slate-400 text-sm mt-1">
            This action cannot be undone
          </p>
        </div>

        <div className="p-6">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-200">
                <p className="font-medium mb-1">Warning:</p>
                <ul className="space-y-1 text-red-200/80">
                  <li>• All courses under this organization will be deleted</li>
                  <li>• All user associations will be removed</li>
                  <li>• All enrollments and progress will be lost</li>
                  <li>• All subscriptions will be canceled</li>
                  <li>• This action is permanent and cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type the organization name to confirm: <span className="text-white font-bold">{organization.name}</span>
              </label>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={organization.name}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700 mt-6">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={confirmText !== organization.name || loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete Organization'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSuccess }: any) {
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.full_name || '');
  const [role, setRole] = useState<UserRole>(user.role);
  const [organizationId, setOrganizationId] = useState(user.organization_id || '');
  const [isSuperAdmin, setIsSuperAdmin] = useState(user.is_super_admin || false);
  const [password, setPassword] = useState('');
  const [updatePassword, setUpdatePassword] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { success: showToast, error: showError } = useToast();
  const { profile } = useAuth();

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

      const updates: any = {
        userId: user.id,
        email,
        full_name: fullName,
        role,
        organization_id: organizationId || null,
        is_super_admin: isSuperAdmin,
      };

      if (updatePassword && password) {
        updates.password = password;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      if (result.success) {
        showToast('User updated successfully');
        onSuccess();
      } else {
        throw new Error(result.error || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      showError(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const canEditSuperAdmin = user.id !== profile?.id;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Edit User</h2>
          <p className="text-slate-400 text-sm mt-1">Update user information and settings</p>
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
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
              <input
                type="checkbox"
                checked={updatePassword}
                onChange={(e) => setUpdatePassword(e.target.checked)}
                className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span>Update Password</span>
            </label>
            {updatePassword && (
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                minLength={6}
                className="bg-slate-700 border-slate-600 text-white"
              />
            )}
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
              Organization
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

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isSuperAdmin}
                onChange={(e) => setIsSuperAdmin(e.target.checked)}
                disabled={!canEditSuperAdmin}
                className="rounded border-slate-600 bg-slate-700 text-orange-600 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-sm font-medium text-slate-300">
                Super Admin
              </span>
            </label>
            {!canEditSuperAdmin && (
              <p className="text-slate-400 text-xs mt-1">
                You cannot change your own super admin status
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteUserModal({ user, onClose, onSuccess }: any) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const { success: showToast, error: showError } = useToast();
  const { profile } = useAuth();

  const canDelete = user.id !== profile?.id;

  const handleDelete = async () => {
    if (confirmText !== user.email) {
      showError('Email address does not match');
      return;
    }

    if (!canDelete) {
      showError('You cannot delete your own account');
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      if (result.success) {
        showToast('User deleted successfully');
        onSuccess();
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showError(error.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Delete User</h2>
          <p className="text-slate-400 text-sm mt-1">
            This action cannot be undone
          </p>
        </div>

        <div className="p-6">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-200">
                <p className="font-medium mb-1">Warning:</p>
                <ul className="space-y-1 text-red-200/80">
                  <li>• User will be permanently deleted from the system</li>
                  <li>• All user data and progress will be lost</li>
                  <li>• User enrollments will be removed</li>
                  <li>• This action is permanent and cannot be undone</li>
                  {!canDelete && <li className="text-red-300 font-bold">• You cannot delete your own account</li>}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type the user's email to confirm: <span className="text-white font-bold">{user.email}</span>
              </label>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={user.email}
                className="bg-slate-700 border-slate-600 text-white"
                disabled={!canDelete}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700 mt-6">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={confirmText !== user.email || loading || !canDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
