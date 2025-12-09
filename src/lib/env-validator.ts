import { logger } from './logger';

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_STRIPE_PUBLISHABLE_KEY: string;
  VITE_EMAIL_PROVIDER?: string;
  VITE_EMAIL_API_KEY?: string;
  VITE_EMAIL_FROM?: string;
}

class EnvironmentValidator {
  private isProduction: boolean;
  private isDevelopment: boolean;

  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.isDevelopment = import.meta.env.DEV;
  }

  validateRequired(): void {
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
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.'
      );
    }

    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      if (this.isProduction) {
        throw new Error(
          'Missing required environment variable: VITE_STRIPE_PUBLISHABLE_KEY\n' +
          'Stripe configuration is required in production. Please check your .env file.'
        );
      } else {
        logger.warn(
          'VITE_STRIPE_PUBLISHABLE_KEY is not configured. ' +
          'Payment features will not work until you add a valid Stripe key.'
        );
      }
    }
  }

  validateStripeKeys(): void {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

    if (!stripeKey) {
      return;
    }

    const isTestKey = stripeKey.startsWith('pk_test_');
    const isLiveKey = stripeKey.startsWith('pk_live_');

    if (!isTestKey && !isLiveKey) {
      throw new Error(
        'Invalid Stripe publishable key format. Key must start with pk_test_ or pk_live_'
      );
    }

    if (this.isProduction && isTestKey) {
      logger.warn(
        'Using Stripe TEST keys in production environment! ' +
        'Please replace with live keys (pk_live_...) before deploying to production.'
      );
    }

    if (this.isDevelopment && isLiveKey) {
      logger.warn(
        'Using Stripe LIVE keys in development environment! ' +
        'Consider using test keys (pk_test_...) for development.'
      );
    }
  }

  validateSupabaseConfig(): void {
    const url = import.meta.env.VITE_SUPABASE_URL as string;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    if (!url || !key) {
      return;
    }

    try {
      new URL(url);
    } catch {
      throw new Error(
        `Invalid Supabase URL format: ${url}\n` +
        'Expected format: https://your-project.supabase.co'
      );
    }

    if (!url.includes('supabase.co')) {
      logger.warn(
        'Supabase URL does not contain "supabase.co". ' +
        'Please verify this is a valid Supabase project URL.'
      );
    }
  }

  validateAll(): void {
    try {
      this.validateRequired();
      this.validateStripeKeys();
      this.validateSupabaseConfig();
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Environment validation error', error);
        throw error;
      }
      throw error;
    }
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

if (import.meta.env.DEV) {
  envValidator.validateAll();
  const envInfo = envValidator.getEnvironmentInfo();
  logger.info('Environment initialized', { mode: envInfo.mode });
}
