import { useState } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { LearnerDashboard } from './pages/LearnerDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { CourseViewerPage } from './pages/CourseViewerPage';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<{ id: string; name: string } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginPage />;
  }

  if (viewingCourse) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar onProfileClick={() => setShowProfile(true)} />
        <CourseViewerPage
          courseId={viewingCourse.id}
          courseName={viewingCourse.name}
          onBack={() => setViewingCourse(null)}
        />
      </div>
    );
  }

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar onProfileClick={() => setShowProfile(false)} />
        <ProfilePage onBack={() => setShowProfile(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {profile.role === 'learner' && <LearnerDashboard />}
      {profile.role === 'instructor' && <InstructorDashboard onViewCourse={setViewingCourse} />}
      {profile.role === 'admin' && <AdminDashboard onViewCourse={setViewingCourse} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
