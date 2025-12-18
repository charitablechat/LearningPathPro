import { ArrowLeft } from 'lucide-react';
import { navigateTo } from '../lib/router';

interface BackButtonProps {
  onClick?: () => void;
  to?: string;
  label?: string;
  variant?: 'link' | 'button';
  className?: string;
}

export function BackButton({
  onClick,
  to,
  label = 'Back',
  variant = 'link',
  className = ''
}: BackButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigateTo(to);
    } else {
      window.history.back();
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors ${className}`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
