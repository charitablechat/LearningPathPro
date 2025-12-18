# Production Deployment Checklist

## Pre-Deployment Tasks

### 1. Environment Configuration
- [ ] Create production `.env` file from `.env.template`
- [ ] Set `VITE_SUPABASE_URL` to production Supabase URL
- [ ] Set `VITE_SUPABASE_ANON_KEY` to production anon key
- [ ] Set `VITE_STRIPE_PUBLISHABLE_KEY` to **LIVE** key (pk_live_...)
- [ ] Verify no test keys (pk_test_...) are in production environment
- [ ] Configure email service provider settings (if using)

### 2. Supabase Configuration
- [ ] Verify all database migrations are applied
- [ ] Review and test RLS policies for all tables
- [ ] Create super admin user account
- [ ] Set up database backups (automatic in Supabase)
- [ ] Configure Supabase Edge Functions secrets:
  ```bash
  supabase secrets set STRIPE_SECRET_KEY=sk_live_...
  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- [ ] Deploy Edge Functions:
  ```bash
  supabase functions deploy create-checkout-session
  supabase functions deploy stripe-webhook
  supabase functions deploy delete-user
  ```
- [ ] Test Edge Functions are accessible

### 3. Stripe Configuration
- [ ] Switch to live mode in Stripe Dashboard
- [ ] Create or verify subscription plans in Stripe
- [ ] Note down live price IDs (price_...)
- [ ] Update subscription_plans table with live Stripe price IDs
- [ ] Configure webhook endpoint: `https://[project].supabase.co/functions/v1/stripe-webhook`
- [ ] Select webhook events:
  - [x] checkout.session.completed
  - [x] customer.subscription.updated
  - [x] customer.subscription.deleted
  - [x] invoice.payment_failed
  - [x] invoice.payment_succeeded
- [ ] Copy webhook signing secret to Supabase secrets
- [ ] Test webhook with Stripe CLI or test event

### 4. Security Configuration
- [ ] Update ALLOWED_ORIGINS in Edge Functions with production domains
- [ ] Verify CORS configuration is production-ready
- [ ] Test rate limiting on Edge Functions
- [ ] Verify security headers are configured
- [ ] Run security audit: `npm audit`
- [ ] Fix any high or critical vulnerabilities
- [ ] Review RLS policies for organization isolation
- [ ] Test authentication flows (signup, login, password reset)

### 5. Code Quality
- [ ] Run linting: `npm run lint`
- [ ] Run type checking: `npm run typecheck`
- [ ] Remove any debug code or console.log statements
- [ ] Verify logger utility is used instead of console.log
- [ ] Review error handling in critical paths
- [ ] Test payment flows end-to-end
- [ ] Test user deletion flow

### 6. Build and Test
- [ ] Create production build: `npm run build`
- [ ] Verify build succeeds without errors
- [ ] Check bundle size (target: < 1MB main chunk)
- [ ] Test production build locally: `npm run preview`
- [ ] Verify all pages load correctly
- [ ] Test authentication in preview mode
- [ ] Verify Stripe integration works in preview
- [ ] Check browser console for errors

### 7. Domain and SSL
- [ ] Register production domain (if not already)
- [ ] Configure DNS records (A/CNAME)
- [ ] Set up SSL certificate (automatic with Vercel)
- [ ] Verify SSL certificate is valid
- [ ] Test HTTPS redirect works
- [ ] Update ALLOWED_ORIGINS with production domain

### 8. Monitoring and Logging
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Set up log aggregation if needed
- [ ] Configure alerts for critical errors
- [ ] Set up payment failure alerts
- [ ] Configure database monitoring
- [ ] Test that errors are being captured

## Deployment

### 9. Deploy Application
Choose your deployment platform:

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Site Settings → Environment Variables
```

#### Manual Deployment
```bash
# Build
npm run build

# Upload dist/ folder to your hosting provider
# Configure web server (nginx, Apache, etc.)
```

### 10. Verify Deployment
- [ ] Visit production URL
- [ ] Verify homepage loads
- [ ] Test user registration
- [ ] Test user login
- [ ] Create test organization
- [ ] Test subscription flow with Stripe test card
- [ ] Verify webhook events are received
- [ ] Check database records are created correctly
- [ ] Test course creation and enrollment
- [ ] Verify file uploads work
- [ ] Test different user roles (learner, instructor, admin)

## Post-Deployment

### 11. Final Checks
- [ ] Monitor error logs for first 24 hours
- [ ] Check payment processing is working
- [ ] Verify email notifications are sent
- [ ] Test mobile responsiveness
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify analytics are tracking (if configured)
- [ ] Check SEO meta tags
- [ ] Test social media sharing (if applicable)

### 12. Documentation
- [ ] Document deployment procedure
- [ ] Create runbook for common issues
- [ ] Document environment variables
- [ ] Create incident response plan
- [ ] Document backup/restore procedures
- [ ] Share credentials with team securely

### 13. Communication
- [ ] Notify team of deployment
- [ ] Announce launch (if applicable)
- [ ] Update status page
- [ ] Share production URLs with stakeholders
- [ ] Schedule post-launch review meeting

### 14. Monitoring Plan
- [ ] Set up daily health checks
- [ ] Monitor error rates
- [ ] Track payment success rates
- [ ] Monitor API response times
- [ ] Review security logs weekly
- [ ] Schedule regular backups verification

## Rollback Procedure

If issues are discovered post-deployment:

1. **Assess Severity**
   - Critical: Affects payments or data integrity → Immediate rollback
   - High: Affects core functionality → Rollback within 1 hour
   - Medium: Affects secondary features → Fix forward or rollback
   - Low: Minor issues → Fix forward

2. **Rollback Steps**
   ```bash
   # Vercel
   vercel rollback [deployment-url]

   # Manual
   # Restore previous build from backup
   ```

3. **Post-Rollback**
   - [ ] Verify system is stable
   - [ ] Document the issue
   - [ ] Create fix in development
   - [ ] Test fix thoroughly
   - [ ] Redeploy with fix

## Ongoing Maintenance

### Daily
- [ ] Check error monitoring dashboard
- [ ] Review failed payment notifications
- [ ] Monitor uptime status

### Weekly
- [ ] Review security logs
- [ ] Check for dependency updates
- [ ] Review performance metrics
- [ ] Test backup restoration (monthly)

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Review and optimize database queries
- [ ] Check SSL certificate expiration
- [ ] Review and update documentation

### Quarterly
- [ ] Conduct security review
- [ ] Perform load testing
- [ ] Review and optimize costs
- [ ] Update disaster recovery plan
- [ ] Test full backup restoration

---

## Emergency Contacts

- **Technical Lead**: [Name/Email]
- **DevOps**: [Name/Email]
- **On-Call**: [Phone/Slack]
- **Stripe Support**: dashboard.stripe.com/support
- **Supabase Support**: supabase.com/dashboard/support

## Quick Reference

### Environment Variables
```bash
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_[key]
```

### Deployment Commands
```bash
# Build
npm run build

# Preview locally
npm run preview

# Deploy (Vercel)
vercel --prod

# Deploy Edge Functions
supabase functions deploy [function-name]
```

### Useful Links
- Production URL: [Your production domain]
- Supabase Dashboard: https://supabase.com/dashboard
- Stripe Dashboard: https://dashboard.stripe.com
- Error Monitoring: [Your Sentry/other URL]
- Uptime Monitoring: [Your monitoring URL]

---

**Last Updated**: November 2024
**Version**: 1.0.0
