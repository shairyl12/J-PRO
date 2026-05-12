import { useState } from 'react';
import { Zap, Eye, EyeOff, Shield, User, LogIn, ArrowRight } from 'lucide-react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  customerId?: string;
}

interface LoginProps {
  onLogin: (user: AuthUser) => void;
}

// Mock credentials — in production, these come from Node.js/Aiven DB
const ADMIN_CREDENTIALS = { email: 'admin@jpro.com', password: 'admin123' };
const CUSTOMER_ACCOUNTS = [
  { email: 'maria@santosweddings.com', password: 'customer123', name: 'Maria Santos', id: 'CUS-001' },
  { email: 'james@corp-events.ph', password: 'customer123', name: 'James Reyes', id: 'CUS-002' },
  { email: 'angela@concerts.ph', password: 'customer123', name: 'Angela Cruz', id: 'CUS-003' },
  { email: 'roberto@fiestas.com', password: 'customer123', name: 'Roberto Garcia', id: 'CUS-004' },
  { email: 'diana@glamevents.ph', password: 'customer123', name: 'Diana Mendoza', id: 'CUS-005' },
];

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<'admin' | 'customer'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (role === 'admin') {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        onLogin({
          id: 'ADM-001',
          name: 'System Administrator',
          email: ADMIN_CREDENTIALS.email,
          role: 'admin',
        });
      } else {
        setError('Invalid admin credentials. Try admin@jpro.com / admin123');
      }
    } else {
      const customer = CUSTOMER_ACCOUNTS.find(
        (c) => c.email === email && c.password === password
      );
      if (customer) {
        onLogin({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          role: 'customer',
          customerId: customer.id,
        });
      } else {
        setError('Invalid customer credentials. Try any customer email / customer123');
      }
    }
    setLoading(false);
  };

  const fillDemoCredentials = () => {
    if (role === 'admin') {
      setEmail('admin@jpro.com');
      setPassword('admin123');
    } else {
      setEmail('maria@santosweddings.com');
      setPassword('customer123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30">
              <Zap size={32} className="text-gray-900" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">J-Pro</h1>
              <p className="text-yellow-400/80 text-sm font-medium">Light & Sound Rentals</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Professional Event<br />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Equipment Rentals
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-md mb-10">
            Book premium lighting, sound, and staging equipment for your events. Trusted by top event organizers across the Philippines.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: '💡', text: 'Premium Lighting Equipment' },
              { icon: '🔊', text: 'Professional Sound Systems' },
              { icon: '🎪', text: 'Complete Stage Solutions' },
              { icon: '📦', text: 'Delivery & Setup Included' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-gray-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Tech Stack Badge */}
          <div className="mt-12 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700/50">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-400">Node.js + Aiven Cloud DB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Zap size={24} className="text-gray-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">J-Pro</h1>
              <p className="text-yellow-400/80 text-xs font-medium">Light & Sound Rentals</p>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-gray-800/50 rounded-xl p-1 mb-8 border border-gray-700/50">
            <button
              onClick={() => { setRole('admin'); setError(''); setEmail(''); setPassword(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === 'admin'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 shadow-lg shadow-yellow-500/20'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Shield size={16} />
              Admin
            </button>
            <button
              onClick={() => { setRole('customer'); setError(''); setEmail(''); setPassword(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === 'customer'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 shadow-lg shadow-yellow-500/20'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <User size={16} />
              Customer
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder={role === 'admin' ? 'admin@jpro.com' : 'your@email.com'}
                  className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In as {role === 'admin' ? 'Admin' : 'Customer'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

         // Inside your Login component, add this state:
const [isRegistering, setIsRegistering] = useState(false);

// Then, wrap your return statement logic:
if (isRegistering) {
  return <Register onBack={() => setIsRegistering(false)} />;
}

// At the bottom of your Login form (before the footer), add:
<p className="text-center text-sm text-gray-400 mt-6">
  Don't have an account?{' '}
  <button 
    onClick={() => setIsRegistering(true)}
    className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors"
  >
    Create an account
  </button>
</p>
             
          {/* Footer */}
          <p className="text-center text-xs text-gray-600 mt-8">
            © 2025 J-Pro Light & Sound Rentals. Secure login powered by Node.js + Aiven.
          </p>
        </div>
      </div>
    </div>
  );
}
