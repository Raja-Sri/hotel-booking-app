import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Hotel, Room, Booking, User, SystemLog, SimulatedEmail } from '../src/types';

const DATA_DIR = path.join(process.cwd(), '.data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const HOTELS_FILE = path.join(DATA_DIR, 'hotels.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const EMAILS_FILE = path.join(DATA_DIR, 'emails.json');

// Helper to read JSON safely
function readJSON<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
}

// Helper to write JSON safely
function writeJSON<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Seed Initial Hotel Data
const INITIAL_HOTELS: Hotel[] = [
  {
    id: 'h-1',
    name: 'Park Hyatt Tokyo',
    city: 'Tokyo',
    address: '3-7-1-2 Nishi-Shinjuku, Shinjuku-ku',
    stars: 5,
    rating: 9.4,
    reviewCount: 1240,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description: 'Towering above Shinjuku’s bustling streets, Park Hyatt Tokyo occupies the top 14 floors of a 55-story tower, offering breathtaking 360-degree views of Tokyo and Mount Fuji. Immortalized in cinematic history, this legendary oasis blends quiet Swiss precision with vibrant Japanese hospitality.',
    amenities: ['Free WiFi', 'Luxury Spa', 'Indoor Pool', 'Skyline Bar', 'Fitness Center', 'Michelin Star Dining', '24h Concierge'],
    rooms: [
      {
        id: 'r-1-1',
        name: 'Deluxe King Room',
        type: 'Deluxe',
        price: 450,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        amenities: ['King Bed', 'City View', 'Deep Tub', 'Nespresso', 'Bose Sound System'],
        description: 'Vast 55-sqm room featuring deep-green hued granite bathroom, walk-in closets, and rich wood craftsmanship.',
        count: 10
      },
      {
        id: 'r-1-2',
        name: 'Park Suite',
        type: 'Suite',
        price: 950,
        capacity: 3,
        imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
        amenities: ['1 King Bed', 'Separate Living Room', 'Panoramic Mt. Fuji View', 'Premium Spa Toiletries', 'Complimentary Evening Cocktails'],
        description: 'An elegant 100-sqm suite framing spectacular views of the Tokyo metropolis with custom-designed art.',
        count: 5
      }
    ],
    featured: true,
    popular: true,
    status: 'available',
    pricePerNight: 450,
    policies: {
      checkInTime: '15:00',
      checkOutTime: '11:00',
      cancellation: 'Free cancellation up to 24h before arrival'
    },
    contactDetails: {
      phone: '+81 3-5322-1234',
      email: 'tokyo.park@hyatt.com'
    },
    state: 'Tokyo Prefecture',
    country: 'Japan',
    zipCode: '163-1055'
  },
  {
    id: 'h-2',
    name: 'Sotetsu Fresa Inn Tokyo-Toyocho',
    city: 'Tokyo',
    address: '4-4-3 Toyo, Koto-ku',
    stars: 3,
    rating: 8.2,
    reviewCount: 520,
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    description: 'Offering exceptional functional comfort in Eastern Tokyo, this accommodation is located a mere 1-minute walk from Toyocho Subway Station. Perfectly streamlined for modern business and leisure travelers who seek clean efficiency and smooth metro connectivity.',
    amenities: ['Free WiFi', 'Air Conditioning', 'Self Check-in Kiosks', 'Laundry Facilities', '24h Front Desk', 'Convenience Store Nearby'],
    rooms: [
      {
        id: 'r-2-1',
        name: 'Standard Single Room',
        type: 'Single',
        price: 95,
        capacity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        amenities: ['Single Bed', 'High-Speed LAN', 'Work Desk', 'Humidifier', 'Pyjamas Included'],
        description: 'Compact, immaculately clean 12-sqm room with micro-spaced workspace and full private bath ensuite.',
        count: 25
      },
      {
        id: 'r-2-2',
        name: 'Double Room',
        type: 'Double',
        price: 130,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        amenities: ['Double Bed', 'Flat-screen TV', 'Mini Fridge', 'Air Purifier'],
        description: 'Comfortable 16-sqm layout suited for couples or solo guests seeking double space.',
        count: 15
      }
    ],
    featured: false,
    popular: true,
    status: 'available',
    pricePerNight: 95,
    policies: {
      checkInTime: '15:00',
      checkOutTime: '10:00',
      cancellation: 'Non-refundable rate'
    },
    contactDetails: {
      phone: '+81 3-3647-2031',
      email: 'fresa_toyocho@sotetsu-group.jp'
    },
    state: 'Koto City',
    country: 'Japan',
    zipCode: '135-0016'
  },
  {
    id: 'h-3',
    name: 'Le Bristol Paris',
    city: 'Paris',
    address: '112 Rue du Faubourg Saint-Honoré, 75008',
    stars: 5,
    rating: 9.7,
    reviewCount: 980,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    description: 'A genuine masterpiece of French art de vivre, Le Bristol Paris is an exquisite palace hotel located on the prestigious Rue du Faubourg Saint-Honoré. Highlighted by its magnificent 1,200-sqm private garden and a yacht-style indoor pool overlooking Sacré-Cœur.',
    amenities: ['Free WiFi', 'Michelin 3-Star Dining', 'French Palace Garden', 'Spa Le Bristol', 'Indoor Rooftop Pool', 'Pet Friendly', 'Valet Parking'],
    rooms: [
      {
        id: 'r-3-1',
        name: 'Deluxe Double Room',
        type: 'Double',
        price: 880,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        amenities: ['Queen Bed', 'Chic Louis XV Decor', 'Italian Marble Bath', 'Garden View', 'Complimentary Macarons'],
        description: 'Elegant 45-sqm room featuring period furnishings, original master paintings, and beautiful high ceilings.',
        count: 8
      },
      {
        id: 'r-3-2',
        name: 'Prestige Suite',
        type: 'Suite',
        price: 1800,
        capacity: 3,
        imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
        amenities: ['King Bed', 'Double Vanity Bath', 'Separate Salon', 'Privilege Chauffeur Service', '24/7 Personal Butler'],
        description: 'Sprawling 80-sqm palace apartment containing customized silk wall draperies and historical antique fireplace.',
        count: 4
      }
    ],
    featured: true,
    popular: true,
    status: 'available',
    pricePerNight: 880,
    policies: {
      checkInTime: '15:00',
      checkOutTime: '12:00',
      cancellation: 'Free cancellation up to 48h prior'
    },
    contactDetails: {
      phone: '+33 1 53 43 43 00',
      email: 'reservation.lebristolparis@oetkercollection.com'
    },
    state: 'Île-de-France',
    country: 'France',
    zipCode: '75008'
  },
  {
    id: 'h-4',
    name: 'Hotel de Neuve by Happyculture',
    city: 'Paris',
    address: '14 Rue Neuve Saint-Pierre, 75004',
    stars: 3,
    rating: 8.0,
    reviewCount: 310,
    imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    description: 'Located in the romantic heart of Le Marais district, Hotel de Neuve is a cheerful, stylish boutique establishment. Just steps from Place de la Bastille and the River Seine, it offers high-spirited design and authentic Parisian neighborhood vibes.',
    amenities: ['Free WiFi', 'Boutique Coffee Station', 'Lobby Lounge', 'Luggage Storage', 'Concierge Tour Services'],
    rooms: [
      {
        id: 'r-4-1',
        name: 'Cozy Single Room',
        type: 'Single',
        price: 120,
        capacity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        amenities: ['Single bed', 'Retro Lighting', 'Bluetooth Speaker', 'Ensuite Shower'],
        description: 'Charming 11-sqm urban cocoon styled with contemporary wallpapers and custom colorful accents.',
        count: 12
      },
      {
        id: 'r-4-2',
        name: 'Classic Double',
        type: 'Double',
        price: 165,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        amenities: ['Double Bed', 'Quiet Courtyard View', 'Espresso Machine'],
        description: 'Brilliant 15-sqm room combining warm pastel palettes with modern bathroom conveniences.',
        count: 10
      }
    ],
    featured: false,
    popular: false,
    status: 'available',
    pricePerNight: 120,
    policies: {
      checkInTime: '14:00',
      checkOutTime: '11:00',
      cancellation: 'Free cancellation up to 24h prior'
    },
    contactDetails: {
      phone: '+33 1 44 49 19 20',
      email: 'de_neuve@happyculture.com'
    },
    state: 'Île-de-France',
    country: 'France',
    zipCode: '75004'
  }
];

// Seed databases if files don't exist
if (!fs.existsSync(HOTELS_FILE)) {
  writeJSON(HOTELS_FILE, INITIAL_HOTELS);
}
if (!fs.existsSync(USERS_FILE)) {
  writeJSON(USERS_FILE, []);
}
if (!fs.existsSync(BOOKINGS_FILE)) {
  writeJSON(BOOKINGS_FILE, []);
}
if (!fs.existsSync(LOGS_FILE)) {
  writeJSON(LOGS_FILE, []);
}
if (!fs.existsSync(EMAILS_FILE)) {
  writeJSON(EMAILS_FILE, []);
}

// Guarantee Seed Admin & Standard User Accounts right away
const initialUsers = readJSON<User[]>(USERS_FILE, []);
let hasChanges = false;
if (!initialUsers.some(u => u.email.toLowerCase() === 'admin@stayvibe.com')) {
  const adminHash = crypto.createHash('sha256').update('admin123').digest('hex');
  initialUsers.push({
    id: 'usr-admin-default',
    email: 'admin@stayvibe.com',
    name: 'StayVibe Master Admin',
    createdAt: new Date().toISOString(),
    passwordHash: adminHash,
    role: 'ROLE_ADMIN',
    username: 'admin',
    phone: '+1 555-019-2834',
    gender: 'male',
    dob: '1985-06-15',
    status: 'active',
    address: {
      country: 'United States',
      state: 'New York',
      city: 'New York',
      zipCode: '10019',
      fullAddress: '768 Fifth Ave, Admin Wing 4B'
    }
  });
  hasChanges = true;
}

if (!initialUsers.some(u => u.email.toLowerCase() === 'user@stayvibe.com')) {
  const userHash = crypto.createHash('sha256').update('user123').digest('hex');
  initialUsers.push({
    id: 'usr-standard-default',
    email: 'user@stayvibe.com',
    name: 'Pujitha Pullamsetty',
    createdAt: new Date().toISOString(),
    passwordHash: userHash,
    role: 'ROLE_USER',
    username: 'pujithap',
    phone: '+1 650-253-0000',
    gender: 'female',
    dob: '1998-11-22',
    status: 'active',
    address: {
      country: 'United States',
      state: 'California',
      city: 'Mountain View',
      zipCode: '94043',
      fullAddress: '1600 Amphitheatre Pkwy'
    },
    preferences: {
      preferredRoomType: 'Suite',
      favoriteDestinations: 'Tokyo, Paris',
      travelPreferences: 'WiFi, Skyline View, Luxury Lounge access'
    }
  });
  hasChanges = true;
}

if (hasChanges) {
  writeJSON(USERS_FILE, initialUsers);
}

// System Logger Helper
export function logSystemAction(
  level: 'info' | 'warn' | 'error',
  category: 'auth' | 'booking' | 'api' | 'system',
  userEmail: string | null,
  message: string,
  details?: string
): void {
  const logs = readJSON<SystemLog[]>(LOGS_FILE, []);
  const newLog: SystemLog = {
    id: `log-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    level,
    category,
    userEmail,
    message,
    details,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  writeJSON(LOGS_FILE, logs.slice(0, 500));
}

// Send Simulated Email Helper
export function sendSimulatedEmail(
  to: string,
  subject: string,
  body: string,
  type: 'registration' | 'booking_confirm' | 'booking_cancel' | 'invoice_payment'
): void {
  const emails = readJSON<SimulatedEmail[]>(EMAILS_FILE, []);
  const newEmail: SimulatedEmail = {
    id: `email-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    to,
    subject,
    body,
    type,
    sentAt: new Date().toISOString()
  };
  emails.unshift(newEmail);
  writeJSON(EMAILS_FILE, emails.slice(0, 100));

  logSystemAction(
    'info',
    'system',
    to,
    `Email Sent: ${subject}`,
    `Subject: ${subject}\n\nContents:\n${body}`
  );
}

function datesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();
  return sA < eB && sB < eA;
}

export class Database {
  // ---- USERS SECTOR ----
  static getUsers(): User[] {
    return readJSON<User[]>(USERS_FILE, []);
  }

  static findUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static registerUser(extendedData: {
    name: string;
    email: string;
    passwordPlain: string;
    username?: string;
    phone?: string;
    gender?: 'male' | 'female' | 'other';
    dob?: string;
    address?: {
      country: string;
      state: string;
      city: string;
      zipCode: string;
      fullAddress: string;
    };
    role?: 'ROLE_USER' | 'ROLE_ADMIN';
    preferences?: {
      preferredRoomType?: string;
      favoriteDestinations?: string;
      travelPreferences?: string;
    };
  }): User {
    const users = this.getUsers();
    const normalizedEmail = extendedData.email.toLowerCase().trim();

    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error(`Email ${extendedData.email} is already registered.`);
    }

    const passwordHash = crypto.createHash('sha256').update(extendedData.passwordPlain).digest('hex');
    const newUser: User = {
      id: `usr-${crypto.randomBytes(8).toString('hex')}`,
      name: extendedData.name.trim(),
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
      passwordHash,
      role: extendedData.role || 'ROLE_USER',
      username: extendedData.username || normalizedEmail.split('@')[0],
      phone: extendedData.phone || '',
      gender: extendedData.gender || 'other',
      dob: extendedData.dob || '',
      status: 'active',
      address: extendedData.address || {
        country: '',
        state: '',
        city: '',
        zipCode: '',
        fullAddress: ''
      },
      preferences: extendedData.preferences || {}
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);

    logSystemAction('info', 'auth', normalizedEmail, `Registered new account: ${newUser.name} with role ${newUser.role}`);

    // Welcome registration email
    sendSimulatedEmail(
      normalizedEmail,
      'Welcome to StayVibe Luxury Hotels - Let the Vibe Guide You!',
      `Dear ${newUser.name},\n\nWe are absolutely delighted to welcome you to the StayVibe family of luxury hotel collections!\n\nYour profile has been created with the username: "${newUser.username}". You can log in securely and plan journeys, complete real-time pre-payments, and track active room vouchers at any moment.\n\nWarmest regards,\nThe StayVibe Concierge Team`,
      'registration'
    );

    const { passwordHash: _, ...userSafe } = newUser;
    return userSafe;
  }

  static authenticateUser(email: string, passwordPlain: string): User {
    const normalizedEmail = email.toLowerCase().trim();
    const user = this.getUsers().find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      logSystemAction('warn', 'auth', normalizedEmail, `Auth failed: Invalid credentials`);
      throw new Error('Invalid email or password.');
    }

    if (user.status === 'blocked') {
      logSystemAction('warn', 'auth', normalizedEmail, `Access denied: User account is blocked by Admin`);
      throw new Error('This user account has been suspended by system administrators.');
    }

    const passwordHash = crypto.createHash('sha256').update(passwordPlain).digest('hex');
    if (user.passwordHash !== passwordHash) {
      logSystemAction('warn', 'auth', normalizedEmail, `Auth failed: Password mismatch`);
      throw new Error('Invalid email or password.');
    }

    logSystemAction('info', 'auth', normalizedEmail, `Successfully authenticated session as ${user.role}`);
    const { passwordHash: _, ...userSafe } = user;
    return userSafe;
  }

  static updateUserStatus(userId: string, status: 'active' | 'blocked'): User {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found.');
    users[idx].status = status;
    writeJSON(USERS_FILE, users);
    
    logSystemAction('info', 'system', null, `User '${users[idx].email}' status set to '${status}'`);
    return users[idx];
  }

  static deleteUser(userId: string): void {
    const users = this.getUsers();
    const removed = users.filter(u => u.id !== userId);
    writeJSON(USERS_FILE, removed);
    logSystemAction('info', 'system', null, `Deleted user ID: ${userId}`);
  }

  static updateUserRole(userId: string, role: 'ROLE_USER' | 'ROLE_ADMIN'): User {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found.');
    users[idx].role = role;
    writeJSON(USERS_FILE, users);
    
    logSystemAction('info', 'system', null, `User role set to '${role}' for ${users[idx].email}`);
    return users[idx];
  }

  // ---- HOTELS & ROOM SECTORS ----
  static getHotels(): Hotel[] {
    const hotels = readJSON<Hotel[]>(HOTELS_FILE, INITIAL_HOTELS);
    // Backward compatibility mappings
    return hotels.map(h => ({
      ...h,
      status: h.status || 'available',
      pricePerNight: h.pricePerNight || (h.rooms && h.rooms.length ? Math.min(...h.rooms.map(r => r.price)) : 100),
      state: h.state || '',
      country: h.country || 'France',
      zipCode: h.zipCode || '',
      policies: h.policies || {
        checkInTime: '15:00',
        checkOutTime: '11:00',
        cancellation: 'Free cancellation up to 24h prior'
      },
      contactDetails: h.contactDetails || {
        phone: h.id === 'h-1' ? '+81 3-5322-1234' : '+33 1 44 49 19 20',
        email: 'reservations@stayvibe.com'
      }
    }));
  }

  static getHotelById(id: string): Hotel | undefined {
    return this.getHotels().find(h => h.id === id);
  }

  static addHotel(hotelData: Omit<Hotel, 'id'>): Hotel {
    const hotels = this.getHotels();
    const newId = `h-${Date.now()}`;
    const newHotel: Hotel = {
      ...hotelData,
      id: newId,
      status: hotelData.status || 'available'
    };
    hotels.push(newHotel);
    writeJSON(HOTELS_FILE, hotels);
    logSystemAction('info', 'system', null, `Admin created new hotel property: ${newHotel.name}`);
    return newHotel;
  }

  static updateHotel(id: string, updatedFields: Partial<Hotel>): Hotel {
    const hotels = this.getHotels();
    const idx = hotels.findIndex(h => h.id === id);
    if (idx === -1) throw new Error(`Property ${id} not found.`);
    
    const updatedHotel: Hotel = {
      ...hotels[idx],
      ...updatedFields,
      id // preserve ID
    };
    hotels[idx] = updatedHotel;
    writeJSON(HOTELS_FILE, hotels);
    logSystemAction('info', 'system', null, `Admin modified hotel property: ${updatedHotel.name}`);
    return updatedHotel;
  }

  static deleteHotel(id: string, permanent: boolean = false): void {
    const hotels = this.getHotels();
    if (permanent) {
      const filtered = hotels.filter(h => h.id !== id);
      writeJSON(HOTELS_FILE, filtered);
      logSystemAction('info', 'system', null, `Admin permanently removed hotel Property ID: ${id}`);
    } else {
      // Soft disable
      this.updateHotel(id, { status: 'disabled' });
      logSystemAction('info', 'system', null, `Admin soft-disabled hotel property ID: ${id}`);
    }
  }

  static searchHotels(city: string, checkIn: string, checkOut: string, guestsRequested: number): Hotel[] {
    const hotels = this.getHotels().filter(h => h.status !== 'disabled');
    const bookings = readJSON<Booking[]>(BOOKINGS_FILE, []);

    let filtered = hotels;
    if (city && city.trim().length > 0) {
      const q = city.toLowerCase().trim();
      filtered = hotels.filter(h => h.city.toLowerCase().includes(q) || h.name.toLowerCase().includes(q));
    }

    return filtered.map(hotel => {
      const matchedRooms = hotel.rooms.filter(room => {
        if (room.capacity < guestsRequested) {
          return false;
        }

        if (checkIn && checkOut) {
          const activeOverlappingBookings = bookings.filter(b => 
            b.hotelId === hotel.id &&
            b.roomId === room.id &&
            b.status === 'confirmed' &&
            datesOverlap(checkIn, checkOut, b.checkIn, b.checkOut)
          );

          const occupiedCount = activeOverlappingBookings.length;
          return occupiedCount < room.count;
        }

        return true;
      });

      return {
        ...hotel,
        rooms: matchedRooms
      };
    }).filter(hotel => hotel.rooms.length > 0);
  }

  // ---- BOOKINGS SECTOR & OFFLINE ENGINE ----
  static getBookings(): Booking[] {
    const bookings = readJSON<Booking[]>(BOOKINGS_FILE, []);
    // Backwards compatibility mappings
    return bookings.map(b => ({
      ...b,
      paymentStatus: b.paymentStatus || 'paid',
      paymentMethod: b.paymentMethod || 'credit_card',
      bookingSource: b.bookingSource || 'online',
      advancePayment: b.advancePayment !== undefined ? b.advancePayment : b.totalPrice,
      remainingBalance: b.remainingBalance !== undefined ? b.remainingBalance : 0,
    }));
  }

  static getUserBookings(userId: string): Booking[] {
    return this.getBookings().filter(b => b.userId === userId);
  }

  static createBooking(bookingParams: {
    userId: string;
    userEmail: string;
    userName: string;
    hotelId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    paymentMethod: Booking['paymentMethod'];
    paymentStatus?: Booking['paymentStatus'];
    bookingSource?: Booking['bookingSource'];
    advancePayment?: number;
    customerPhone?: string;
    specialRequests?: string;
  }): Booking {
    const bookings = this.getBookings();
    
    const hotel = this.getHotelById(bookingParams.hotelId);
    if (!hotel) {
      throw new Error('Selected hotel not found');
    }

    const room = hotel.rooms.find(r => r.id === bookingParams.roomId);
    if (!room) {
      throw new Error('Selected room type not found');
    }

    if (bookingParams.guests > room.capacity) {
      throw new Error(`Occupancy limit exceeded. Max guests for ${room.name} is ${room.capacity}.`);
    }

    const checkInDate = new Date(bookingParams.checkIn);
    const checkOutDate = new Date(bookingParams.checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new Error('Check-in and Check-out dates must be valid.');
    }

    if (checkOutDate <= checkInDate) {
      throw new Error('Check-out date must be after check-in date.');
    }

    // Availability validation check
    const activeOverlappingBookings = bookings.filter(b => 
      b.hotelId === bookingParams.hotelId &&
      b.roomId === bookingParams.roomId &&
      b.status === 'confirmed' &&
      datesOverlap(bookingParams.checkIn, bookingParams.checkOut, b.checkIn, b.checkOut)
    );

    if (activeOverlappingBookings.length >= room.count) {
      throw new Error('The room type has reached its booking capacity for the selected dates.');
    }

    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = nights * room.price;

    const source = bookingParams.bookingSource || 'online';
    const finalAdvance = bookingParams.advancePayment !== undefined ? bookingParams.advancePayment : totalPrice;
    const finalRemaining = Math.max(0, totalPrice - finalAdvance);
    
    // Status depends on payment method
    let paymentStatus: Booking['paymentStatus'] = bookingParams.paymentStatus || 'paid';
    if (bookingParams.paymentMethod === 'cash_on_arrival' || bookingParams.paymentMethod === 'pay_at_hotel') {
      paymentStatus = 'pending';
    } else if (finalRemaining > 0 && finalAdvance > 0) {
      paymentStatus = 'partially_paid';
    }

    const newBooking: Booking = {
      id: `res-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
      userId: bookingParams.userId,
      userEmail: bookingParams.userEmail.toLowerCase().trim(),
      userName: bookingParams.userName,
      hotelId: bookingParams.hotelId,
      hotelName: hotel.name,
      roomId: bookingParams.roomId,
      roomName: room.name,
      roomType: room.type,
      checkIn: bookingParams.checkIn,
      checkOut: bookingParams.checkOut,
      guests: bookingParams.guests,
      totalPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      
      paymentStatus,
      paymentMethod: bookingParams.paymentMethod,
      bookingSource: source,
      advancePayment: finalAdvance,
      remainingBalance: finalRemaining,
      customerPhone: bookingParams.customerPhone || '',
      specialRequests: bookingParams.specialRequests || ''
    };

    bookings.push(newBooking);
    writeJSON(BOOKINGS_FILE, bookings);

    logSystemAction(
      'info',
      'booking',
      bookingParams.userEmail,
      `Success booked room via ${source}. Conf#: ${newBooking.id}`,
      `Total: $${totalPrice}, Paid: $${finalAdvance}`
    );

    // Simulated email confirmation invoice
    sendSimulatedEmail(
      newBooking.userEmail,
      `StayVibe Reservation Confirmation ${newBooking.id} at ${hotel.name}`,
      `Dear ${newBooking.userName},\n\nWe are high-spirited to confirm your reservation!\n\n========================================\nINVOICE DETAILS & VOUCHER INFORMATION\n========================================\nBooking Reference: ${newBooking.id}\nHotel: ${hotel.name}\nAddress: ${hotel.address}\nBooking Source: ${source.toUpperCase()}\nRoom: ${room.name} (${room.type})\nCheck In: ${bookingParams.checkIn}\nCheck Out: ${bookingParams.checkOut}\nOccupants: ${bookingParams.guests} guest(s)\n\nFINANCIAL TRANSACTION LEDGER:\nNightly Suite Rate: $${room.price}\nNights Stayed: ${nights}\nSubtotal Price: $${totalPrice}\nTaxes & Surcharges: Inclusive\nTotal Balance: $${totalPrice}\n\nAmount Pre-paid: $${finalAdvance} via [${bookingParams.paymentMethod.toUpperCase()}]\nRemaining Balance Due At Desk: $${finalRemaining}\nPayment Status: ${paymentStatus.toUpperCase()}\n========================================\n\nShow this email confirmation voucher at arrival. We hope you enjoy absolute serenity with StayVibe!\n\nWarm regards,\nThe StayVibe Automated Concierge`,
      'booking_confirm'
    );

    return newBooking;
  }

  static updateBookingStatus(bookingId: string, status: Booking['status'], paymentStatus?: Booking['paymentStatus']): Booking {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) throw new Error('Booking not found');
    
    bookings[idx].status = status;
    if (paymentStatus) {
      bookings[idx].paymentStatus = paymentStatus;
    }
    
    writeJSON(BOOKINGS_FILE, bookings);
    logSystemAction('info', 'booking', bookings[idx].userEmail, `Admin updated booking ${bookingId} to status=${status}, paymentStatus=${bookings[idx].paymentStatus}`);
    
    if (status === 'cancelled') {
      sendSimulatedEmail(
        bookings[idx].userEmail,
        `Cancellation Notification: Ref: ${bookingId}`,
        `Dear ${bookings[idx].userName},\n\nYour room booking ${bookingId} at ${bookings[idx].hotelName} has been cancelled by the property administrator.\n\nA transaction refund of $${bookings[idx].advancePayment} has been initiated back to your payment origin. If you have any questions, contact support reference desk.\n\nWarm regards,\nThe StayVibe Office`,
        'booking_cancel'
      );
    }
    return bookings[idx];
  }

  static modifyBookingDates(bookingId: string, checkIn: string, checkOut: string, guests: number): Booking {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) throw new Error('Booking record not found');
    
    // Check hotel vacancy overlap
    const hotelId = bookings[idx].hotelId;
    const roomId = bookings[idx].roomId;
    
    // Calculate new total price
    const hotel = this.getHotelById(hotelId);
    if (!hotel) throw new Error('Associated property not found');
    const room = hotel.rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Associated room not found');
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    const newPrice = nights * room.price;
    
    bookings[idx].checkIn = checkIn;
    bookings[idx].checkOut = checkOut;
    bookings[idx].guests = guests;
    bookings[idx].totalPrice = newPrice;
    bookings[idx].remainingBalance = Math.max(0, newPrice - bookings[idx].advancePayment);
    
    writeJSON(BOOKINGS_FILE, bookings);
    logSystemAction('info', 'booking', bookings[idx].userEmail, `Admin rescheduled booking ${bookingId} to checkIn=${checkIn}, checkOut=${checkOut}, price=${newPrice}`);
    return bookings[idx];
  }

  static cancelBooking(bookingId: string, userEmail: string): Booking {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);

    if (idx === -1) {
      throw new Error('Booking not found');
    }

    const booking = bookings[idx];
    
    // Auth bypass for ADMIN roles
    const users = this.getUsers();
    const cancellingUser = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
    const isAdmin = cancellingUser && cancellingUser.role === 'ROLE_ADMIN';
    
    if (!isAdmin && booking.userEmail.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error('Unauthorized cancellation permissions');
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    bookings[idx] = booking;
    writeJSON(BOOKINGS_FILE, bookings);

    logSystemAction(
      'info',
      'booking',
      userEmail,
      `Success: Cancelled Booking ${bookingId} with refund.`
    );

    sendSimulatedEmail(
      booking.userEmail,
      `Cancellation Confirmed - Vibe Record Ref: ${bookingId}`,
      `This email confirms that absolute cancellation transaction has successfully registered on booking ID ${bookingId}.\n\nYour refund value of $${booking.advancePayment} has been processed.\n\nThank you,\nStayVibe Office`,
      'booking_cancel'
    );

    return booking;
  }

  // ---- INTEL ANALYTICS & REPORTS GENERATION ----
  static getAdminStats() {
    const hotels = this.getHotels();
    const bookings = this.getBookings();
    const users = this.getUsers();

    const totalHotels = hotels.length;
    const totalUsers = users.length;
    const totalBookingsCount = bookings.length;

    const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    // Revenue computations
    const confirmedBookingsList = bookings.filter(b => b.status === 'confirmed');
    const totalRevenue = confirmedBookingsList.reduce((acc, b) => acc + b.advancePayment, 0);
    const projectionRemainingRevenue = confirmedBookingsList.reduce((acc, b) => acc + b.remainingBalance, 0);

    // Count rooms
    let totalRoomsCount = 0;
    hotels.forEach(h => {
      h.rooms.forEach(r => {
        totalRoomsCount += r.count;
      });
    });

    // Simulated occupancy rate (active confirmed bookings * 2 nights average / total capacity)
    const activeRoomsOccupiedCount = confirmedBookingsList.length; // simplified
    const occupancyRatePercent = totalRoomsCount > 0 
      ? Math.round(Math.min(100, (activeRoomsOccupiedCount / totalRoomsCount) * 100)) 
      : 0;

    // Monthly revenue simulation groups
    const monthlyRevenue = [
      { month: 'Jan', revenue: Math.round(totalRevenue * 0.1) },
      { month: 'Feb', revenue: Math.round(totalRevenue * 0.12) },
      { month: 'Mar', revenue: Math.round(totalRevenue * 0.15) },
      { month: 'Apr', revenue: Math.round(totalRevenue * 0.23) },
      { month: 'May', revenue: Math.round(totalRevenue * 0.3) },
      { month: 'Jun', revenue: Math.round(totalRevenue * 0.1) },
    ];

    // Popular hotels performance overview
    const hotelPerformance = hotels.map(h => {
      const hBookings = bookings.filter(b => b.hotelId === h.id && b.status === 'confirmed');
      const rev = hBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      return {
        id: h.id,
        name: h.name,
        city: h.city,
        bookingsCount: hBookings.length,
        revenue: rev,
        stars: h.stars
      };
    }).sort((a,b) => b.revenue - a.revenue);

    return {
      totalHotels,
      totalRooms: totalRoomsCount,
      totalUsers,
      totalBookings: totalBookingsCount,
      activeBookings,
      cancelledBookings,
      totalRevenue,
      projectionRemainingRevenue,
      occupancyRatePercent,
      monthlyRevenue,
      hotelPerformance
    };
  }

  static getLogs(): SystemLog[] {
    return readJSON<SystemLog[]>(LOGS_FILE, []);
  }

  static getEmailsByRecipient(email: string): SimulatedEmail[] {
    const emails = readJSON<SimulatedEmail[]>(EMAILS_FILE, []);
    return emails.filter(e => e.to.toLowerCase() === email.toLowerCase());
  }

  static getPublicEmails(): SimulatedEmail[] {
    return readJSON<SimulatedEmail[]>(EMAILS_FILE, []);
  }
}
