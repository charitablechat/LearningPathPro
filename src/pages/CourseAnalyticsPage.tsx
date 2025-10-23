import { useState, useEffect } from 'react';
import { ArrowLeft, Users, CheckCircle, Clock, TrendingUp, User, Eye } from 'lucide-react';
import { supabase, Profile, Module, Lesson, LessonProgress } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ProgressRing } from '../components/ProgressRing';

interface CourseAnalyticsPageProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
}

interface EnrollmentData {
  id: string;
  user_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percentage: number;
  user: Profile;
}

interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

interface StudentProgress {
  enrollment: EnrollmentData;
  completedLessons: number;
  totalLessons: number;
  moduleProgress: Map<string, { completed: number; total: number }>;
  lessonProgress: Map<string, LessonProgress | null>;
}

export function CourseAnalyticsPage({ courseId, courseName, onBack }: CourseAnalyticsPageProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [courseId]);

  const loadAnalytics = async () => {
    try {
      const [enrollmentsRes, modulesRes] = await Promise.all([
        supabase
          .from('enrollments')
          .select(`
            *,
            user:profiles!user_id(*)
          `)
          .eq('course_id', courseId)
          .order('enrolled_at', { ascending: false }),
        supabase
          .from('modules')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index'),
      ]);

      const enrollmentsData = enrollmentsRes.data || [];
      setEnrollments(enrollmentsData);

      const modulesData = modulesRes.data || [];
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (module) => {
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order_index');

          return {
            ...module,
            lessons: lessonsData || [],
          };
        })
      );

      setModules(modulesWithLessons);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProgress = async (enrollment: EnrollmentData) => {
    try {
      const allLessons = modules.flatMap(m => m.lessons);
      const lessonIds = allLessons.map(l => l.id);

      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', enrollment.user_id)
        .in('lesson_id', lessonIds);

      const progressMap = new Map<string, LessonProgress | null>();
      allLessons.forEach(lesson => {
        const progress = progressData?.find(p => p.lesson_id === lesson.id);
        progressMap.set(lesson.id, progress || null);
      });

      const completedLessons = progressData?.filter(p => p.is_completed).length || 0;

      const moduleProgress = new Map<string, { completed: number; total: number }>();
      modules.forEach(module => {
        const moduleLessons = module.lessons;
        const completedInModule = moduleLessons.filter(lesson => {
          const progress = progressMap.get(lesson.id);
          return progress?.is_completed;
        }).length;

        moduleProgress.set(module.id, {
          completed: completedInModule,
          total: moduleLessons.length,
        });
      });

      setSelectedStudent({
        enrollment,
        completedLessons,
        totalLessons: allLessons.length,
        moduleProgress,
        lessonProgress: progressMap,
      });
    } catch (error) {
      console.error('Error loading student progress:', error);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalEnrolled: enrollments.length,
    completed: enrollments.filter(e => e.completed_at).length,
    inProgress: enrollments.filter(e => !e.completed_at && e.progress_percentage > 0).length,
    notStarted: enrollments.filter(e => e.progress_percentage === 0).length,
    avgProgress: enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / enrollments.length)
      : 0,
  };

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
        <Button
          variant="secondary"
          onClick={onBack}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Course Analytics</h1>
          <p className="text-gray-400">{courseName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Enrolled</p>
                <p className="text-2xl font-bold text-white">{stats.totalEnrolled}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-600 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-600 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Not Started</p>
                <p className="text-2xl font-bold text-white">{stats.notStarted}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Avg Progress</p>
                <p className="text-2xl font-bold text-white">{stats.avgProgress}%</p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Student Progress</h2>
            <Input
              type="text"
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Student</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Progress</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Enrolled</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{enrollment.user.full_name || 'N/A'}</p>
                        <p className="text-gray-400 text-sm">{enrollment.user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <ProgressRing progress={enrollment.progress_percentage} size={40} strokeWidth={4} />
                        <span className="text-white font-medium">{enrollment.progress_percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {enrollment.completed_at ? (
                        <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded-full">
                          Completed
                        </span>
                      ) : enrollment.progress_percentage > 0 ? (
                        <span className="px-2 py-1 bg-orange-900/50 text-orange-300 text-xs rounded-full">
                          In Progress
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
                          Not Started
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadStudentProgress(enrollment)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEnrollments.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                {searchTerm ? 'No students found' : 'No students enrolled yet'}
              </div>
            )}
          </div>
        </Card>
      </div>

      {selectedStudent && (
        <StudentProgressModal
          student={selectedStudent}
          modules={modules}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

function StudentProgressModal({
  student,
  modules,
  onClose,
}: {
  student: StudentProgress;
  modules: ModuleWithLessons[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-700 my-8">
        <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {student.enrollment.user.full_name || 'Student'}
              </h2>
              <p className="text-gray-400 text-sm">{student.enrollment.user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Overall Progress</p>
                <p className="text-2xl font-bold text-white">{student.enrollment.progress_percentage}%</p>
              </div>
              <ProgressRing progress={student.enrollment.progress_percentage} size={60} strokeWidth={6} />
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="mb-6 grid grid-cols-3 gap-4">
            <Card className="bg-gray-900/50">
              <p className="text-gray-400 text-sm mb-1">Total Lessons</p>
              <p className="text-2xl font-bold text-white">{student.totalLessons}</p>
            </Card>
            <Card className="bg-gray-900/50">
              <p className="text-gray-400 text-sm mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-400">{student.completedLessons}</p>
            </Card>
            <Card className="bg-gray-900/50">
              <p className="text-gray-400 text-sm mb-1">Remaining</p>
              <p className="text-2xl font-bold text-orange-400">
                {student.totalLessons - student.completedLessons}
              </p>
            </Card>
          </div>

          <div className="space-y-4">
            {modules.map((module, moduleIndex) => {
              const moduleStats = student.moduleProgress.get(module.id) || { completed: 0, total: 0 };
              const moduleProgress = moduleStats.total > 0
                ? Math.round((moduleStats.completed / moduleStats.total) * 100)
                : 0;

              return (
                <Card key={module.id} className="bg-gray-900/50">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        Module {moduleIndex + 1}: {module.title}
                      </h3>
                      <span className="text-sm text-gray-400">
                        {moduleStats.completed}/{moduleStats.total} lessons
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                      <span className="text-white font-medium text-sm w-12 text-right">
                        {moduleProgress}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const progress = student.lessonProgress.get(lesson.id);
                      const isCompleted = progress?.is_completed || false;

                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-600" />
                            )}
                            <span className={`text-sm ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
                              {lessonIndex + 1}. {lesson.title}
                            </span>
                          </div>
                          {progress && (
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              {progress.time_spent_minutes > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {progress.time_spent_minutes}m
                                </span>
                              )}
                              {progress.completed_at && (
                                <span>
                                  {new Date(progress.completed_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 sticky bottom-0 bg-gray-800 rounded-b-2xl">
          <Button onClick={onClose} variant="secondary" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
