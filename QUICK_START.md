# Quick Start Guide

Get your multi-tenant LMS platform running in 5 minutes!

## Step 1: Verify Everything Works

```bash
npm run dev
```

Visit `http://localhost:5173` - you should see the landing page.

## Step 2: Test Organization Creation

1. Click "Get Started" or "Sign Up"
2. Create an account with email/password
3. Complete the 3-step organization setup:
   - Name your organization (e.g., "Test Academy")
   - Customize brand colors
   - Optionally try promo code: `LTD2025`
4. You'll be redirected to your dashboard!

## Step 3: Access Super Admin

Your email `kale@lighthousechatbots.com` is already set as super admin.

1. Log in with that email
2. Navigate to `/super-admin`
3. View all organizations and platform stats

## Step 4: Configure Stripe (For Real Payments)

### Quick Setup:

1. **Get Stripe Keys**
   ```
   Sign up: https://dashboard.stripe.com/register
   Get keys: https://dashboard.stripe.com/apikeys
   ```

2. **Create Products** (in Stripe Dashboard)
   - Product 1: "Starter" - $29/month, $290/year
   - Product 2: "Professional" - $99/month, $990/year
   - Product 3: "Enterprise" - $499/month, $5,490/year

3. **Update Database**
   ```sql
   -- In Supabase SQL Editor
   UPDATE subscription_plans
   SET stripe_monthly_price_id = 'price_abc123',
       stripe_yearly_price_id = 'price_def456'
   WHERE slug = 'starter';

   -- Repeat for 'professional' and 'enterprise'
   ```

4. **Add Environment Variable**
   ```bash
   # In .env file
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_abc123...
   ```

5. **Configure Webhook**
   ```
   URL: https://lmnpzfafwslxeqmdrucx.supabase.co/functions/v1/stripe-webhook

   Events to send:
   ✓ checkout.session.completed
   ✓ customer.subscription.updated
   ✓ customer.subscription.deleted
   ✓ invoice.payment_failed
   ✓ invoice.payment_succeeded
   ```

6. **Add Webhook Secret to Supabase**
   - Go to Supabase Dashboard
   - Edge Functions > stripe-webhook > Secrets
   - Add: `STRIPE_WEBHOOK_SECRET=whsec_...`

## Step 5: Test Subscription Flow

1. Navigate to `/pricing`
2. Select a plan
3. Complete Stripe checkout (use test card: 4242 4242 4242 4242)
4. Verify organization status changes to "active"
5. Check super admin dashboard to see subscription

## Testing Promo Code

1. During organization setup (Step 3 of signup)
2. Enter code: `LTD2025`
3. Click "Apply"
4. Organization will get lifetime access!
5. Super admin can see redemption count

## Common Test Scenarios

### Test Feature Limits

On Starter plan (5 courses max):
1. Create 5 courses
2. Try to create 6th course
3. Should see upgrade prompt

### Test Team Invitations

1. Go to `/settings` → Team tab
2. Enter email and role
3. Send invitation
4. Check `organization_invitations` table

### Test Branding

1. Go to `/settings` → Branding tab
2. Change primary/secondary colors
3. See gradient preview update
4. Save changes
5. Colors apply across entire org

## Troubleshooting

**Can't create organization?**
- Check you're logged in
- Verify Supabase connection
- Check browser console for errors

**Stripe not working?**
- Verify publishable key in .env
- Check price IDs match in database
- Ensure webhook is configured
- Check Supabase function logs

**No super admin access?**
- Run: `UPDATE profiles SET is_super_admin = true WHERE email = 'your@email.com';`
- Log out and back in

**Feature limits not enforcing?**
- Check organization_id is set on profiles
- Verify RLS policies are enabled
- Check subscription status

## What's Next?

### Essential for Production:
- [ ] Switch Stripe to live mode
- [ ] Set up custom domain
- [ ] Configure email service (optional but recommended)
- [ ] Add terms of service content
- [ ] Add privacy policy content

### Nice to Have:
- [ ] Add more email templates
- [ ] Create help documentation
- [ ] Set up error monitoring
- [ ] Add analytics tracking
- [ ] Create onboarding tutorials

## Key URLs

- Landing: `/`
- Pricing: `/pricing`
- Dashboard: `/dashboard`
- Settings: `/settings`
- Super Admin: `/super-admin`
- Profile: `/profile`

## Default Credentials

Super Admin: `kale@lighthousechatbots.com` (password: whatever you set)

## Database Access

Supabase Dashboard: https://supabase.com/dashboard/project/lmnpzfafwslxeqmdrucx

Key tables to watch:
- `organizations` - All tenant orgs
- `subscriptions` - Active subscriptions
- `promo_code_redemptions` - LTD usage
- `profiles` - Users with org_id

## Need Help?

1. Check `MULTITENANT_SETUP.md` for detailed docs
2. Check `TRANSFORMATION_SUMMARY.md` for overview
3. Email: kale@lighthousechatbots.com

---

That's it! Your multi-tenant SaaS platform is ready to go! 🎉
