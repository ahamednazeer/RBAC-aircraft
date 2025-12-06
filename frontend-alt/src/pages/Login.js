import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Airplane, Lock, User } from '@phosphor-icons/react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1762803307972-32b46df28a4b)',
      }}
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className="scanlines" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-slate-900/90 border border-slate-700 rounded-sm p-8 backdrop-blur-md">
          <div className="flex flex-col items-center mb-8">
            <Airplane size={48} weight="duotone" className="text-blue-400 mb-4" />
            <h1 className="text-3xl font-chivo font-bold uppercase tracking-wider text-center">
              Flight Mission Hub
            </h1>
            <p className="text-slate-400 text-sm mt-2">Aviation Base Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2 font-mono">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm placeholder:text-slate-600 font-mono text-sm pl-10 pr-3 py-2.5 border outline-none"
                  placeholder="user@airbase.mil"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2 font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm placeholder:text-slate-600 font-mono text-sm pl-10 pr-3 py-2.5 border outline-none"
                  placeholder="••••••••"
                  data-testid="password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-medium tracking-wide uppercase text-sm px-4 py-3 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="login-submit-btn"
            >
              {loading ? 'Authenticating...' : 'Access System'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-950/50 border border-slate-800 rounded-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-mono">Demo Accounts:</p>
            <div className="space-y-1 text-xs font-mono text-slate-400">
              <div>Admin: admin@airbase.mil / admin123</div>
              <div>Pilot: pilot@airbase.mil / pilot123</div>
              <div>Technician: tech@airbase.mil / tech123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;