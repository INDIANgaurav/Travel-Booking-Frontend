import React, { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';
import { MessageSquare, Clock, CheckCircle, AlertCircle, X, Send, User, Building, ShieldAlert, ChevronDown, RefreshCw, Loader2 } from 'lucide-react';
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

interface TicketUser {
  _id: string;
  name: string;
  email: string;
  roles: string[];
}

interface Ticket {
  _id: string;
  user: TicketUser;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminHelpdesk() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.custom-dropdown')) {
        setShowStatusDropdown(false);
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, roleFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let url = '/api/tickets';
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (roleFilter !== 'All') params.append('role', roleFilter);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await api.get(url);
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
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
        // Also refresh ticket list to update last-updated time
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

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      const res = await api.put(`/api/tickets/${selectedTicket._id}/status`, { status });
      if (res.data.success) {
        toast.success(`Ticket marked as ${status}`);
        const updatedRes = await api.get(`/api/tickets/${selectedTicket._id}`);
        setSelectedTicket(updatedRes.data.data);
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getRoleIcon = (roles: string[]) => {
    if (!roles || roles.length === 0) return <User size={14} className="text-gray-500" />;
    if (roles.includes('B2B_AGENT')) return <Building size={14} className="text-blue-500" />;
    if (roles.includes('SUPER_ADMIN') || roles.includes('SUB_ADMIN')) return <ShieldAlert size={14} className="text-purple-500" />;
    return <User size={14} className="text-gray-500" />;
  };

  const getRoleLabel = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'User';
    if (roles.includes('B2B_AGENT')) return 'B2B Agent';
    if (roles.includes('SUPER_ADMIN')) return 'Super Admin';
    if (roles.includes('SUB_ADMIN')) return 'Sub Admin';
    if (roles.includes('SUPPLIER_AGENT')) return 'Supplier';
    return 'User';
  };

  if (loading && tickets.length === 0) {
    return <Loader />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* Left Column - Ticket List */}
      <div className={`w-full ${selectedTicket ? 'hidden md:flex' : 'flex'} md:w-1/3 flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden`}>
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-600" /> Admin Helpdesk
            </h2>
            <button 
              onClick={fetchTickets}
              className="p-1.5 text-gray-500 hover:bg-gray-200 hover:text-blue-600 rounded-full transition-colors"
              title="Refresh Tickets"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            {/* Status Dropdown */}
            <div className="relative flex-1 custom-dropdown">
              <div 
                className="flex items-center justify-between text-xs px-3 py-1.5 border border-gray-200 rounded-lg cursor-pointer bg-white hover:border-blue-400"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <span>{statusFilter === 'All' ? 'All Statuses' : statusFilter}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden">
                  {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
                    <div 
                      key={status}
                      className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer"
                      onClick={() => { setStatusFilter(status); setShowStatusDropdown(false); }}
                    >
                      {status === 'All' ? 'All Statuses' : status}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Role Dropdown */}
            <div className="relative flex-1 custom-dropdown">
              <div 
                className="flex items-center justify-between text-xs px-3 py-1.5 border border-gray-200 rounded-lg cursor-pointer bg-white hover:border-blue-400"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              >
                <span>{roleFilter === 'All' ? 'All Roles' : (roleFilter === 'USER' ? 'B2C User' : 'B2B Agent')}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              {showRoleDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer" onClick={() => { setRoleFilter('All'); setShowRoleDropdown(false); }}>All Roles</div>
                  <div className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer" onClick={() => { setRoleFilter('USER'); setShowRoleDropdown(false); }}>B2C User</div>
                  <div className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer" onClick={() => { setRoleFilter('B2B_AGENT'); setShowRoleDropdown(false); }}>B2B Agent</div>
                </div>
              )}
            </div>
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
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    {getRoleIcon(ticket.user?.roles)}
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{ticket.subject}</h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 border rounded-full font-medium whitespace-nowrap ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-2 truncate">
                  By: {ticket.user?.name}
                </div>
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
          <div className="p-4 border-b border-gray-100 bg-white z-10 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 border rounded-full font-medium ${getStatusColor(selectedTicket.status)}`}>
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
            
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {selectedTicket.user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{selectedTicket.user?.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {getRoleIcon(selectedTicket.user?.roles)} {getRoleLabel(selectedTicket.user?.roles)} • {selectedTicket.user?.email}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
                  <button 
                    onClick={() => handleUpdateStatus('Resolved')}
                    className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium flex items-center gap-1"
                  >
                    <CheckCircle size={14} /> Mark Resolved
                  </button>
                )}
                {selectedTicket.status !== 'Closed' && (
                  <button 
                    onClick={() => handleUpdateStatus('Closed')}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30 flex flex-col gap-4">
            {/* Initial Request as first message */}
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm">
                <div className="text-xs text-gray-500 mb-1">{selectedTicket.user?.name} - Initial Request</div>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </div>

            {selectedTicket.messages.map((msg, index) => {
              const senderRoles = typeof msg.sender !== 'string' ? (msg.sender.roles || []) : [];
              const isAdminMsg = senderRoles.includes('SUPER_ADMIN') || senderRoles.includes('SUB_ADMIN');
              return (
                <div key={index} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${isAdminMsg ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'} rounded-2xl px-4 py-3 max-w-[80%] shadow-sm`}>
                    <div className={`text-xs mb-1 ${isAdminMsg ? 'text-blue-200' : 'text-gray-500'}`}>
                      {isAdminMsg ? 'You (Admin)' : (typeof msg.sender !== 'string' ? msg.sender.name : 'User')} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Reply Box */}
          {selectedTicket.status !== 'Closed' && (
            <div className="p-4 border-t border-gray-100 bg-white">
              <form onSubmit={handleReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here to the user..."
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                <button 
                  type="submit"
                  disabled={!replyMessage.trim() || sendingReply}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition min-w-[120px] justify-center"
                >
                  {sendingReply ? (
                    <><Loader2 size={18} className="animate-spin" /> <span className="hidden sm:inline">Sending...</span></>
                  ) : (
                    <><Send size={18} /> <span className="hidden sm:inline">Send Reply</span></>
                  )}
                </button>
              </form>
            </div>
          )}

          {selectedTicket.status === 'Closed' && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-sm text-gray-500">
              This ticket is closed. No further replies can be added.
            </div>
          )}
        </div>
      ) : (
        <div className="hidden md:flex w-2/3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 items-center justify-center text-gray-400 flex-col">
          <MessageSquare size={48} className="mb-4 opacity-20" />
          <p>Select a ticket to view details</p>
        </div>
      )}
    </div>
  );
}
