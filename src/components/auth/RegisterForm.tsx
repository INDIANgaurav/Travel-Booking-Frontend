import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../services/api';
import { auth } from '../../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export default function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);

    try {
      const payload = {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        password,
        role: 'USER'
      };

      const response = await api.post('/api/auth/register', payload);
      
      setUserId(response.data._id);
      toast.success('Account created! A welcome OTP has been sent to your email.');
      setStep(2);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp || otp.length !== 6) {
      return setError('Please enter a valid 6-digit OTP');
    }

    setIsLoading(true);
    try {
      // Verify OTP and complete registration
      const response = await api.post('/api/auth/verify-registration', { userId, otp });
      
      // Store token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      toast.success('Registration successful! Logging you in...');
      
      // Dispatch storage event to trigger auth sync across app
      window.dispatchEvent(new Event('storage'));
      
      // Wait a moment then reload or redirect to update UI state completely
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const response = await api.post('/api/auth/google', { token: idToken, role: 'USER' });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      toast.success('Account created successfully! Logging you in...');

      window.dispatchEvent(new Event('storage'));
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="animate-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setStep(1)} 
          className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Verify Email</h2>
        <p className="text-sm text-gray-500 mb-6">
          We've sent a 6-digit code to <span className="font-semibold text-gray-800">{email}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              id="otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center tracking-[0.5em] font-bold text-2xl transition-all"
              placeholder="------"
            />
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            Verify & Create Account
          </Button>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            Didn't receive the code? Check your spam folder.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-left-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
      <p className="text-sm text-gray-500 mb-6">
        Sign up and start your adventure
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleRegisterSubmit} className="space-y-3">
        

          <div className="flex gap-4">
            <Input 
              label="First Name" 
              placeholder="First name" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input 
              label="Last Name" 
              placeholder="Last name" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

        <Input 
          label="Email Address" 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={<Mail size={18} />} 
        />
        
        <div className="flex gap-4 w-full mb-4">
          <div className="w-[120px] flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Code</label>
            <div className="h-[46px] flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 font-medium">
              🇮🇳 +91
            </div>
          </div>
          <div className="flex-1">
            <Input 
              label="Phone Number" 
              type="tel" 
              placeholder="Enter phone number" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Input 
              label="Password" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Create a password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<Lock size={18} />} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative flex-1">
            <Input 
              label="Confirm Password" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Confirm your password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              icon={<Lock size={18} />} 
            />
          </div>
        </div>

        <div className="flex items-center gap-2 my-4">
          <input type="checkbox" id="terms" className="rounded text-blue-600 focus:ring-blue-500" required />
          <label htmlFor="terms" className="text-xs text-gray-600">
            I agree to the <a href="#" className="text-blue-600 font-semibold hover:underline">Terms & Conditions</a> and <a href="#" className="text-blue-600 font-semibold hover:underline">Privacy Policy</a>
          </label>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          Sign Up
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or continue with</span>
        </div>
      </div>

      <Button variant="outline" fullWidth type="button" onClick={handleGoogleSignIn} disabled={isLoading} icon={
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
      }>
        Continue with Google
      </Button>

      <div className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button onClick={onToggleMode} className="text-blue-600 font-semibold hover:underline">
          Log In
        </button>
      </div>
    </div>
  );
}
