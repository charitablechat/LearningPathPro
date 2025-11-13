import { useState } from 'react';
import { LogOut, User, ChevronDown, Moon, Sun, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { navigateTo } from '../lib/router';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';

interface NavbarProps {
  onProfileClick?: () => void;
}

export function Navbar({ onProfileClick }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      success('Successfully signed out!');
    } catch (err) {
      console.error('Error signing out:', err);
      error('Failed to sign out');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <img src="/CLEAR COURSE STUDIO.png" alt="Clear Course Studio" className="h-8 sm:h-10" />
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">Clear Course Studio</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white sm:hidden">CCS</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {user && profile && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:inline">{profile.full_name || profile.email}</span>
                  {profile.is_super_admin ? (
                    <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span className="hidden sm:inline">Super Admin</span>
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full capitalize hidden sm:inline">
                      {profile.role}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-50">
                    {profile.is_super_admin && (
                      <>
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            navigateTo('/super-admin');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border-b border-gray-200 dark:border-gray-700"
                        >
                          <Shield className="w-4 h-4 text-orange-500" />
                          <span className="font-semibold">Super Admin Dashboard</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onProfileClick?.();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleSignOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </nav>
  );
}
