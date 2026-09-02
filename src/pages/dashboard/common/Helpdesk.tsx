import React, { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, X, Send, ChevronDown, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../../components/common/Loader';

interface TicketMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    roles: string[];
  } | string;
  message: string;
  timestamp: string;
}

interface Ticket {
  _id: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function Helpdesk() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.custom-dropdown')) {
        setShowPriorityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/tickets/my');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/tickets', { subject, description, priority });
      if (res.data.success) {
        toast.success('Ticket created successfully');
        setIsModalOpen(false);
        setSubject('');
        setDescription('');
        setPriority('Medium');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await api.post(`/api/tickets/${selectedTicket._id}/reply`, { message: replyMessage });
      if (res.data.success) {
        toast.success('Reply sent');
        setReplyMessage('');
        // Re-fetch only the selected ticket to update messages
        const updatedRes = await api.get(`/api/tickets/${selectedTicket._id}`);
        setSelectedTicket(updatedRes.data.data);
        fetchTickets();
        // Scroll to bottom
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-orange-500';
      case 'Low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* Left Column - Ticket List */}
      <div className={`w-full ${selectedTicket ? 'hidden md:flex' : 'flex'} md:w-1/3 flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-600" /> Support Tickets
          </h2>
          <div className="flex gap-2 items-center">
            <button 
              onClick={fetchTickets}
              className="p-1.5 text-gray-500 hover:bg-gray-200 hover:text-blue-600 rounded-full transition-colors"
              title="Refresh Tickets"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              title="Create New Ticket"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
              <p>No support tickets found.</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <div 
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${selectedTicket?._id === ticket._id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800 truncate pr-2">{ticket.subject}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{ticket.description}</p>
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <AlertCircle size={12} className={getPriorityColor(ticket.priority)} /> {ticket.priority}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {new Date(ticket.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column - Ticket Details & Chat */}
      {selectedTicket ? (
        <div className="w-full md:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden relative">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">{selectedTicket.subject}</h2>
            </div>
            <button 
              onClick={() => setSelectedTicket(null)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30 flex flex-col gap-4">
            {/* Initial Request as first message */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] shadow-sm">
                <div className="text-xs text-blue-200 mb-1">You - Initial Request</div>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </div>

            {selectedTicket.messages.map((msg, index) => {
              const senderRoles = typeof msg.sender !== 'string' ? (msg.sender.roles || []) : [];
              const isMyMsg = !(senderRoles.includes('SUPER_ADMIN') || senderRoles.includes('SUB_ADMIN'));
              return (
                <div key={index} className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${isMyMsg ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'} rounded-2xl px-4 py-3 max-w-[80%] shadow-sm`}>
                    <div className={`text-xs mb-1 ${isMyMsg ? 'text-blue-200' : 'text-gray-500'}`}>
                      {isMyMsg ? 'You' : (typeof msg.sender !== 'string' ? msg.sender.name : 'Support Team')} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Reply Box */}
          {selectedTicket.status !== 'Closed' && selectedTicket.status !== 'Resolved' && (
            <div className="p-4 border-t border-gray-100 bg-white">
              <form onSubmit={handleReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                <button 
                  type="submit"
                  disabled={!replyMessage.trim() || sendingReply}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition min-w-[100px] justify-center"
                >
                  {sendingReply ? (
                    <><Loader2 size={18} className="animate-spin" /> <span className="hidden sm:inline">Sending...</span></>
                  ) : (
                    <><Send size={18} /> <span className="hidden sm:inline">Send</span></>
                  )}
                </button>
              </form>
            </div>
          )}

          {(selectedTicket.status === 'Closed' || selectedTicket.status === 'Resolved') && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-sm text-gray-500">
              This ticket is marked as {selectedTicket.status}. You cannot reply to it.
            </div>
          )}
        </div>
      ) : (
        <div className="hidden md:flex w-2/3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 items-center justify-center text-gray-400 flex-col">
          <MessageSquare size={48} className="mb-4 opacity-20" />
          <p>Select a ticket to view details</p>
        </div>
      )}

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800">Create New Support Ticket</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Flight booking failed but amount deducted"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <div className="relative custom-dropdown">
                  <div 
                    className="flex items-center justify-between w-full px-4 py-2 border border-gray-200 rounded-lg cursor-pointer bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  >
                    <span>{priority === 'High' ? 'High - Urgent' : priority}</span>
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                  {showPriorityDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="px-4 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => { setPriority('Low'); setShowPriorityDropdown(false); }}>Low</div>
                      <div className="px-4 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => { setPriority('Medium'); setShowPriorityDropdown(false); }}>Medium</div>
                      <div className="px-4 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => { setPriority('High'); setShowPriorityDropdown(false); }}>High - Urgent</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!subject || !description}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
