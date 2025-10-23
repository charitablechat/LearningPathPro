#!/usr/bin/env node

const https = require('https');

const SUPABASE_URL = 'https://lmnpzfafwslxeqmdrucx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbnB6ZmFmd3NseGVxbWRydWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNzYzODEsImV4cCI6MjA3Njc1MjM4MX0.k0Hl2G79PygL_M9aQPz6_frJzAtyF7j6HDCDLz9PX_c';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function checkEnvironmentVariables() {
  log('\n📋 Checking Environment Variables...', 'blue');

  try {
    const fs = require('fs');
    const envContent = fs.readFileSync('.env', 'utf8');

    const hasStripeKey = envContent.includes('VITE_STRIPE_PUBLISHABLE_KEY=pk_test');
    const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=');
    const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');

    if (hasStripeKey) {
      logSuccess('Stripe publishable key configured');
    } else {
      logError('Stripe publishable key missing in .env');
      return false;
    }

    if (hasSupabaseUrl && hasSupabaseKey) {
      logSuccess('Supabase credentials configured');
    } else {
      logError('Supabase credentials missing in .env');
      return false;
    }

    return true;
  } catch (error) {
    logError(`Failed to read .env file: ${error.message}`);
    return false;
  }
}

async function checkSubscriptionPlans() {
  log('\n📦 Checking Subscription Plans...', 'blue');

  try {
    const response = await makeRequest('/rest/v1/subscription_plans?select=*');

    if (response.status !== 200) {
      logError(`Failed to fetch subscription plans (Status: ${response.status})`);
      return false;
    }

    const plans = response.data;

    if (!Array.isArray(plans) || plans.length === 0) {
      logError('No subscription plans found in database');
      return false;
    }

    logSuccess(`Found ${plans.length} subscription plans`);

    let allConfigured = true;

    for (const plan of plans) {
      const hasMonthly = plan.stripe_monthly_price_id && plan.stripe_monthly_price_id.startsWith('price_');
      const hasYearly = plan.stripe_yearly_price_id && plan.stripe_yearly_price_id.startsWith('price_');

      if (hasMonthly && hasYearly) {
        logSuccess(`${plan.name}: Monthly and yearly prices configured`);
        logInfo(`  Monthly: ${plan.stripe_monthly_price_id} ($${plan.price_monthly / 100}/mo)`);
        logInfo(`  Yearly:  ${plan.stripe_yearly_price_id} ($${plan.price_yearly / 100}/yr)`);
      } else {
        logError(`${plan.name}: Missing Stripe price IDs`);
        allConfigured = false;
      }
    }

    return allConfigured;
  } catch (error) {
    logError(`Failed to check subscription plans: ${error.message}`);
    return false;
  }
}

async function checkPromoCode() {
  log('\n🎟️  Checking Promo Code...', 'blue');

  try {
    const response = await makeRequest('/rest/v1/promo_codes?code=eq.LTD2025&select=*');

    if (response.status !== 200) {
      logError(`Failed to fetch promo code (Status: ${response.status})`);
      return false;
    }

    const promoCodes = response.data;

    if (!Array.isArray(promoCodes) || promoCodes.length === 0) {
      logError('Promo code LTD2025 not found');
      return false;
    }

    const promo = promoCodes[0];

    if (!promo.is_active) {
      logWarning('Promo code LTD2025 exists but is not active');
      return false;
    }

    logSuccess(`Promo code LTD2025 is active`);
    logInfo(`  Type: ${promo.type}`);
    logInfo(`  Redemptions: ${promo.redemptions_count}/${promo.max_redemptions}`);

    return true;
  } catch (error) {
    logError(`Failed to check promo code: ${error.message}`);
    return false;
  }
}

async function checkEdgeFunctions() {
  log('\n⚡ Checking Edge Functions...', 'blue');

  try {
    const checkoutResponse = await makeRequest('/functions/v1/create-checkout-session', 'OPTIONS');
    const webhookResponse = await makeRequest('/functions/v1/stripe-webhook', 'OPTIONS');

    if (checkoutResponse.status === 200 || checkoutResponse.status === 204) {
      logSuccess('create-checkout-session function is accessible');
    } else {
      logWarning('create-checkout-session function returned unexpected status');
    }

    if (webhookResponse.status === 200 || webhookResponse.status === 204) {
      logSuccess('stripe-webhook function is accessible');
    } else {
      logWarning('stripe-webhook function returned unexpected status');
    }

    logInfo('Note: Edge functions need secrets configured in Supabase Dashboard');
    logInfo('  Required for create-checkout-session: STRIPE_SECRET_KEY');
    logInfo('  Required for stripe-webhook: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET');

    return true;
  } catch (error) {
    logError(`Failed to check edge functions: ${error.message}`);
    return false;
  }
}

async function checkDatabaseTables() {
  log('\n🗄️  Checking Database Tables...', 'blue');

  const tables = [
    'organizations',
    'subscription_plans',
    'subscriptions',
    'promo_codes',
    'promo_code_redemptions',
  ];

  let allExist = true;

  for (const table of tables) {
    try {
      const response = await makeRequest(`/rest/v1/${table}?limit=1`);
      if (response.status === 200) {
        logSuccess(`Table '${table}' exists`);
      } else {
        logError(`Table '${table}' is not accessible (Status: ${response.status})`);
        allExist = false;
      }
    } catch (error) {
      logError(`Table '${table}' check failed: ${error.message}`);
      allExist = false;
    }
  }

  return allExist;
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('   Stripe Integration Verification Tool', 'cyan');
  log('='.repeat(60), 'cyan');

  const checks = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Database Tables', fn: checkDatabaseTables },
    { name: 'Subscription Plans', fn: checkSubscriptionPlans },
    { name: 'Promo Code', fn: checkPromoCode },
    { name: 'Edge Functions', fn: checkEdgeFunctions },
  ];

  const results = [];

  for (const check of checks) {
    const result = await check.fn();
    results.push({ name: check.name, passed: result });
  }

  log('\n' + '='.repeat(60), 'cyan');
  log('   Summary', 'cyan');
  log('='.repeat(60), 'cyan');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  for (const result of results) {
    if (result.passed) {
      logSuccess(`${result.name}`);
    } else {
      logError(`${result.name}`);
    }
  }

  log('\n' + '='.repeat(60), 'cyan');

  if (passed === total) {
    logSuccess(`All checks passed! (${passed}/${total})`);
    log('\n📚 Next steps:', 'yellow');
    log('1. Add Stripe secrets to Supabase Edge Functions', 'yellow');
    log('2. Configure Stripe webhook endpoint', 'yellow');
    log('3. Run test checkout flow', 'yellow');
    log('\nSee STRIPE_SETUP_GUIDE.md for detailed instructions.', 'cyan');
  } else {
    logError(`Some checks failed (${passed}/${total} passed)`);
    log('\nPlease review the errors above and fix them before proceeding.', 'yellow');
  }

  log('='.repeat(60) + '\n', 'cyan');

  process.exit(passed === total ? 0 : 1);
}

main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});
