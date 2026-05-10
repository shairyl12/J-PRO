import { useEffect, useState } from 'react';
import { Booking, Equipment } from '../types';
import { AuthUser } from './Login';
import { api } from '../services/api';
import {
  CalendarDays, Package, Clock, CheckCircle,
  TrendingUp, ArrowUpRight, Zap, MapPin, Calendar
} from 'lucide-react';

interface CustomerDashboardProps {
  user: AuthUser;
  onNavigate: (page: string) => void;
}

export default function CustomerDashboard({ user, onNavigate }: CustomerDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [allBookings, eqData] = await Promise.all([
        api.getBookings(),
        api.getEquipment(),
      ]);
      // Filter bookings for this customer only
      const myBookings = allBookings.filter(b => b.customerId === user.customerId);
      setBookings(myBookings);
      setEquipment(eqData);
      setLoading(false);
    };
    fetchData();
  }, [user.customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed');
  const totalSpent = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.totalCost, 0);
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  const statusColors: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-700',
    confirmed: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-700',
  };

  const featuredEquipment = equipment.filter(e => e.available > 0).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-gray-900" />
            </div>
            <span className="text-yellow-400 text-sm font-medium">J-Pro Light & Sound</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}! 👋</h2>
          <p className="text-gray-400 max-w-lg">Manage your equipment rentals, track your bookings, and browse our latest inventory — all in one place.</p>
          <button
            onClick={() => onNavigate('new-booking')}
            className="mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all inline-flex items-center gap-2"
          >
            <CalendarDays size={18} />
            Book Equipment Now
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <CalendarDays size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Bookings</p>
              <p className="text-xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900">{activeBookings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Spent</p>
              <p className="text-xl font-bold text-gray-900">₱{totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">My Recent Bookings</h3>
            <button
              onClick={() => onNavigate('bookings')}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
            >
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 mb-4">You haven't made any bookings yet.</p>
              <button
                onClick={() => onNavigate('new-booking')}
                className="text-yellow-600 font-semibold hover:text-yellow-700"
              >
                Create your first booking →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.eventType}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {booking.venue}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status]}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> {booking.startDate} → {booking.endDate}
                    </p>
                    <p className="font-bold text-gray-900">₱{booking.totalCost.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {booking.equipmentNames.map((name, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">{name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Featured */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('new-booking')}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all border border-yellow-100"
              >
                <CalendarDays size={20} className="text-yellow-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">New Booking</p>
                  <p className="text-xs text-gray-500">Reserve equipment</p>
                </div>
              </button>
              <button
                onClick={() => onNavigate('equipment')}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <Package size={20} className="text-gray-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">Browse Equipment</p>
                  <p className="text-xs text-gray-500">View catalog</p>
                </div>
              </button>
              <button
                onClick={() => onNavigate('bookings')}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <TrendingUp size={20} className="text-gray-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">Track Bookings</p>
                  <p className="text-xs text-gray-500">View status & history</p>
                </div>
              </button>
            </div>
          </div>

          {/* Featured Equipment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Available Now</h3>
            <div className="space-y-3">
              {featuredEquipment.slice(0, 4).map((eq) => (
                <div key={eq.id} className="flex items-center gap-3">
                  <span className="text-2xl">{eq.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{eq.name}</p>
                    <p className="text-xs text-gray-400">{eq.available} available</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">₱{eq.dailyRate}/d</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate('equipment')}
              className="w-full mt-4 py-2.5 text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              View Full Catalog →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
