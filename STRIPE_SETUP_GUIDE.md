# Stripe Integration Setup Guide

## Current Status

Your Stripe integration is **95% complete**! Here's what's already configured:

- ✅ Stripe publishable key added to .env
- ✅ Subscription plans configured in database with Stripe price IDs
- ✅ Promo code LTD2025 active (0/150 redemptions used)
- ✅ Edge functions deployed and active
- ✅ Frontend checkout flow implemented

## What You Need to Do

### Step 1: Add Stripe Secrets to Supabase Edge Functions

You need to add your Stripe secret key to the Supabase Edge Functions. Here's how:

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/lmnpzfafwslxeqmdrucx
   - Navigate to: Edge Functions

2. **Add Secret to `create-checkout-session` Function**
   - Click on the `create-checkout-session` function
   - Go to the "Secrets" tab
   - Click "Add Secret"
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_test_51SLRWCFSH748HgtBRLCFrHa3jJN2quPdavckRIg12gVzj5uv9L9ddH834G0JC9O5fbQqi7ZTgG0V1ywDjEWMzRhF00Bb6c009y`
   - Click "Save"

3. **Add Secrets to `stripe-webhook` Function**
   - Click on the `stripe-webhook` function
   - Go to the "Secrets" tab
   - Add two secrets:

   **Secret 1:**
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_test_51SLRWCFSH748HgtBRLCFrHa3jJN2quPdavckRIg12gVzj5uv9L9ddH834G0JC9O5fbQqi7ZTgG0V1ywDjEWMzRhF00Bb6c009y`

   **Secret 2 (You'll get this in Step 2):**
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (from Step 2 below)

### Step 2: Configure Stripe Webhook

1. **Go to Stripe Dashboard**
   - URL: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"

2. **Configure the Endpoint**
   - Endpoint URL: `https://lmnpzfafwslxeqmdrucx.supabase.co/functions/v1/stripe-webhook`
   - Description: "Clear Course Studio Webhook"
   - Version: Latest API version

3. **Select Events to Listen**
   Select these 5 events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.payment_succeeded`

4. **Get Webhook Signing Secret**
   - After creating the endpoint, click on it
   - Click "Reveal" under "Signing secret"
   - Copy the secret (format: `whsec_...`)
   - Go back to Supabase and add this as `STRIPE_WEBHOOK_SECRET` to the `stripe-webhook` function

### Step 3: Verify Stripe Products Match Database

Your database already has the correct Stripe price IDs configured:

**Starter Plan:**
- Monthly: `price_1SLR4WFWhBWNTGhfgihNNenl` ($29/month)
- Yearly: `price_1SLR5bFWhBWNTGhfYrF5rBWy` ($290/year)

**Professional Plan:**
- Monthly: `price_1SLR7DFWhBWNTGhfLgi8Mb6e` ($99/month)
- Yearly: `price_1SLR82FWhBWNTGhfLtvDPrnS` ($990/year)

**Enterprise Plan:**
- Monthly: `price_1SLR8eFWhBWNTGhfTwlaTZwX` ($499/month)
- Yearly: `price_1SLR9PFWhBWNTGhfAuqx4HeM` ($5,490/year)

**Verify in Stripe Dashboard:**
- Go to: https://dashboard.stripe.com/test/products
- Confirm these price IDs exist and match the amounts above
- If they don't exist, you'll need to create products and update the database

## Testing Instructions

### Test 1: Basic Checkout Flow

1. **Start the development server** (if not already running)
   ```bash
   npm run dev
   ```

2. **Create a test account**
   - Navigate to: http://localhost:5173/signup
   - Email: test@example.com
   - Password: testpassword123
   - Complete organization setup

3. **Go to pricing page**
   - Navigate to: http://localhost:5173/pricing
   - Select "Starter" plan with monthly billing
   - Click "Start Free Trial"

4. **Complete checkout**
   - You'll be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Expiration: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
   - Complete payment

5. **Verify success**
   - You should be redirected to dashboard
   - Organization status should change from "trial" to "active"

### Test 2: Promo Code (Lifetime Deal)

1. **Create another test account**
   - Different email: test2@example.com

2. **During organization setup**
   - Step 3 shows promo code input
   - Enter: `LTD2025`
   - Click "Apply"
   - Should show: "Promo code applied! Lifetime access granted."

3. **Complete signup**
   - Organization should have "lifetime" status
   - No payment required

### Test 3: Webhook Verification

1. **After completing Test 1 checkout**
   - Go to: https://dashboard.stripe.com/test/events
   - You should see a `checkout.session.completed` event
   - Click on it to see webhook delivery status
   - Should show successful delivery (200 response)

2. **Check database**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;

   -- Should show:
   -- - organization_id: your org ID
   -- - stripe_subscription_id: sub_xxx
   -- - status: active
   ```

### Test 4: Feature Limits

1. **Log into Starter plan organization**
   - Try creating 6 courses (limit is 5)
   - Should see error: "Upgrade required"

2. **Try inviting 3 instructors** (limit is 2)
   - Should see error: "Upgrade required"

### Test 5: Super Admin Dashboard

1. **Set yourself as super admin**
   ```sql
   -- In Supabase SQL Editor
   UPDATE profiles
   SET is_super_admin = true
   WHERE email = 'your-email@example.com';
   ```

2. **Access super admin panel**
   - Navigate to: http://localhost:5173/super-admin
   - Should see:
     - Total organizations
     - Active subscriptions
     - Promo code redemptions
     - Organization directory

## Troubleshooting

### "Missing required environment variables" Error

**Solution:** Make sure you added the secrets to Supabase Edge Functions (Step 1 above).

### Checkout Page Shows "Price ID not configured"

**Solution:** The price IDs in Stripe don't match those in your database. Either:
1. Create products in Stripe with the IDs shown above, OR
2. Update the database with your actual Stripe price IDs

### Webhook Not Receiving Events

**Possible causes:**
1. Webhook signing secret not added to edge function
2. Wrong endpoint URL in Stripe dashboard
3. Events not selected in Stripe webhook configuration

**Check:**
- Supabase Edge Function logs: Project > Edge Functions > stripe-webhook > Logs
- Stripe webhook attempts: Dashboard > Developers > Webhooks > Click your endpoint

### Organization Status Not Changing After Payment

**This means the webhook didn't process correctly.**

**Check:**
1. Edge function logs for errors
2. Stripe webhook delivery status
3. Database subscriptions table for new records

### Test Card Declined

Make sure you're using: `4242 4242 4242 4242`

**Other test cards:**
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`
- Insufficient funds: `4000 0000 0000 9995`

## Production Checklist

Before going live with real payments:

- [ ] Switch to live Stripe keys (not test keys)
- [ ] Update VITE_STRIPE_PUBLISHABLE_KEY with live key
- [ ] Update Supabase secrets with live STRIPE_SECRET_KEY
- [ ] Create live webhook in Stripe (not test webhook)
- [ ] Update STRIPE_WEBHOOK_SECRET with live webhook secret
- [ ] Test with a real card (charge will be real)
- [ ] Set up billing portal for customers to manage subscriptions
- [ ] Configure Stripe tax settings if applicable
- [ ] Add terms of service and privacy policy links
- [ ] Set up email notifications for failed payments

## Stripe Dashboard Quick Links

- **Test Dashboard**: https://dashboard.stripe.com/test/dashboard
- **Products**: https://dashboard.stripe.com/test/products
- **Subscriptions**: https://dashboard.stripe.com/test/subscriptions
- **Webhooks**: https://dashboard.stripe.com/test/webhooks
- **Events**: https://dashboard.stripe.com/test/events
- **API Keys**: https://dashboard.stripe.com/test/apikeys

## Support

If you encounter issues:

1. Check Edge Function logs in Supabase
2. Check Stripe webhook delivery logs
3. Check browser console for frontend errors
4. Review database tables for expected records

---

**Your integration is ready to test!** Complete Steps 1 and 2 above, then run through the test scenarios.
