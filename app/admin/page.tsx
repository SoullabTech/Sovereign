"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { betaSession } from '@/lib/auth/betaSession';
import { ArrowLeft, UserPlus, Edit3, Trash2, Save, X, Key, Users, Activity } from 'lucide-react';
import { SystemHealthDisplay } from '@/components/system-health/SystemHealthDisplay';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password: string;
  onboarded: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    name: '',
    email: '',
    password: '',
    onboarded: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const user = betaSession.getUser();
    if (!user) {
      router.push('/signin');
      return;
    }
    setCurrentUser(user);

    // Load users from localStorage
    loadUsers();
  }, [router]);

  const loadUsers = () => {
    const betaUsersStr = localStorage.getItem('beta_users');
    if (betaUsersStr) {
      const betaUsers = JSON.parse(betaUsersStr);
      const usersList = Object.values(betaUsers) as User[];
      setUsers(usersList);
    }

    // Always include default test users
    const defaultUsers = [
      {
        id: 'user_kelly_default',
        username: 'Kelly@Soullab.org',
        name: 'Kelly',
        email: 'Kelly@Soullab.org',
        password: 'Mandala21',
        onboarded: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_kelly_lowercase',
        username: 'kelly@soullab.org',
        name: 'Kelly',
        email: 'kelly@soullab.org',
        password: 'Mandala21',
        onboarded: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_kelly_name',
        username: 'Kelly',
        name: 'Kelly',
        email: 'Kelly@Soullab.org',
        password: 'Mandala21',
        onboarded: true,
        createdAt: new Date().toISOString()
      }
    ];

    // Merge with existing users, avoiding duplicates
    const allUsers = [...defaultUsers];
    users.forEach(user => {
      if (!defaultUsers.find(du => du.username === user.username)) {
        allUsers.push(user);
      }
    });

    setUsers(allUsers);
  };

  const saveUsers = (updatedUsers: User[]) => {
    const betaUsers: { [key: string]: User } = {};
    updatedUsers.forEach(user => {
      betaUsers[user.username] = user;
    });
    localStorage.setItem('beta_users', JSON.stringify(betaUsers));
    setUsers(updatedUsers);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user.id);
    setEditForm(user);
  };

  const handleSaveEdit = () => {
    if (!editForm.username || !editForm.password) {
      setMessage('Username and password are required');
      return;
    }

    const updatedUsers = users.map(user =>
      user.id === editingUser
        ? { ...user, ...editForm }
        : user
    );

    saveUsers(updatedUsers);
    setEditingUser(null);
    setEditForm({});
    setMessage('User updated successfully');

    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && ['user_kelly_default', 'user_kelly_lowercase', 'user_kelly_name'].includes(userId)) {
      setMessage('Cannot delete default test users');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      saveUsers(updatedUsers);
      setMessage('User deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.email) {
      setMessage('Username, email, and password are required');
      return;
    }

    // Check if username already exists
    if (users.find(u => u.username === newUser.username)) {
      setMessage('Username already exists');
      return;
    }

    const user: User = {
      id: `user_${Date.now()}`,
      username: newUser.username!,
      name: newUser.name || newUser.username!,
      email: newUser.email!,
      password: newUser.password!,
      onboarded: newUser.onboarded || false,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, user];
    saveUsers(updatedUsers);

    setShowAddForm(false);
    setNewUser({
      username: '',
      name: '',
      email: '',
      password: '',
      onboarded: false
    });
    setMessage('User added successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  if (!currentUser) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-teal-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/maia')}
              className="text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-teal-400" />
              <h1 className="text-2xl font-cinzel text-white">Admin Panel</h1>
            </div>
          </div>

          <div className="text-white/70 text-sm">
            Logged in as {currentUser.name}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Status Message */}
        {message && (
          <div className="mb-6 bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {/* System Health Monitoring */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-6 h-6 text-teal-400" />
            <h2 className="text-xl font-cinzel text-white">System Health Monitoring</h2>
          </div>
          <SystemHealthDisplay showDetails={true} className="mb-6" />
        </div>

        {/* Add User Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-cinzel text-white">User Management</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <div className="mb-6 bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-cinzel text-white mb-4">Add New User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Username</label>
                <input
                  type="text"
                  value={newUser.username || ''}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Name</label>
                <input
                  type="text"
                  value={newUser.name || ''}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white"
                  placeholder="Enter display name"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email || ''}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Password</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newUser.password || ''}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/30 rounded text-white"
                    placeholder="Enter password"
                  />
                  <button
                    onClick={() => setNewUser({...newUser, password: generateRandomPassword()})}
                    className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                    title="Generate random password"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-white/70 font-cinzel">Username</th>
                  <th className="text-left px-4 py-3 text-white/70 font-cinzel">Name</th>
                  <th className="text-left px-4 py-3 text-white/70 font-cinzel">Email</th>
                  <th className="text-left px-4 py-3 text-white/70 font-cinzel">Password</th>
                  <th className="text-left px-4 py-3 text-white/70 font-cinzel">Status</th>
                  <th className="text-center px-4 py-3 text-white/70 font-cinzel">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-white/10">
                    <td className="px-4 py-3">
                      {editingUser === user.id ? (
                        <input
                          type="text"
                          value={editForm.username || ''}
                          onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                          className="w-full px-2 py-1 bg-white/10 border border-white/30 rounded text-white text-sm"
                        />
                      ) : (
                        <span className="text-white">{user.username}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser === user.id ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-2 py-1 bg-white/10 border border-white/30 rounded text-white text-sm"
                        />
                      ) : (
                        <span className="text-white">{user.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser === user.id ? (
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full px-2 py-1 bg-white/10 border border-white/30 rounded text-white text-sm"
                        />
                      ) : (
                        <span className="text-white">{user.email}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser === user.id ? (
                        <div className="flex space-x-1">
                          <input
                            type="text"
                            value={editForm.password || ''}
                            onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                            className="flex-1 px-2 py-1 bg-white/10 border border-white/30 rounded text-white text-sm"
                          />
                          <button
                            onClick={() => setEditForm({...editForm, password: generateRandomPassword()})}
                            className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                            title="Generate random password"
                          >
                            <Key className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-white/70 font-mono">{'•'.repeat(8)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        user.onboarded
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {user.onboarded ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-2">
                        {editingUser === user.id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title="Save changes"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(null);
                                setEditForm({});
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit user"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-cinzel text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                const password = generateRandomPassword();
                navigator.clipboard.writeText(password);
                setMessage(`Generated password copied to clipboard: ${password}`);
                setTimeout(() => setMessage(''), 5000);
              }}
              className="bg-yellow-600/20 border border-yellow-500/30 text-yellow-200 px-4 py-3 rounded-lg hover:bg-yellow-600/30 transition-colors flex items-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>Generate Random Password</span>
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('beta_users');
                loadUsers();
                setMessage('Reset to default users');
                setTimeout(() => setMessage(''), 3000);
              }}
              className="bg-red-600/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg hover:bg-red-600/30 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </button>

            <div className="bg-teal-600/20 border border-teal-500/30 text-teal-200 px-4 py-3 rounded-lg flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Total Users: {users.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}