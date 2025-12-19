import { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, UserPlus, Edit2, Shield, ArrowLeft, Trash2, Mail } from 'lucide-react';
import { supabase, Profile, UserRole } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../hooks/useToast';

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  instructors: number;
  learners: number;
}

type SectionView = 'overview' | 'users' | 'courses' | 'enrollments' | 'instructors';

interface AdminDashboardProps {
  onViewCourse: (course: { id: string; name: string }) => void;
}

export function AdminDashboard({ onViewCourse }: AdminDashboardProps) {
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    instructors: 0,
    learners: 0,
  });
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [currentView, setCurrentView] = useState<SectionView>('overview');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingEmail, setEditingEmail] = useState<Profile | null>(null);
  const [deletingUser, setDeletingUser] = useState<Profile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profilesRes, coursesRes, enrollmentsRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('courses').select('id'),
        supabase.from('enrollments').select('id'),
      ]);

      const profiles = profilesRes.data || [];
      setUsers(profiles);

      setStats({
        totalUsers: profiles.length,
        totalCourses: coursesRes.data?.length || 0,
        totalEnrollments: enrollmentsRes.data?.length || 0,
        instructors: profiles.filter((p) => p.role === 'instructor').length,
        learners: profiles.filter((p) => p.role === 'learner').length,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { data, error } = await supabase.rpc('update_organization_user_role', {
        target_user_id: userId,
        new_role: newRole,
      });

      if (error) {
        console.error('RPC error updating user role:', error);
        showToast(`Permission error: ${error.message}`);
        return;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          showToast('User role updated successfully');
          await loadData();
          setEditingUser(null);
        } else {
          const errorMsg = data.error || 'Failed to update user role';
          console.error('Function returned error:', errorMsg);
          showToast(errorMsg);
        }
      } else {
        console.error('Unexpected response format:', data);
        showToast('Unexpected response from server');
      }
    } catch (error: any) {
      console.error('Exception updating user role:', error);
      showToast(error.message || 'Failed to update user role');
    }
  };

  const updateUserEmail = async (userId: string, newEmail: string) => {
    try {
      await supabase.from('profiles').update({ email: newEmail }).eq('id', userId);
      await loadData();
      setEditingEmail(null);
    } catch (error) {
      console.error('Error updating user email:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      await loadData();
      setDeletingUser(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.message || 'Failed to delete user');
    }
  };

  const createUser = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('User creation failed - no user data returned');
      }

      await loadData();
      setShowAddUser(false);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
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
          Back to Dashboard
        </Button>
      )}
      <h1 className="text-3xl font-bold text-white mb-2">
        {currentView === 'overview' && 'Admin Dashboard'}
        {currentView === 'users' && 'User Management'}
        {currentView === 'courses' && 'Course Management'}
        {currentView === 'enrollments' && 'Enrollment Management'}
        {currentView === 'instructors' && 'Instructor Management'}
      </h1>
      <p className="text-gray-400">
        {currentView === 'overview' && 'Manage users, courses, and platform analytics'}
        {currentView === 'users' && 'View and manage all platform users'}
        {currentView === 'courses' && 'View and manage all courses'}
        {currentView === 'enrollments' && 'View all student enrollments'}
        {currentView === 'instructors' && 'View and manage instructors'}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderHeader()}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {currentView === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card
                  className="hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                  onClick={() => setCurrentView('users')}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    {stats.learners} learners, {stats.instructors} instructors
                  </div>
                </Card>

                <Card
                  className="hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                  onClick={() => setCurrentView('courses')}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600 rounded-lg">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Courses</p>
                      <p className="text-3xl font-bold text-white">{stats.totalCourses}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Platform-wide courses
                  </div>
                </Card>

                <Card
                  className="hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                  onClick={() => setCurrentView('enrollments')}
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
                    Active course enrollments
                  </div>
                </Card>

                <Card
                  className="hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                  onClick={() => setCurrentView('instructors')}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-600 rounded-lg">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Instructors</p>
                      <p className="text-3xl font-bold text-white">{stats.instructors}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Content creators
                  </div>
                </Card>
              </div>
            )}

            {currentView === 'users' && (
              <UsersSection
                users={users}
                onEditUser={setEditingUser}
                onEditEmail={setEditingEmail}
                onDeleteUser={setDeletingUser}
                onAddUser={() => setShowAddUser(true)}
              />
            )}
            {currentView === 'courses' && <CoursesSection onViewCourse={onViewCourse} />}
            {currentView === 'enrollments' && <EnrollmentsSection />}
            {currentView === 'instructors' && <InstructorsSection users={users.filter(u => u.role === 'instructor')} />}
          </>
        )}

        {editingUser && (
          <UserRoleModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={(role) => updateUserRole(editingUser.id, role)}
          />
        )}

        {editingEmail && (
          <EditEmailModal
            user={editingEmail}
            onClose={() => setEditingEmail(null)}
            onSave={(email) => updateUserEmail(editingEmail.id, email)}
          />
        )}

        {deletingUser && (
          <DeleteUserModal
            user={deletingUser}
            onClose={() => setDeletingUser(null)}
            onConfirm={() => deleteUser(deletingUser.id)}
          />
        )}

        {showAddUser && (
          <AddUserModal
            onClose={() => setShowAddUser(false)}
            onSave={createUser}
          />
        )}
      </div>
    </div>
  );
}

function UsersSection({
  users,
  onEditUser,
  onEditEmail,
  onDeleteUser,
  onAddUser,
}: {
  users: Profile[];
  onEditUser: (user: Profile) => void;
  onEditEmail: (user: Profile) => void;
  onDeleteUser: (user: Profile) => void;
  onAddUser: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <section>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="learner">Learners</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
        <Button onClick={onAddUser} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Name</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Email</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Role</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Joined</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-white">{user.full_name || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-400">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-red-900/50 text-red-300'
                          : user.role === 'instructor'
                          ? 'bg-teal-900/50 text-teal-300'
                          : 'bg-blue-900/50 text-blue-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditUser(user)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Role
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditEmail(user)}
                        className="flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteUser(user)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 hover:border-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">No users found</div>
          )}
        </div>
      </Card>
    </section>
  );
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  created_at: string;
  instructor?: Profile;
  enrollment_count?: number;
}

function CoursesSection({ onViewCourse }: { onViewCourse: (course: { id: string; name: string }) => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id(id, full_name, email)
        `)
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

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Course Title</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Instructor</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Enrollments</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4">
                    <div>
                      <button
                        onClick={() => onViewCourse({ id: course.id, name: course.title })}
                        className="text-white font-medium hover:text-blue-400 transition-colors text-left"
                      >
                        {course.title}
                      </button>
                      <p className="text-gray-400 text-sm line-clamp-1">{course.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {course.instructor?.full_name || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {course.enrollment_count}
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(course.created_at).toLocaleDateString()}
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
    </section>
  );
}

interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  progress: number;
  course?: Course;
  user?: Profile;
}

function EnrollmentsSection() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(id, title),
          user:profiles!user_id(id, full_name, email)
        `)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by student name, email, or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Student</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Course</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Progress</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-medium">{enrollment.user?.full_name || 'Unknown'}</p>
                      <p className="text-gray-400 text-sm">{enrollment.user?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {enrollment.course?.title || 'Unknown Course'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{enrollment.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEnrollments.length === 0 && (
            <div className="text-center py-8 text-gray-400">No enrollments found</div>
          )}
        </div>
      </Card>
    </section>
  );
}

function InstructorsSection({ users }: { users: Profile[] }) {
  const [instructorStats, setInstructorStats] = useState<Map<string, { courses: number; enrollments: number }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInstructorStats();
  }, [users]);

  const loadInstructorStats = async () => {
    try {
      const stats = new Map();

      await Promise.all(
        users.map(async (instructor) => {
          const [coursesRes, enrollmentsRes] = await Promise.all([
            supabase.from('courses').select('id').eq('instructor_id', instructor.id),
            supabase
              .from('enrollments')
              .select('id')
              .in('course_id',
                (await supabase.from('courses').select('id').eq('instructor_id', instructor.id))
                  .data?.map(c => c.id) || []
              ),
          ]);

          stats.set(instructor.id, {
            courses: coursesRes.data?.length || 0,
            enrollments: enrollmentsRes.data?.length || 0,
          });
        })
      );

      setInstructorStats(stats);
    } catch (error) {
      console.error('Error loading instructor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = users.filter(instructor =>
    instructor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search instructors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Name</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Email</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Courses</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Total Enrollments</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.map((instructor) => {
                const stats = instructorStats.get(instructor.id) || { courses: 0, enrollments: 0 };
                return (
                  <tr key={instructor.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4 text-white font-medium">{instructor.full_name || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-400">{instructor.email}</td>
                    <td className="py-3 px-4 text-white font-medium">{stats.courses}</td>
                    <td className="py-3 px-4 text-white font-medium">{stats.enrollments}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(instructor.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredInstructors.length === 0 && (
            <div className="text-center py-8 text-gray-400">No instructors found</div>
          )}
        </div>
      </Card>
    </section>
  );
}

function UserRoleModal({
  user,
  onClose,
  onSave,
}: {
  user: Profile;
  onClose: () => void;
  onSave: (role: UserRole) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedRole);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Edit User Role</h2>
          <p className="text-gray-400 text-sm mt-1">{user.email}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Select Role</label>
            <div className="space-y-3">
              {(['learner', 'instructor', 'admin'] as UserRole[]).map((role) => (
                <label
                  key={role}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRole === role
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div>
                    <p className="text-white font-medium capitalize">{role}</p>
                    <p className="text-gray-400 text-sm">
                      {role === 'learner' && 'Can enroll in and view courses'}
                      {role === 'instructor' && 'Can create and manage courses'}
                      {role === 'admin' && 'Full access to all platform features'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Role</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditEmailModal({
  user,
  onClose,
  onSave,
}: {
  user: Profile;
  onClose: () => void;
  onSave: (email: string) => void;
}) {
  const [newEmail, setNewEmail] = useState(user.email);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !newEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    onSave(newEmail);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Edit Email Address</h2>
          <p className="text-gray-400 text-sm mt-1">{user.full_name || 'User'}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setError('');
              }}
              placeholder="user@example.com"
              required
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Email</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteUserModal({
  user,
  onClose,
  onConfirm,
}: {
  user: Profile;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-red-900/50">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-red-400">Delete User</h2>
          <p className="text-gray-400 text-sm mt-1">This action cannot be undone</p>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-white">
            Are you sure you want to delete the following user?
          </p>
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <p className="text-white font-medium">{user.full_name || 'N/A'}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <p className="text-gray-500 text-xs mt-2">Role: {user.role}</p>
          </div>
          <p className="text-red-400 text-sm">
            All associated data including enrollments and progress will be permanently removed.
          </p>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddUserModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('learner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !fullName) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await onSave(email, password, fullName, role);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Add New User</h2>
          <p className="text-gray-400 text-sm mt-1">Create a new user account</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Role
            </label>
            <div className="space-y-2">
              {(['learner', 'instructor', 'admin'] as UserRole[]).map((roleOption) => (
                <label
                  key={roleOption}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    role === roleOption
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={roleOption}
                    checked={role === roleOption}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-white font-medium capitalize">{roleOption}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
