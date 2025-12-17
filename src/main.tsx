import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { envValidator } from './lib/env-validator';
import { logger } from './lib/logger';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  const validationResult = envValidator.validateAll();
  const envInfo = envValidator.getEnvironmentInfo();

  if (import.meta.env.DEV) {
    logger.info('Environment initialized', {
      mode: envInfo.mode,
      isValid: validationResult.isValid,
      warningCount: validationResult.warnings.length
    });
  } else {
    logger.info('Production environment initialized', {
      mode: envInfo.mode,
      hasSupabase: !!import.meta.env.VITE_SUPABASE_URL,
      hasStripe: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      isValid: validationResult.isValid
    });
  }

  if (validationResult.isValid) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } else {
    logger.error('Cannot start application: Environment validation failed', {
      errors: validationResult.errors
    });
  }
} catch (error) {
  logger.error('Fatal error during initialization', error);
  console.error('Application failed to initialize:', error);
}
