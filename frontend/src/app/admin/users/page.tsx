'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DataTable from '@/components/DataTable';
import UserModal from '@/components/UserModal';
import { Plus, Search, Edit2, Trash2, Shield } from 'lucide-react';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const fetchUsers = async () => {
        try {
            const data = await api.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (userData: any) => {
        await api.createUser(userData);
        await fetchUsers();
    };

    const handleUpdateUser = async (userData: any) => {
        if (!selectedUser) return;
        await api.updateUser(selectedUser.id, userData);
        await fetchUsers();
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.deleteUser(id);
            await fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            key: 'name',
            label: 'User',
            render: (user: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500 font-bold text-xs">
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                        <div className="font-medium text-slate-200">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-slate-500">@{user.username}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            label: 'Email',
            render: (user: any) => <span className="text-slate-400">{user.email}</span>
        },
        {
            key: 'role',
            label: 'Role',
            render: (user: any) => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Shield className="w-3 h-3" />
                    {user.role}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (user: any) => (
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (user: any) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    if (loading) {
        return <div className="text-slate-400">Loading users...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">User Management</h1>
                    <p className="text-slate-400 mt-2">Manage system users, roles, and permissions</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedUser(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <Search className="w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search users by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-slate-200 w-full placeholder-slate-500"
                />
            </div>

            <DataTable
                data={filteredUsers}
                columns={columns}
                emptyMessage="No users found matching your search."
            />

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={selectedUser ? handleUpdateUser : handleCreateUser}
                user={selectedUser}
            />
        </div>
    );
}
