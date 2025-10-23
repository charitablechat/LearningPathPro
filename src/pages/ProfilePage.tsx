import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Award, BookOpen, Clock, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ProgressRing } from '../components/ProgressRing';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';

interface UserStats {
  enrolledCourses: number;
  completedCourses: number;
  totalLearningTime: number;
  completedLessons: number;
}

export function ProfilePage({ onBack }: { onBack: () => void }) {
  const { user, profile, changePassword } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [stats, setStats] = useState<UserStats>({
    enrolledCourses: 0,
    completedCourses: 0,
    totalLearningTime: 0,
    completedLessons: 0,
  });
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (profile?.role === 'learner') {
      loadLearnerStats();
    }
  }, [profile]);

  const loadLearnerStats = async () => {
    if (!user) return;

    try {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id);

      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      const completedCourses = enrollments?.filter((e) => e.progress_percentage === 100).length || 0;
      const completedLessons = progress?.filter((p) => p.is_completed).length || 0;
      const totalTime = progress?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0;

      setStats({
        enrolledCourses: enrollments?.length || 0,
        completedCourses,
        totalLearningTime: totalTime,
        completedLessons,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordForm = (): boolean => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    let isValid = true;

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      success('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
    } catch (error) {
      if (error instanceof Error) {
        showError(error.message);
      } else {
        showError('Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsChangingPassword(false);
  };

  const completionRate = stats.enrolledCourses > 0
    ? (stats.completedCourses / stats.enrolledCourses) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-900 dark:text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {profile?.full_name || 'User'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 capitalize">{profile?.role || 'Learner'}</p>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                {!isEditing && (
                  <Button variant="outline" size="sm" fullWidth onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>

              {isEditing && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <Input
                    label="Full Name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      fullWidth
                      onClick={handleUpdateProfile}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setIsEditing(false);
                        setFullName(profile?.full_name || '');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{profile?.email}</span>
                </div>
              </div>
            </Card>

            <Card className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
                <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>

              {!isChangingPassword && (
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </Button>
              )}

              {isChangingPassword && (
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    error={passwordErrors.currentPassword}
                    placeholder="Enter current password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    error={passwordErrors.newPassword}
                    helperText="Must be at least 8 characters"
                    placeholder="Enter new password"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    error={passwordErrors.confirmPassword}
                    placeholder="Confirm new password"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      fullWidth
                      onClick={handleChangePassword}
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={handleCancelPasswordChange}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {profile?.role === 'learner' && (
              <>
                <Card>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Learning Progress</h3>
                  <div className="flex items-center justify-center mb-8">
                    <ProgressRing progress={completionRate} size={150} />
                  </div>
                  <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                    You've completed {stats.completedCourses} out of {stats.enrolledCourses} enrolled courses
                  </p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600 rounded-lg">
                        <BookOpen className="w-8 h-8 text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Enrolled Courses</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.enrolledCourses}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-600 rounded-lg">
                        <Award className="w-8 h-8 text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Completed Courses</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedCourses}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-600 rounded-lg">
                        <CheckCircle2 className="w-8 h-8 text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Completed Lessons</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedLessons}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-600 rounded-lg">
                        <Clock className="w-8 h-8 text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Learning Time</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {Math.floor(stats.totalLearningTime / 60)}h
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}

            {profile?.role === 'instructor' && (
              <Card>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Instructor Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  As an instructor, you have access to course creation and management tools.
                  Create engaging courses and track your students' progress.
                </p>
              </Card>
            )}

            {profile?.role === 'admin' && (
              <Card>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Admin Panel</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  As an administrator, you have full access to platform management,
                  user administration, and system settings.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
