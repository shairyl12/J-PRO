import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { AuthUser } from './Login';
import { api } from '../services/api';
import { Search, MapPin, Calendar, RefreshCw } from 'lucide-react';

interface CustomerBookingsProps {
  user: AuthUser;
}

export default function CustomerBookings({ user }: CustomerBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const allBookings = await api.getBookings();
    setBookings(allBookings.filter(b => b.customerId === user.customerId));
    setLoading(false);
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-gray-100 text-gray-600 border-gray-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  const statusIcons: Record<string, string> = {
    pending: '⏳', confirmed: '✅', active: '🟢', completed: '📋', cancelled: '❌',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Bookings</h2>
          <p className="text-gray-500 mt-1">Track and manage your rental reservations.</p>
        </div>
        <button onClick={fetchBookings} className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search my bookings..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize ${
                statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Cards (mobile-friendly) */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-lg">No bookings found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((booking) => (
            <div key={booking.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedBooking(booking)}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-gray-500">{booking.id}</span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[booking.status]}`}>
                      {statusIcons[booking.status]} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{booking.eventType}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin size={14} /> {booking.venue}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {booking.equipmentNames.map((name, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">{name}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right sm:border-l sm:border-gray-100 sm:pl-6 flex-shrink-0">
                  <p className="text-2xl font-bold text-gray-900">₱{booking.totalCost.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">Deposit: ₱{booking.deposit.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 justify-end mt-2">
                    <Calendar size={12} /> {booking.startDate} → {booking.endDate}
                  </p>
                </div>
              </div>
              {booking.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500"><span className="font-medium text-gray-700">Notes:</span> {booking.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedBooking.id}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border mt-2 ${statusColors[selectedBooking.status]}`}>
                    {statusIcons[selectedBooking.status]} {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </span>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Event Type</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.eventType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Venue</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.venue}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">End Date</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.endDate}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Equipment Rented</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.equipmentNames.map((name, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">{name}</span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-gray-600 text-sm">{selectedBooking.notes || 'No notes provided.'}</p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-yellow-50/30 rounded-xl p-6 border border-yellow-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="text-2xl font-bold text-gray-900">₱{selectedBooking.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Deposit Paid</span>
                  <span className="text-sm font-semibold text-green-600">₱{selectedBooking.deposit.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={() => setSelectedBooking(null)}
                className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
