import { useState, useEffect } from 'react';
import {
  Users, BookOpen, TrendingUp, Settings, BarChart, Library,
  CreditCard, ArrowLeft, Bell
} from 'lucide-react';
import { supabase, Course } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
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
  useAuth();
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
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

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
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Total Courses</p>
                <Tooltip content="All courses in your organization, including published and draft courses. Click to manage courses." />
              </div>
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
            onEditCourse={(course) => setEditingCourse(course as unknown as Course)}
            onViewCourse={onViewCourse}
            onCreateCourse={() => setShowCreateCourse(true)}
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

      {(showCreateCourse || editingCourse) && (
        <CourseModal
          course={editingCourse}
          onClose={() => {
            setShowCreateCourse(false);
            setEditingCourse(null);
          }}
          onSave={() => {
            setShowCreateCourse(false);
            setEditingCourse(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function CourseModal({
  course,
  onClose,
  onSave,
}: {
  course: Course | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (course) {
        await supabase
          .from('courses')
          .update({ title, description })
          .eq('id', course.id);
      } else {
        if (!organization?.id) {
          setError('Organization context is required to create a course');
          setLoading(false);
          return;
        }
        await supabase.from('courses').insert({
          title,
          description,
          instructor_id: user?.id,
          organization_id: organization.id,
        });
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {course ? 'Edit Course' : 'Create New Course'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Course Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title"
              required
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description"
              rows={4}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
