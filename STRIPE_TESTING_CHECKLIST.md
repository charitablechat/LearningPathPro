# Stripe Integration Testing Checklist

Use this checklist to systematically test your Stripe integration after completing the setup steps in `STRIPE_SETUP_GUIDE.md`.

## Pre-Testing Setup

Before running these tests, ensure you have completed:

- [ ] Added `STRIPE_SECRET_KEY` to both edge functions in Supabase Dashboard
- [ ] Created webhook endpoint in Stripe Dashboard
- [ ] Added `STRIPE_WEBHOOK_SECRET` to stripe-webhook function
- [ ] Verified all checks pass: `node verify-stripe-setup.cjs`

## Test 1: Anonymous Pricing Page Access

**Goal:** Verify pricing page works for non-logged-in users

### Steps:
1. [ ] Open incognito/private browser window
2. [ ] Navigate to: `http://localhost:5173/pricing`
3. [ ] Verify all 3 plans display (Starter, Professional, Enterprise)
4. [ ] Toggle between Monthly and Yearly billing
5. [ ] Verify prices change correctly
6. [ ] Check that yearly shows savings percentage
7. [ ] Verify Lifetime Deal section appears at bottom
8. [ ] Click "Start Free Trial" on Starter plan
9. [ ] Verify redirect to login page (not error)

### Expected Results:
- ✅ Pricing page loads without authentication
- ✅ All plans display with correct prices
- ✅ Billing toggle works smoothly
- ✅ Clicking "Start Free Trial" redirects to login

---

## Test 2: User Registration and Organization Setup

**Goal:** Create test account and organization with trial status

### Steps:
1. [ ] Navigate to: `http://localhost:5173/signup`
2. [ ] Enter test email: `test1@example.com`
3. [ ] Enter password: `TestPassword123!`
4. [ ] Click "Sign Up"
5. [ ] Wait for redirect to organization signup

**Organization Setup - Step 1: Details**
6. [ ] Enter organization name: `Test Academy`
7. [ ] Verify slug auto-generates: `test-academy`
8. [ ] Click "Continue"

**Organization Setup - Step 2: Branding**
9. [ ] Select primary color (try blue)
10. [ ] Select secondary color (try dark blue)
11. [ ] Verify gradient preview updates
12. [ ] Click "Continue"

**Organization Setup - Step 3: Plan**
13. [ ] Verify trial period shown: "Start with 14-day free trial"
14. [ ] Leave promo code empty for now
15. [ ] Click "Complete Setup"

**Verify Dashboard Access**
16. [ ] Verify redirect to dashboard
17. [ ] Check organization name appears in navbar
18. [ ] Verify role-based dashboard loads

### Expected Results:
- ✅ Registration completes without errors
- ✅ Organization created successfully
- ✅ Trial status: expires in 14 days
- ✅ Dashboard loads with organization context

### Database Verification:
```sql
-- Run in Supabase SQL Editor
SELECT
  o.name,
  o.subscription_status,
  o.trial_ends_at,
  p.email,
  p.role
FROM organizations o
JOIN profiles p ON p.organization_id = o.id
WHERE o.name = 'Test Academy';
```

Expected output:
- subscription_status: `trial`
- trial_ends_at: ~14 days from now

---

## Test 3: Starter Plan Checkout (Monthly)

**Goal:** Complete checkout flow and verify webhook processing

### Steps:
1. [ ] Log in as `test1@example.com` (if not already)
2. [ ] Navigate to: `http://localhost:5173/pricing`
3. [ ] Select "Monthly" billing
4. [ ] Click "Start Free Trial" on Starter plan
5. [ ] Verify redirect to subscribe page
6. [ ] Verify plan details show:
   - Plan: Starter
   - Price: $29/month
   - Max Courses: 5
   - Max Instructors: 2
   - Max Learners: 100

**Stripe Checkout**
7. [ ] Click "Continue to Payment"
8. [ ] Verify redirect to Stripe Checkout
9. [ ] Verify email pre-filled
10. [ ] Enter test card: `4242 4242 4242 4242`
11. [ ] Expiration: `12/34`
12. [ ] CVC: `123`
13. [ ] ZIP: `12345`
14. [ ] Name: `Test User`
15. [ ] Click "Subscribe"

**Post-Checkout**
16. [ ] Verify redirect to dashboard
17. [ ] Check URL contains: `?session_id=`

### Expected Results:
- ✅ Subscribe page shows correct plan details
- ✅ Stripe Checkout loads without errors
- ✅ Payment processes successfully
- ✅ Redirects back to application

### Stripe Dashboard Verification:
1. [ ] Go to: https://dashboard.stripe.com/test/payments
2. [ ] Verify payment appears (succeeded)
3. [ ] Go to: https://dashboard.stripe.com/test/subscriptions
4. [ ] Verify subscription created (active)
5. [ ] Go to: https://dashboard.stripe.com/test/events
6. [ ] Verify `checkout.session.completed` event sent
7. [ ] Click on event, verify webhook delivered (200 OK)

### Database Verification:
```sql
-- Check subscription was created
SELECT
  s.status,
  s.billing_cycle,
  s.stripe_subscription_id,
  sp.name as plan_name,
  o.name as org_name,
  o.subscription_status
FROM subscriptions s
JOIN subscription_plans sp ON sp.id = s.plan_id
JOIN organizations o ON o.id = s.organization_id
WHERE o.name = 'Test Academy'
ORDER BY s.created_at DESC
LIMIT 1;
```

Expected output:
- subscription status: `active`
- billing_cycle: `monthly`
- organization subscription_status: `active`
- stripe_subscription_id: `sub_xxxxx`

---

## Test 4: Professional Plan Checkout (Yearly)

**Goal:** Test yearly billing and verify different plan limits

### Steps:
1. [ ] Create new account: `test2@example.com` / `TestPassword123!`
2. [ ] Complete organization setup: `Professional Org`
3. [ ] Navigate to pricing page
4. [ ] Select "Yearly" billing
5. [ ] Click "Start Free Trial" on Professional plan
6. [ ] Verify shows: $990/year ($82.50/month)
7. [ ] Click "Continue to Payment"
8. [ ] Complete Stripe checkout with test card
9. [ ] Verify successful subscription

### Expected Results:
- ✅ Yearly pricing displays correctly
- ✅ Per-month calculation shown
- ✅ Checkout completes successfully
- ✅ Organization upgraded to Professional plan

### Database Verification:
```sql
SELECT
  sp.name as plan_name,
  sp.max_courses,
  sp.max_instructors,
  s.billing_cycle,
  o.subscription_status
FROM subscriptions s
JOIN subscription_plans sp ON sp.id = s.plan_id
JOIN organizations o ON o.id = s.organization_id
WHERE o.name = 'Professional Org';
```

Expected output:
- plan_name: `Professional`
- max_courses: `25`
- max_instructors: `10`
- billing_cycle: `yearly`

---

## Test 5: Promo Code (Lifetime Deal)

**Goal:** Test LTD2025 promo code redemption

### Steps:
1. [ ] Create new account: `test3@example.com` / `TestPassword123!`
2. [ ] Start organization setup
3. [ ] Complete Steps 1 & 2 (name and branding)
4. [ ] On Step 3, enter promo code: `LTD2025`
5. [ ] Click "Apply"
6. [ ] Verify message: "Promo code applied! Lifetime access granted."
7. [ ] Verify shows: "You have lifetime access to Clear Course Studio"
8. [ ] Click "Complete Setup"
9. [ ] Verify redirect to dashboard (no payment required)

### Expected Results:
- ✅ Promo code validates successfully
- ✅ No payment required
- ✅ Organization created with lifetime status
- ✅ Lifetime plan limits applied

### Database Verification:
```sql
-- Check organization has lifetime status
SELECT
  o.name,
  o.subscription_status,
  o.trial_ends_at
FROM organizations o
JOIN promo_code_redemptions pcr ON pcr.organization_id = o.id
WHERE o.subscription_status = 'lifetime'
ORDER BY o.created_at DESC
LIMIT 1;
```

Expected output:
- subscription_status: `lifetime`
- trial_ends_at: `null`

```sql
-- Check promo code redemption count increased
SELECT
  code,
  redemptions_count,
  max_redemptions
FROM promo_codes
WHERE code = 'LTD2025';
```

Expected output:
- redemptions_count: `1` (or higher if tested multiple times)

---

## Test 6: Feature Limits Enforcement

**Goal:** Verify plan limits are enforced correctly

### Test 6A: Course Creation Limit (Starter Plan)

1. [ ] Log in as test1@example.com (Starter plan - 5 course limit)
2. [ ] Navigate to dashboard
3. [ ] Create 5 courses (name them: Course 1, Course 2, etc.)
4. [ ] Try to create 6th course
5. [ ] Verify error: "You've reached your plan limit"
6. [ ] Verify prompt to upgrade

### Test 6B: Instructor Invitation Limit (Starter Plan)

1. [ ] Stay logged in as test1@example.com
2. [ ] Navigate to: `/settings` → Team tab
3. [ ] Invite 2 instructors (use any emails)
4. [ ] Try to invite 3rd instructor
5. [ ] Verify error about plan limit
6. [ ] Verify upgrade prompt

### Expected Results:
- ✅ Limits enforced at database level
- ✅ Clear error messages shown
- ✅ Upgrade prompts appear

---

## Test 7: Super Admin Dashboard

**Goal:** Verify super admin can see all organizations and metrics

### Steps:
1. [ ] Run SQL to make yourself super admin:
   ```sql
   UPDATE profiles
   SET is_super_admin = true
   WHERE email = 'test1@example.com';
   ```
2. [ ] Log out and log back in
3. [ ] Navigate to: `http://localhost:5173/super-admin`
4. [ ] Verify displays:
   - Total Organizations count
   - Active Subscriptions count
   - Trial Conversions percentage
   - LTD Redemptions count
5. [ ] Scroll to organization directory
6. [ ] Verify all test organizations appear
7. [ ] Test search functionality
8. [ ] Test filtering by subscription status
9. [ ] Click on an organization to view details

### Expected Results:
- ✅ Dashboard accessible only to super admin
- ✅ Accurate metrics displayed
- ✅ All organizations visible
- ✅ Search and filters work

---

## Test 8: Webhook Event Processing

**Goal:** Verify all webhook events process correctly

### Test 8A: Subscription Update

1. [ ] Go to Stripe Dashboard → Subscriptions
2. [ ] Find test1@example.com subscription
3. [ ] Click "Update subscription"
4. [ ] Change quantity or add item (to trigger update)
5. [ ] Save changes
6. [ ] Go to Events, verify `customer.subscription.updated` sent
7. [ ] Check webhook delivery status (200 OK)

### Test 8B: Payment Failure Simulation

1. [ ] In Stripe Dashboard, find subscription
2. [ ] Simulate failed payment (in test mode)
3. [ ] Verify `invoice.payment_failed` event sent
4. [ ] Check database:
   ```sql
   SELECT subscription_status
   FROM organizations
   WHERE name = 'Test Academy';
   ```
5. [ ] Verify status changed to `past_due`

### Test 8C: Subscription Cancellation

1. [ ] In Stripe Dashboard, cancel subscription
2. [ ] Verify `customer.subscription.deleted` event sent
3. [ ] Check database:
   ```sql
   SELECT
     o.subscription_status,
     s.status,
     s.canceled_at
   FROM subscriptions s
   JOIN organizations o ON o.id = s.organization_id
   WHERE o.name = 'Test Academy';
   ```
4. [ ] Verify both show canceled status

### Expected Results:
- ✅ All webhook events deliver successfully
- ✅ Database updates reflect webhook events
- ✅ Organization status changes appropriately

---

## Test 9: Error Handling

**Goal:** Verify graceful error handling

### Test 9A: Declined Card

1. [ ] Create new account: `test4@example.com`
2. [ ] Complete organization setup
3. [ ] Select any plan
4. [ ] In Stripe Checkout, use declined card: `4000 0000 0000 0002`
5. [ ] Verify Stripe shows decline message
6. [ ] Verify can retry with valid card

### Test 9B: Invalid Promo Code

1. [ ] Create new account: `test5@example.com`
2. [ ] During organization setup, enter invalid code: `INVALID`
3. [ ] Click "Apply"
4. [ ] Verify error: "Invalid promo code"
5. [ ] Try valid code: `LTD2025`
6. [ ] Verify accepts valid code

### Test 9C: Missing Stripe Configuration

1. [ ] In Supabase Dashboard, temporarily remove `STRIPE_SECRET_KEY`
2. [ ] Try to start checkout
3. [ ] Verify friendly error message (not crash)
4. [ ] Re-add the secret
5. [ ] Verify checkout works again

### Expected Results:
- ✅ Clear error messages for all failure cases
- ✅ No application crashes
- ✅ Users can recover from errors

---

## Test 10: End-to-End User Journey

**Goal:** Complete full user lifecycle test

### Steps:
1. [ ] Anonymous user visits landing page
2. [ ] Clicks "Get Started"
3. [ ] Creates account
4. [ ] Sets up organization with custom branding
5. [ ] Starts 14-day trial
6. [ ] Creates first course
7. [ ] Invites team member
8. [ ] Views pricing page
9. [ ] Upgrades to paid plan
10. [ ] Continues using platform with active subscription

### Expected Results:
- ✅ Smooth flow from anonymous to paying customer
- ✅ No broken links or errors
- ✅ All features accessible as expected
- ✅ Branding persists throughout

---

## Final Verification Checklist

After completing all tests:

- [ ] All test organizations created successfully
- [ ] At least 1 active monthly subscription
- [ ] At least 1 active yearly subscription
- [ ] At least 1 lifetime deal redemption
- [ ] All webhook events delivered successfully
- [ ] Feature limits enforced correctly
- [ ] Super admin dashboard functional
- [ ] Error handling works gracefully
- [ ] Build completes without errors: `npm run build`

## Test Data Summary

Record your test results:

| Test Account | Organization | Plan | Billing | Status | Notes |
|--------------|--------------|------|---------|--------|-------|
| test1@example.com | Test Academy | Starter | Monthly | Active | ✅ Checkout successful |
| test2@example.com | Professional Org | Professional | Yearly | Active | ✅ Yearly billing works |
| test3@example.com | LTD Org | Lifetime | N/A | Lifetime | ✅ Promo code redeemed |
| test4@example.com | Error Test | N/A | N/A | Trial | ✅ Declined card handled |
| test5@example.com | Invalid Promo | N/A | N/A | Trial | ✅ Invalid code handled |

## Cleanup (Optional)

To reset test data:

```sql
-- Delete test organizations (cascades to all related records)
DELETE FROM organizations
WHERE name IN ('Test Academy', 'Professional Org', 'LTD Org', 'Error Test', 'Invalid Promo');

-- Delete test user profiles
DELETE FROM auth.users
WHERE email LIKE 'test%@example.com';

-- Reset promo code redemption count
UPDATE promo_codes
SET redemptions_count = 0
WHERE code = 'LTD2025';
```

---

## Success Criteria

Your Stripe integration is fully functional when:

✅ All 10 tests pass without errors
✅ Webhooks deliver successfully (200 OK)
✅ Database updates reflect all transactions
✅ Feature limits enforce correctly
✅ Error handling works gracefully
✅ Super admin dashboard shows accurate data
✅ Build completes: `npm run build`

## Next Steps

After successful testing:

1. Review `STRIPE_SETUP_GUIDE.md` for production deployment
2. Switch to live Stripe keys when ready
3. Configure production webhook endpoint
4. Add monitoring and alerting for failed payments
5. Set up customer billing portal
6. Launch! 🚀
