// Verify environment variables are present during build
import { readFileSync } from 'fs';
import { join } from 'path';

// Try to load .env file if it exists (for local builds)
try {
  const envPath = join(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      process.env[key] = values.join('=');
    }
  });
} catch (e) {
  // .env file doesn't exist, variables should come from deployment platform
}

console.log('Environment Variables Check:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
console.log('VITE_STRIPE_PUBLISHABLE_KEY:', process.env.VITE_STRIPE_PUBLISHABLE_KEY ? '✓ Set' : '✗ Missing');

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY || !process.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  console.error('\n⚠️  Missing required environment variables!');
  console.error('Make sure these are set in your deployment platform or .env file\n');
  process.exit(1);
}

console.log('\n✓ All required environment variables are set\n');
