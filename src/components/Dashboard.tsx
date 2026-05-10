import { useEffect, useState } from 'react';
import { DashboardStats, Booking } from '../types';
import { api } from '../services/api';
import {
  CalendarDays, Package, DollarSign, Clock, CheckCircle, AlertCircle,
  TrendingUp, ArrowUpRight
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [statsData, bookingsData] = await Promise.all([
        api.getDashboardStats(),
        api.getBookings(),
      ]);
      setStats(statsData);
      setRecentBookings(bookingsData.slice(0, 5));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: <CalendarDays size={22} />, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Active Rentals', value: stats?.activeRentals || 0, icon: <Clock size={22} />, color: 'from-green-500 to-green-600', bgLight: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'Total Revenue', value: `₱${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign size={22} />, color: 'from-yellow-500 to-orange-500', bgLight: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { label: 'Available Equipment', value: stats?.availableEquipment || 0, icon: <Package size={22} />, color: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50', textColor: 'text-purple-600' },
    { label: 'Pending', value: stats?.pendingBookings || 0, icon: <AlertCircle size={22} />, color: 'from-orange-500 to-red-500', bgLight: 'bg-orange-50', textColor: 'text-orange-600' },
    { label: 'Completed', value: stats?.completedBookings || 0, icon: <CheckCircle size={22} />, color: 'from-teal-500 to-teal-600', bgLight: 'bg-teal-50', textColor: 'text-teal-600' },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-700',
    confirmed: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Welcome back! Here's your rental overview.</p>
        </div>
        <button
          onClick={() => onNavigate('new-booking')}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-200 flex items-center gap-2"
        >
          <CalendarDays size={18} />
          New Booking
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-sm`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
          </div>
          <button
            onClick={() => onNavigate('bookings')}
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
          >
            View All <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Booking ID</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Event</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">{booking.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.customerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.eventType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.startDate}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">₱{booking.totalCost.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status]}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
