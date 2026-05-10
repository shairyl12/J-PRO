import { Equipment, Customer, Booking, DashboardStats } from '../types';

// ============================================================
// J-Pro Light & Sound Rentals - API Service Layer
// ============================================================
// This service simulates a Node.js + Express backend with
// Aiven MySQL/PostgreSQL cloud database integration.
//
// In production, replace mock data with actual API calls:
//   const res = await fetch('/api/equipment');
//   return await res.json();
//
// Backend stack:
//   - Node.js + Express.js server
//   - Aiven for MySQL (cloud database)
//   - JWT authentication
//   - RESTful API endpoints
// ============================================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ---- Equipment Data ----
const equipmentData: Equipment[] = [
  {
    id: 'EQ-001', name: 'LED Par Can 64', category: 'lighting',
    description: 'High-intensity LED par can with RGBW color mixing. Perfect for stage wash and uplighting.',
    dailyRate: 45, weeklyRate: 250, available: 24, total: 30, image: '🔴', condition: 'excellent'
  },
  {
    id: 'EQ-002', name: 'Moving Head Spot 300W', category: 'lighting',
    description: 'Professional moving head spotlight with gobo wheel, color wheel, and prism effects.',
    dailyRate: 120, weeklyRate: 700, available: 8, total: 12, image: '🔦', condition: 'excellent'
  },
  {
    id: 'EQ-003', name: 'LED Wash Light 18x15W', category: 'lighting',
    description: 'Full-color LED wash light with zoom. Ideal for large venue coverage.',
    dailyRate: 85, weeklyRate: 500, available: 16, total: 20, image: '💡', condition: 'good'
  },
  {
    id: 'EQ-004', name: 'Strobe Light 3000W', category: 'lighting',
    description: 'High-power strobe light with adjustable flash rate. DMX controllable.',
    dailyRate: 55, weeklyRate: 320, available: 6, total: 8, image: '⚡', condition: 'good'
  },
  {
    id: 'EQ-005', name: 'Haze Machine Pro', category: 'lighting',
    description: 'Professional haze machine with timer and remote control. Enhances light beam visibility.',
    dailyRate: 65, weeklyRate: 380, available: 4, total: 5, image: '🌫️', condition: 'excellent'
  },
  {
    id: 'EQ-006', name: 'JBL SRX Line Array', category: 'sound',
    description: 'Professional line array speaker system. Crystal clear sound for large venues up to 5000 people.',
    dailyRate: 350, weeklyRate: 2000, available: 4, total: 8, image: '🔊', condition: 'excellent'
  },
  {
    id: 'EQ-007', name: 'QSC KW153 Powered Speaker', category: 'sound',
    description: '15-inch 3-way powered loudspeaker. 1000W with built-in DSP processing.',
    dailyRate: 95, weeklyRate: 550, available: 12, total: 16, image: '📢', condition: 'good'
  },
  {
    id: 'EQ-008', name: 'Allen & Heath SQ-7 Mixer', category: 'sound',
    description: '48-channel digital mixer with 12 stereo mixes. Professional FOH mixing console.',
    dailyRate: 200, weeklyRate: 1200, available: 2, total: 3, image: '🎛️', condition: 'excellent'
  },
  {
    id: 'EQ-009', name: 'Shure ULX-D Wireless Mic Set', category: 'sound',
    description: 'Digital wireless microphone system with 8 channels. Includes handheld and lavalier options.',
    dailyRate: 150, weeklyRate: 900, available: 6, total: 10, image: '🎤', condition: 'excellent'
  },
  {
    id: 'EQ-010', name: 'Subwoofer QSC KS118', category: 'sound',
    description: '18-inch powered subwoofer. 3600W peak power for deep, punchy bass response.',
    dailyRate: 110, weeklyRate: 650, available: 6, total: 8, image: '🔉', condition: 'good'
  },
  {
    id: 'EQ-011', name: 'Stage Platform 4x8', category: 'staging',
    description: 'Modular stage platform with adjustable height. Non-slip surface, rated for 150 lbs/sqft.',
    dailyRate: 40, weeklyRate: 220, available: 30, total: 50, image: '🎪', condition: 'good'
  },
  {
    id: 'EQ-012', name: 'Pipe & Drape Kit', category: 'staging',
    description: 'Complete pipe and drape system with uprights, crossbars, and velour drapes.',
    dailyRate: 75, weeklyRate: 420, available: 10, total: 15, image: '🎭', condition: 'good'
  },
  {
    id: 'EQ-013', name: 'DMX Controller GrandMA2', category: 'accessories',
    description: 'Professional lighting console for complex DMX programming and show control.',
    dailyRate: 250, weeklyRate: 1500, available: 1, total: 2, image: '🎮', condition: 'excellent'
  },
  {
    id: 'EQ-014', name: 'Power Distribution Box', category: 'accessories',
    description: '200A power distribution with multiple output connectors. Essential for event power management.',
    dailyRate: 80, weeklyRate: 450, available: 5, total: 6, image: '🔌', condition: 'good'
  },
  {
    id: 'EQ-015', name: 'LED Video Wall Panel P3', category: 'lighting',
    description: 'Indoor LED video wall panel with P3 pixel pitch. Create stunning visual backdrops.',
    dailyRate: 180, weeklyRate: 1050, available: 20, total: 40, image: '📺', condition: 'excellent'
  },
];

// ---- Customer Data ----
const customerData: Customer[] = [
  { id: 'CUS-001', name: 'Maria Santos', email: 'maria@santosweddings.com', phone: '+63 917 123 4567', company: 'Santos Wedding Planners', address: 'Makati City, Metro Manila', createdAt: '2025-01-15' },
  { id: 'CUS-002', name: 'James Reyes', email: 'james@corp-events.ph', phone: '+63 928 234 5678', company: 'Corporate Events Inc.', address: 'BGC, Taguig City', createdAt: '2025-02-03' },
  { id: 'CUS-003', name: 'Angela Cruz', email: 'angela@concerts.ph', phone: '+63 939 345 6789', company: 'LiveSound Productions', address: 'Quezon City', createdAt: '2025-02-20' },
  { id: 'CUS-004', name: 'Roberto Garcia', email: 'roberto@fiestas.com', phone: '+63 917 456 7890', company: 'Garcia Fiesta Events', address: 'Pasay City', createdAt: '2025-03-10' },
  { id: 'CUS-005', name: 'Diana Mendoza', email: 'diana@glamevents.ph', phone: '+63 928 567 8901', company: 'Glam Events Studio', address: 'Ortigas, Pasig City', createdAt: '2025-03-25' },
];

// ---- Booking Data ----
const bookingData: Booking[] = [
  {
    id: 'BK-2025-001', customerId: 'CUS-001', customerName: 'Maria Santos',
    equipmentIds: ['EQ-001', 'EQ-006', 'EQ-009'], equipmentNames: ['LED Par Can 64', 'JBL SRX Line Array', 'Shure ULX-D Wireless Mic Set'],
    startDate: '2025-06-15', endDate: '2025-06-16', status: 'confirmed',
    totalCost: 1540, deposit: 770, notes: 'Wedding reception at Shangri-La. Need setup by 2PM.',
    createdAt: '2025-05-01', eventType: 'Wedding', venue: 'Shangri-La at the Fort'
  },
  {
    id: 'BK-2025-002', customerId: 'CUS-002', customerName: 'James Reyes',
    equipmentIds: ['EQ-002', 'EQ-003', 'EQ-008', 'EQ-013'], equipmentNames: ['Moving Head Spot 300W', 'LED Wash Light 18x15W', 'Allen & Heath SQ-7 Mixer', 'DMX Controller GrandMA2'],
    startDate: '2025-06-20', endDate: '2025-06-22', status: 'pending',
    totalCost: 4740, deposit: 2370, notes: 'Annual corporate gala. Full stage lighting and sound setup required.',
    createdAt: '2025-05-10', eventType: 'Corporate Event', venue: 'SMX Convention Center'
  },
  {
    id: 'BK-2025-003', customerId: 'CUS-003', customerName: 'Angela Cruz',
    equipmentIds: ['EQ-006', 'EQ-010', 'EQ-009', 'EQ-015'], equipmentNames: ['JBL SRX Line Array', 'Subwoofer QSC KS118', 'Shure ULX-D Wireless Mic Set', 'LED Video Wall Panel P3'],
    startDate: '2025-06-10', endDate: '2025-06-12', status: 'active',
    totalCost: 5260, deposit: 2630, notes: 'Concert event. Main stage PA system and LED backdrop.',
    createdAt: '2025-04-28', eventType: 'Concert', venue: 'Araneta Coliseum'
  },
  {
    id: 'BK-2025-004', customerId: 'CUS-004', customerName: 'Roberto Garcia',
    equipmentIds: ['EQ-001', 'EQ-004', 'EQ-005', 'EQ-007'], equipmentNames: ['LED Par Can 64', 'Strobe Light 3000W', 'Haze Machine Pro', 'QSC KW153 Powered Speaker'],
    startDate: '2025-06-05', endDate: '2025-06-06', status: 'completed',
    totalCost: 810, deposit: 405, notes: 'Birthday party event. Dance floor lighting and sound.',
    createdAt: '2025-04-15', eventType: 'Birthday Party', venue: 'Club Haze, Pasay'
  },
  {
    id: 'BK-2025-005', customerId: 'CUS-005', customerName: 'Diana Mendoza',
    equipmentIds: ['EQ-003', 'EQ-007', 'EQ-011', 'EQ-012'], equipmentNames: ['LED Wash Light 18x15W', 'QSC KW153 Powered Speaker', 'Stage Platform 4x8', 'Pipe & Drape Kit'],
    startDate: '2025-06-25', endDate: '2025-06-27', status: 'confirmed',
    totalCost: 1710, deposit: 855, notes: 'Fashion show event. Runway lighting and staging.',
    createdAt: '2025-05-20', eventType: 'Fashion Show', venue: 'Glorietta Activity Center'
  },
  {
    id: 'BK-2025-006', customerId: 'CUS-001', customerName: 'Maria Santos',
    equipmentIds: ['EQ-001', 'EQ-007'], equipmentNames: ['LED Par Can 64', 'QSC KW153 Powered Speaker'],
    startDate: '2025-05-20', endDate: '2025-05-21', status: 'completed',
    totalCost: 140, deposit: 70, notes: 'Intimate garden wedding.',
    createdAt: '2025-04-01', eventType: 'Wedding', venue: 'Nayong Pilipino'
  },
];

// ---- API Service ----
export const api = {
  // Equipment endpoints
  async getEquipment(): Promise<Equipment[]> {
    await delay(300);
    return [...equipmentData];
  },

  async getEquipmentById(id: string): Promise<Equipment | undefined> {
    await delay(200);
    return equipmentData.find(e => e.id === id);
  },

  async getEquipmentByCategory(category: string): Promise<Equipment[]> {
    await delay(200);
    if (category === 'all') return [...equipmentData];
    return equipmentData.filter(e => e.category === category);
  },

  // Customer endpoints
  async getCustomers(): Promise<Customer[]> {
    await delay(300);
    return [...customerData];
  },

  async addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    await delay(400);
    const newCustomer: Customer = {
      ...customer,
      id: `CUS-${String(customerData.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    customerData.push(newCustomer);
    return newCustomer;
  },

  // Booking endpoints
  async getBookings(): Promise<Booking[]> {
    await delay(300);
    return [...bookingData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getBookingById(id: string): Promise<Booking | undefined> {
    await delay(200);
    return bookingData.find(b => b.id === id);
  },

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    await delay(500);
    const newBooking: Booking = {
      ...booking,
      id: `BK-2025-${String(bookingData.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    bookingData.push(newBooking);
    // Update equipment availability
    booking.equipmentIds.forEach(eqId => {
      const eq = equipmentData.find(e => e.id === eqId);
      if (eq) eq.available = Math.max(0, eq.available - 1);
    });
    return newBooking;
  },

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | undefined> {
    await delay(300);
    const booking = bookingData.find(b => b.id === id);
    if (booking) {
      booking.status = status;
      if (status === 'completed' || status === 'cancelled') {
        booking.equipmentIds.forEach(eqId => {
          const eq = equipmentData.find(e => e.id === eqId);
          if (eq) eq.available = Math.min(eq.total, eq.available + 1);
        });
      }
    }
    return booking;
  },

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    await delay(200);
    const totalRevenue = bookingData
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.totalCost, 0);
    const availableEquipment = equipmentData.reduce((sum, e) => sum + e.available, 0);
    return {
      totalBookings: bookingData.length,
      activeRentals: bookingData.filter(b => b.status === 'active').length,
      totalRevenue,
      availableEquipment,
      pendingBookings: bookingData.filter(b => b.status === 'pending').length,
      completedBookings: bookingData.filter(b => b.status === 'completed').length,
    };
  },
};
