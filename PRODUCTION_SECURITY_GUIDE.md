# Production Security Configuration Guide

## Overview
This guide outlines all security configurations and best practices implemented for production deployment of the Clear Course Studio multi-tenant LMS platform.

## 1. Environment Variables

### Required Variables
All environment variables must be configured before deployment:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... # MUST be live key for production
```

### Environment Variable Validation
- Automatic validation runs on application startup
- Development mode validates test keys
- Production mode requires live Stripe keys (pk_live_...)
- Warnings are displayed if test keys are used in production

### Setting Production Environment Variables

**Vercel:**
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
```

**Netlify:**
Navigate to: Site settings → Environment variables → Add variables

**Supabase Edge Functions:**
All Supabase environment variables are automatically available:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

Add Stripe keys via Supabase CLI:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

## 2. Security Headers

### Implemented Headers
All security headers are configured in `vite.config.ts`:

- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts camera, microphone, geolocation
- **Content-Security-Policy**: Controls resource loading

### Production Server Configuration

**Nginx:**
```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

**Vercel (vercel.json):**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

## 3. CORS Configuration

### Development vs Production
- **Development**: Wildcard (*) origin allowed for local testing
- **Production**: Strict origin validation against whitelist

### Allowed Origins
Edit the ALLOWED_ORIGINS arrays in Edge Functions:
```typescript
const ALLOWED_ORIGINS = [
  'https://your-production-domain.com',
  'https://www.your-production-domain.com',
  'https://your-subdomain.your-domain.com',
];
```

### Custom Domain Setup
When using custom domains:
1. Update ALLOWED_ORIGINS in all Edge Functions
2. Configure DNS CNAME records
3. Set up SSL certificates
4. Test CORS with production domain

## 4. Rate Limiting

### Edge Function Rate Limits
Implemented in `create-checkout-session`:
- **Window**: 60 seconds
- **Max Requests**: 10 per IP address
- **Response**: 429 Too Many Requests

### Customizing Rate Limits
```typescript
const RATE_LIMIT_WINDOW = 60000; // milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10;
```

### Production Considerations
- Rate limits are per-function instance
- Consider adding Redis for distributed rate limiting
- Monitor rate limit hits in logs
- Adjust based on legitimate traffic patterns

## 5. Stripe Configuration

### Production Checklist
- [ ] Replace test keys with live keys
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Test webhook signature verification
- [ ] Set up webhook monitoring and alerts
- [ ] Configure idempotency keys for payment operations
- [ ] Test failed payment scenarios
- [ ] Verify subscription lifecycle management

### Webhook Configuration
1. Navigate to: Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed
   - invoice.payment_succeeded
4. Copy webhook signing secret to Supabase secrets

### Testing Stripe Integration
```bash
# Use Stripe CLI for webhook testing
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
stripe trigger checkout.session.completed
```

## 6. Database Security (RLS)

### Row Level Security Policies
All tables have RLS enabled with restrictive policies:

#### Organizations
- Users can only view their own organization
- Only owners can update organization settings
- Super admins have full access

#### Courses
- Strict organization boundary enforcement
- Instructors can only manage courses in their organization
- Learners can only view courses they're enrolled in

#### Enrollments
- Users can only enroll in courses from their organization
- Admins can view all enrollments in their organization

### RLS Best Practices
1. **Always enable RLS**: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. **Never use `USING (true)`**: Always check authentication and ownership
3. **Test policies**: Verify unauthorized access is blocked
4. **Use indexes**: Add indexes on frequently queried RLS columns
5. **Monitor performance**: Check for RLS-related slow queries

### Testing RLS Policies
```sql
-- Test as authenticated user
SET request.jwt.claim.sub = 'user-id-here';
SELECT * FROM courses; -- Should only return user's courses

-- Test as unauthenticated
RESET request.jwt.claim.sub;
SELECT * FROM courses; -- Should return empty or error
```

## 7. Logging and Monitoring

### Production Logging
- Console.log statements are removed in production builds
- Only errors and warnings are logged in production
- Structured logging via `logger` utility

### Error Monitoring Integration
Recommended services:
- **Sentry**: Full-featured error tracking
- **LogRocket**: Session replay with error tracking
- **DataDog**: Application performance monitoring

### Sentry Setup Example
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter sensitive data
    return event;
  },
});
```

## 8. Build Configuration

### Production Build Optimizations
Configured in `vite.config.ts`:
- **Code Splitting**: Vendor chunks separated
- **Minification**: Terser minification enabled
- **Console Removal**: All console.log removed
- **Source Maps**: Disabled for production
- **Tree Shaking**: Automatic unused code removal

### Building for Production
```bash
npm run build
npm run preview  # Test production build locally
```

### Build Verification
Check build output:
- Bundle size < 1MB for main chunk
- Vendor chunks properly split
- No console.log in output
- Assets properly hashed

## 9. SSL/TLS Configuration

### Certificate Requirements
- Use valid SSL certificates (Let's Encrypt, CloudFlare, etc.)
- Enable HSTS with long max-age
- Redirect all HTTP to HTTPS
- Use TLS 1.2 or higher

### Vercel/Netlify
SSL is automatic with custom domains.

### Self-Hosted
```nginx
ssl_certificate /path/to/fullchain.pem;
ssl_certificate_key /path/to/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

## 10. Deployment Checklist

### Pre-Deployment
- [ ] Update all environment variables to production values
- [ ] Replace Stripe test keys with live keys
- [ ] Configure Stripe webhook endpoint
- [ ] Update ALLOWED_ORIGINS in Edge Functions
- [ ] Test production build locally
- [ ] Run security audit: `npm audit`
- [ ] Update dependencies: `npm update`
- [ ] Review and tighten RLS policies
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure backup strategy

### Post-Deployment
- [ ] Verify SSL certificate is valid
- [ ] Test authentication flow
- [ ] Test payment processing with test mode first
- [ ] Verify webhook delivery
- [ ] Test organization isolation
- [ ] Check error logging is working
- [ ] Monitor performance metrics
- [ ] Set up uptime monitoring
- [ ] Test email notifications
- [ ] Verify CORS configuration

### Ongoing Maintenance
- [ ] Monitor error rates daily
- [ ] Review security logs weekly
- [ ] Update dependencies monthly
- [ ] Run security audits quarterly
- [ ] Review and rotate secrets annually
- [ ] Test disaster recovery procedures

## 11. Incident Response

### Security Incident Protocol
1. **Detect**: Monitor logs and error rates
2. **Assess**: Determine scope and severity
3. **Contain**: Disable affected features if needed
4. **Eradicate**: Fix vulnerability
5. **Recover**: Deploy fix and verify
6. **Review**: Post-mortem analysis

### Emergency Contacts
- Platform Admin: [Contact Info]
- Security Team: [Contact Info]
- Stripe Support: [Dashboard Link]
- Supabase Support: [Dashboard Link]

## 12. Compliance

### GDPR Compliance
- Cookie consent implemented
- Privacy policy accessible
- User data export capability
- Right to be forgotten (user deletion)
- Data retention policies

### Data Protection
- Encryption at rest (Supabase default)
- Encryption in transit (TLS/SSL)
- Secure password storage (Supabase Auth)
- PII handling procedures
- Audit logging enabled

## 13. Performance Optimization

### CDN Configuration
- Use CDN for static assets
- Configure proper cache headers
- Optimize images (WebP format)
- Lazy load components
- Code splitting enabled

### Database Performance
- Indexes on foreign keys
- Indexes on RLS columns
- Query optimization
- Connection pooling
- Regular VACUUM operations

## 14. Backup and Recovery

### Automated Backups
Supabase provides:
- Daily automatic backups
- Point-in-time recovery (PITR)
- 7-day retention minimum

### Backup Verification
Test backup restoration quarterly:
```bash
# Download backup
supabase db dump > backup.sql

# Test restore on staging
psql -h staging-db -U postgres -d staging < backup.sql
```

### Disaster Recovery Plan
1. Identify failure type
2. Restore from most recent backup
3. Replay transactions if using PITR
4. Verify data integrity
5. Resume normal operations
6. Document incident

## 15. Monitoring and Alerts

### Key Metrics to Monitor
- Error rate (target: < 1%)
- API response time (target: < 500ms)
- Database query time (target: < 100ms)
- Failed payment rate
- User authentication failures
- Edge function execution time

### Alert Configuration
Set up alerts for:
- Error rate spike (> 5%)
- API downtime (> 1 minute)
- Failed payment threshold (> 10/hour)
- Database connection issues
- Edge function failures
- SSL certificate expiration (30 days)

## Support and Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Vite Docs](https://vitejs.dev)

### Community
- GitHub Issues: [Repository Link]
- Discord: [Community Link]
- Email: support@your-domain.com

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Maintained By**: Development Team
