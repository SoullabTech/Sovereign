'use client';

/**
 * MODEL STUDIO - Services Page
 *
 * Demo service offerings management
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Clock,
  DollarSign,
  Users,
  Video,
  MapPin,
  Edit2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Calendar,
} from 'lucide-react';

const demoServices = [
  {
    id: '1',
    name: 'Individual Therapy Session',
    description: 'One-on-one therapeutic session for personal growth and healing',
    duration: 50,
    price: 150,
    type: 'individual',
    locations: ['Video', 'In-Person'],
    active: true,
    bookings: 45,
    color: 'emerald',
  },
  {
    id: '2',
    name: 'Initial Consultation',
    description: 'First-time meeting to discuss goals and assess fit',
    duration: 60,
    price: 175,
    type: 'individual',
    locations: ['Video', 'In-Person'],
    active: true,
    bookings: 12,
    color: 'amber',
  },
  {
    id: '3',
    name: 'EMDR Session',
    description: 'Eye Movement Desensitization and Reprocessing therapy',
    duration: 90,
    price: 200,
    type: 'individual',
    locations: ['Video', 'In-Person'],
    active: true,
    bookings: 18,
    color: 'blue',
  },
  {
    id: '4',
    name: 'Couples Therapy',
    description: 'Relationship counseling for partners',
    duration: 75,
    price: 200,
    type: 'couples',
    locations: ['Video', 'In-Person'],
    active: true,
    bookings: 22,
    color: 'pink',
  },
  {
    id: '5',
    name: 'Mindfulness Group',
    description: 'Weekly group session focused on mindfulness and meditation',
    duration: 90,
    price: 45,
    type: 'group',
    locations: ['In-Person'],
    active: true,
    bookings: 8,
    color: 'violet',
  },
  {
    id: '6',
    name: 'Crisis Support Session',
    description: 'Urgent support session for acute distress',
    duration: 60,
    price: 175,
    type: 'individual',
    locations: ['Video', 'Phone'],
    active: false,
    bookings: 3,
    color: 'red',
  },
];

const colorClasses = {
  emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
  pink: { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400' },
  violet: { bg: 'bg-violet-500/20', border: 'border-violet-500/30', text: 'text-violet-400' },
  red: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
};

export default function ModelServicesPage() {
  const [services, setServices] = useState(demoServices);

  const toggleService = (serviceId: string) => {
    setServices(prev => prev.map(s =>
      s.id === serviceId ? { ...s, active: !s.active } : s
    ));
  };

  const activeServices = services.filter(s => s.active).length;
  const totalBookings = services.reduce((sum, s) => sum + s.bookings, 0);
  const avgPrice = Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length);

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-slate-500 mt-1">{activeServices} active services</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors">
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <Package className="w-5 h-5 text-amber-400 mb-2" />
          <div className="text-2xl font-bold text-white">{services.length}</div>
          <div className="text-sm text-slate-400">Total Services</div>
        </div>
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="text-2xl font-bold text-white">{totalBookings}</div>
          <div className="text-sm text-slate-400">Monthly Bookings</div>
        </div>
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <DollarSign className="w-5 h-5 text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-white">${avgPrice}</div>
          <div className="text-sm text-slate-400">Avg. Price</div>
        </div>
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <Calendar className="w-5 h-5 text-violet-400 mb-2" />
          <div className="text-2xl font-bold text-white">68%</div>
          <div className="text-sm text-slate-400">Utilization</div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => {
          const colors = colorClasses[service.color as keyof typeof colorClasses];
          return (
            <motion.div
              key={service.id}
              whileHover={{ scale: 1.01 }}
              className={`bg-[#1e1e38] border rounded-xl p-5 ${
                service.active ? 'border-slate-800/50' : 'border-slate-800/30 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border`}>
                    <Package className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{service.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                      {service.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleService(service.id)}
                  className={`${service.active ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  {service.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              <p className="text-sm text-slate-400 mb-4">{service.description}</p>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {service.duration} min
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                  {service.price}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Users className="w-4 h-4 text-slate-500" />
                  {service.bookings} bookings
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {service.locations.map((loc) => (
                    <span key={loc} className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">
                      {loc === 'Video' && <Video className="w-3 h-3" />}
                      {loc === 'In-Person' && <MapPin className="w-3 h-3" />}
                      {loc === 'Phone' && '📞'}
                      {loc}
                    </span>
                  ))}
                </div>
                <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
