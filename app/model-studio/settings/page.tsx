'use client';

/**
 * MODEL STUDIO - Settings Page
 *
 * Demo practice settings
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Building2,
  Bell,
  Lock,
  CreditCard,
  Calendar,
  Palette,
  Globe,
  Mail,
  Shield,
  Key,
  Smartphone,
  Monitor,
  Save,
  ChevronRight,
} from 'lucide-react';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Your personal information' },
  { id: 'practice', label: 'Practice', icon: Building2, description: 'Practice details and branding' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and push preferences' },
  { id: 'security', label: 'Security', icon: Lock, description: 'Password and authentication' },
  { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Subscription and payments' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, description: 'Availability and scheduling' },
  { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display' },
  { id: 'integrations', label: 'Integrations', icon: Globe, description: 'Connected services' },
];

export default function ModelSettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'Dr. Kelly Williams',
    email: 'kelly@mindfulpractice.com',
    phone: '(555) 123-4567',
    practiceName: 'Mindful Practice Therapy',
    address: '123 Wellness Ave, Suite 200',
    city: 'San Francisco, CA 94102',
    timezone: 'America/Los_Angeles',
    emailNotifications: true,
    pushNotifications: true,
    smsReminders: true,
    twoFactor: true,
    theme: 'dark',
  });

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-500/20 rounded-xl">
          <Settings className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your practice preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Settings Nav */}
        <div className="space-y-1">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeSection === section.id
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div>
                  <div className="text-sm font-medium">{section.label}</div>
                  <div className="text-xs opacity-60">{section.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="col-span-3 bg-[#1e1e38] border border-slate-800/50 rounded-xl p-6">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl font-medium text-amber-400">
                    KW
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
                      Change Photo
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/New_York">Eastern Time</option>
                    </select>
                  </div>
                </div>

                <button className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Practice Section */}
          {activeSection === 'practice' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">Practice Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Practice Name</label>
                  <input
                    type="text"
                    value={formData.practiceName}
                    onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">City, State, ZIP</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser and desktop alerts', icon: Bell },
                  { key: 'smsReminders', label: 'SMS Reminders', desc: 'Text message appointment reminders', icon: Smartphone },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-white font-medium">{item.label}</div>
                        <div className="text-sm text-slate-500">{item.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key as keyof typeof formData] })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        formData[item.key as keyof typeof formData] ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData[item.key as keyof typeof formData] ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-white font-medium">Password</div>
                      <div className="text-sm text-slate-500">Last changed 30 days ago</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-white font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-emerald-400">Enabled</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                    Manage
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-white font-medium">Active Sessions</div>
                      <div className="text-sm text-slate-500">2 devices logged in</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                    View All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other sections show placeholder */}
          {!['profile', 'practice', 'notifications', 'security'].includes(activeSection) && (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-2 capitalize">{activeSection} Settings</h3>
              <p className="text-slate-400">Configure your {activeSection} preferences here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
