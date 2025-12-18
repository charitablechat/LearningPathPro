import { useState, FormEvent } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';
import { navigateTo } from '../lib/router';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { supabase } from '../lib/supabase';
import { Mail, MessageSquare, HelpCircle, Send } from 'lucide-react';

export function ContactPage() {
  const { user, profile } = useAuth();
  const { organization } = useOrganization();
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          organization_id: organization?.id || null,
          user_id: user?.id || null,
          subject: subject.trim(),
          message: message.trim(),
          category,
          priority,
          user_email: email.trim(),
          user_name: name.trim(),
          status: 'open'
        });

      if (ticketError) throw ticketError;

      setSubmitted(true);
      setSubject('');
      setMessage('');
      setCategory('general');
      setPriority('normal');

      setTimeout(() => {
        if (user) {
          navigateTo('/support-tickets');
        } else {
          setSubmitted(false);
        }
      }, 3000);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to submit your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <a href="/pricing" onClick={(e) => { e.preventDefault(); navigateTo('/pricing'); }} className="text-slate-300 hover:text-white transition-colors">
              Pricing
            </a>
            <Button href="/login">Sign In</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-8">
          <BackButton to="/" className="text-slate-300 hover:text-white" />
        </div>
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4 mx-auto">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Email Us</h3>
            <p className="text-slate-400 mb-4">
              Our support team is here to help
            </p>
            <a href="mailto:support@clearcoursestudio.com" className="text-blue-400 hover:text-blue-300 transition-colors">
              support@clearcoursestudio.com
            </a>
          </Card>

          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4 mx-auto">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Live Chat</h3>
            <p className="text-slate-400 mb-4">
              Chat with our team during business hours
            </p>
            <p className="text-slate-300">
              Monday - Friday, 9am - 6pm EST
            </p>
          </Card>

          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-4 mx-auto">
              <HelpCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Help Center</h3>
            <p className="text-slate-400 mb-4">
              Find answers to common questions
            </p>
            <a href="/faq" onClick={(e) => { e.preventDefault(); navigateTo('/faq'); }} className="text-green-400 hover:text-green-300 transition-colors">
              Visit FAQ
            </a>
          </Card>
        </div>

        <Card className="p-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Send Us a Message</h2>
          <p className="text-slate-400 text-center mb-8">
            Fill out the form below and we'll get back to you within 24 hours
          </p>

          {submitted && (
            <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
              <p className="text-green-400 text-center">
                {user
                  ? 'Thank you! Your support ticket has been created. Redirecting to your tickets...'
                  : 'Thank you for your message! We\'ll get back to you soon.'}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  disabled={!!profile}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  disabled={!!profile}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature_request">Feature Request</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                Subject
              </label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder="Tell us more about your inquiry..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </span>
              )}
            </Button>
          </form>
        </Card>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Prefer to talk directly?</h3>
          <p className="text-slate-400 mb-6">
            Schedule a demo with our team to see how Clear Course Studio can work for you
          </p>
          <Button size="lg" variant="outline" href="/signup">
            Schedule a Demo
          </Button>
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
