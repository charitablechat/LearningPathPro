import { useState, useEffect } from 'react';
import { TrendingUp, Users, BookOpen, Clock, Award, BarChart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import { Card } from '../components/Card';

interface CourseAnalytics {
  id: string;
  course_id: string;
  total_enrollments: number;
  active_enrollments: number;
  completion_rate: number;
  average_progress: number;
  total_time_spent: number;
  course?: {
    title: string;
  };
}

interface OrganizationStats {
  totalCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  activeEnrollments: number;
  averageCompletion: number;
  totalLearningTime: number;
}

export function AdminAnalytics() {
  const { organization } = useOrganization();
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics[]>([]);
  const [orgStats, setOrgStats] = useState<OrganizationStats>({
    totalCourses: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    averageCompletion: 0,
    totalLearningTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [organization]);

  const loadAnalytics = async () => {
    if (!organization) return;

    try {
      const [analyticsRes, coursesRes, profilesRes, enrollmentsRes] = await Promise.all([
        supabase
          .from('course_analytics')
          .select(`
            *,
            course:courses(title)
          `)
          .eq('organization_id', organization.id),
        supabase
          .from('courses')
          .select('id')
          .eq('organization_id', organization.id),
        supabase
          .from('profiles')
          .select('id')
          .eq('organization_id', organization.id),
        supabase
          .from('enrollments')
          .select('id, progress')
          .eq('organization_id', organization.id),
      ]);

      setCourseAnalytics(analyticsRes.data || []);

      const enrollments = enrollmentsRes.data || [];
      const activeEnrollments = enrollments.filter(e => e.progress < 100).length;
      const avgCompletion = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
        : 0;

      setOrgStats({
        totalCourses: coursesRes.data?.length || 0,
        totalUsers: profilesRes.data?.length || 0,
        totalEnrollments: enrollments.length,
        activeEnrollments,
        averageCompletion: avgCompletion,
        totalLearningTime: 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
        <p className="text-gray-400">Track learner progress and course performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Courses</p>
              <p className="text-2xl font-bold text-white">{orgStats.totalCourses}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Learners</p>
              <p className="text-2xl font-bold text-white">{orgStats.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Enrollments</p>
              <p className="text-2xl font-bold text-white">{orgStats.activeEnrollments}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Completion</p>
              <p className="text-2xl font-bold text-white">{orgStats.averageCompletion.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-600 rounded-lg">
              <BarChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Enrollments</p>
              <p className="text-2xl font-bold text-white">{orgStats.totalEnrollments}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-600 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Learning Time</p>
              <p className="text-2xl font-bold text-white">{formatTime(orgStats.totalLearningTime)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Course Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Course</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Enrollments</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Active</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Completion Rate</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Avg Progress</th>
              </tr>
            </thead>
            <tbody>
              {courseAnalytics.map((analytics) => (
                <tr key={analytics.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-white">{analytics.course?.title || 'Unknown'}</td>
                  <td className="py-3 px-4 text-gray-400">{analytics.total_enrollments}</td>
                  <td className="py-3 px-4 text-gray-400">{analytics.active_enrollments}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${analytics.completion_rate}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{analytics.completion_rate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${analytics.average_progress}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{analytics.average_progress.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {courseAnalytics.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No analytics data available yet. Data will appear once courses have enrollments.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
