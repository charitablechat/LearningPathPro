export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export function validateField(value: string, rules: ValidationRule): string | null {
  if (rules.required && !value.trim()) {
    return rules.message || 'This field is required';
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    return rules.message || `Minimum ${rules.minLength} characters required`;
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    return rules.message || `Maximum ${rules.maxLength} characters allowed`;
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    return rules.message || 'Invalid format';
  }

  if (value && rules.custom) {
    return rules.custom(value);
  }

  return null;
}

export function validateForm(
  values: { [key: string]: string },
  rules: ValidationRules
): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  Object.keys(rules).forEach((field) => {
    const error = validateField(values[field] || '', rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordValidation = {
  minLength: 8,
  hasUpperCase: (value: string) => /[A-Z]/.test(value),
  hasLowerCase: (value: string) => /[a-z]/.test(value),
  hasNumber: (value: string) => /\d/.test(value),
  hasSpecialChar: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
};

export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('At least 8 characters');
  }

  if (passwordValidation.hasUpperCase(password)) {
    score += 1;
  } else {
    feedback.push('One uppercase letter');
  }

  if (passwordValidation.hasLowerCase(password)) {
    score += 1;
  } else {
    feedback.push('One lowercase letter');
  }

  if (passwordValidation.hasNumber(password)) {
    score += 1;
  } else {
    feedback.push('One number');
  }

  if (passwordValidation.hasSpecialChar(password)) {
    score += 1;
  } else {
    feedback.push('One special character');
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return { strength, score, feedback };
}
