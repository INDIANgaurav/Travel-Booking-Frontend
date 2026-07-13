import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [resetLink, setResetLink] = useState(''); // Only for local dev simulation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setIsSent(true);
      
      // In a real app, this link would be sent via email. 
      // For this demo, we're extracting it from the response to show the user.
      if (response.data.data) {
        setResetLink(response.data.data);
      }
      
      toast.success('Password reset link generated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <KeyRound size={32} className="text-blue-600" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          {isSent ? (
            <div className="text-center space-y-6">
              <div className="bg-green-50 text-green-800 p-4 rounded-md text-sm border border-green-100">
                Reset instructions have been generated for <strong>{email}</strong>.
              </div>
              
              {/* Local Dev specific: Showing the link directly */}
              {resetLink && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-left">
                  <p className="text-xs text-blue-600 font-bold uppercase mb-2">Local Dev Mode Only:</p>
                  <p className="text-sm text-gray-700 mb-3">Since we don't have an email server configured, here is your reset link:</p>
                  <a href={resetLink} className="text-blue-600 hover:underline break-all text-sm font-medium">
                    {resetLink}
                  </a>
                </div>
              )}

              <Link to="/?login=true" className="flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500">
                <ArrowLeft size={16} className="mr-1" /> Back to log in
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
                >
                  {isLoading ? 'Processing...' : 'Reset password'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <Link to="/?login=true" className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900">
                  <ArrowLeft size={16} className="mr-1" /> Back to log in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
