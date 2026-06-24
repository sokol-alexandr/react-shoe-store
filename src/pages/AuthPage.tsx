import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Role } from '../types';
import { toast } from 'react-hot-toast/headless';

export function AuthPage() {
  const navigate = useNavigate();
  
  // View toggle: false = Sign In / Login mode, true = Sign Up / Register mode
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form controlled inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('CUSTOMER');
  
  // API processing state tracking
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        // --- REGISTER ACCOUNT IN SUPABASE ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || 'Anonymous Client',
              role: role, 
            },
          },
        });

        if (error) throw error;
        
        if (data.user) {
          toast.success('Registration complete! Welcome to the store.');
          navigate('/');
        }
      } else {
        // --- LOGIN EXISTENT USER IN SUPABASE ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        navigate('/');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border border-gray-200 rounded-xl shadow-sm bg-white mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>
      
      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-200 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I want to register as:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="CUSTOMER">Client (Customer)</option>
              <option value="EMPLOYEE">Store Manager (Admin)</option>
            </select>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-md text-sm transition-colors shadow-sm mt-2"
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 border-t border-gray-100 pt-4 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMessage(null);
          }}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium focus:outline-none"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}