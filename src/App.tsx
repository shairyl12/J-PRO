import { useState } from 'react';
import { Page } from './types';
import { AuthUser } from './components/Login';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EquipmentCatalog from './components/EquipmentCatalog';
import NewBooking from './components/NewBooking';
import BookingsList from './components/BookingsList';
import Customers from './components/Customers';
import CustomerDashboard from './components/CustomerDashboard';
import CustomerBookings from './components/CustomerBookings';
import { Menu, X, Bell, User, LogOut, Shield } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Not logged in — show login page
  if (!currentUser) {
    return <Login onLogin={(user) => { setCurrentUser(user); setCurrentPage('dashboard'); }} />;
  }

  const isAdmin = currentUser.role === 'admin';

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setSidebarOpen(false);
  };

  const renderPage = () => {
    if (isAdmin) {
      switch (currentPage) {
        case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
        case 'equipment': return <EquipmentCatalog />;
        case 'new-booking': return <NewBooking onNavigate={handleNavigate} />;
        case 'bookings': return <BookingsList />;
        case 'customers': return <Customers />;
        default: return <Dashboard onNavigate={handleNavigate} />;
      }
    } else {
      switch (currentPage) {
        case 'dashboard': return <CustomerDashboard user={currentUser} onNavigate={handleNavigate} />;
        case 'equipment': return <EquipmentCatalog />;
        case 'new-booking': return <NewBooking onNavigate={handleNavigate} />;
        case 'bookings': return <CustomerBookings user={currentUser} />;
        default: return <CustomerDashboard user={currentUser} onNavigate={handleNavigate} />;
      }
    }
  };

  const pageTitle: Record<Page, string> = {
    'dashboard': isAdmin ? 'Admin Dashboard' : 'My Dashboard',
    'equipment': 'Equipment Catalog',
    'new-booking': 'New Booking',
    'bookings': isAdmin ? 'All Bookings' : 'My Bookings',
    'customers': 'Customers',
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} role={currentUser.role} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{pageTitle[currentPage]}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400">J-Pro Light & Sound Rentals</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isAdmin ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isAdmin ? <Shield size={8} /> : <User size={8} />}
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell size={18} className="text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-400">{currentUser.email}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                  isAdmin
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-br from-blue-400 to-blue-600'
                }`}>
                  {isAdmin ? <Shield size={16} /> : <User size={16} />}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group"
                  title="Sign Out"
                >
                  <LogOut size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 px-6 py-4 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <p>Barangay Palongpong Hinunangan Southern Leyte</p>
            <p>© 2026 J-Pro Light & Sound Rentals. All rights reserved.</p>
            <div className="flex items-center gap-4">
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
