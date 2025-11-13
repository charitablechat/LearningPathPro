import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { navigateTo } from '../lib/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, Clock, CheckCircle, AlertCircle, Send, ArrowLeft } from 'lucide-react';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
}

interface TicketResponse {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
}

export function SupportTicketsPage() {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      loadResponses(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedTicket || !user || !newResponse.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: newResponse.trim()
        });

      if (error) throw error;

      setNewResponse('');
      await loadResponses(selectedTicket.id);
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'closed': return <CheckCircle className="w-5 h-5 text-gray-400" />;
      default: return <MessageSquare className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'in_progress': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'resolved': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'closed': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'high': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'normal': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'low': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  if (selectedTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/CLEAR COURSE STUDIO.png" alt="Clear Course Studio" className="h-10" />
              <span className="text-xl font-bold text-white">Clear Course Studio</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
              Back to Tickets
            </Button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Tickets
            </Button>
          </div>

          <Card className="p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full border ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority} priority
                  </span>
                  <span className="text-xs text-gray-400">
                    {selectedTicket.category}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {selectedTicket.subject}
                </h1>
                <p className="text-sm text-gray-400">
                  Created {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </div>
              {getStatusIcon(selectedTicket.status)}
            </div>

            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-gray-300 whitespace-pre-wrap">
                {selectedTicket.message}
              </p>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-xl font-bold text-white mb-6">Conversation</h2>

            <div className="space-y-4 mb-6">
              {responses.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No responses yet. Our team will respond soon!</p>
                </div>
              ) : (
                responses.map((response) => (
                  <div
                    key={response.id}
                    className={`p-4 rounded-lg ${
                      response.user_id === user?.id
                        ? 'bg-blue-600/20 border border-blue-600/30 ml-8'
                        : 'bg-slate-800 mr-8'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-white">
                        {response.user_id === user?.id ? 'You' : 'Support Team'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(response.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{response.message}</p>
                  </div>
                ))
              )}
            </div>

            {selectedTicket.status !== 'closed' && (
              <div className="border-t border-gray-700 pt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Add a response
                </label>
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                />
                <div className="flex justify-end mt-3">
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={submitting || !newResponse.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Sending...' : 'Send Response'}
                  </Button>
                </div>
              </div>
            )}

            {selectedTicket.status === 'closed' && (
              <div className="border-t border-gray-700 pt-6">
                <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                  <p className="text-gray-400">
                    This ticket has been closed. If you need further assistance, please create a new ticket.
                  </p>
                </div>
              </div>
            )}
          </Card>
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
            <Button href="/contact">Create New Ticket</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            My Support Tickets
          </h1>
          <p className="text-xl text-slate-400">
            Track and manage your support requests
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Support Tickets</h2>
            <p className="text-gray-400 mb-6">
              You haven't created any support tickets yet
            </p>
            <Button href="/contact">Create Your First Ticket</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="p-6 hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(ticket.status)}
                      <h3 className="text-lg font-semibold text-white">
                        {ticket.subject}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {ticket.message}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {ticket.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        Created {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Check our help resources before creating a ticket
            </p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" fullWidth href="/help">
                Browse Help Center
              </Button>
              <Button variant="outline" size="sm" fullWidth href="/faq">
                View FAQ
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Response Times</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Normal Priority:</span>
                <span className="text-white">24-48 hours</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>High Priority:</span>
                <span className="text-white">12-24 hours</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Urgent:</span>
                <span className="text-white">Within 4 hours</span>
              </div>
            </div>
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
