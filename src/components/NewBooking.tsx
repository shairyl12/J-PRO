import { useState, useEffect } from 'react';
import { Equipment, Customer } from '../types';
import { api } from '../services/api';
import { CalendarPlus, Check, ChevronRight } from 'lucide-react';

interface NewBookingProps {
  onNavigate: (page: string) => void;
}

export default function NewBooking({ onNavigate }: NewBookingProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', company: '', address: '' });
  const [useNewCustomer, setUseNewCustomer] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [eqData, cusData] = await Promise.all([api.getEquipment(), api.getCustomers()]);
      setEquipment(eqData);
      setCustomers(cusData);
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

  const toggleEquipment = (id: string) => {
    setSelectedEquipment(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1) : 1;
    return selectedEquipment.reduce((sum, eqId) => {
      const eq = equipment.find(e => e.id === eqId);
      if (!eq) return sum;
      return sum + (days >= 7 ? eq.weeklyRate * Math.floor(days / 7) + eq.dailyRate * (days % 7) : eq.dailyRate * days);
    }, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let resolvedCustomerId = customerId;
    let customerName = '';

    if (useNewCustomer) {
      const newCus = await api.addCustomer(newCustomer);
      resolvedCustomerId = newCus.id;
      customerName = newCus.name;
    } else {
      const cus = customers.find(c => c.id === customerId);
      customerName = cus?.name || '';
    }

    const totalCost = calculateTotal();
    const equipmentNames = selectedEquipment.map(id => equipment.find(e => e.id === id)?.name || '');

    await api.createBooking({
      customerId: resolvedCustomerId,
      customerName,
      equipmentIds: selectedEquipment,
      equipmentNames,
      startDate,
      endDate,
      status: 'pending',
      totalCost,
      deposit: Math.round(totalCost * 0.5),
      notes,
      eventType,
      venue,
    });

    setSubmitting(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <Check size={40} className="text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Created!</h2>
          <p className="text-gray-500">Your reservation has been submitted and is pending confirmation.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('bookings')}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            View All Bookings
          </button>
          <button
            onClick={() => { setSuccess(false); setStep(1); setCustomerId(''); setSelectedEquipment([]); setStartDate(''); setEndDate(''); setEventType(''); setVenue(''); setNotes(''); }}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  const totalCost = calculateTotal();
  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">New Booking</h2>
        <p className="text-gray-500 mt-1">Create a new equipment rental reservation.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400'
            }`}>
              {s}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
              {s === 1 ? 'Customer' : s === 2 ? 'Equipment' : 'Details'}
            </span>
            {s < 3 && <ChevronRight size={16} className="text-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Customer Selection */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Select Customer</h3>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setUseNewCustomer(false)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${!useNewCustomer ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Existing Customer
            </button>
            <button
              onClick={() => setUseNewCustomer(true)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${useNewCustomer ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              New Customer
            </button>
          </div>

          {!useNewCustomer ? (
            <div className="space-y-3">
              {customers.map((cus) => (
                <button
                  key={cus.id}
                  onClick={() => setCustomerId(cus.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    customerId === cus.id ? 'border-yellow-400 bg-yellow-50/50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{cus.name}</p>
                      <p className="text-sm text-gray-500">{cus.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{cus.email}</p>
                      <p className="text-xs text-gray-400">{cus.phone}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={newCustomer.name} onChange={(e) => setNewCustomer(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm" placeholder="Juan Dela Cruz" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm" placeholder="juan@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input type="text" value={newCustomer.phone} onChange={(e) => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm" placeholder="+63 9XX XXX XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input type="text" value={newCustomer.company} onChange={(e) => setNewCustomer(p => ({ ...p, company: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm" placeholder="Company name" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={newCustomer.address} onChange={(e) => setNewCustomer(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm" placeholder="Full address" />
              </div>
            </div>
          )}

          <div className="flex justify-end mt-8">
            <button
              onClick={() => setStep(2)}
              disabled={!useNewCustomer && !customerId}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Equipment Selection */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Select Equipment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
            {equipment.filter(e => e.available > 0).map((item) => (
              <button
                key={item.id}
                onClick={() => toggleEquipment(item.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedEquipment.includes(item.id) ? 'border-yellow-400 bg-yellow-50/50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.id} • {item.available} avail.</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">₱{item.dailyRate}/day</p>
                  </div>
                  {selectedEquipment.includes(item.id) && (
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedEquipment.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Event Details */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Event Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
              <select value={eventType} onChange={(e) => setEventType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm">
                <option value="">Select event type</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Concert">Concert</option>
                <option value="Birthday Party">Birthday Party</option>
                <option value="Fashion Show">Fashion Show</option>
                <option value="Festival">Festival</option>
                <option value="Church Event">Church Event</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
              <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm" placeholder="Event venue" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Special Requirements</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm resize-none"
              placeholder="Setup time, special requirements, etc." />
          </div>

          {/* Cost Summary */}
          {startDate && endDate && selectedEquipment.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-yellow-50/30 rounded-xl p-6 mb-6 border border-yellow-100">
              <h4 className="font-bold text-gray-900 mb-3">Cost Summary</h4>
              <div className="space-y-2 text-sm">
                {selectedEquipment.map(eqId => {
                  const eq = equipment.find(e => e.id === eqId);
                  if (!eq) return null;
                  const cost = days >= 7 ? eq.weeklyRate * Math.floor(days / 7) + eq.dailyRate * (days % 7) : eq.dailyRate * days;
                  return (
                    <div key={eqId} className="flex justify-between">
                      <span className="text-gray-600">{eq.name} × {days} day{days > 1 ? 's' : ''}</span>
                      <span className="font-semibold">₱{cost.toLocaleString()}</span>
                    </div>
                  );
                })}
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total ({days} day{days > 1 ? 's' : ''})</span>
                  <span className="font-bold text-xl text-gray-900">₱{totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-yellow-600">
                  <span>Deposit (50%)</span>
                  <span className="font-semibold">₱{Math.round(totalCost * 0.5).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!startDate || !endDate || !eventType || !venue || submitting}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <><CalendarPlus size={18} /> Submit Booking</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
