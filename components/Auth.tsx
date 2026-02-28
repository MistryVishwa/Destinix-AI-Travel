
import React, { useState } from 'react';
import { register, login, forgotPassword } from '../services/authService';
import { User } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  onCancel: () => void;
}

type Mode = 'signin' | 'signup' | 'forgot';

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onCancel }) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name || !email || !password) throw new Error('Please fill all fields');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        const user = await register(name, email, password);
        onAuthSuccess(user);
      } else if (mode === 'signin') {
        if (!email || !password) throw new Error('Please fill all fields');
        const user = await login(email, password);
        onAuthSuccess(user);
      } else {
        if (!email) throw new Error('Please enter your email');
        await forgotPassword(email);
        setMessage('Reset link sent! Check your inbox.');
        setTimeout(() => setMode('signin'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      <div className="relative w-full max-w-md bg-gray-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-[scaleUp_0.3s_ease-out]">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-white">
              {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Join Destinix' : 'Reset Password'}
            </h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] py-4 rounded-xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-500 text-sm">
            {mode === 'signin' ? (
              <p>Don't have an account? <button onClick={() => setMode('signup')} className="text-indigo-400 font-bold hover:underline">Sign Up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setMode('signin')} className="text-indigo-400 font-bold hover:underline">Sign In</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
