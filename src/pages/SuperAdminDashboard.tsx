import { useState, useEffect } from 'react';
import { Shield, Building2, Users, CreditCard, TrendingUp, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

export function SuperAdminDashboard() {
  const { profile } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
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

    const [orgsResult, usersResult, subsResult] = await Promise.all([
      supabase
        .from('organizations')
        .select('*, profiles!organizations_owner_id_fkey(email), subscriptions(*, subscription_plans(*))')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .in('status', ['active', 'trialing']),
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

    setLoading(false);
  };

  if (!profile?.is_super_admin) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">You don't have permission to access the super admin dashboard.</p>
        </Card>
      </div>
    );
  }

  const filteredOrgs = organizations.filter(
    (org) =>
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
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
        </div>
        <p className="text-slate-400">Platform-wide administration and monitoring</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.totalOrgs}</span>
          </div>
          <p className="text-slate-400 text-sm">Total Organizations</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
          </div>
          <p className="text-slate-400 text-sm">Total Users</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">{stats.activeSubscriptions}</span>
          </div>
          <p className="text-slate-400 text-sm">Active Subscriptions</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            <span className="text-2xl font-bold text-white">
              {((stats.activeSubscriptions / stats.totalOrgs) * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-slate-400 text-sm">Conversion Rate</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">All Organizations</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizations..."
                className="pl-10 w-64"
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
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-white font-medium">{org.name}</div>
                        <div className="text-slate-400 text-sm">{org.slug}.clearcoursestudio.com</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-slate-300">{org.profiles?.email || 'N/A'}</div>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(`https://${org.slug}.clearcoursestudio.com`, '_blank');
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
