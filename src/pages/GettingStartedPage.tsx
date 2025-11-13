import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { navigateTo } from '../lib/router';
import { CheckCircle, Circle, BookOpen, Users, Settings, Video, Play, ChevronRight } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  icon: typeof BookOpen;
}

export function GettingStartedPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: 'Complete your profile',
      description: 'Add your name and organization details',
      completed: false,
      icon: Users
    },
    {
      id: 2,
      title: 'Create your first course',
      description: 'Build engaging learning content',
      completed: false,
      icon: BookOpen
    },
    {
      id: 3,
      title: 'Invite team members',
      description: 'Add instructors and learners',
      completed: false,
      icon: Users
    },
    {
      id: 4,
      title: 'Customize settings',
      description: 'Set up branding and preferences',
      completed: false,
      icon: Settings
    }
  ]);

  const toggleStep = (id: number) => {
    setSteps(steps.map(step =>
      step.id === id ? { ...step, completed: !step.completed } : step
    ));
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  const guides = [
    {
      title: 'Platform Overview',
      duration: '5 min',
      description: 'Get familiar with the dashboard and main features',
      icon: Play,
      videoId: 'platform-overview'
    },
    {
      title: 'Creating Your First Course',
      duration: '8 min',
      description: 'Step-by-step guide to building a course',
      icon: Play,
      videoId: 'first-course'
    },
    {
      title: 'Managing Users',
      duration: '6 min',
      description: 'Invite and manage instructors and learners',
      icon: Play,
      videoId: 'user-management'
    },
    {
      title: 'Understanding Analytics',
      duration: '7 min',
      description: 'Track engagement and measure success',
      icon: Play,
      videoId: 'analytics'
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

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to Clear Course Studio
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Let's get you started with everything you need to create amazing learning experiences
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Setup Checklist</h2>
              <span className="text-sm text-gray-400">
                {completedCount} of {steps.length} completed
              </span>
            </div>

            <div className="mb-6">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    step.completed
                      ? 'bg-green-600/10 border-green-600/30'
                      : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => toggleStep(step.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${step.completed ? 'text-green-300' : 'text-white'}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {step.description}
                      </p>
                    </div>
                    <step.icon className={`w-5 h-5 ${step.completed ? 'text-green-400' : 'text-gray-500'}`} />
                  </div>
                </div>
              ))}
            </div>

            {completedCount === steps.length && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-600/20 to-cyan-600/20 border border-green-600/30 rounded-lg">
                <p className="text-green-300 font-semibold text-center">
                  🎉 Great job! You've completed all setup steps
                </p>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30">
              <BookOpen className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Quick Start Guide</h3>
              <p className="text-gray-300 mb-6">
                Follow our comprehensive guide to get up and running in minutes
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">Set up your organization profile and branding</p>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">Create and publish your first course</p>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">Invite team members and assign roles</p>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">Track progress with analytics dashboard</p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
              <p className="text-gray-400 mb-4">
                Our support team is here to help you succeed
              </p>
              <div className="space-y-3">
                <Button variant="outline" fullWidth href="/help">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Help Center
                </Button>
                <Button variant="outline" fullWidth href="/tutorials">
                  <Video className="w-4 h-4 mr-2" />
                  Watch Video Tutorials
                </Button>
                <Button variant="outline" fullWidth href="/contact">
                  <Users className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Video Tutorials
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <Card
                key={index}
                className="p-6 hover:bg-slate-700/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <guide.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {guide.title}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-slate-700 text-gray-300 rounded">
                        {guide.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {guide.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Card className="inline-block p-8 bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30">
            <h3 className="text-2xl font-bold text-white mb-2">Ready to Dive In?</h3>
            <p className="text-gray-300 mb-6">
              Start creating your first course and share knowledge with your learners
            </p>
            <Button size="lg" href="/dashboard">
              Go to Dashboard
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
