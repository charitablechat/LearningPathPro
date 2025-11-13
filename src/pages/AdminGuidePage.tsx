import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { navigateTo } from '../lib/router';
import { BookOpen, Users, Settings, BarChart, CreditCard, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  icon: typeof BookOpen;
  content: string;
  subsections?: { title: string; content: string }[];
}

export function AdminGuidePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');

  const sections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started as an Admin',
      icon: BookOpen,
      content: `
As an administrator of Clear Course Studio, you have full control over your organization's learning platform. This guide will help you understand your responsibilities and capabilities.

**Your Key Responsibilities:**
- Managing users and assigning roles
- Overseeing course creation and quality
- Monitoring platform usage and analytics
- Managing subscription and billing
- Configuring organization settings
      `,
      subsections: [
        {
          title: 'First Steps',
          content: 'Complete your organization profile, invite your first team members, and create your initial course structure.'
        },
        {
          title: 'Best Practices',
          content: 'Start with a clear organizational structure, define role assignments carefully, and establish content creation guidelines.'
        }
      ]
    },
    {
      id: 'user-management',
      title: 'Managing Users and Roles',
      icon: Users,
      content: `
**Understanding User Roles:**

**Learner Role**
- Access enrolled courses only
- Track their own progress
- No administrative capabilities
- Best for: Students, trainees, team members consuming content

**Instructor Role**
- All learner capabilities
- Create and manage courses
- View course analytics
- Cannot access organization settings
- Best for: Content creators, subject matter experts, trainers

**Admin Role**
- Full platform access
- Manage all users and roles
- Access organization settings
- View all analytics and reports
- Manage billing and subscription
- Best for: Platform managers, training directors, HR admins

**Inviting Users:**
1. Navigate to Users section in dashboard
2. Click "Invite User" button
3. Enter email address and select role
4. User receives invitation email
5. They create account and join your organization

**Changing User Roles:**
You can change roles at any time. Changes take effect immediately and the user may need to refresh their browser.

**Removing Users:**
When you remove a user, their enrollment data is preserved but they lose access to the platform.
      `
    },
    {
      id: 'course-management',
      title: 'Course Management',
      icon: BookOpen,
      content: `
**Creating Quality Courses:**

**Planning Phase:**
- Define clear learning objectives
- Identify your target audience
- Outline course structure (modules and lessons)
- Gather all learning materials

**Building Phase:**
- Create course with descriptive title and overview
- Organize content into logical modules
- Add lessons with varied content types (video, text, documents)
- Set appropriate durations for each lesson

**Publishing Phase:**
- Review all content for accuracy
- Test course flow as a learner would experience it
- Set course to "Published" status
- Monitor initial engagement

**Content Best Practices:**
- Keep videos under 15 minutes for better engagement
- Use high-quality visuals and clear audio
- Provide downloadable resources
- Include knowledge checks or quizzes
- Update content regularly

**Managing Existing Courses:**
- Monitor completion rates in analytics
- Update outdated content promptly
- Respond to learner feedback
- Archive old courses instead of deleting
      `
    },
    {
      id: 'analytics',
      title: 'Analytics and Reporting',
      icon: BarChart,
      content: `
**Understanding Your Dashboard:**

**Key Metrics:**
- **Total Enrollments:** Number of active course enrollments
- **Completion Rate:** Percentage of learners who complete courses
- **Engagement Score:** Average time spent and interaction level
- **Course Performance:** Which courses are most/least successful

**Course Analytics:**
- View detailed metrics for each course
- Identify high-performing and struggling learners
- Find content that causes learner drop-off
- Track assessment scores and patterns

**User Analytics:**
- Monitor individual learner progress
- Identify users who may need support
- Track instructor productivity
- View team-wide learning trends

**Using Analytics to Improve:**
1. Review metrics weekly
2. Identify patterns in successful courses
3. Address drop-off points in content
4. Recognize and reward top performers
5. Provide additional support where needed

**Generating Reports:**
- Export data as CSV for further analysis
- Create custom date range reports
- Filter by user, course, or department
- Schedule automated reports (Enterprise plan)
      `
    },
    {
      id: 'settings',
      title: 'Organization Settings',
      icon: Settings,
      content: `
**Branding Your Platform:**

**Logo and Colors:**
- Upload your organization logo (recommended: PNG or SVG)
- Set primary and secondary brand colors
- Preview changes before applying
- Changes appear across the platform immediately

**Email Customization:**
- Customize automated email templates
- Add your branding to notifications
- Set custom email sender name
- Configure email frequency preferences

**Registration Settings:**
- **Open Registration:** Anyone can sign up (public platforms)
- **Invite Only:** Admin approval required (private organizations)
- **Domain Restriction:** Limit to specific email domains (@yourcompany.com)
- **Default Role:** Auto-assign role to new users

**Notification Preferences:**
Configure when and how users receive notifications:
- Course updates and new content
- Enrollment confirmations
- Progress milestones and achievements
- Administrative messages
- Billing and subscription updates

**Security Settings:**
- Password requirements
- Session timeout duration
- Two-factor authentication (Enterprise)
- SSO configuration (Enterprise)

**Data Management:**
- Export all organization data
- Configure data retention policies
- Manage GDPR compliance tools
- Handle data deletion requests
      `
    },
    {
      id: 'subscription',
      title: 'Subscription and Billing',
      icon: CreditCard,
      content: `
**Managing Your Subscription:**

**Understanding Your Plan:**
- Review current plan limits (courses, users, storage)
- Check usage against limits
- Plan for growth and potential upgrades
- Access billing history and invoices

**Plan Tiers:**

**Starter** - $29/month or $290/year
- 5 courses maximum
- 2 instructors, 100 learners
- 10GB storage
- Email support
- Basic analytics

**Professional** - $99/month or $990/year
- 25 courses
- 10 instructors, 500 learners
- 100GB storage
- Priority support, advanced analytics
- Custom branding

**Enterprise** - $499/month or $5,490/year
- Unlimited courses and instructors
- 2000 learners
- 500GB storage
- Dedicated support, custom domain
- API access, SSO

**Upgrading Your Plan:**
1. Navigate to Settings > Subscription
2. Review plan comparison
3. Select desired plan
4. Confirm billing details
5. Upgrade is immediate with prorated billing

**Payment Management:**
- Update payment method anytime
- Download past invoices
- View next billing date
- Cancel subscription (access continues until period ends)

**Usage Monitoring:**
- Track user count against limit
- Monitor storage usage
- Review API calls (Enterprise)
- Plan for upcoming needs

**Billing Support:**
For billing questions or issues, contact our billing team at billing@clearcoursestudio.com or create a support ticket with "Billing" category.
      `
    },
    {
      id: 'best-practices',
      title: 'Admin Best Practices',
      icon: Shield,
      content: `
**Success Tips for Administrators:**

**User Management:**
- Grant minimum necessary permissions
- Regularly audit user roles and access
- Remove inactive users promptly
- Document role assignment criteria
- Maintain clear communication about expectations

**Content Quality:**
- Establish content creation guidelines
- Review courses before publishing
- Encourage instructor collaboration
- Maintain content freshness
- Gather and act on learner feedback

**Engagement:**
- Monitor completion rates regularly
- Celebrate learner achievements
- Address low engagement quickly
- Foster community through announcements
- Provide clear learning paths

**Security:**
- Use strong passwords and 2FA
- Review access logs periodically
- Educate users on security practices
- Keep contact information current
- Respond quickly to security concerns

**Growth Planning:**
- Review analytics monthly
- Plan for scaling (users, courses, storage)
- Budget for plan upgrades in advance
- Document processes for new admins
- Create backup admin accounts

**Communication:**
- Keep users informed of platform changes
- Provide clear course descriptions
- Set expectations for support response times
- Gather feedback regularly
- Maintain help documentation

**Compliance:**
- Understand data privacy requirements
- Maintain GDPR compliance (if applicable)
- Handle data requests properly
- Keep terms of service accessible
- Document data handling procedures
      `
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/CLEAR COURSE STUDIO.png" alt="Clear Course Studio" className="h-10" />
            <span className="text-xl font-bold text-white">Clear Course Studio</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/dashboard" onClick={(e) => { e.preventDefault(); navigateTo('/dashboard'); }} className="text-slate-300 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="/help" onClick={(e) => { e.preventDefault(); navigateTo('/help'); }} className="text-slate-300 hover:text-white transition-colors">
              Help Center
            </a>
            <Button href="/contact">Get Support</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Administrator Guide
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Complete guide for managing your organization on Clear Course Studio
          </p>
        </div>

        <div className="mb-8">
          <Card className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Admin Responsibilities</h3>
                <p className="text-gray-300 text-sm">
                  As an administrator, you're responsible for the success of your organization's learning platform.
                  This guide covers everything you need to know to excel in this role.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-700/30 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <section.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                </div>
                {expandedSection === section.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSection === section.id && (
                <div className="px-6 pb-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </div>

                  {section.subsections && section.subsections.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {section.subsections.map((subsection, index) => (
                        <div key={index} className="pl-4 border-l-2 border-blue-600/30">
                          <h3 className="text-lg font-semibold text-white mb-2">{subsection.title}</h3>
                          <p className="text-gray-300 text-sm">{subsection.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" size="sm" fullWidth href="/dashboard">
                Go to Dashboard
              </Button>
              <Button variant="outline" size="sm" fullWidth href="/settings">
                Organization Settings
              </Button>
              <Button variant="outline" size="sm" fullWidth href="/help">
                Browse Help Center
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Still have questions? Our support team is here to assist you.
            </p>
            <Button fullWidth href="/contact">
              Contact Support
            </Button>
          </Card>
        </div>
      </div>

      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} Clear Course Studio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
