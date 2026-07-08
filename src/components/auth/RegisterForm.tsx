import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../services/api';

interface RegisterFormProps {
  role: 'USER' | 'AGENT';
  onToggleMode: () => void;
}

export default function RegisterForm({ role, onToggleMode }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);

    try {
      const payload = {
        name: role === 'USER' ? `${firstName} ${lastName}` : contactPerson,
        companyName: role === 'AGENT' ? agencyName : undefined,
        email,
        phone,
        password,
        role
      };

      await api.post('/api/auth/register', payload);
      
      if (role === 'AGENT') {
        setSuccessMsg('Your agent account has been created and is pending admin approval. Redirecting...');
      } else {
        setSuccessMsg('Account created successfully! Redirecting to login...');
      }
      
      // Reset form fields
      setFirstName('');
      setLastName('');
      setAgencyName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        onToggleMode();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-left-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
      <p className="text-sm text-gray-500 mb-6">Sign up and start your adventure</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {role === 'USER' ? (
          <div className="flex gap-4">
            <Input 
              label="First Name" 
              placeholder="First name" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              icon={<User size={18} />} 
            />
            <Input 
              label="Last Name" 
              placeholder="Last name" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              icon={<User size={18} />} 
            />
          </div>
        ) : (
          <div className="flex gap-4">
            <Input 
              label="Agency Name" 
              placeholder="Agency name" 
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              required
              icon={<User size={18} />} 
            />
            <Input 
              label="Contact Person" 
              placeholder="Contact name" 
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
              icon={<User size={18} />} 
            />
          </div>
        )}

        <Input 
          label="Email Address" 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={<Mail size={18} />} 
        />
        
        <div className="flex gap-2 w-full mb-4">
          <div className="w-1/3 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Code</label>
            <div className="h-[46px] flex items-center bg-white border border-gray-300 rounded-lg px-3 text-sm text-gray-900">
              🇮🇳 +91
            </div>
          </div>
          <div className="w-2/3">
            <Input 
              label="Phone Number" 
              type="tel" 
              placeholder="Enter your phone number" 
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

      <Button variant="outline" fullWidth icon={
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
