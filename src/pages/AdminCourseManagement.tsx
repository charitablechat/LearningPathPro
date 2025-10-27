import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Copy, Eye, CheckCircle, XCircle, Archive, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface Course {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  is_template: boolean;
  instructor_id: string;
  created_at: string;
  instructor?: {
    full_name: string;
    email: string;
  };
  enrollment_count?: number;
}

interface AdminCourseManagementProps {
  onEditCourse: (course: Course) => void;
  onViewCourse: (course: { id: string; name: string }) => void;
  onCreateCourse: () => void;
}

export function AdminCourseManagement({ onEditCourse, onViewCourse, onCreateCourse }: AdminCourseManagementProps) {
  const { organization } = useOrganization();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCourses();
  }, [organization]);

  const loadCourses = async () => {
    if (!organization) return;

    try {
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id(full_name, email)
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const coursesWithEnrollments = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('id')
            .eq('course_id', course.id);

          return {
            ...course,
            enrollment_count: enrollments?.length || 0,
          };
        })
      );

      setCourses(coursesWithEnrollments);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCourseStatus = async (courseId: string, status: 'draft' | 'published' | 'archived') => {
    try {
      await supabase
        .from('courses')
        .update({ status })
        .eq('id', courseId);

      await loadCourses();
    } catch (error) {
      console.error('Error updating course status:', error);
    }
  };

  const duplicateCourse = async (courseId: string) => {
    if (!organization) return;

    try {
      const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (!course) return;

      const { data: newCourse, error } = await supabase
        .from('courses')
        .insert({
          organization_id: organization.id,
          title: `${course.title} (Copy)`,
          description: course.description,
          instructor_id: course.instructor_id,
          thumbnail_url: course.thumbnail_url,
          status: 'draft',
          cloned_from_id: courseId,
        })
        .select()
        .single();

      if (error) throw error;

      const { data: modules } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (modules) {
        for (const module of modules) {
          const { data: newModule } = await supabase
            .from('modules')
            .insert({
              course_id: newCourse.id,
              organization_id: organization.id,
              title: module.title,
              description: module.description,
              order_index: module.order_index,
            })
            .select()
            .single();

          if (newModule) {
            const { data: lessons } = await supabase
              .from('lessons')
              .select('*')
              .eq('module_id', module.id)
              .order('order_index');

            if (lessons) {
              for (const lesson of lessons) {
                await supabase
                  .from('lessons')
                  .insert({
                    module_id: newModule.id,
                    organization_id: organization.id,
                    title: lesson.title,
                    content: lesson.content,
                    content_type: lesson.content_type,
                    content_url: lesson.content_url,
                    duration_minutes: lesson.duration_minutes,
                    order_index: lesson.order_index,
                    file_size: lesson.file_size,
                    file_type: lesson.file_type,
                    original_filename: lesson.original_filename,
                  });
              }
            }
          }
        }
      }

      await loadCourses();
    } catch (error) {
      console.error('Error duplicating course:', error);
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Delete this course? All modules, lessons, and enrollments will be removed.')) return;

    try {
      await supabase.from('courses').delete().eq('id', courseId);
      await loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const bulkUpdateStatus = async (status: 'draft' | 'published' | 'archived') => {
    if (selectedCourses.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedCourses).map(courseId =>
          supabase.from('courses').update({ status }).eq('id', courseId)
        )
      );

      setSelectedCourses(new Set());
      await loadCourses();
    } catch (error) {
      console.error('Error updating courses:', error);
    }
  };

  const bulkDelete = async () => {
    if (selectedCourses.size === 0) return;
    if (!confirm(`Delete ${selectedCourses.size} courses? This cannot be undone.`)) return;

    try {
      await Promise.all(
        Array.from(selectedCourses).map(courseId =>
          supabase.from('courses').delete().eq('id', courseId)
        )
      );

      setSelectedCourses(new Set());
      await loadCourses();
    } catch (error) {
      console.error('Error deleting courses:', error);
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    const newSelection = new Set(selectedCourses);
    if (newSelection.has(courseId)) {
      newSelection.delete(courseId);
    } else {
      newSelection.add(courseId);
    }
    setSelectedCourses(newSelection);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-900/50 text-green-300';
      case 'draft': return 'bg-yellow-900/50 text-yellow-300';
      case 'archived': return 'bg-gray-700 text-gray-400';
      default: return 'bg-gray-700 text-gray-300';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Course Management</h2>
          <p className="text-gray-400">Manage all courses in your organization</p>
        </div>
        <Button onClick={onCreateCourse}>
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {selectedCourses.size > 0 && (
        <Card className="bg-blue-900/20 border-blue-800">
          <div className="flex items-center justify-between">
            <p className="text-white">{selectedCourses.size} courses selected</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => bulkUpdateStatus('published')}>
                <CheckCircle className="w-3 h-3 mr-1" />
                Publish
              </Button>
              <Button size="sm" onClick={() => bulkUpdateStatus('draft')}>
                <Edit2 className="w-3 h-3 mr-1" />
                Draft
              </Button>
              <Button size="sm" onClick={() => bulkUpdateStatus('archived')}>
                <Archive className="w-3 h-3 mr-1" />
                Archive
              </Button>
              <Button variant="danger" size="sm" onClick={bulkDelete}>
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedCourses.size === filteredCourses.length && filteredCourses.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCourses(new Set(filteredCourses.map(c => c.id)));
                      } else {
                        setSelectedCourses(new Set());
                      }
                    }}
                    className="w-4 h-4"
                  />
                </th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Course</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Instructor</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Enrollments</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedCourses.has(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <button
                        onClick={() => onViewCourse({ id: course.id, name: course.title })}
                        className="text-white font-medium hover:text-blue-400 transition-colors text-left"
                      >
                        {course.title}
                      </button>
                      {course.is_template && (
                        <span className="ml-2 text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">
                          Template
                        </span>
                      )}
                      <p className="text-gray-400 text-sm line-clamp-1">{course.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {course.instructor?.full_name || 'Unknown'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {course.enrollment_count}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {course.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCourseStatus(course.id, 'published')}
                          title="Publish"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      {course.status === 'published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCourseStatus(course.id, 'archived')}
                          title="Archive"
                        >
                          <Archive className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateCourse(course.id)}
                        title="Duplicate"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewCourse({ id: course.id, name: course.title })}
                        title="View"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteCourse(course.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCourses.length === 0 && (
            <div className="text-center py-8 text-gray-400">No courses found</div>
          )}
        </div>
      </Card>
    </div>
  );
}
