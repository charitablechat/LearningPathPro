# Deployment Environment Variables Setup

Your application requires the following environment variables to be configured in your deployment platform.

## Required Environment Variables

### 1. Supabase Configuration

Get these from: https://supabase.com/dashboard/project/[your-project-id]/settings/api

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Stripe Configuration

Get from: https://dashboard.stripe.com/apikeys

For Production (use LIVE keys):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
```

For Testing (use TEST keys):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

### 3. Optional Email Configuration

```
VITE_EMAIL_PROVIDER=console
VITE_EMAIL_API_KEY=
VITE_EMAIL_FROM=noreply@yourdomain.com
VITE_APP_DOMAIN=https://clearcoursestudio.com
```

## Platform-Specific Instructions

### Vercel

1. Go to your project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable for Production environment
4. Redeploy your application

### Other Platforms

Most platforms have a similar process:
1. Find the environment variables or build settings section
2. Add each variable as key-value pairs
3. Redeploy the application

## Verification

After setting up the environment variables:

1. Trigger a new deployment
2. Check the deployment logs for any errors
3. Visit your site - you should see the landing page instead of a blank screen
4. If you see a "Configuration Error" message, verify:
   - All required variables are set
   - Variable names are exactly as shown (case-sensitive)
   - No extra spaces in the values
   - The Supabase URL includes `https://`

## Troubleshooting

If you still see a blank screen:

1. Open browser developer console (F12)
2. Check the Console tab for error messages
3. Look for any failed network requests in the Network tab
4. Verify environment variables are actually being loaded in production

## Contact

If you need help:
- Check your deployment platform's logs
- Verify Supabase project is active
- Ensure Stripe keys match your environment (test vs live)
