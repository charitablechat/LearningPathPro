import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const hoverClass = hover ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : '';

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg transition-all duration-200 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
