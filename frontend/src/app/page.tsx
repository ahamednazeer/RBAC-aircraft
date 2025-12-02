'use client';

import React, { useState } from 'react';
import { Plane } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(username, password);
      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        PILOT: '/dashboard/pilot',
        TECHNICIAN: '/dashboard/technician',
        COMMANDER: '/dashboard/commander',
        ADMIN: '/admin',
        TRAINEE: '/dashboard/trainee',
        EMERGENCY: '/dashboard/emergency',
        FAMILY: '/dashboard/family',
        OPS_OFFICER: '/dashboard/ops',
      };

      const route = roleRoutes[response.user.role] || '/dashboard';
      router.push(route);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-elevated rounded-full mb-4">
            <Plane className="w-8 h-8 text-pilot" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">AeroOps AI</h1>
          <p className="text-secondary">Airbase Operations Management</p>
        </div>

        <div className="card-elevated">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-critical/20 border border-critical/50 rounded-lg p-3 text-sm text-critical">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-secondary mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-pilot/50"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-pilot/50"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pilot text-background font-semibold rounded-lg hover:bg-pilot/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted text-center mb-3">Test Credentials:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-secondary">Pilot: <span className="text-pilot">pilot1 / pilot123</span></div>
              <div className="text-secondary">Tech: <span className="text-technician">tech1 / tech123</span></div>
              <div className="text-secondary">Commander: <span className="text-commander">commander / cmd123</span></div>
              <div className="text-secondary">Admin: <span className="text-admin">admin / admin123</span></div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted text-center mt-8">
          Secure access to operational systems • Role-based authentication
        </p>
      </div>
    </div>
  );
}

