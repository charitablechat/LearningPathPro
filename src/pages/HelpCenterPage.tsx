import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { BackButton } from '../components/BackButton';
import { navigateTo } from '../lib/router';
import { Search, BookOpen, Video, Users, Settings, CreditCard, FileText, ChevronRight, HelpCircle } from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: typeof BookOpen;
  content?: string;
}

export function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const categories = [
    { name: 'Getting Started', icon: BookOpen, color: 'text-blue-400' },
    { name: 'Course Management', icon: FileText, color: 'text-green-400' },
    { name: 'User Management', icon: Users, color: 'text-purple-400' },
    { name: 'Settings', icon: Settings, color: 'text-orange-400' },
    { name: 'Billing & Subscription', icon: CreditCard, color: 'text-cyan-400' },
    { name: 'Video Tutorials', icon: Video, color: 'text-pink-400' }
  ];

  const articles: HelpArticle[] = [
    {
      id: '1',
      title: 'How to create your first course',
      category: 'Getting Started',
      description: 'Learn how to create and publish your first course on the platform',
      icon: BookOpen,
      content: `
# How to Create Your First Course

Creating a course on Clear Course Studio is easy and intuitive. Follow these steps:

## Step 1: Navigate to Course Management
- Click on the "Courses" tab in your dashboard
- Click the "Create New Course" button

## Step 2: Enter Course Details
- Provide a descriptive title for your course
- Add a detailed description explaining what learners will gain
- Upload a thumbnail image (recommended size: 1920x1080px)

## Step 3: Add Modules
- Click "Add Module" to create course sections
- Each module can contain multiple lessons
- Organize modules in logical order

## Step 4: Create Lessons
- Add lessons to each module
- Upload videos, PDFs, or other content
- Set lesson duration and order

## Step 5: Publish Your Course
- Review all content for accuracy
- Click "Publish" to make your course available to learners
- You can unpublish and edit at any time

**Pro Tip:** Start with a course outline before adding content. This helps maintain structure and flow.
      `
    },
    {
      id: '2',
      title: 'Managing user roles and permissions',
      category: 'User Management',
      description: 'Understand different user roles and how to assign them',
      icon: Users,
      content: `
# Managing User Roles and Permissions

Clear Course Studio has three main user roles, each with specific permissions.

## User Roles

### Learner
- Can enroll in courses
- Access course content
- Track their own progress
- Cannot create or manage courses

### Instructor
- All learner permissions
- Create and edit courses
- View course analytics
- Cannot manage organization settings

### Admin
- All instructor permissions
- Manage users and roles
- Access organization settings
- View subscription and billing
- Manage organization-wide content

## How to Assign Roles

1. Navigate to the Users section in admin dashboard
2. Click on a user's profile
3. Select the appropriate role from the dropdown
4. Click "Save Changes"

**Important:** Role changes take effect immediately. Users may need to refresh their browser to see new permissions.

## Best Practices

- Grant the minimum permissions needed for each user
- Regularly review user roles and permissions
- Use the instructor role for content creators
- Reserve admin access for management team only
      `
    },
    {
      id: '3',
      title: 'Understanding your subscription plan',
      category: 'Billing & Subscription',
      description: 'Learn about plan features, limits, and how to upgrade',
      icon: CreditCard,
      content: `
# Understanding Your Subscription Plan

Clear Course Studio offers flexible subscription plans to fit organizations of all sizes.

## Plan Tiers

### Starter Plan - $29/month
- 5 courses maximum
- 2 instructors
- 100 learners
- Email support
- Basic analytics

### Professional Plan - $99/month
- 25 courses
- 10 instructors
- 500 learners
- Priority support
- Advanced analytics
- Custom branding

### Enterprise Plan - $499/month
- Unlimited courses
- Unlimited instructors
- 2000 learners
- Dedicated support
- Custom domain
- API access

## How to Upgrade

1. Go to Settings > Subscription
2. Click "Upgrade Plan"
3. Select your desired plan
4. Enter payment information
5. Confirm upgrade

**Note:** When you upgrade, you'll be charged a prorated amount for the remainder of your billing cycle. New features are available immediately.

## Managing Your Subscription

- View current plan details in Settings
- Download invoices for past payments
- Update payment method anytime
- Cancel subscription (access continues until end of billing period)

## Free Trial

New organizations get a 14-day free trial with full access to Professional plan features. No credit card required to start!
      `
    },
    {
      id: '4',
      title: 'How to upload and manage course content',
      category: 'Course Management',
      description: 'Upload videos, documents, and other learning materials',
      icon: FileText,
      content: `
# How to Upload and Manage Course Content

Clear Course Studio supports various content types for rich learning experiences.

## Supported File Types

### Videos
- MP4, MOV, WebM formats
- Maximum size: 2GB per file
- Recommended: 1080p resolution

### Documents
- PDF, DOC, DOCX, PPT, PPTX
- Maximum size: 100MB per file
- Viewable directly in browser

### Images
- JPG, PNG, GIF
- For thumbnails and visual aids

## Uploading Content

1. Open your course in edit mode
2. Navigate to the lesson where you want to add content
3. Click "Upload Content"
4. Select files from your computer
5. Wait for upload to complete (progress bar shown)
6. Content is automatically processed and available

## Content Management Tips

- **Organize First:** Plan your structure before uploading
- **Use Descriptive Names:** Make content easy to find
- **Check Quality:** Preview content before publishing
- **Update Regularly:** Keep content fresh and relevant

## Storage Limits

Storage is included in your plan:
- Starter: 10GB
- Professional: 100GB
- Enterprise: 500GB

## Video Processing

Uploaded videos are automatically:
- Transcoded for optimal playback
- Available in multiple quality levels
- Optimized for mobile and desktop viewing

**Pro Tip:** Upload content during off-peak hours for faster processing times.
      `
    },
    {
      id: '5',
      title: 'Customizing your organization settings',
      category: 'Settings',
      description: 'Personalize branding, notifications, and preferences',
      icon: Settings,
      content: `
# Customizing Your Organization Settings

Make Clear Course Studio reflect your brand and workflow preferences.

## Branding Settings

### Logo and Colors
1. Navigate to Settings > Branding
2. Upload your organization logo (PNG, SVG recommended)
3. Choose primary and secondary brand colors
4. Preview changes before saving

### Email Templates
- Customize email notifications sent to users
- Add your logo and branding
- Edit welcome messages and notifications

## Notification Preferences

Configure when and how users receive notifications:

- **Course Updates:** Notify learners of new content
- **Progress Milestones:** Celebrate completions
- **Administrative:** User invitations and role changes
- **Billing:** Payment confirmations and renewals

## User Registration

Control how users join your organization:

- **Open Registration:** Anyone can sign up
- **Invite Only:** Admin approval required
- **Email Domain Restriction:** Limit to specific domains
- **Auto-assign Role:** Default role for new users

## Data & Privacy

- Export all organization data
- Configure data retention policies
- Manage user consent and privacy settings
- GDPR compliance tools

## Integration Settings

Connect with other tools (Enterprise plan):
- Single Sign-On (SSO) configuration
- Webhook endpoints for notifications
- API key management
- Third-party integrations

**Important:** Changes to branding and notifications may take a few minutes to propagate throughout the system.
      `
    },
    {
      id: '6',
      title: 'Tracking learner progress and analytics',
      category: 'Course Management',
      description: 'View detailed analytics on course engagement and completion',
      icon: BookOpen,
      content: `
# Tracking Learner Progress and Analytics

Monitor how learners engage with your courses and identify areas for improvement.

## Course Analytics Dashboard

Access comprehensive analytics from your instructor or admin dashboard:

### Enrollment Metrics
- Total enrollments over time
- Active vs. inactive learners
- Enrollment by course

### Engagement Metrics
- Video watch time and completion rates
- Lesson completion rates
- Time spent on each lesson
- Quiz and assessment scores

### Progress Tracking
- Individual learner progress
- Average course completion time
- Drop-off points in courses
- Popular lessons and modules

## Viewing Individual Progress

1. Navigate to Course > Enrollments
2. Click on a learner's name
3. View their detailed progress:
   - Completed lessons
   - Time spent learning
   - Quiz scores
   - Last activity date

## Generating Reports

Create custom reports for analysis:

1. Go to Analytics section
2. Select report type (enrollment, completion, engagement)
3. Choose date range
4. Filter by course, module, or user group
5. Export as PDF or CSV

## Using Analytics to Improve Courses

- Identify lessons with low completion rates
- Find content that learners spend most time on
- Discover drop-off points
- Recognize top-performing learners
- Adjust course difficulty based on data

**Pro Tip:** Review analytics weekly to catch issues early and optimize content for better engagement.
      `
    }
  ];

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/CLEAR COURSE STUDIO.png" alt="Clear Course Studio" className="h-10" />
              <span className="text-xl font-bold text-white">Clear Course Studio</span>
            </div>
            <div className="flex items-center space-x-6">
              <Button variant="outline" size="sm" onClick={() => setSelectedArticle(null)}>
                Back to Help Center
              </Button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-8">
            <Button variant="outline" size="sm" onClick={() => setSelectedArticle(null)}>
              ← Back to Articles
            </Button>
          </div>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <selectedArticle.icon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">{selectedArticle.category}</p>
                <h1 className="text-3xl font-bold text-white">{selectedArticle.title}</h1>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                {selectedArticle.content}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-700">
              <p className="text-gray-400 mb-4">Was this article helpful?</p>
              <div className="flex gap-3">
                <Button size="sm" variant="outline">Yes, it helped</Button>
                <Button size="sm" variant="outline">No, need more help</Button>
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Still need help?</p>
            <Button href="/contact">Contact Support</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/CLEAR COURSE STUDIO.png" alt="Clear Course Studio" className="h-10" />
            <span className="text-xl font-bold text-white">Clear Course Studio</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }} className="text-slate-300 hover:text-white transition-colors">
              Home
            </a>
            <a href="/dashboard" onClick={(e) => { e.preventDefault(); navigateTo('/dashboard'); }} className="text-slate-300 hover:text-white transition-colors">
              Dashboard
            </a>
            <Button href="/contact">Contact Support</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-8">
          <BackButton className="text-slate-300 hover:text-white" />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Help Center
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Find answers, learn best practices, and get the most out of Clear Course Studio
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-4 text-lg"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => (
            <Card key={category.name} className="p-6 hover:bg-slate-700/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
              </div>
              <p className="text-sm text-gray-400">
                {articles.filter(a => a.category === category.name).length} articles
              </p>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">
            {searchQuery ? 'Search Results' : 'Popular Articles'}
          </h2>
          {filteredArticles.length === 0 ? (
            <Card className="p-12 text-center">
              <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No articles found matching your search</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </Card>
          ) : (
            filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="p-6 hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <article.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">{article.category}</p>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {article.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30">
            <Video className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Video Tutorials</h3>
            <p className="text-gray-300 mb-4">
              Watch step-by-step video guides to learn the platform visually
            </p>
            <Button variant="outline" href="/tutorials">
              Browse Tutorials
            </Button>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30">
            <FileText className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Getting Started Guide</h3>
            <p className="text-gray-300 mb-4">
              New to Clear Course Studio? Start here for a complete walkthrough
            </p>
            <Button variant="outline" href="/getting-started">
              Get Started
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
