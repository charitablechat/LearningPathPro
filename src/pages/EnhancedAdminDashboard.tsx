import { useState, useEffect } from 'react';
import {
  Users, BookOpen, TrendingUp, Settings, BarChart, Library,
  MessageSquare, CreditCard, ArrowLeft, Bell
} from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { AdminCourseManagement } from './AdminCourseManagement';
import { AdminContentLibrary } from './AdminContentLibrary';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSubscriptionDashboard } from './AdminSubscriptionDashboard';
import { OrganizationSettingsPage } from './OrganizationSettingsPage';

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  instructors: number;
  learners: number;
  publishedCourses: number;
  draftCourses: number;
}

type DashboardView =
  | 'overview'
  | 'courses'
  | 'users'
  | 'content-library'
  | 'analytics'
  | 'settings'
  | 'subscription'
  | 'announcements';

interface EnhancedAdminDashboardProps {
  onViewCourse: (course: { id: string; name: string }) => void;
}

export function EnhancedAdminDashboard({ onViewCourse }: EnhancedAdminDashboardProps) {
  const { organization } = useOrganization();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    instructors: 0,
    learners: 0,
    publishedCourses: 0,
    draftCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<DashboardView>('overview');

  useEffect(() => {
    loadData();
  }, [organization]);

  const loadData = async () => {
    if (!organization) return;

    try {
      const [profilesRes, coursesRes, enrollmentsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('organization_id', organization.id),
        supabase
          .from('courses')
          .select('id, status')
          .eq('organization_id', organization.id),
        supabase
          .from('enrollments')
          .select('id')
          .eq('organization_id', organization.id),
      ]);

      const profiles = profilesRes.data || [];
      const courses = coursesRes.data || [];

      setStats({
        totalUsers: profiles.length,
        totalCourses: courses.length,
        totalEnrollments: enrollmentsRes.data?.length || 0,
        instructors: profiles.filter((p) => p.role === 'instructor').length,
        learners: profiles.filter((p) => p.role === 'learner').length,
        publishedCourses: courses.filter(c => c.status === 'published').length,
        draftCourses: courses.filter(c => c.status === 'draft').length,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <div className="mb-8">
      {currentView !== 'overview' && (
        <Button
          variant="secondary"
          onClick={() => setCurrentView('overview')}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {currentView === 'overview' && 'Admin Dashboard'}
            {currentView === 'courses' && 'Course Management'}
            {currentView === 'users' && 'User Management'}
            {currentView === 'content-library' && 'Content Library'}
            {currentView === 'analytics' && 'Analytics & Reports'}
            {currentView === 'settings' && 'Organization Settings'}
            {currentView === 'subscription' && 'Subscription & Billing'}
            {currentView === 'announcements' && 'Announcements'}
          </h1>
          <p className="text-gray-400">
            {organization?.name}
          </p>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="hover:shadow-xl transition-all cursor-pointer hover:scale-105"
          onClick={() => setCurrentView('courses')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Courses</p>
              <p className="text-3xl font-bold text-white">{stats.totalCourses}</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {stats.publishedCourses} published, {stats.draftCourses} drafts
          </div>
        </Card>

        <Card
          className="hover:shadow-xl transition-all cursor-pointer hover:scale-105"
          onClick={() => setCurrentView('users')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {stats.instructors} instructors, {stats.learners} learners
          </div>
        </Card>

        <Card
          className="hover:shadow-xl transition-all cursor-pointer hover:scale-105"
          onClick={() => setCurrentView('analytics')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Enrollments</p>
              <p className="text-3xl font-bold text-white">{stats.totalEnrollments}</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Active learning paths
          </div>
        </Card>

        <Card
          className="hover:shadow-xl transition-all cursor-pointer hover:scale-105"
          onClick={() => setCurrentView('content-library')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Library className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Content Library</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Shared resources
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setCurrentView('courses')}
            >
              <BookOpen className="w-4 h-4 mr-3" />
              Create New Course
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setCurrentView('users')}
            >
              <Users className="w-4 h-4 mr-3" />
              Invite Team Members
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setCurrentView('analytics')}
            >
              <BarChart className="w-4 h-4 mr-3" />
              View Analytics
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setCurrentView('settings')}
            >
              <Settings className="w-4 h-4 mr-3" />
              Organization Settings
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-white mb-4">Platform Features</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCurrentView('content-library')}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
            >
              <Library className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-white font-medium text-sm">Content Library</p>
              <p className="text-gray-400 text-xs">Reusable lessons</p>
            </button>
            <button
              onClick={() => setCurrentView('announcements')}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
            >
              <Bell className="w-6 h-6 text-yellow-400 mb-2" />
              <p className="text-white font-medium text-sm">Announcements</p>
              <p className="text-gray-400 text-xs">Message users</p>
            </button>
            <button
              onClick={() => setCurrentView('subscription')}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
            >
              <CreditCard className="w-6 h-6 text-green-400 mb-2" />
              <p className="text-white font-medium text-sm">Subscription</p>
              <p className="text-gray-400 text-xs">Billing & usage</p>
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
            >
              <Settings className="w-6 h-6 text-blue-400 mb-2" />
              <p className="text-white font-medium text-sm">Settings</p>
              <p className="text-gray-400 text-xs">Customize</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderHeader()}

        {currentView === 'overview' && renderOverview()}
        {currentView === 'courses' && (
          <AdminCourseManagement
            onEditCourse={(course) => console.log('Edit course:', course)}
            onViewCourse={onViewCourse}
            onCreateCourse={() => console.log('Create course')}
          />
        )}
        {currentView === 'content-library' && <AdminContentLibrary />}
        {currentView === 'analytics' && <AdminAnalytics />}
        {currentView === 'settings' && <OrganizationSettingsPage />}
        {currentView === 'subscription' && <AdminSubscriptionDashboard />}
        {currentView === 'announcements' && (
          <Card>
            <p className="text-gray-400">Announcements feature coming soon...</p>
          </Card>
        )}
      </div>
    </div>
  );
}
