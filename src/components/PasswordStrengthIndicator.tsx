import { CheckCircle2, Circle } from 'lucide-react';
import { getPasswordStrength } from '../lib/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  show?: boolean;
}

export function PasswordStrengthIndicator({ password, show = true }: PasswordStrengthIndicatorProps) {
  if (!show || !password) return null;

  const { strength, score, feedback } = getPasswordStrength(password);

  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const strengthLabels = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
  };

  const strengthTextColors = {
    weak: 'text-red-500',
    medium: 'text-yellow-500',
    strong: 'text-green-500',
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
        <span className={`font-semibold ${strengthTextColors[strength]}`}>
          {strengthLabels[strength]}
        </span>
      </div>
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`flex-1 rounded-full transition-colors ${
              level <= score ? strengthColors[strength] : 'bg-gray-300 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      {feedback.length > 0 && (
        <div className="space-y-1">
          {feedback.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Circle className="w-3 h-3" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
