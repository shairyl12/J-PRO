import { useState, useEffect } from 'react';
import { Equipment } from '../types';
import { api } from '../services/api';
import { Search, Filter, Package, ChevronDown } from 'lucide-react';

export default function EquipmentCatalog() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      const data = await api.getEquipment();
      setEquipment(data);
      setLoading(false);
    };
    fetchEquipment();
  }, []);

  const filtered = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Equipment', icon: '🎯' },
    { value: 'lighting', label: 'Lighting', icon: '💡' },
    { value: 'sound', label: 'Sound', icon: '🔊' },
    { value: 'staging', label: 'Staging', icon: '🎪' },
    { value: 'accessories', label: 'Accessories', icon: '🔌' },
  ];

  const conditionColors: Record<string, string> = {
    excellent: 'bg-green-100 text-green-700',
    good: 'bg-blue-100 text-blue-700',
    fair: 'bg-yellow-100 text-yellow-700',
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
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Equipment Catalog</h2>
        <p className="text-gray-500 mt-1">Browse our professional light and sound equipment inventory.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm appearance-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Category Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              categoryFilter === cat.value
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-yellow-200 transition-all duration-200 cursor-pointer overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{item.image}</div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${conditionColors[item.condition]}`}>
                  {item.condition}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors">{item.name}</h3>
              <p className="text-xs text-gray-400 font-mono mb-2">{item.id}</p>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-lg font-bold text-gray-900">₱{item.dailyRate}<span className="text-xs font-normal text-gray-400">/day</span></p>
                  <p className="text-xs text-gray-400">₱{item.weeklyRate}/week</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${item.available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {item.available > 0 ? `${item.available} available` : 'Unavailable'}
                  </div>
                  <p className="text-xs text-gray-400">{item.total} total units</p>
                </div>
              </div>

              {/* Availability Bar */}
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${item.available > item.total * 0.3 ? 'bg-green-400' : item.available > 0 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${(item.available / item.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No equipment found matching your search.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="text-5xl">{selectedItem.image}</div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedItem.name}</h3>
            <p className="text-sm text-gray-400 font-mono mb-4">{selectedItem.id}</p>
            <p className="text-gray-600 mb-6">{selectedItem.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Daily Rate</p>
                <p className="text-xl font-bold text-gray-900">₱{selectedItem.dailyRate}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Weekly Rate</p>
                <p className="text-xl font-bold text-gray-900">₱{selectedItem.weeklyRate}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Available</p>
                <p className="text-xl font-bold text-green-600">{selectedItem.available} / {selectedItem.total}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Condition</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{selectedItem.condition}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
