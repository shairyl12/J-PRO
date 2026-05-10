export interface Equipment {
  id: string;
  name: string;
  category: 'lighting' | 'sound' | 'staging' | 'accessories';
  description: string;
  dailyRate: number;
  weeklyRate: number;
  available: number;
  total: number;
  image: string;
  condition: 'excellent' | 'good' | 'fair';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  equipmentIds: string[];
  equipmentNames: string[];
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  totalCost: number;
  deposit: number;
  notes: string;
  createdAt: string;
  eventType: string;
  venue: string;
}

export interface DashboardStats {
  totalBookings: number;
  activeRentals: number;
  totalRevenue: number;
  availableEquipment: number;
  pendingBookings: number;
  completedBookings: number;
}

export type Page = 'dashboard' | 'equipment' | 'new-booking' | 'bookings' | 'customers';
