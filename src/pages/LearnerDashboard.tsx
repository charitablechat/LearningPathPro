import { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle2, PlayCircle, TrendingUp, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course, Enrollment } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { CourseViewerPage } from './CourseViewerPage';

interface CourseWithProgress extends Course {
  enrollment?: Enrollment;
  instructor_name?: string;
}

export function LearnerDashboard() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithProgress[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;

    try {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            *,
            profiles:instructor_id (full_name)
          )
        `)
        .eq('user_id', user.id);

      const { data: allCourses } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id (full_name)
        `)
        .eq('is_published', true);

      const enrolled = enrollments?.map((e: any) => ({
        ...e.courses,
        enrollment: e,
        instructor_name: e.courses.profiles?.full_name,
      })) || [];

      const enrolledIds = enrolled.map((c) => c.id);
      const available = allCourses
        ?.filter((c: any) => !enrolledIds.includes(c.id))
        .map((c: any) => ({
          ...c,
          instructor_name: c.profiles?.full_name,
        })) || [];

      setEnrolledCourses(enrolled);
      setAvailableCourses(available);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;

    try {
      await supabase.from('enrollments').insert({
        user_id: user.id,
        course_id: courseId,
      });
      await loadCourses();
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  if (selectedCourse) {
    return (
      <CourseViewerPage
        courseId={selectedCourse.id}
        courseName={selectedCourse.title}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  const filteredAvailableCourses = availableCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Learning Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Continue your learning journey</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {enrolledCourses.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  My Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <Card key={course.id} hover onClick={() => setSelectedCourse(course)}>
                      <div className="aspect-video bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg mb-4 flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-white opacity-80" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {course.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <span>{course.instructor_name || 'Unknown Instructor'}</span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{course.enrollment?.progress_percentage || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${course.enrollment?.progress_percentage || 0}%` }}
                          />
                        </div>
                      </div>
                      <Button variant="primary" size="sm" fullWidth>
                        Continue Learning
                      </Button>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  Available Courses
                </h2>
                <div className="w-72">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              {availableCourses.length === 0 ? (
                <Card>
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No courses available at the moment. Check back soon!
                  </p>
                </Card>
              ) : filteredAvailableCourses.length === 0 ? (
                <Card>
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No courses found matching your search.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAvailableCourses.map((course) => (
                    <Card key={course.id} hover>
                      <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {course.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <span>{course.instructor_name || 'Unknown Instructor'}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => enrollInCourse(course.id)}
                      >
                        Enroll Now
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

