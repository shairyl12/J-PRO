import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { api } from '../services/api';
import { Search, Eye, Check, X, RefreshCw } from 'lucide-react';

export default function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const data = await api.getBookings();
    setBookings(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: Booking['status']) => {
    setActionLoading(id);
    await api.updateBookingStatus(id, status);
    await fetchBookings();
    setActionLoading(null);
    if (selectedBooking?.id === id) {
      setSelectedBooking(prev => prev ? { ...prev, status } : null);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    pending: '⏳',
    confirmed: '✅',
    active: '🟢',
    completed: '📋',
    cancelled: '❌',
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">All Bookings</h2>
          <p className="text-gray-500 mt-1">Manage and track all rental reservations.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize ${
                statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Booking ID</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Event</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Venue</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Dates</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">{booking.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{booking.customerName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.eventType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[150px] truncate">{booking.venue}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{booking.startDate}</p>
                    <p className="text-xs text-gray-400">to {booking.endDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">₱{booking.totalCost.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Dep: ₱{booking.deposit.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[booking.status]}`}>
                      {statusIcons[booking.status]} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} className="text-gray-500" />
                      </button>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            disabled={actionLoading === booking.id}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Confirm"
                          >
                            <Check size={16} className="text-green-600" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            disabled={actionLoading === booking.id}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'active')}
                          disabled={actionLoading === booking.id}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Mark Active"
                        >
                          <Check size={16} className="text-blue-600" />
                        </button>
                      )}
                      {booking.status === 'active' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          disabled={actionLoading === booking.id}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                          title="Mark Completed"
                        >
                          <Check size={16} className="text-gray-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No bookings found.</p>
          </div>
        )}
      </div>

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
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Event Type</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.eventType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Venue</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.venue}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Created</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.createdAt}</p>
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

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                {selectedBooking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => { handleStatusUpdate(selectedBooking.id, 'confirmed'); }}
                      className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => { handleStatusUpdate(selectedBooking.id, 'cancelled'); }}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <button
                    onClick={() => { handleStatusUpdate(selectedBooking.id, 'active'); }}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Mark as Active
                  </button>
                )}
                {selectedBooking.status === 'active' && (
                  <button
                    onClick={() => { handleStatusUpdate(selectedBooking.id, 'completed'); }}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
