import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { navigateTo } from '../lib/router';
import { Play, Clock, CheckCircle, BookOpen, Users, BarChart, Settings, Video } from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  videoUrl?: string;
}

export function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  const categories = [
    { id: 'all', name: 'All Tutorials', icon: Video },
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen },
    { id: 'course-creation', name: 'Course Creation', icon: BookOpen },
    { id: 'user-management', name: 'User Management', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart },
    { id: 'settings', name: 'Settings & Admin', icon: Settings }
  ];

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Platform Overview - Getting Started',
      description: 'A comprehensive introduction to Clear Course Studio. Learn about the dashboard, navigation, and key features available to you.',
      duration: '5:30',
      category: 'getting-started',
      level: 'beginner',
      thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '2',
      title: 'Creating Your First Course',
      description: 'Step-by-step guide to creating your first course from scratch. Learn how to structure modules, add lessons, and publish content.',
      duration: '8:45',
      category: 'course-creation',
      level: 'beginner',
      thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '3',
      title: 'Advanced Course Builder Features',
      description: 'Master advanced features like drag-and-drop organization, bulk content upload, and course templates.',
      duration: '12:15',
      category: 'course-creation',
      level: 'advanced',
      thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '4',
      title: 'Inviting and Managing Users',
      description: 'Learn how to invite team members, assign roles, and manage user permissions across your organization.',
      duration: '6:20',
      category: 'user-management',
      level: 'beginner',
      thumbnail: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '5',
      title: 'Understanding User Roles and Permissions',
      description: 'Deep dive into learner, instructor, and admin roles. Learn best practices for organizing your team.',
      duration: '9:10',
      category: 'user-management',
      level: 'intermediate',
      thumbnail: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '6',
      title: 'Course Analytics and Reporting',
      description: 'Track learner progress, generate reports, and use analytics to improve your courses.',
      duration: '10:30',
      category: 'analytics',
      level: 'intermediate',
      thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '7',
      title: 'Organization Settings and Branding',
      description: 'Customize your organization settings, add branding, and configure notification preferences.',
      duration: '7:45',
      category: 'settings',
      level: 'beginner',
      thumbnail: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '8',
      title: 'Content Library Management',
      description: 'Learn how to use the content library to create reusable lesson templates and share resources.',
      duration: '8:00',
      category: 'course-creation',
      level: 'intermediate',
      thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '9',
      title: 'Subscription and Billing Management',
      description: 'Manage your subscription plan, understand billing, and learn about plan upgrades.',
      duration: '5:50',
      category: 'settings',
      level: 'beginner',
      thumbnail: 'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '10',
      title: 'Advanced Analytics - Data-Driven Decisions',
      description: 'Use advanced analytics features to identify trends, optimize content, and improve learner outcomes.',
      duration: '14:20',
      category: 'analytics',
      level: 'advanced',
      thumbnail: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '11',
      title: 'Video Upload and Optimization',
      description: 'Best practices for uploading videos, optimizing file sizes, and ensuring smooth playback.',
      duration: '6:40',
      category: 'course-creation',
      level: 'intermediate',
      thumbnail: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '12',
      title: 'Bulk User Import and Management',
      description: 'Import multiple users at once using CSV files and manage large teams efficiently.',
      duration: '7:15',
      category: 'user-management',
      level: 'advanced',
      thumbnail: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  const filteredTutorials = selectedCategory === 'all'
    ? tutorials
    : tutorials.filter(t => t.category === selectedCategory);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'intermediate': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'advanced': return 'bg-red-600/20 text-red-400 border-red-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  if (selectedTutorial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/CLEAR COURSE STUDIO.png" alt="Clear Course Studio" className="h-10" />
              <span className="text-xl font-bold text-white">Clear Course Studio</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedTutorial(null)}>
              Back to Tutorials
            </Button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => setSelectedTutorial(null)}>
              ← Back to All Tutorials
            </Button>
          </div>

          <div className="bg-slate-900 rounded-2xl overflow-hidden mb-8 aspect-video">
            <img
              src={selectedTutorial.thumbnail}
              alt={selectedTutorial.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs px-3 py-1 rounded-full border ${getLevelColor(selectedTutorial.level)}`}>
                    {selectedTutorial.level}
                  </span>
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedTutorial.duration}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">
                  {selectedTutorial.title}
                </h1>

                <p className="text-gray-300 text-lg mb-8">
                  {selectedTutorial.description}
                </p>

                <div className="bg-slate-800 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">What you'll learn</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300">Step-by-step instructions for {selectedTutorial.title.toLowerCase()}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300">Best practices and tips from experienced users</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300">Common pitfalls to avoid</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300">Real-world examples and use cases</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Related Tutorials</h3>
                <div className="space-y-3">
                  {tutorials
                    .filter(t => t.category === selectedTutorial.category && t.id !== selectedTutorial.id)
                    .slice(0, 3)
                    .map(tutorial => (
                      <button
                        key={tutorial.id}
                        onClick={() => setSelectedTutorial(tutorial)}
                        className="w-full p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                      >
                        <p className="text-white text-sm font-medium mb-1">{tutorial.title}</p>
                        <p className="text-gray-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tutorial.duration}
                        </p>
                      </button>
                    ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Need More Help?</h3>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" fullWidth href="/help">
                    Browse Help Articles
                  </Button>
                  <Button variant="outline" size="sm" fullWidth href="/contact">
                    Contact Support
                  </Button>
                </div>
              </Card>
            </div>
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
            Video Tutorials
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Learn at your own pace with our comprehensive video library
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => (
            <Card
              key={tutorial.id}
              className="overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
              onClick={() => setSelectedTutorial(tutorial)}
            >
              <div className="relative aspect-video bg-slate-800 overflow-hidden">
                <img
                  src={tutorial.thumbnail}
                  alt={tutorial.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {tutorial.duration}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded border ${getLevelColor(tutorial.level)}`}>
                    {tutorial.level}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {tutorial.title}
                </h3>

                <p className="text-sm text-gray-400 line-clamp-2">
                  {tutorial.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {filteredTutorials.length === 0 && (
          <div className="text-center py-16">
            <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No tutorials found in this category</p>
            <Button variant="outline" onClick={() => setSelectedCategory('all')}>
              View All Tutorials
            </Button>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} Clear Course Studio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
