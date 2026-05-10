import { Page } from '../types';
import {
  LayoutDashboard, Package, CalendarPlus, CalendarDays, Users, Zap
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  role: 'admin' | 'customer';
}

export default function Sidebar({ currentPage, onNavigate, role }: SidebarProps) {
  const isAdmin = role === 'admin';

  const adminNav: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { page: 'equipment', label: 'Equipment Catalog', icon: <Package size={20} /> },
    { page: 'new-booking', label: 'New Booking', icon: <CalendarPlus size={20} /> },
    { page: 'bookings', label: 'All Bookings', icon: <CalendarDays size={20} /> },
    { page: 'customers', label: 'Customers', icon: <Users size={20} /> },
  ];

  const customerNav: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard', label: 'My Dashboard', icon: <LayoutDashboard size={20} /> },
    { page: 'equipment', label: 'Browse Equipment', icon: <Package size={20} /> },
    { page: 'new-booking', label: 'New Booking', icon: <CalendarPlus size={20} /> },
    { page: 'bookings', label: 'My Bookings', icon: <CalendarDays size={20} /> },
  ];

  const navItems = isAdmin ? adminNav : customerNav;

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white flex flex-col min-h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Zap size={22} className="text-gray-900" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">J-Pro</h1>
            <p className="text-[11px] text-gray-400 leading-tight">Light & Sound Rentals</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 pt-4">
        <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center ${
          isAdmin
            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/10 text-yellow-400 border border-yellow-500/20'
            : 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-400 border border-blue-500/20'
        }`}>
          {isAdmin ? '🛡️ Admin Panel' : '👤 Customer Portal'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentPage === item.page
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/10 text-yellow-400 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* System Info */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">System Online</span>
          </div>
          <p className="text-[10px] text-gray-500">Node.js + Aiven Cloud DB</p>
          <p className="text-[10px] text-gray-500">v2.1.0 — Production</p>
        </div>
      </div>
    </aside>
  );
}
