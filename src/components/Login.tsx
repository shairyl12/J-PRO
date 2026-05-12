import { useState } from 'react';
import { Zap, Eye, EyeOff, Shield, User, LogIn, ArrowRight } from 'lucide-react';
import Register from './Register'; // Make sure this import is here

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

const ADMIN_CREDENTIALS = { email: 'admin@jpro.com', password: 'admin123' };
const CUSTOMER_ACCOUNTS = [
  { email: 'maria@santosweddings.com', password: 'customer123', name: 'Maria Santos', id: 'CUS-001' },
];

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<'admin' | 'customer'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (role === 'admin') {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        onLogin({ id: 'ADM-001', name: 'System Administrator', email: ADMIN_CREDENTIALS.email, role: 'admin' });
      } else {
        setError('Invalid admin credentials.');
      }
    } else {
      const customer = CUSTOMER_ACCOUNTS.find(c => c.email === email && c.password === password);
      if (customer) {
        onLogin({ id: customer.id, name: customer.name, email: customer.email, role: 'customer', customerId: customer.id });
      } else {
        setError('Invalid customer credentials.');
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

  if (isRegistering) {
    return <Register onBack={() => setIsRegistering(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Side — Branding (Keeping your original UI) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black p-16 flex-col justify-center">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
            <Zap size={32} className="text-gray-900" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">J-Pro</h1>
            <p className="text-yellow-400/80 text-sm font-medium">Light & Sound Rentals</p>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Professional Event Equipment</h2>
        <p className="text-gray-400 text-lg max-w-md">Book premium lighting and sound systems securely.</p>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-gray-800/50 rounded-xl p-1 mb-8 border border-gray-700/50">
            <button onClick={() => setRole('admin')} className={`flex-1 py-3 rounded-lg text-sm font-semibold ${role === 'admin' ? 'bg-yellow-500 text-gray-900' : 'text-gray-400'}`}>Admin</button>
            <button onClick={() => setRole('customer')} className={`flex-1 py-3 rounded-lg text-sm font-semibold ${role === 'customer' ? 'bg-yellow-500 text-gray-900' : 'text-gray-400'}`}>Customer</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input 
               type="email" 
               value={email} 
               onChange={(e) => setEmail(e.target.value)} 
               className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white outline-none" 
               placeholder="Email Address"
               required 
            />
            <input 
               type={showPassword ? 'text' : 'password'} 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white outline-none" 
               placeholder="Password"
               required 
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 rounded-xl font-bold">
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          {/* --- DEMO CREDENTIALS BOX --- */}
          <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Demo Credentials</h3>
              <button onClick={fillDemoCredentials} className="text-xs text-yellow-500 font-bold hover:underline">Auto-fill →</button>
            </div>
            <p className="text-sm text-gray-400"><span className="text-gray-600">Email:</span> {role === 'admin' ? 'admin@jpro.com' : 'maria@santosweddings.com'}</p>
            <p className="text-sm text-gray-400"><span className="text-gray-600">Password:</span> {role === 'admin' ? 'admin123' : 'customer123'}</p>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account? <button onClick={() => setIsRegistering(true)} className="text-yellow-500 font-semibold hover:underline">Create an account</button>
          </p>
        </div>
      </div>
    </div>
  );
}
