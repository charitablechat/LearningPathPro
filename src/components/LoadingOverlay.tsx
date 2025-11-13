import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ isLoading, message = 'Loading...', fullScreen = false }: LoadingOverlayProps) {
  if (!isLoading) return null;

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50'
    : 'absolute inset-0 z-10';

  return (
    <div className={`${containerClasses} bg-black/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-900 dark:text-white font-medium text-center">{message}</p>
        </div>
      </div>
    </div>
  );
}
