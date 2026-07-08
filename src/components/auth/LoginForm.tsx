import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { setCredentials } from '../../store/authSlice';
import api from '../../services/api';

interface LoginFormProps {
  role: 'USER' | 'AGENT';
  onToggleMode: () => void;
}

export default function LoginForm({ role, onToggleMode }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      const { token, ...user } = response.data;
      dispatch(setCredentials({ user, token }));
      
      // Redirect based on role
      if (user.role === 'USER') navigate('/dashboard');
      else if (user.role === 'AGENT') navigate('/agent-portal');
      else navigate('/admin');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back!</h2>
      <p className="text-sm text-gray-500 mb-6">Login to continue your journey with us</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={<Mail size={18} />} 
        />
        
        <div className="relative">
          <Input 
            label="Password" 
            type={showPassword ? 'text' : 'password'} 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock size={18} />} 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex justify-end -mt-2 mb-4">
          <Link to="/forgot-password" className="text-sm text-blue-600 font-semibold hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          Log In
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or continue with</span>
        </div>
      </div>

      <Button variant="outline" fullWidth icon={
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
      }>
        Continue with Google
      </Button>

      <div className="mt-8 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button onClick={onToggleMode} className="text-blue-600 font-semibold hover:underline">
          Sign Up
        </button>
      </div>
    </div>
  );
}
