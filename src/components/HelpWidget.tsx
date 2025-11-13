import { useState } from 'react';
import { HelpCircle, X, BookOpen, MessageSquare, Video, FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { navigateTo } from '../lib/router';
import { Button } from './Button';
import { Card } from './Card';

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useAuth();

  const helpLinks = [
    {
      icon: BookOpen,
      title: 'Help Center',
      description: 'Browse articles and guides',
      path: '/help',
      color: 'text-blue-400'
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      path: '/tutorials',
      color: 'text-purple-400'
    },
    {
      icon: FileText,
      title: 'Getting Started',
      description: 'New to the platform?',
      path: '/getting-started',
      color: 'text-green-400'
    },
    {
      icon: MessageSquare,
      title: 'Contact Support',
      description: 'Get help from our team',
      path: '/contact',
      color: 'text-orange-400'
    }
  ];

  const roleSpecificHelp = [
    {
      role: 'admin',
      icon: FileText,
      title: 'Admin Guide',
      description: 'Learn to manage your organization',
      path: '/admin-guide',
      color: 'text-cyan-400'
    },
    {
      role: 'instructor',
      icon: BookOpen,
      title: 'Course Creation Guide',
      description: 'Build engaging courses',
      path: '/help?topic=course-creation',
      color: 'text-yellow-400'
    },
    {
      role: 'learner',
      icon: BookOpen,
      title: 'Learner Guide',
      description: 'Get the most from your courses',
      path: '/help?topic=learner',
      color: 'text-pink-400'
    }
  ];

  const roleHelp = roleSpecificHelp.find(h => h.role === profile?.role);

  const handleLinkClick = (path: string) => {
    navigateTo(path);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="Help"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <HelpCircle className="w-6 h-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <Card className="shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">How can we help?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Find answers and learn how to use the platform
              </p>

              <div className="space-y-3">
                {roleHelp && (
                  <button
                    onClick={() => handleLinkClick(roleHelp.path)}
                    className="w-full p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 hover:border-blue-500/60 rounded-lg transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <roleHelp.icon className={`w-5 h-5 ${roleHelp.color} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">
                          {roleHelp.title}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {roleHelp.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {helpLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleLinkClick(link.path)}
                    className="w-full p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <link.icon className={`w-5 h-5 ${link.color} flex-shrink-0`} />
                      <div>
                        <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">
                          {link.title}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-gray-400 text-xs mb-3">Quick Links</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleLinkClick('/faq')}
                    className="text-xs px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white rounded-full transition-colors"
                  >
                    FAQ
                  </button>
                  <button
                    onClick={() => handleLinkClick('/support-tickets')}
                    className="text-xs px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white rounded-full transition-colors"
                  >
                    My Tickets
                  </button>
                  <a
                    href="mailto:support@clearcoursestudio.com"
                    className="text-xs px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white rounded-full transition-colors inline-flex items-center gap-1"
                  >
                    Email Us
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/20"
        />
      )}
    </>
  );
}
