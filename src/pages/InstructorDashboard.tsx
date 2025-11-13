import { useState, useEffect } from 'react';
import { Plus, BookOpen, Users, Edit, Trash2, Eye, EyeOff, LayoutList, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { supabase, Course } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { CourseBuilderPage } from './CourseBuilderPage';
import { CourseAnalyticsPage } from './CourseAnalyticsPage';

interface CourseWithStats extends Course {
  enrollment_count?: number;
}

interface InstructorDashboardProps {
  onViewCourse: (course: { id: string; name: string }) => void;
}

export function InstructorDashboard({ onViewCourse }: InstructorDashboardProps) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithStats | null>(null);
  const [buildingCourse, setBuildingCourse] = useState<CourseWithStats | null>(null);
  const [viewingAnalytics, setViewingAnalytics] = useState<CourseWithStats | null>(null);
  const { confirm, confirmState } = useConfirm();
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('courses')
        .select(`
          *,
          enrollments (count)
        `)
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      const coursesWithStats = data?.map((c: any) => ({
        ...c,
        enrollment_count: c.enrollments[0]?.count || 0,
      })) || [];

      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublishStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('courses')
        .update({ is_published: !currentStatus })
        .eq('id', courseId);
      await loadCourses();
      success(currentStatus ? 'Course unpublished successfully' : 'Course published successfully');
    } catch (err) {
      console.error('Error updating course:', err);
      error('Failed to update course status');
    }
  };

  const deleteCourse = async (courseId: string, courseName: string) => {
    const confirmed = await confirm({
      title: 'Delete Course',
      message: `Are you sure you want to delete "${courseName}"? This action cannot be undone and will remove all modules and lessons.`,
      confirmLabel: 'Delete Course',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await supabase.from('courses').delete().eq('id', courseId);
      await loadCourses();
      success('Course deleted successfully');
    } catch (err) {
      console.error('Error deleting course:', err);
      error('Failed to delete course');
    }
  };

  if (viewingAnalytics) {
    return (
      <CourseAnalyticsPage
        courseId={viewingAnalytics.id}
        courseName={viewingAnalytics.title}
        onBack={() => setViewingAnalytics(null)}
      />
    );
  }

  if (buildingCourse) {
    return (
      <CourseBuilderPage
        courseId={buildingCourse.id}
        courseName={buildingCourse.title}
        onBack={() => setBuildingCourse(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Instructor Dashboard</h1>
            <p className="text-gray-400">Manage your courses and track learner progress</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Course
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
              <p className="text-gray-400 mb-6">Create your first course to get started</p>
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="w-5 h-5" />
                Create Course
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id}>
                <div className="aspect-video bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white opacity-80" />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <button
                    onClick={() => onViewCourse({ id: course.id, name: course.title })}
                    className="text-xl font-semibold text-white flex-1 text-left hover:text-blue-400 transition-colors"
                  >
                    {course.title}
                  </button>
                  <div className="flex gap-2">
                    {course.is_published ? (
                      <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded-full flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {course.description || 'No description'}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Users className="w-4 h-4" />
                  <span>{course.enrollment_count} enrolled</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBuildingCourse(course)}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <LayoutList className="w-4 h-4" />
                    Content
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCourse(course)}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingAnalytics(course)}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Button>
                  <Button
                    variant={course.is_published ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => togglePublishStatus(course.id, course.is_published)}
                    className="flex-1"
                  >
                    {course.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteCourse(course.id, course.title)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {(showCreateModal || editingCourse) && (
          <CourseModal
            course={editingCourse}
            onClose={() => {
              setShowCreateModal(false);
              setEditingCourse(null);
            }}
            onSave={() => {
              setShowCreateModal(false);
              setEditingCourse(null);
              loadCourses();
              success(editingCourse ? 'Course updated successfully' : 'Course created successfully');
            }}
            onError={(message: string) => error(message)}
          />
        )}

        <ConfirmDialog
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          variant={confirmState.variant}
          onConfirm={confirmState.onConfirm}
          onCancel={confirmState.onCancel}
        />

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
}

function CourseModal({
  course,
  onClose,
  onSave,
  onError,
}: {
  course: Course | null;
  onClose: () => void;
  onSave: () => void;
  onError: (message: string) => void;
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
      const errorMsg = err.message || 'Failed to save course';
      setError(errorMsg);
      onError(errorMsg);
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

          <Input
            label="Course Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter course title"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description"
              rows={4}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
