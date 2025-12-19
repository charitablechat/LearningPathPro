import { X, AlertCircle, User, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { useState, useEffect } from 'react';

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedProfile, originalProfile, activeImpersonation, endImpersonation } = useAuth();
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!activeImpersonation) return;

    const updateElapsed = () => {
      const start = new Date(activeImpersonation.startedAt).getTime();
      const now = Date.now();
      const diff = now - start;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsed(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeImpersonation]);

  if (!isImpersonating || !impersonatedProfile || !originalProfile || !activeImpersonation) {
    return null;
  }

  const handleEndImpersonation = async () => {
    try {
      await endImpersonation();
      window.location.href = '/super-admin';
    } catch (error: any) {
      console.error('Failed to end impersonation:', error);
      alert(error.message || 'Failed to end impersonation');
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg border-b-4 border-orange-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full backdrop-blur-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">Impersonation Mode Active</span>
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium backdrop-blur-sm">
                  TEST MODE
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-white/90 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>
                    Viewing as: <span className="font-medium">{impersonatedProfile.full_name || impersonatedProfile.email}</span>
                  </span>
                  <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs uppercase">
                    {impersonatedProfile.role}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Duration: {elapsed}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-right hidden sm:block">
              <div className="text-white/90">Logged in as:</div>
              <div className="font-medium">{originalProfile.full_name || originalProfile.email}</div>
            </div>
            <Button
              variant="secondary"
              onClick={handleEndImpersonation}
              className="flex items-center gap-2 bg-white/90 hover:bg-white text-orange-600 font-semibold shadow-md"
            >
              <X className="w-4 h-4" />
              Exit Impersonation
            </Button>
          </div>
        </div>

        {activeImpersonation.reason && (
          <div className="mt-2 pt-2 border-t border-white/20 text-sm">
            <span className="text-white/90">Reason:</span>{' '}
            <span className="font-medium">{activeImpersonation.reason}</span>
          </div>
        )}
      </div>
    </div>
  );
}
