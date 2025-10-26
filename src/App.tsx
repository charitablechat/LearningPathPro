import { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { LearnerDashboard } from './pages/LearnerDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { CourseViewerPage } from './pages/CourseViewerPage';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { OrganizationSignupPage } from './pages/OrganizationSignupPage';
import { OrganizationSettingsPage } from './pages/OrganizationSettingsPage';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { SubscribePage } from './pages/SubscribePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { getPath, navigateTo } from './lib/router';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(getPath());
  const [viewingCourse, setViewingCourse] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(getPath());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('routechange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('routechange', handleRouteChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const publicRoutes = ['/', '/pricing', '/login', '/signup', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(currentPath);

  if (!user && !isPublicRoute) {
    return <LoginPage />;
  }

  if (user && profile && !profile.organization_id && currentPath !== '/organization/signup' && currentPath !== '/login' && !profile.is_super_admin) {
    if (currentPath !== '/organization/signup') {
      navigateTo('/organization/signup');
    }
    return <OrganizationSignupPage />;
  }

  if (currentPath === '/' && !user) {
    return <LandingPage />;
  }

  if (currentPath === '/' && user && profile && profile.organization_id) {
    if (currentPath !== '/dashboard') {
      navigateTo('/dashboard');
    }
    return null;
  }

  if (currentPath === '/pricing') {
    return <PricingPage />;
  }

  if (currentPath === '/subscribe') {
    return <SubscribePage />;
  }

  if (currentPath === '/login' || currentPath === '/signup') {
    return <LoginPage />;
  }

  if (currentPath === '/reset-password') {
    return <ResetPasswordPage />;
  }

  if (currentPath === '/organization/signup') {
    return <OrganizationSignupPage />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (profile.is_super_admin && currentPath === '/super-admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar onProfileClick={() => navigateTo('/profile')} />
        <SuperAdminDashboard />
      </div>
    );
  }

  if (currentPath === '/settings') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar onProfileClick={() => navigateTo('/profile')} />
        <OrganizationSettingsPage />
      </div>
    );
  }

  if (viewingCourse) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar onProfileClick={() => navigateTo('/profile')} />
        <CourseViewerPage
          courseId={viewingCourse.id}
          courseName={viewingCourse.name}
          onBack={() => setViewingCourse(null)}
        />
      </div>
    );
  }

  if (currentPath === '/profile') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar onProfileClick={() => navigateTo('/dashboard')} />
        <ProfilePage onBack={() => navigateTo('/dashboard')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar onProfileClick={() => navigateTo('/profile')} />
      {profile.role === 'learner' && <LearnerDashboard />}
      {profile.role === 'instructor' && <InstructorDashboard onViewCourse={setViewingCourse} />}
      {profile.role === 'admin' && <AdminDashboard onViewCourse={setViewingCourse} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </OrganizationProvider>
    </AuthProvider>
  );
}

export default App;
