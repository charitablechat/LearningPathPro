# 🚀 Quick Start: Stripe Testing

## ✅ Status: Ready to Test!

All configuration complete. Just 2 steps remaining before you can test payments.

---

## Step 1: Add Stripe Secret to Supabase (5 minutes)

### For create-checkout-session function:
1. Go to: https://supabase.com/dashboard/project/lmnpzfafwslxeqmdrucx/functions
2. Click `create-checkout-session`
3. Click "Secrets" tab
4. Click "Add Secret"
5. Add:
   ```
   Name: STRIPE_SECRET_KEY
   Value: sk_test_51SLRWCFSH748HgtBRLCFrHa3jJN2quPdavckRIg12gVzj5uv9L9ddH834G0JC9O5fbQqi7ZTgG0V1ywDjEWMzRhF00Bb6c009y
   ```

### For stripe-webhook function:
1. Click `stripe-webhook`
2. Click "Secrets" tab
3. Add Secret 1:
   ```
   Name: STRIPE_SECRET_KEY
   Value: sk_test_51SLRWCFSH748HgtBRLCFrHa3jJN2quPdavckRIg12gVzj5uv9L9ddH834G0JC9O5fbQqi7ZTgG0V1ywDjEWMzRhF00Bb6c009y
   ```
4. Add Secret 2 (you'll get this value in Step 2):
   ```
   Name: STRIPE_WEBHOOK_SECRET
   Value: whsec_... (from Step 2)
   ```

---

## Step 2: Configure Stripe Webhook (5 minutes)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Configure:
   ```
   Endpoint URL: https://lmnpzfafwslxeqmdrucx.supabase.co/functions/v1/stripe-webhook
   Description: Clear Course Studio Webhook
   ```
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.payment_succeeded`
5. Click "Add endpoint"
6. Click on the newly created endpoint
7. Click "Reveal" next to "Signing secret"
8. Copy the secret (starts with `whsec_`)
9. Go back to Supabase and add it as `STRIPE_WEBHOOK_SECRET` in stripe-webhook function

---

## Step 3: Test It! (2 minutes)

```bash
# Start dev server
npm run dev
```

Then:

1. **Go to:** http://localhost:5173/signup
2. **Sign up:** test@example.com / TestPassword123!
3. **Create org:** Name it anything you like
4. **Go to pricing:** http://localhost:5173/pricing
5. **Select plan:** Click "Start Free Trial" on any plan
6. **Test card:** 4242 4242 4242 4242
7. **Complete:** Fill in any future date for expiration, any CVC
8. **Done!** ✅ You should be redirected back with active subscription

---

## Verification

**Check webhook worked:**
1. Go to: https://dashboard.stripe.com/test/events
2. Look for `checkout.session.completed` event
3. Click it → should show 200 OK response

**Check database updated:**
```sql
-- In Supabase SQL Editor
SELECT
  o.name,
  o.subscription_status,
  sp.name as plan_name
FROM organizations o
LEFT JOIN subscriptions s ON s.organization_id = o.id
LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
ORDER BY o.created_at DESC
LIMIT 5;
```

Should show your test organization with status = 'active'

---

## Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Declined |
| 4000 0025 0000 3155 | 🔐 Requires Auth |

All cards:
- Exp: Any future date (12/34)
- CVC: Any 3 digits (123)
- ZIP: Any 5 digits (12345)

---

## Test Promo Code

During organization setup (Step 3):
```
Code: LTD2025
Result: Lifetime access (no payment required)
```

---

## Troubleshooting

**"Missing environment variables" error:**
- Make sure you added STRIPE_SECRET_KEY to **both** edge functions

**Webhook not firing:**
- Check you added STRIPE_WEBHOOK_SECRET to stripe-webhook function
- Verify endpoint URL in Stripe is correct
- Check edge function logs in Supabase Dashboard

**Payment succeeds but org status doesn't change:**
- Check Stripe webhook delivery status (should be 200 OK)
- Review stripe-webhook logs in Supabase Dashboard
- Verify subscriptions table has new record

---

## Files to Reference

- `STRIPE_SETUP_GUIDE.md` - Detailed setup instructions
- `STRIPE_TESTING_CHECKLIST.md` - Comprehensive test scenarios
- `STRIPE_INTEGRATION_SUMMARY.md` - Complete overview

---

## Verify Configuration

```bash
node verify-stripe-setup.cjs
```

Should show: ✅ All checks passed! (5/5)

---

## Support

If you get stuck:

1. Check the guides above
2. Review Supabase edge function logs
3. Check Stripe event logs
4. Verify secrets are added correctly

---

**That's it! Complete Steps 1 & 2, then test. Takes about 12 minutes total.**

Good luck! 🎉
