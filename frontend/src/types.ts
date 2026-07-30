/**
 * Shared Type Definitions for the Hotel Booking Application
 */

export interface Room {
  id: string;
  name: string;
  type: 'Single' | 'Double' | 'Suite' | 'Deluxe' | 'Presidential';
  price: number;
  capacity: number;
  imageUrl: string;
  images?: string[];
  amenities: string[];
  description: string;
  count: number; // total rooms of this type
  availabilityStatus?: 'AVAILABLE' | 'BOOKED';
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  stars: number; // 1-5
  rating: number; // 0-10
  reviewCount: number;
  imageUrl: string;
  images?: string[];
  description: string;
  amenities: string[];
  rooms: Room[];
  featured?: boolean;
  popular?: boolean;
  status: 'available' | 'disabled';
  pricePerNight?: number;
  policies?: {
    checkInTime: string;
    checkOutTime: string;
    cancellation: string;
  };
  contactDetails?: {
    phone: string;
    email: string;
  };
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomName: string;
  roomType: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  createdAt: string;
  
  // Payment Integration parameters
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partially_paid';
  paymentMethod: 'upi' | 'credit_card' | 'debit_card' | 'net_banking' | 'wallet' | 'cash_on_arrival' | 'pay_at_hotel';
  bookingSource: 'online' | 'offline';
  advancePayment: number;
  remainingBalance: number;
  customerPhone?: string;
  specialRequests?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  passwordHash?: string; // used server-side only
  
  // Expanded Authentication fields
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  username?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  status: 'active' | 'blocked';
  address?: {
    country: string;
    state: string;
    city: string;
    zipCode: string;
    fullAddress: string;
  };
  preferences?: {
    preferredRoomType?: string;
    favoriteDestinations?: string;
    travelPreferences?: string;
  };
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error';
  category: 'auth' | 'booking' | 'api' | 'system';
  userEmail: string | null;
  message: string;
  details?: string;
  timestamp: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  type: 'registration' | 'booking_confirm' | 'booking_cancel' | 'invoice_payment';
  sentAt: string;
}

export interface SearchQueryParams {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}
