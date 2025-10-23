# Clear Course Studio

A comprehensive multi-tenant Learning Management System (LMS) with Stripe subscription integration.

## 🚀 Quick Start

### For Stripe Testing
See: **[QUICK_START_STRIPE.md](./QUICK_START_STRIPE.md)** - 12 minutes to test payments

### For Platform Setup
See: **[QUICK_START.md](./QUICK_START.md)** - Complete platform guide

## 📚 Documentation

- **[STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md)** - Detailed Stripe configuration
- **[STRIPE_TESTING_CHECKLIST.md](./STRIPE_TESTING_CHECKLIST.md)** - Comprehensive test scenarios
- **[STRIPE_INTEGRATION_SUMMARY.md](./STRIPE_INTEGRATION_SUMMARY.md)** - Complete overview
- **[MULTITENANT_SETUP.md](./MULTITENANT_SETUP.md)** - Multi-tenancy documentation
- **[TRANSFORMATION_SUMMARY.md](./TRANSFORMATION_SUMMARY.md)** - Platform transformation details

## ✅ Current Status

**Stripe Integration: READY TO TEST**

All configuration complete:
- ✅ Environment variables configured
- ✅ Database schema deployed
- ✅ Edge functions active
- ✅ Subscription plans configured
- ✅ Promo code LTD2025 active
- ✅ Production build successful

**Next Steps:**
1. Add Stripe secrets to Supabase Edge Functions
2. Configure Stripe webhook endpoint
3. Test checkout flow

Run verification: `node verify-stripe-setup.cjs`

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run verification
node verify-stripe-setup.cjs
```

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **Payments**: Stripe
- **Icons**: Lucide React
- **Build**: Vite

## 🔑 Key Features

### Multi-Tenancy
- Isolated organizations with custom branding
- Row-level security for data isolation
- Organization-scoped access control

### Subscription Management
- 3 pricing tiers (Starter, Professional, Enterprise)
- Monthly and yearly billing options
- 14-day free trial (no credit card required)
- Lifetime deal promo code support

### Learning Platform
- Course creation and management
- Module and lesson organization
- Video support with progress tracking
- Enrollment and analytics

### Admin Tools
- Super admin dashboard
- Organization metrics
- Subscription tracking
- Promo code management

## 💳 Subscription Plans

**Starter** - $29/month or $290/year
- 5 courses, 2 instructors, 100 learners
- Email support, Basic analytics

**Professional** - $99/month or $990/year
- 25 courses, 10 instructors, 500 learners
- Priority support, Advanced analytics, Custom branding

**Enterprise** - $499/month or $5,490/year
- Unlimited courses/instructors, 2000 learners
- Dedicated support, Custom domain, API access

**Lifetime Deal** - Use code: LTD2025
- 30 courses, 15 instructors, 1000 learners
- 150 redemptions available

## 🧪 Testing

### Test Cards
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`

### Test Account
- Super Admin: `kale@lighthousechatbots.com`
- Create additional test accounts as needed

## 📊 Database

Tables:
- `organizations` - Tenant organizations
- `subscription_plans` - Pricing tiers
- `subscriptions` - Active subscriptions
- `promo_codes` - Promotional offers
- `profiles` - User profiles
- `courses` - Course catalog
- `modules` - Course modules
- `lessons` - Course lessons
- `enrollments` - Student enrollments

## 🔗 Important URLs

### Local Development
- App: http://localhost:5173
- Pricing: http://localhost:5173/pricing
- Super Admin: http://localhost:5173/super-admin

### Production Services
- Supabase: https://supabase.com/dashboard/project/lmnpzfafwslxeqmdrucx
- Stripe: https://dashboard.stripe.com/test/dashboard

## 🤝 Support

For issues or questions, review the documentation files listed above.
