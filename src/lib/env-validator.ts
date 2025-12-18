import { logger } from './logger';

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_STRIPE_PUBLISHABLE_KEY: string;
  VITE_EMAIL_PROVIDER?: string;
  VITE_EMAIL_API_KEY?: string;
  VITE_EMAIL_FROM?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class EnvironmentValidator {
  private isProduction: boolean;
  private isDevelopment: boolean;
  private validationResult: ValidationResult | null = null;

  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.isDevelopment = import.meta.env.DEV;
  }

  private showConfigError(message: string): void {
    if (typeof document !== 'undefined') {
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = `
          <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 1rem;">
            <div style="max-width: 600px; background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
              <div style="text-align: center; margin-bottom: 1.5rem;">
                <svg style="width: 64px; height: 64px; margin: 0 auto; color: #ef4444;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 1rem; text-align: center;">Configuration Error</h1>
              <p style="color: #6b7280; margin-bottom: 1.5rem; line-height: 1.6;">${message}</p>
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                <p style="color: #991b1b; font-size: 0.875rem; margin: 0;">
                  <strong>For Deployment Platforms:</strong><br>
                  Make sure to set the following environment variables in your deployment settings:
                </p>
                <ul style="color: #991b1b; font-size: 0.875rem; margin: 0.5rem 0 0 1.5rem;">
                  <li>VITE_SUPABASE_URL</li>
                  <li>VITE_SUPABASE_ANON_KEY</li>
                  <li>VITE_STRIPE_PUBLISHABLE_KEY</li>
                </ul>
              </div>
              <p style="color: #6b7280; font-size: 0.875rem; text-align: center; margin: 0;">
                Contact your administrator if you need help configuring these variables.
              </p>
            </div>
          </div>
        `;
      }
    }
  }

  validateRequired(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const required: (keyof EnvConfig)[] = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
    ];

    const missing: string[] = [];
    required.forEach((key) => {
      if (!import.meta.env[key]) {
        missing.push(key);
      }
    });

    if (missing.length > 0) {
      const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
      errors.push(errorMsg);
    }

    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      warnings.push('VITE_STRIPE_PUBLISHABLE_KEY is not configured. Payment features will not work.');
    }

    return { errors, warnings };
  }

  validateStripeKeys(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

    if (!stripeKey) {
      return { errors, warnings };
    }

    const isTestKey = stripeKey.startsWith('pk_test_');
    const isLiveKey = stripeKey.startsWith('pk_live_');

    if (!isTestKey && !isLiveKey) {
      errors.push('Invalid Stripe publishable key format. Key must start with pk_test_ or pk_live_');
      return { errors, warnings };
    }

    if (this.isProduction && isTestKey) {
      warnings.push('Using Stripe TEST keys in production environment! Please replace with live keys (pk_live_...).');
    }

    if (this.isDevelopment && isLiveKey) {
      warnings.push('Using Stripe LIVE keys in development environment! Consider using test keys (pk_test_...).');
    }

    return { errors, warnings };
  }

  validateSupabaseConfig(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const url = import.meta.env.VITE_SUPABASE_URL as string;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    if (!url || !key) {
      return { errors, warnings };
    }

    try {
      new URL(url);
    } catch {
      errors.push(`Invalid Supabase URL format: ${url}. Expected format: https://your-project.supabase.co`);
      return { errors, warnings };
    }

    if (!url.includes('supabase.co')) {
      warnings.push('Supabase URL does not contain "supabase.co". Please verify this is a valid Supabase project URL.');
    }

    return { errors, warnings };
  }

  validateAll(): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    const requiredResult = this.validateRequired();
    allErrors.push(...requiredResult.errors);
    allWarnings.push(...requiredResult.warnings);

    const stripeResult = this.validateStripeKeys();
    allErrors.push(...stripeResult.errors);
    allWarnings.push(...stripeResult.warnings);

    const supabaseResult = this.validateSupabaseConfig();
    allErrors.push(...supabaseResult.errors);
    allWarnings.push(...supabaseResult.warnings);

    this.validationResult = {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };

    allWarnings.forEach(warning => logger.warn(warning));

    if (!this.validationResult.isValid) {
      allErrors.forEach(error => logger.error(error));
      const errorMessage = allErrors.join('; ');
      this.showConfigError(errorMessage);
    }

    return this.validationResult;
  }

  getValidationResult(): ValidationResult | null {
    return this.validationResult;
  }

  getEnvironmentInfo(): { mode: string; isProduction: boolean; isDevelopment: boolean } {
    return {
      mode: import.meta.env.MODE,
      isProduction: this.isProduction,
      isDevelopment: this.isDevelopment,
    };
  }
}

export const envValidator = new EnvironmentValidator();
