import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  Airplane,
  SignOut,
  Wrench,
  Target,
  Siren,
  GraduationCap,
  House,
  Robot,
  Gauge,
  Users,
} from '@phosphor-icons/react';
import { ChatBot } from '../shared/ChatBot';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { icon: Gauge, label: 'Overview', path: '/dashboard' },
      { icon: Airplane, label: 'Aircraft', path: '/dashboard/aircraft' },
      { icon: Users, label: 'Users', path: '/dashboard/users' },
      { icon: Wrench, label: 'Maintenance', path: '/dashboard/maintenance' },
      { icon: Target, label: 'Missions', path: '/dashboard/missions' },
      { icon: Siren, label: 'Emergencies', path: '/dashboard/emergencies' },
    ],
    pilot: [
      { icon: Gauge, label: 'Overview', path: '/dashboard' },
      { icon: Airplane, label: 'Aircraft', path: '/dashboard/aircraft' },
      { icon: Target, label: 'Missions', path: '/dashboard/missions' },
    ],
    technician: [
      { icon: Gauge, label: 'Overview', path: '/dashboard' },
      { icon: Airplane, label: 'Aircraft', path: '/dashboard/aircraft' },
      { icon: Wrench, label: 'Maintenance', path: '/dashboard/maintenance' },
    ],
    ops_officer: [
      { icon: Gauge, label: 'Overview', path: '/dashboard' },
      { icon: Airplane, label: 'Aircraft', path: '/dashboard/aircraft' },
      { icon: Target, label: 'Missions', path: '/dashboard/missions' },
    ],
    commander: [
      { icon: Gauge, label: 'Overview', path: '/dashboard' },
      { icon: Airplane, label: 'Aircraft', path: '/dashboard/aircraft' },
      { icon: Target, label: 'Missions', path: '/dashboard/missions' },
      { icon: Siren, label: 'Emergencies', path: '/dashboard/emergencies' },
    ],
    emergency: [
      { icon: Gauge, label: 'Overview', path: '/dashboard' },
      { icon: Siren, label: 'Emergencies', path: '/dashboard/emergencies' },
    ],
    trainee: [
      { icon: Gauge, label: 'Overview', path: '/dashboard' },
      { icon: GraduationCap, label: 'Training', path: '/dashboard/training' },
    ],
    family: [
      { icon: Gauge, label: 'Overview', path: '/dashboard' },
      { icon: House, label: 'Welfare', path: '/dashboard/welfare' },
    ],
  };

  const userMenu = menuItems[user?.role] || menuItems.pilot;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="scanlines" />

      <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Airplane size={32} weight="duotone" className="text-blue-400" />
            <div>
              <h1 className="font-chivo font-bold text-sm uppercase tracking-wider">Mission Hub</h1>
              <p className="text-xs text-slate-500 font-mono">{user?.role.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {userMenu.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-sm transition-all duration-150 text-sm font-medium"
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon size={20} weight="duotone" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setChatOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-sm transition-all duration-150 text-sm font-medium"
            data-testid="open-chatbot-btn"
          >
            <Robot size={20} weight="duotone" />
            AI Assistant
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-sm transition-all duration-150 text-sm font-medium"
            data-testid="logout-btn"
          >
            <SignOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="backdrop-blur-md bg-slate-900/80 border-b border-slate-700 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="font-chivo font-bold text-xl uppercase tracking-wider">Mission Control</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">Welcome back, {user?.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-mono">Logged in as</p>
                <p className="text-sm font-mono text-slate-300">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>

      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default DashboardLayout;