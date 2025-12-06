import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { Users as UsersIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Note: This would need a dedicated endpoint in production
      toast.info('User management coming soon');
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  return (
    <div className="space-y-6" data-testid="users-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-chivo font-bold uppercase tracking-wider">User Management</h3>
      </div>

      <div className="text-center py-12 text-slate-500">
        <UsersIcon size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
        <p>User management interface</p>
        <p className="text-sm mt-2">Configure users, roles, and permissions</p>
      </div>
    </div>
  );
};

export default Users;