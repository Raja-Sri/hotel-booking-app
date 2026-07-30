import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Check, 
  X, 
  Terminal, 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Trash2,
  Lock,
  ChevronRight,
  Eye,
  Info,
  CreditCard,
  Percent,
  Sliders,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import Header from './components/Header';
import AdminPortal from './components/AdminPortal';
import HotelDetailView from './components/HotelDetailView';
import { Hotel, Room, Booking, User, SystemLog, SimulatedEmail } from './types';
import { ensureArray, getAuthHeaders, setToken } from './api/client';
import { mapHotelFromApi } from './api/mappers';
import { normalizePhoneInput, validatePhone } from './utils/phoneValidation';

export default function App() {
  // ---- STATE REGISTRY ----
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('stayvibe_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'explore' | 'bookings' | 'admin'>('explore');
  const [loginType, setLoginType] = useState<'customer' | 'admin'>('customer');
  const [landingView, setLandingView] = useState<'login' | 'register'>('login');

  // Search Parameters
  const [searchCity, setSearchCity] = useState('');
  const [checkIn, setCheckIn] = useState('2026-06-12');
  const [checkOut, setCheckOut] = useState('2026-06-15');
  const [guests, setGuests] = useState(2);

  // Sidebar Filter States
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);
  const [filterStars, setFilterStars] = useState<number | null>(null);
  const [filterMaxPrice, setFilterMaxPrice] = useState<number>(2000);

  // Hotel and Reservation Lists
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Loading and Notification States
  const [searchLoading, setSearchLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);

  // Unified Checkout / Gateway States
  const [showCheckoutModal, setShowCheckoutModal] = useState<Room | null>(null);
  const [payMethod, setPayMethod] = useState<'credit_card' | 'upi' | 'pay_at_hotel' | 'cash_on_arrival'>('credit_card');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [advanceChoice, setAdvanceChoice] = useState<'full' | 'partial_50' | 'pay_later'>('full');
  
  // Coupons & Promo rates
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromoPercent, setAppliedPromoPercent] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  // Extended Auth Dialog registration parameters
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
  const [authStep, setAuthStep] = useState<1 | 2 | 3>(1); // Step tracker for registration profiles

  // Auth fields
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authGender, setAuthGender] = useState<'male' | 'female' | 'other'>('male');
  const [authDob, setAuthDob] = useState('');
  
  const [authAddress, setAuthAddress] = useState('');
  const [authCity, setAuthCity] = useState('');
  const [authState, setAuthState] = useState('');
  const [authZip, setAuthZip] = useState('');
  const [authCountry, setAuthCountry] = useState('United States');

  const [authPrefRoom, setAuthPrefRoom] = useState('Non-smoking high floors');
  const [authPrefVibe, setAuthPrefVibe] = useState('Eco Luxe Relaxation');

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Diagnostic Logs & Simulated Emails States
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [showLogsPanel, setShowLogsPanel] = useState(false);
  const [showEmailsPanel, setShowEmailsPanel] = useState(false);
  const [lastEmailCount, setLastEmailCount] = useState<number>(0);
  const [unreadEmailCount, setUnreadEmailCount] = useState<number>(0);

  // Premium Custom Alert & Confirm Modal state
  const [customModal, setCustomModal] = useState<{
    type: 'alert' | 'confirm';
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showCustomConfirm = (message: string, onConfirm: () => void) => {
    setCustomModal({
      type: 'confirm',
      title: 'Action Confirmation required',
      message,
      onConfirm: () => {
        setCustomModal(null);
        onConfirm();
      },
      onCancel: () => {
        setCustomModal(null);
      }
    });
  };

  const showCustomAlert = (message: string, onOk?: () => void) => {
    setCustomModal({
      type: 'alert',
      title: 'Success Notification',
      message,
      onConfirm: () => {
        setCustomModal(null);
        if (onOk) onOk();
      }
    });
  };

  // Trigger searching on mount or parameters change
  useEffect(() => {
    fetchHotels();
  }, [searchCity, checkIn, checkOut, guests]);

  // Refresh room availability when stay dates change on the detail view
  useEffect(() => {
    if (selectedHotel) {
      loadHotelDetail(selectedHotel);
    }
  }, [checkIn, checkOut, selectedHotel?.id]);

  // Fetch bookings if user is active
  useEffect(() => {
    if (currentUser) {
      fetchMyBookings();
    } else {
      setMyBookings([]);
    }
  }, [currentUser]);

  // Poll system logs and simulated emails for debugging visibility
  useEffect(() => {
    fetchLogs();
    fetchEmails();
    const interval = setInterval(() => {
      fetchLogs();
      fetchEmails();
    }, 4500);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Increment unread count when new emails arrive
  useEffect(() => {
    if (emails.length > lastEmailCount) {
      const arrivedCount = emails.length - lastEmailCount;
      if (!showEmailsPanel) {
        setUnreadEmailCount(prev => prev + arrivedCount);
      }
      setLastEmailCount(emails.length);
    }
  }, [emails, lastEmailCount, showEmailsPanel]);

  // Reset email notification counts if opened
  useEffect(() => {
    if (showEmailsPanel) {
      setUnreadEmailCount(0);
    }
  }, [showEmailsPanel]);

  // ---- API METHODS ----
  const fetchHotels = async () => {
    setSearchLoading(true);

    try {
      const params = new URLSearchParams({
        city: searchCity,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: guests.toString()
      });

      const response = await fetch(`/api/hotels?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        const list = ensureArray(data.hotels).map((h) =>
          mapHotelFromApi(h as Record<string, unknown>)
        );
        setHotels(list);
      } else {
        setHotels([]);
      }
    } catch (err) {
      console.error("Error searching hotels:", err);
      setHotels([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadHotelDetail = async (hotel: Hotel) => {
    try {
      const params = new URLSearchParams();
      if (checkIn) params.set('checkIn', checkIn);
      if (checkOut) params.set('checkOut', checkOut);
      const query = params.toString() ? `?${params.toString()}` : '';

      const response = await fetch(`/api/hotels/${hotel.id}${query}`);
      const data = await response.json();
      if (response.ok && data.hotel) {
        setSelectedHotel(mapHotelFromApi(data.hotel as Record<string, unknown>));
      } else {
        setSelectedHotel(hotel);
      }
    } catch {
      setSelectedHotel(hotel);
    }
  };

  const fetchMyBookings = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/bookings/my?userId=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setMyBookings(ensureArray(data.bookings));
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/logs?_t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const fetchEmails = async () => {
    const emailQueryBase = currentUser ? `recipient=${encodeURIComponent(currentUser.email)}` : '';
    const emailQuery = emailQueryBase ? `?${emailQueryBase}&_t=${Date.now()}` : `?_t=${Date.now()}`;
    try {
      const response = await fetch(`/api/emails${emailQuery}`);
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails);
      }
    } catch (err) {
      console.error('Error fetching email archive:', err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!authName.trim()) {
      setAuthError('Please enter full professional name.');
      return;
    }
    if (!authEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Password must contain at least 6 characters.');
      return;
    }

    const normalizedPhone = normalizePhoneInput(authPhone);
    const phoneError = validatePhone(authPhone);
    if (phoneError) {
      setAuthError(phoneError);
      return;
    }

    const payload = {
      name: authName,
      email: authEmail,
      password: authPassword,
      username: authUsername || authEmail.split('@')[0],
      phone: normalizedPhone,
      gender: authGender,
      dob: authDob,
      role: 'ROLE_USER', // Standard registry
      status: 'active',
      address: {
        country: authCountry,
        state: authState,
        city: authCity,
        zipCode: authZip,
        fullAddress: authAddress || `${authCity}, ${authState}`
      },
      preferences: {
        preferredRoomType: authPrefRoom,
        favoriteDestinations: authPrefVibe
      }
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setAuthSuccess('Registration completed! Personal stays ledger activated.');
        if (data.token) setToken(data.token);
        localStorage.setItem('stayvibe_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        
        setTimeout(() => {
          setShowAuthModal(null);
          // reset wizard
          setAuthStep(1);
          setAuthEmail('');
          setAuthName('');
          setAuthPhone('');
          setAuthAddress('');
          setAuthPassword('');
          setAuthSuccess(null);
        }, 1500);
      } else {
        setAuthError(data.error || 'Server rejected registration.');
      }
    } catch (err) {
      setAuthError('Unable to connect with unified credentials broker.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!authEmail || !authPassword) {
      setAuthError('Please input both email and password.');
      return;
    }

    const loginEndpoint = loginType === 'admin'
      ? '/api/auth/admin/login'
      : '/api/auth/customer/login';

    try {
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setAuthSuccess(
          loginType === 'admin'
            ? 'Admin session authenticated. Welcome back!'
            : 'Session authenticated. Welcome back!'
        );
        if (data.token) setToken(data.token);
        localStorage.setItem('stayvibe_user', JSON.stringify(data.user));
        setCurrentUser(data.user);

        if (loginType === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('explore');
        }

        setTimeout(() => {
          setShowAuthModal(null);
          setAuthEmail('');
          setAuthPassword('');
          setAuthSuccess(null);
        }, 1500);
      } else {
        setAuthError(
          data.error ||
          (loginType === 'admin'
            ? 'Invalid admin credentials. Customer accounts cannot access admin portal.'
            : 'Invalid customer credentials.')
        );
      }
    } catch (err) {
      setAuthError('Error reaching safety auth key rings.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('stayvibe_user');
    setToken(null);
    setCurrentUser(null);
    setMyBookings([]);
    setActiveTab('explore');
  };

  // Open Checkout Step helper
  const triggerCheckoutFlow = (room: Room) => {
    if (room.availabilityStatus === 'BOOKED') {
      setBookingError('Room is already booked for the selected dates.');
      return;
    }

    if (guests > room.capacity) {
      setBookingError(`Guest count exceeds room capacity. Maximum guests allowed: ${room.capacity}.`);
      return;
    }

    setBookingError(null);

    let activeUser = currentUser;
    if (!activeUser) {
      // Auto-assign Guest Voyager session to ensure instant, frictionless payment simulation
      const guestSimUser: User = {
        id: 'guest_visitor',
        email: 'guest@stayvibe.com',
        name: 'Guest Voyager',
        role: 'ROLE_USER',
        phone: '',
        gender: 'other',
        dob: '',
        status: 'active',
        address: {
          country: 'United States',
          state: 'California',
          city: 'San Francisco',
          zipCode: '94103',
          fullAddress: '150 Post St, San Francisco, CA'
        },
        preferences: {
          preferredRoomType: 'Suite',
          favoriteDestinations: 'New York',
          travelPreferences: 'Silent floor, King Bed'
        },
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('stayvibe_user', JSON.stringify(guestSimUser));
      setCurrentUser(guestSimUser);
      activeUser = guestSimUser;
    }

    // Set standard values
    setPromoCodeInput('');
    setAppliedPromoPercent(0);
    setPromoError(null);
    setPromoSuccessMsg(null);
    setCardHolder(activeUser.name);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setAdvanceChoice('full');
    setPayMethod('credit_card');

    setShowCheckoutModal(room);
  };

  // Apply Coupon promo code validation
  const handleApplyCoupon = () => {
    setPromoError(null);
    setPromoSuccessMsg(null);
    
    const key = promoCodeInput.trim().toUpperCase();
    if (!key) return;

    if (key === 'STAYVIBE15') {
      setAppliedPromoPercent(15);
      setPromoSuccessMsg('LOYALTY APPLIED: 15% discount successfully calculated.');
    } else if (key === 'WELCOME10') {
      setAppliedPromoPercent(10);
      setPromoSuccessMsg('FIRST STAY APPLIED: 10% discount calculated.');
    } else if (key === 'SUPERDEAL30') {
      setAppliedPromoPercent(30);
      setPromoSuccessMsg('FLASH DEAL APPLIED: 30% huge off calculated!');
    } else {
      setPromoError('Promo code does not exist or expired.');
      setAppliedPromoPercent(0);
    }
  };

  // Execute actual validated booking with payment metrics
  const executePaymentBooking = async () => {
    if (!currentUser || !showCheckoutModal || !selectedHotel) return;

    setBookingError(null);
    setBookingSuccess(null);
    setBookingLoading(true);

    // Calculative values
    const numNights = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) || 1;
    let basePriceTotal = numNights * showCheckoutModal.price;
    if (appliedPromoPercent > 0) {
      basePriceTotal = Math.round(basePriceTotal * (1 - appliedPromoPercent / 100));
    }

    let advanceCollected = basePriceTotal;
    if (advanceChoice === 'partial_50') {
      advanceCollected = Math.round(basePriceTotal * 0.5);
    } else if (advanceChoice === 'pay_later') {
      advanceCollected = 0;
    }

    const payload = {
      userId: currentUser.id,
      userName: currentUser.name,
      hotelId: selectedHotel.id,
      roomId: showCheckoutModal.id,
      checkIn,
      checkOut,
      guests,
      
      // Payment parameters
      paymentMethod: payMethod,
      paymentStatus: advanceChoice === 'full' ? 'paid' : advanceChoice === 'partial_50' ? 'partially_paid' : 'pending',
      advancePayment: advanceCollected,
      remainingBalance: basePriceTotal - advanceCollected,
      totalPrice: basePriceTotal,
      customerPhone: currentUser.phone || '',
      specialRequests: `Applied Promo: ${promoCodeInput || 'None'}. Advance prepaid option: ${advanceChoice}.`
    };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'x-user-email': currentUser.email
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setBookingSuccess(data.booking);
        setShowCheckoutModal(null); // close checkout panel
        fetchMyBookings();
        fetchHotels(); // dynamic calendar constraints
        if (selectedHotel) {
          loadHotelDetail(selectedHotel);
        }
      } else {
        setBookingError(data.error || 'The secure payment node did not authorize validation.');
      }
    } catch (err) {
      setBookingError('Dynamic bank balance ledger connection refused.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!currentUser) return;
    
    showCustomConfirm(
      'Are you absolutely sure you want to cancel this active reservation? Prepaid components will be credited back to your balance.',
      async () => {
        try {
          const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: {
              ...getAuthHeaders(),
              'x-user-email': currentUser.email
            }
          });
          const data = await response.json();
          if (response.ok) {
            showCustomAlert('Reservation cancelled successfully! Simulated email refund dispatch completed.');
            fetchMyBookings();
            fetchHotels();
            if (selectedHotel) {
              loadHotelDetail(selectedHotel);
            }
          } else {
            showCustomAlert(`Core cancel rejection: ${data.error}`);
          }
        } catch (err) {
          showCustomAlert('Security cancel loop failed to bridge database tables.');
        }
      }
    );
  };

  // Computed filter variables
  const processedHotels = useMemo(() => {
    let list = Array.isArray(hotels) ? hotels : [];
    if (filterStars) {
      list = list.filter((h) => h.stars >= filterStars);
    }
    if (filterMaxPrice < 2000) {
      list = list.filter((h) => {
        const min = h.rooms?.length
          ? Math.min(...h.rooms.map((r) => r.price))
          : h.pricePerNight ?? 9999;
        return min <= filterMaxPrice;
      });
    }
    if (filterAmenities.length) {
      list = list.filter((h) =>
        filterAmenities.every((a) => h.amenities?.includes(a))
      );
    }
    return list;
  }, [hotels, filterStars, filterMaxPrice, filterAmenities]);

  const handleToggleAmenity = (amenity: string) => {
    setFilterAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const POPULAR_DESTINATIONS = [
    { name: 'Tokyo', count: '2 properties', image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=400&q=80' },
    { name: 'Paris', count: '2 properties', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
    { name: 'New York', count: '2 properties', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80' },
    { name: 'London', count: '1 property', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&w=400&q=80' },
  ];

  // ---- RENDER LANDING LOGIN SCREEN IF NOT AUTHENTICATED ----
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-luxury-cream text-luxury-navy flex flex-col font-sans relative overflow-hidden">
        {/* Ambient background blur circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-luxury-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-luxury-navy/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Top Header line */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between border-b border-luxury-beige">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-luxury-gold rounded-lg flex items-center justify-center text-luxury-navy font-black text-lg shadow-lg shadow-luxury-gold/20">
              S
            </div>
            <span className="text-xl font-black text-luxury-navy tracking-tight">
              Stay<span className="text-luxury-gold-dark">Vibe</span> <span className="font-semibold text-xs text-luxury-clay tracking-normal ml-1">Hotels Portal</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => {
                // Instantly browse as guest without checking credentials
                const guestSimUser: User = {
                  id: 'guest_visitor',
                  email: 'guest@stayvibe.com',
                  name: 'Guest Voyager',
                  role: 'ROLE_USER',
                  phone: '',
                  gender: 'other',
                  dob: '',
                  status: 'active',
                  address: {
                    country: 'United States',
                    state: 'California',
                    city: 'San Francisco',
                    zipCode: '94103',
                    fullAddress: '150 Post St, San Francisco, CA'
                  },
                  preferences: {
                    preferredRoomType: 'Suite',
                    favoriteDestinations: 'New York',
                    travelPreferences: 'Silent floor, King Bed'
                  },
                  createdAt: new Date().toISOString()
                };
                localStorage.setItem('stayvibe_user', JSON.stringify(guestSimUser));
                setCurrentUser(guestSimUser);
              }}
              className="text-luxury-clay hover:text-luxury-navy transition font-bold hover:underline cursor-pointer"
            >
              Skip & Browse Hotels
            </button>
          </div>
        </div>

        {/* Outer Split Container */}
        <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-16 flex items-center justify-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Splash Marketing */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-left">
              <div>
                <span className="bg-luxury-gold/20 text-luxury-gold-dark border border-luxury-gold/30 text-[10px] uppercase tracking-widest font-extrabold px-3.5 py-1.5 rounded-full inline-block mb-4 font-mono">
                  ✦ Signature Swiss Hospitality ✦
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-luxury-navy tracking-tight leading-tight">
                  Where Style Meets <span className="text-luxury-gold-dark">Extraordinary</span> Comfort.
                </h1>
                <p className="mt-4 text-sm sm:text-base text-luxury-clay leading-relaxed font-normal">
                  Experience a curated collection of premier boutique rooms and luxury suites in Tokyo, Paris, New York, and London. Manage corporate trips, apply custom promotional offers, and secure walk-in lodging.
                </p>
              </div>

              {/* Curated highlights list */}
              <div className="space-y-4 bg-white/70 backdrop-blur p-6 rounded-2xl border border-luxury-stone text-xs sm:text-sm shadow-sm">
                <div className="flex gap-3 text-left">
                  <div className="bg-luxury-beige text-luxury-gold-dark p-2 rounded-lg h-fit flex-shrink-0 border border-luxury-stone">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-luxury-navy text-sm">Flexible Reservation Engine</h4>
                    <p className="text-luxury-clay text-xs mt-0.5">Browse room layouts, apply coupon code <strong className="text-luxury-gold-dark font-mono text-[11px]">WELCOME10</strong> for special discounts, and pay at the property.</p>
                  </div>
                </div>
                <div className="flex gap-3 text-left">
                  <div className="bg-luxury-beige text-luxury-gold-dark p-2 rounded-lg h-fit flex-shrink-0 border border-luxury-stone">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-luxury-navy text-sm">Unified Workspace Credentials</h4>
                    <p className="text-luxury-clay text-xs mt-0.5">Toggle flawlessly between Customer account views and the Hotel management panel in a single screen.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 text-luxury-clay/70 text-xs font-mono">
                <span>✦ Secure HTTPS Endpoint</span>
                <span>•</span>
                <span>Switzerland & Global Collections</span>
              </div>
            </div>

            {/* Right Column: Portal Login card segment (All in One) */}
            <div className="lg:col-span-6 bg-white rounded-[2rem] border border-luxury-stone shadow-xl p-6 sm:p-10 flex flex-col justify-between backdrop-blur-md">
              
              {landingView === 'login' ? (
                <div className="space-y-6">
                  {/* Text Header */}
                  <div className="text-left">
                    <h2 className="text-xs font-bold tracking-widest text-luxury-gold-dark uppercase font-mono">Secure Sign-In</h2>
                    <h3 className="text-2xl font-black text-luxury-navy mt-1">Welcome Back</h3>
                    <p className="text-xs text-luxury-clay mt-1 font-semibold">Sign in below to proceed with reservations, or switch to administrative workspace mode.</p>
                  </div>

                  {/* Unified Select Switch Inside Page */}
                  <div className="bg-luxury-cream p-1.5 rounded-xl border border-luxury-stone flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginType('customer');
                        setAuthEmail('user@stayvibe.com');
                        setAuthPassword('user123');
                        setAuthError(null);
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center tracking-wide uppercase cursor-pointer ${
                        loginType === 'customer'
                          ? 'bg-luxury-navy text-white shadow-md'
                          : 'text-luxury-clay hover:text-luxury-navy hover:bg-white/50'
                      }`}
                    >
                      Guest / Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginType('admin');
                        setAuthEmail('admin@stayvibe.com');
                        setAuthPassword('admin123');
                        setAuthError(null);
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center tracking-wide uppercase cursor-pointer ${
                        loginType === 'admin'
                          ? 'bg-luxury-gold text-luxury-navy shadow-md font-black'
                          : 'text-luxury-clay hover:text-luxury-navy hover:bg-white/50'
                      }`}
                    >
                      Hotel Admin / Staff
                    </button>
                  </div>

                  {/* Quick autofill helper box directly below option tabs */}
                  <div className="bg-luxury-cream border border-luxury-stone px-4 py-3 rounded-xl text-xs text-luxury-navy flex items-center justify-between text-left">
                    <div>
                      <p className="font-extrabold text-luxury-navy">Simulate credentials:</p>
                      <p className="text-[11px] text-luxury-gold-dark mt-0.5 font-bold font-mono">
                        {loginType === 'customer' 
                          ? 'user@stayvibe.com (pass: user123)' 
                          : 'admin@stayvibe.com (pass: admin123)'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (loginType === 'customer') {
                          setAuthEmail('user@stayvibe.com');
                          setAuthPassword('user123');
                        } else {
                          setAuthEmail('admin@stayvibe.com');
                          setAuthPassword('admin123');
                        }
                      }}
                      className="bg-luxury-stone hover:bg-luxury-gold transition text-luxury-navy px-3 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                    >
                      Fill demo
                    </button>
                  </div>

                  {/* Submission Login Form */}
                  <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block font-semibold">Sign-In Email Address</label>
                      <input 
                        type="email" 
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone rounded-xl px-4 py-3 text-xs outline-none focus:border-luxury-gold focus:bg-white transition font-semibold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block font-semibold">Passphrase Credentials</label>
                      <input 
                        type="password" 
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone rounded-xl px-4 py-3 text-xs outline-none focus:border-luxury-gold focus:bg-white transition font-semibold"
                        required
                      />
                    </div>

                    {authError && (
                      <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-mono">
                        <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {authSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-mono">
                        <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <span>{authSuccess}</span>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-3">
                      <button
                        type="submit"
                        className="w-full bg-luxury-navy hover:bg-luxury-navy-light text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>{loginType === 'customer' ? 'Enter Customer Workspace' : 'Enter Admin Terminal'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const guestSimUser: User = {
                            id: 'guest_visitor',
                            email: 'guest@stayvibe.com',
                            name: 'Guest Voyager',
                            role: 'ROLE_USER',
                            phone: '',
                            gender: 'other',
                            dob: '',
                            status: 'active',
                            address: {
                              country: 'United States',
                              state: 'California',
                              city: 'San Francisco',
                              zipCode: '94103',
                              fullAddress: '150 Post St, San Francisco, CA'
                            },
                            preferences: {
                              preferredRoomType: 'Suite',
                              favoriteDestinations: 'New York',
                              travelPreferences: 'Silent floor, King Bed'
                            },
                            createdAt: new Date().toISOString()
                          };
                          localStorage.setItem('stayvibe_user', JSON.stringify(guestSimUser));
                          setCurrentUser(guestSimUser);
                        }}
                        className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-luxury-navy font-black shadow-md shadow-luxury-gold/10 transition py-2.5 rounded-xl text-xs cursor-pointer"
                      >
                        Browse Site as Guest
                      </button>
                    </div>
                  </form>

                  {/* Switch to Register link */}
                  <div className="text-center text-xs text-luxury-clay pt-2 border-t border-luxury-stone">
                    <span>New standard or corporate voyager?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError(null);
                        setAuthSuccess(null);
                        setAuthStep(1);
                        setLandingView('register');
                      }}
                      className="text-luxury-gold-dark font-black hover:underline cursor-pointer ml-1.5"
                    >
                      Create Account Wizard
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Embedded registration form */}
                  <div className="text-left">
                    <h2 className="text-xs font-black tracking-widest text-luxury-gold-dark uppercase font-mono">REGISTRATION ENGINE</h2>
                    <h3 className="text-xl sm:text-2xl font-black text-luxury-navy mt-1">Voyager Initial Protocol</h3>
                    <p className="text-xs text-luxury-clay mt-1 font-semibold">Configure your stay preferences and credentials for premium booking dispatches.</p>
                  </div>

                  {/* Multi-stage tracker widget */}
                  <div className="flex justify-center items-center gap-1.5 bg-luxury-cream p-2 rounded-xl text-[9px] font-black uppercase text-luxury-navy">
                    <span className={`px-2 py-0.5 rounded ${authStep === 1 ? 'bg-luxury-navy text-white' : 'text-luxury-clay'}`}>1. Credentials</span>
                    <ChevronRight className="h-3 w-3 text-luxury-clay" />
                    <span className={`px-2 py-0.5 rounded ${authStep === 2 ? 'bg-luxury-navy text-white' : 'text-luxury-clay'}`}>2. Physical Address</span>
                    <ChevronRight className="h-3 w-3 text-luxury-clay" />
                    <span className={`px-2 py-0.5 rounded ${authStep === 3 ? 'bg-luxury-navy text-white' : 'text-luxury-clay'}`}>3. Preferences</span>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    {authStep === 1 && (
                      <div className="space-y-3 animate-fade-in text-xs text-luxury-navy text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">Full Professional Name</label>
                          <input type="text" placeholder="Johnathan Doe" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl outline-none focus:border-luxury-gold text-xs font-semibold" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">Unique Username</label>
                          <input type="text" placeholder="johny_vibe" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl outline-none focus:border-luxury-gold text-xs font-semibold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">Email Coordinates</label>
                          <input type="email" placeholder="john@stayvibe.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl outline-none focus:border-luxury-gold text-xs font-semibold" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">Contact Phone Code</label>
                          <input type="text" placeholder="+1 (415) 303-9122" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl outline-none focus:border-luxury-gold text-xs font-semibold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">Password Setup</label>
                          <input type="password" placeholder="At least 6 characters" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl outline-none focus:border-luxury-gold text-xs font-semibold" required />
                        </div>
                        <button type="button" onClick={() => setAuthStep(2)} className="w-full bg-luxury-navy hover:bg-luxury-navy-light text-white font-extrabold text-xs py-3 rounded-xl mt-2 cursor-pointer flex items-center justify-center gap-1 transition-colors">
                          <span>Progress to Address Block</span> <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {authStep === 2 && (
                      <div className="space-y-3 animate-fade-in text-xs text-luxury-navy w-full text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">Street Location</label>
                          <input type="text" placeholder="102 Pacific Crest Boulevard" value={authAddress} onChange={(e) => setAuthAddress(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl outline-none focus:border-luxury-gold text-xs font-semibold" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">City</label>
                            <input type="text" placeholder="Los Angeles" value={authCity} onChange={(e) => setAuthCity(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl focus:border-luxury-gold text-xs font-semibold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">State</label>
                            <input type="text" placeholder="California" value={authState} onChange={(e) => setAuthState(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl focus:border-luxury-gold text-xs font-semibold" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">ZIP Code</label>
                            <input type="text" placeholder="90021" value={authZip} onChange={(e) => setAuthZip(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl focus:border-luxury-gold text-xs font-semibold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">Country</label>
                            <input type="text" placeholder="United States" value={authCountry} onChange={(e) => setAuthCountry(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl focus:border-luxury-gold text-xs font-semibold" />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => setAuthStep(1)} className="w-1/2 border border-luxury-stone text-luxury-clay hover:bg-luxury-beige font-extrabold py-2.5 rounded-xl text-xs cursor-pointer">Back</button>
                          <button type="button" onClick={() => setAuthStep(3)} className="w-1/2 bg-luxury-navy hover:bg-luxury-navy-light text-white font-extrabold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1 cursor-pointer">Next Stage</button>
                        </div>
                      </div>
                    )}

                    {authStep === 3 && (
                      <div className="space-y-3 text-xs text-luxury-navy text-left">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">Gender</label>
                            <select value={authGender} onChange={(e) => setAuthGender(e.target.value as any)} className="w-full bg-luxury-accent-cream border border-luxury-stone text-luxury-navy p-2.5 rounded-xl text-xs font-semibold">
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Rather not say</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">Date of Birth</label>
                            <input type="date" value={authDob} onChange={(e) => setAuthDob(e.target.value)} className="w-full bg-luxury-accent-cream border border-luxury-stone text-luxury-navy p-2 rounded-xl text-xs font-semibold" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">Preferred Room Setup</label>
                          <input type="text" placeholder="E.g., High-rise views, double terrace" value={authPrefRoom} onChange={(e) => setAuthPrefRoom(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl text-xs font-semibold" />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-clay block">Vibe & Atmosphere</label>
                          <input type="text" placeholder="E.g., Organic zen oasis" value={authPrefVibe} onChange={(e) => setAuthPrefVibe(e.target.value)} className="w-full bg-luxury-accent-cream text-luxury-navy border border-luxury-stone p-2.5 rounded-xl text-xs font-semibold" />
                        </div>

                        {authError && (
                          <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                            <span>{authError}</span>
                          </div>
                        )}

                        {authSuccess && (
                          <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <span>{authSuccess}</span>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => setAuthStep(2)} className="w-1/3 border border-luxury-stone text-luxury-clay hover:bg-luxury-beige font-extrabold py-2.5 rounded-xl text-xs cursor-pointer">Back</button>
                          <button type="submit" className="w-2/3 bg-luxury-gold hover:bg-luxury-gold-dark text-luxury-navy font-black py-2.5 rounded-xl text-xs flex justify-center items-center gap-1 cursor-pointer shadow-md shadow-luxury-gold/15">
                            <UserCheck className="h-4 w-4" /> Complete Registration
                          </button>
                        </div>
                      </div>
                    )}
                  </form>

                  {/* Switch to login link */}
                  <div className="text-center text-xs text-luxury-clay pt-2 border-t border-luxury-stone">
                    <span>Already have active credentials?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError(null);
                        setAuthSuccess(null);
                        setAuthStep(1);
                        setLandingView('login');
                      }}
                      className="text-luxury-gold-dark font-black hover:underline cursor-pointer ml-1.5"
                    >
                      Retrieve Credentials Key
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Audit terminal panel & emails overlay just like standard screen */}
        {showLogsPanel && (
          <div className="fixed bottom-4 right-4 z-50 w-full max-w-lg bg-slate-950 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col p-5 overflow-hidden font-mono text-[11px] h-96 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="font-extrabold text-slate-300">API METRICS AUDIT TERMINAL</span>
              </div>
              <button onClick={() => setShowLogsPanel(false)} className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 text-left">
              {logs.length === 0 ? (
                <p className="text-slate-500 italic">Listening for incoming API flows...</p>
              ) : (
                logs.map((log) => {
                  const isError = log.level === 'error';
                  return (
                    <div key={log.id} className="border-b border-slate-850/60 pb-2">
                      <span className={`font-bold ${isError ? 'text-rose-455 text-rose-400' : 'text-emerald-400'}`}>[{log.level.toUpperCase()}] [{log.category.toUpperCase()}]</span>
                      <p className="text-slate-205 text-slate-200 mt-1 font-semibold break-all text-left">{log.message}</p>
                      {log.details && <pre className="bg-slate-900 p-2 rounded text-[9px] text-slate-400 mt-1 text-left whitespace-pre-wrap">{log.details}</pre>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {showEmailsPanel && (
          <div className="fixed bottom-4 right-4 z-50 w-full max-w-md bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-205 flex flex-col p-5 overflow-hidden h-[450px] animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-105 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-650"><Mail className="h-4 w-4" /></div>
                <span className="font-extrabold">SIMULATED EMAIL NOTIFICATIONS</span>
              </div>
              <button onClick={() => setShowEmailsPanel(false)} className="text-slate-400 p-1 rounded-full hover:bg-slate-100 focus:outline-none cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {emails.length === 0 ? (
                <p className="text-slate-400 italic text-center p-8 font-semibold">No emails recorded in simulate archive.</p>
              ) : (
                emails.map((e) => (
                  <div key={e.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans text-left">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase"><span>TO: {e.to}</span><span>{e.sentAt.split('T')[1].substring(0,8)}</span></div>
                    <h5 className="font-extrabold text-xs text-slate-850 text-slate-800 mt-1">{e.subject}</h5>
                    <pre className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-100 font-mono mt-1 whitespace-pre-wrap">{e.body}</pre>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="hotel_app_root" className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Navigation Header with Admin conditional badges */}
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onOpenAuth={(mode) => {
          setAuthError(null);
          setAuthSuccess(null);
          setAuthStep(1);
          setShowAuthModal(mode);
        }}
        onOpenLogs={() => setShowLogsPanel(!showLogsPanel)}
        onOpenEmails={() => setShowEmailsPanel(!showEmailsPanel)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'admin' && (!currentUser || currentUser.role !== 'ROLE_ADMIN')) {
            alert('Restricted Area: Admin credentials required.');
            return;
          }
          setActiveTab(tab);
        }}
        unreadEmailCount={unreadEmailCount}
      />

      {/* Main Top Banner Area */}
      {activeTab === 'explore' && (
        <div id="vibrant_search_banner" className="bg-gradient-to-b from-indigo-700 via-indigo-650 to-indigo-600 px-4 sm:px-8 py-10 flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center md:text-left mb-8 max-w-2xl">
              <span className="bg-white/10 text-white border border-white/25 text-[10px] uppercase tracking-widest font-extrabold px-3.5 py-1.5 rounded-full inline-block mb-3.5 font-mono">
                ✦ EXCLUSIVE OFFER: USE WELCOME10 FOR 10% OFF YOUR BOOKING ✦
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                Find your next <span className="text-rose-400">extraordinary stay</span>
              </h2>
              <p className="mt-3 text-sm text-indigo-100 font-medium">
                Experience a curated collection of modern signature suites in Tokyo, Paris, New York, and London. Beautiful amenities, seamless reservation checkouts, and bespoke hospitality.
              </p>
            </div>

            {/* Search inputs */}
            <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-2xl shadow-indigo-900/30 border border-white/10 max-w-5xl mx-auto transform hover:translate-y-[-2px] transition-all">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-4 flex flex-col px-4 py-2 border-r border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Location / Hotel
                  </span>
                  <input 
                    type="text" 
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Where are you heading?" 
                    className="font-bold text-slate-800 placeholder-slate-400 outline-none w-full text-sm mt-1 bg-transparent border-none focus:ring-0 p-0"
                  />
                </div>

                <div className="md:col-span-3 flex flex-col px-4 py-2 border-r border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Check In Date
                  </span>
                  <input 
                    type="date" 
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="font-bold text-slate-800 outline-none w-full text-xs mt-1 bg-transparent"
                  />
                </div>

                <div className="md:col-span-3 flex flex-col px-4 py-2 border-r border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Check Out Date
                  </span>
                  <input 
                    type="date" 
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="font-bold text-slate-800 outline-none w-full text-xs mt-1 bg-transparent"
                    min={checkIn}
                  />
                </div>

                <div className="md:col-span-2 flex flex-col px-4 py-2 mr-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-indigo-500" /> Guests
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <button 
                      onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                      className="text-xs bg-slate-100 font-black h-6 w-6 rounded-full text-slate-700 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-800 text-sm px-1">{guests}</span>
                    <button 
                      onClick={() => setGuests(prev => Math.min(10, prev + 1))}
                      className="text-xs bg-slate-100 font-black h-6 w-6 rounded-full text-slate-700 hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick cities */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wide mr-2">Destinations:</span>
              <button 
                onClick={() => setSearchCity('')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  searchCity === '' ? 'bg-rose-500 text-white shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                All Regions
              </button>
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => setSearchCity(dest.name)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    searchCity.toLowerCase() === dest.name.toLowerCase()
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/25'
                  }`}
                >
                  {dest.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CORE APPLICATION CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        
        {/* VIEW 1: ADMIN SYSTEM PANEL ROUTE */}
        {activeTab === 'admin' && currentUser && currentUser.role === 'ROLE_ADMIN' && (
          <div className="space-y-6 animate-fade-in">
            <AdminPortal 
              adminUser={currentUser} 
              onRefreshGlobalData={fetchHotels} 
              showCustomConfirm={showCustomConfirm}
              showCustomAlert={showCustomAlert}
            />
          </div>
        )}

        {/* VIEW 2: STANDARD EXPLORE COMPONENT GRID */}
        {activeTab === 'explore' && (
          selectedHotel ? (
            <div className="space-y-4">
              {bookingError && !showCheckoutModal && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}
              <HotelDetailView 
                hotel={selectedHotel} 
                onBack={() => { setSelectedHotel(null); setBookingSuccess(null); setBookingError(null); }} 
                onReserveRoom={triggerCheckoutFlow}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
              />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Sidebar Filter Column */}
            <aside className="w-full lg:w-64 flex flex-col gap-6 flex-shrink-0">
              
              {/* Star Rating Section */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xs uppercase tracking-widest font-black text-indigo-600 mb-4 flex items-center justify-between">
                  <span>Stars Classification</span>
                  {filterStars !== null && (
                    <button onClick={() => setFilterStars(null)} className="text-[10px] text-rose-500 underline font-semibold cursor-pointer">
                      Clear
                    </button>
                  )}
                </h3>
                <div className="flex flex-col gap-2.5">
                  {[5, 4, 3].map((starCount) => (
                    <label key={starCount} className="flex items-center gap-2.5 cursor-pointer group">
                      <input 
                        type="radio"
                        checked={filterStars === starCount}
                        onChange={() => setFilterStars(starCount)}
                        className="sr-only text-indigo-600 focus:ring-transparent"
                      />
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                        filterStars === starCount ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 group-hover:border-slate-400'
                      }`}>
                        {filterStars === starCount && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <div className="flex items-center text-amber-400 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < starCount ? 'fill-amber-400 text-amber-400' : 'text-slate-250 text-slate-200'}`} />
                        ))}
                        <span className="text-slate-600 font-bold text-xs ml-2">{starCount} Stars</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter Section */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xs uppercase tracking-widest font-black text-indigo-600 mb-3 block text-indigo-705">
                  Max Nightly Rate
                </h3>
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="font-bold text-slate-500">$50/night</span>
                  <span className="font-extrabold text-indigo-600 text-base bg-indigo-50 px-2 py-0.5 rounded-lg">
                    ${filterMaxPrice}
                  </span>
                </div>
                <input 
                  type="range"
                  min="50"
                  max="2000"
                  step="25"
                  value={filterMaxPrice}
                  onChange={(e) => setFilterMaxPrice(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg outline-none"
                />
              </div>

              {/* Amenities List */}
              <div className="bg-white p-6 rounded-3xl border border-slate-105 shadow-sm">
                <h3 className="text-xs uppercase tracking-widest font-black text-indigo-600 mb-4 block">
                  Select Amenities
                </h3>
                <div className="flex flex-col gap-3">
                  {['Free WiFi', 'Indoor Pool', 'Luxury Spa', 'Michelin Star Dining', '24h Concierge', 'Air Conditioning'].map((amenity) => {
                    const isChecked = filterAmenities.includes(amenity);
                    return (
                      <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleAmenity(amenity)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isChecked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 group-hover:border-slate-400'
                        }`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs text-slate-600 font-bold group-hover:text-slate-900">{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </aside>

            {/* Right grid */}
            <section className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                    {processedHotels.length} Properties Matching Filter
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Stay limits: <span className="font-bold text-indigo-600">{checkIn}</span> to <span className="font-bold text-indigo-600">{checkOut}</span> ({guests} guests)
                  </p>
                </div>
              </div>

              {searchLoading ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-20 flex flex-col items-center justify-center text-center shadow-xs">
                  <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4" />
                  <p className="font-bold text-slate-700">Syncing property registers...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {processedHotels.map((hotel) => {
                    const minPrice =
                      hotel.rooms && hotel.rooms.length
                        ? Math.min(...hotel.rooms.map((r) => r.price))
                        : 110;
                    return (
                      <div 
                        key={hotel.id}
                        onClick={() => loadHotelDetail(hotel)}
                        className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col group cursor-pointer"
                      >
                        <div className="h-56 bg-slate-100 relative overflow-hidden">
                          {hotel.featured && (
                            <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow z-10">
                              FEATURED VIBE
                            </div>
                          )}
                          <img src={hotel.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
/>
                          <div className="absolute bottom-4 left-5 text-white flex items-center gap-1.5 font-bold">
                            <MapPin className="h-4 w-4 text-rose-500" />
                            <span className="text-xs drop-shadow">{hotel.city}, {hotel.country || 'USA'}</span>
                          </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-base font-black text-slate-800 tracking-tight leading-snug">{hotel.name}</h4>
                              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-500 font-extrabold text-[11px] border border-amber-100 font-mono">
                                <span>★ {hotel.stars}</span>
                              </div>
                            </div>
                            <p className="text-slate-400 text-[11px] italic truncate">{hotel.address}</p>
                            <p className="text-slate-500 text-xs line-clamp-2 mt-2 leading-relaxed">{hotel.description}</p>
                          </div>

                          <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                            <div>
                              <span className="block text-[9px] font-black text-indigo-500 uppercase">From</span>
                              <span className="text-xl font-black text-slate-800">${minPrice}<span className="text-xs text-slate-400 font-medium">/night</span></span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                loadHotelDetail(hotel);
                              }}
                              className="bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                            >
                              Explore Suites
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {!processedHotels.length && (
                    <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center max-w-sm mx-auto col-span-2">
                      <p className="font-bold text-slate-700">No hotels fit your criteria.</p>
                      <button onClick={() => { setSearchCity(''); setFilterAmenities([]); setFilterStars(null); setFilterMaxPrice(2000); }} className="mt-4 bg-slate-900 text-white text-xs rounded-xl px-4 py-2 font-bold hover:bg-slate-800">Reset Filters</button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
          )
        )}

        {/* VIEW 3: TRIPS RESERVED HISTORIC PANEL */}
        {activeTab === 'bookings' && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <div>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] uppercase font-black px-3 py-1 rounded-full">Trips Ledger</span>
                <h2 className="text-2xl font-black text-slate-800 mt-1">My Reserved Trips & Receipts</h2>
              </div>
            </div>

            {myBookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
                <Compass className="h-8 w-8 text-slate-400 mx-auto mb-4" />
                <h4 className="font-bold text-slate-850">Empty checkout history</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Explore hotels tab above to allocate your premium beach front suites.</p>
                <button onClick={() => setActiveTab('explore')} className="mt-5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold rounded-xl px-5 py-2.5 shadow">Find Properties</button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((b) => {
                  const isCancelled = b.status === 'cancelled';
                  return (
                    <div key={b.id} className={`bg-white rounded-2xl border transition-all flex flex-col sm:flex-row overflow-hidden ${isCancelled ? 'opacity-60 border-slate-100' : 'border-indigo-100 hover:border-indigo-200'}`}>
                      <div className={`p-5 flex flex-col justify-between text-white sm:w-40 ${isCancelled ? 'bg-slate-500' : 'bg-gradient-to-br from-indigo-600 to-indigo-800'}`}>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider block">ID Ref</span>
                          <span className="font-mono text-xs font-black block truncate">{b.id}</span>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-4 uppercase text-center block ${isCancelled ? 'bg-slate-700 text-white' : 'bg-emerald-500 text-white shadow-sm'}`}>
                          {b.status}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div className="border-b border-slate-100 pb-3">
                          <h4 className="font-extrabold text-sm text-slate-800">{b.hotelName}</h4>
                          <h5 className="text-[11px] text-indigo-500 font-bold uppercase mt-1">{b.roomName} / {b.roomType}</h5>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] bg-slate-50 p-2.5 rounded-xl font-bold font-mono">
                          <div>CheckIn: <span className="text-slate-820 text-indigo-650">{b.checkIn}</span></div>
                          <div>CheckOut: <span className="text-slate-820 text-indigo-650">{b.checkOut}</span></div>
                          <div className="col-span-2 text-slate-500">Guests: {b.guests} occupants | Payment: {b.paymentStatus}</div>
                        </div>

                        {!isCancelled && (
                          <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4 text-xs font-bold">
                            <span className="font-semibold text-[11px] text-slate-500">Total Pre-Paid value: <strong className="text-slate-800">${b.totalPrice}</strong></span>
                            <button onClick={() => handleCancelBooking(b.id)} className="text-rose-500 border border-slate-100 rounded-lg p-1.5 px-3 hover:bg-rose-50 text-xs">
                              Cancel Reservation
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER BAR */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-100 px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
        <div className="flex gap-6 items-center justify-between w-full">
          <span>© 2026 StayVibe Hotels Group. All rights reserved.</span>
          <span className="text-slate-400 text-xs">
            Curated Classic Stays
          </span>
        </div>
      </footer>

      {/* Sandbox Companion Developer Controls bar */}
      <div className="bg-slate-900 border-t border-slate-800 py-3 px-4 sm:px-8 text-xs font-semibold text-slate-300 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider">Demo Sandbox Controller</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400">Instantly simulate workspace logins:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthEmail('user@stayvibe.com');
                  setAuthPassword('user123');
                  setShowAuthModal('login');
                }}
                className="bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white px-2.5 py-1 rounded text-[10px] uppercase font-black transition cursor-pointer"
              >
                Test Guest User
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthEmail('admin@stayvibe.com');
                  setAuthPassword('admin123');
                  setShowAuthModal('login');
                }}
                className="bg-rose-600/30 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white px-2.5 py-1 rounded text-[10px] uppercase font-black transition cursor-pointer"
              >
                Test Admin Center
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEmailsPanel(!showEmailsPanel)}
              className="relative px-3 py-1 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <Mail className="h-4.5 w-4.5 text-indigo-400" />
              <span>Mailbox simulator</span>
              {unreadEmailCount > 0 ? (
                <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.1 rounded-full animate-bounce">
                  {unreadEmailCount}
                </span>
              ) : null}
            </button>
            <button
              onClick={() => setShowLogsPanel(!showLogsPanel)}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <Terminal className="h-4.5 w-4.5 text-emerald-400" />
              <span>API Request telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {/* ---- MODAL LAYER 2: CHOSEN DYNAMIC CHECKOUT / PAYMENT GATEWAY ---- */}
      {showCheckoutModal && selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in text-luxury-navy font-sans">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full border border-luxury-stone p-6 sm:p-8 space-y-6 relative shadow-2xl text-left">
            <button onClick={() => setShowCheckoutModal(null)} className="absolute top-5 right-5 text-luxury-clay hover:text-luxury-navy cursor-pointer p-1">
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[9px] font-black tracking-widest text-[#a88d5e] uppercase font-mono">SECURE SETTLEMENT INTEGRATION</span>
              <h3 className="text-xl font-black text-luxury-navy mt-0.5">Reservation Checkout Settlement</h3>
              <p className="text-[11px] text-luxury-clay mt-0.5 font-semibold">Property: <strong className="text-luxury-navy">{selectedHotel.name}</strong> • {showCheckoutModal.name}</p>
            </div>

            {/* Price Calculations Column */}
            <div className="bg-luxury-cream p-5 rounded-2xl border border-luxury-stone">
              <h4 className="text-xs font-black text-[#a88d5e] uppercase block mb-2 font-mono">Calculative Breakdown</h4>
              <div className="space-y-2 text-xs font-semibold text-luxury-navy">
                <div className="flex justify-between">
                  <span>Stay: {checkIn} to {checkOut} ({Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) || 1} nights)</span>
                  <span className="font-mono font-black">${(Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) || 1) * showCheckoutModal.price}</span>
                </div>
                
                {/* Applied Promo Code */}
                {appliedPromoPercent > 0 && (
                  <div className="flex justify-between text-emerald-700 bg-emerald-50/50 border border-emerald-100 p-2 rounded-xl">
                    <span>Discount Applied ({appliedPromoPercent}%):</span>
                    <span className="font-mono font-black">-${Math.round((((Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) || 1) * showCheckoutModal.price)) * (appliedPromoPercent / 100))}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2.5 border-t border-luxury-stone font-black text-luxury-navy leading-snug">
                  <span>Net Price Due:</span>
                  <span className="text-luxury-navy font-mono text-base">
                    ${Math.round(
                      ((Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) || 1) * showCheckoutModal.price) * (1 - appliedPromoPercent / 100)
                    )}
                  </span>
                </div>
              </div>

              {/* Apply Promo discount box */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-luxury-stone/60">
                <input 
                  type="text" 
                  placeholder="Promo (STAYVIBE15, WELCOME10)"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="bg-white border border-luxury-stone rounded-xl px-3 py-2 text-xs font-bold uppercase flex-1 outline-none focus:border-luxury-gold text-luxury-navy"
                />
                <button 
                  type="button" 
                  onClick={handleApplyCoupon}
                  className="bg-luxury-navy hover:bg-luxury-navy-light text-white text-xs font-black rounded-xl px-4 cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-[10px] text-rose-500 font-bold mt-1.5">{promoError}</p>}
              {promoSuccessMsg && <p className="text-[10px] text-emerald-600 font-bold mt-1.5">{promoSuccessMsg}</p>}
            </div>

            {/* Advance payment options slider */}
            <div className="space-y-2">
              <label className="text-xs font-black text-luxury-clay uppercase font-mono block">Prepaid Advance Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'full', title: '100% Prepaid', desc: 'Secure booking immediately' },
                  { key: 'partial_50', title: '50% Prepaid Due', desc: 'Settle remaining at hotel' },
                  { key: 'pay_later', title: 'Hold & SettleLater', desc: 'No transaction charge now' }
                ].map((act) => (
                  <button
                    key={act.key}
                    type="button"
                    onClick={() => {
                      setAdvanceChoice(act.key as any);
                      if (act.key === 'pay_later') setPayMethod('pay_at_hotel');
                    }}
                    className={`p-3 text-center border rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      advanceChoice === act.key ? 'border-luxury-gold bg-luxury-cream ring-1 ring-luxury-gold' : 'border-luxury-stone hover:bg-luxury-cream'
                    }`}
                  >
                    <span className="text-[10px] font-black text-luxury-navy block">{act.title}</span>
                    <span className="text-[9px] text-luxury-clay mt-1 block leading-tight font-semibold">{act.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Secure Method Switcher */}
            {advanceChoice !== 'pay_later' && (
              <div className="space-y-3">
                <label className="text-xs font-black text-luxury-clay uppercase block font-mono">Settlement Channel Gateway</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-extrabold text-xs text-luxury-navy">
                    <input 
                      type="radio" 
                      name="payMethodRadio" 
                      checked={payMethod === 'credit_card'} 
                      onChange={() => setPayMethod('credit_card')}
                      className="accent-luxury-gold-dark"
                    />
                    <span>Credit / Debit Card secure</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-extrabold text-xs text-luxury-navy">
                    <input 
                      type="radio" 
                      name="payMethodRadio" 
                      checked={payMethod === 'upi'} 
                      onChange={() => setPayMethod('upi')}
                      className="accent-luxury-gold-dark"
                    />
                    <span>UPI ID simulation</span>
                  </label>
                </div>

                {payMethod === 'credit_card' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-luxury-cream border border-luxury-stone rounded-2xl animate-fade-in text-xs font-semibold text-luxury-navy">
                    <div className="flex flex-col gap-1 sm:col-span-3">
                      <label className="text-[10px] text-luxury-clay uppercase block font-bold">Cardholder Moniker</label>
                      <input 
                        type="text" 
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="bg-white p-2.5 border border-luxury-stone rounded-xl outline-none focus:border-luxury-gold text-xs font-semibold text-luxury-navy"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                       <label className="text-[10px] text-luxury-clay uppercase block font-bold">16-Digit Card Number</label>
                      <input 
                        type="text" 
                        placeholder="4111 8899 0044 1122"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                        className="bg-white p-2.5 border border-luxury-stone rounded-xl outline-none focus:border-luxury-gold text-xs font-mono font-black text-luxury-navy tracking-wider"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-luxury-clay uppercase block font-bold">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="09/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                          className="bg-white p-2.5 border border-luxury-stone rounded-xl outline-none focus:border-luxury-gold text-xs font-semibold text-luxury-navy text-center"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-luxury-clay uppercase block font-bold">CVV PIN</label>
                        <input 
                          type="password" 
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          className="bg-white p-2.5 border border-luxury-stone rounded-xl outline-none focus:border-luxury-gold text-xs font-semibold text-luxury-navy text-center"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {payMethod === 'upi' && (
                  <div className="p-4 bg-luxury-cream border border-luxury-stone rounded-2xl space-y-1.5 animate-fade-in text-xs text-luxury-navy">
                    <label className="text-[10px] text-luxury-clay uppercase block font-bold">UPI ID (VPA Address)</label>
                    <input 
                      type="text" 
                      placeholder="alex.rivera@okaxis" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="bg-white p-3 border border-luxury-stone rounded-xl w-full font-semibold text-luxury-navy outline-none focus:border-luxury-gold"
                      required
                    />
                    <span className="text-[9px] text-[#2c7a5f] block font-bold leading-normal">Simulates a direct payment trigger to sandbox clients. Auto confirms instantly.</span>
                  </div>
                )}
              </div>
            )}

            {/* Error notifications block */}
            {bookingError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Authorize button action */}
            <div className="pt-4 border-t border-luxury-stone flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => setShowCheckoutModal(null)}
                className="text-xs font-extrabold text-[#a88d5e] hover:text-luxury-navy px-4 py-2 cursor-pointer transition hover:underline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executePaymentBooking}
                disabled={bookingLoading}
                className="bg-luxury-navy hover:bg-luxury-navy-light text-white font-black text-xs px-6 py-3.5 rounded-xl transition-all shadow shadow-luxury-navy/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{bookingLoading ? 'Authorizing secure transaction...' : 'Authorize settlement Booking'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- MODAL LAYER 3: AUTH MODAL REGISTRATION PROFILE WIZARD ---- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in text-slate-800 font-sans">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-8 border border-slate-100 shadow-2xl relative">
            <button onClick={() => setShowAuthModal(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 cursor-pointer">
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex w-10 h-10 bg-indigo-50 rounded-2xl items-center justify-center text-indigo-650 font-bold text-xl mb-2 shadow-xs">S</div>
              <h3 className="text-xl font-black text-slate-800">
                {showAuthModal === 'login' ? 'Sign In' : 'Create Account Wizard'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Unified credentials broker tracking. Seamless admins and client roles authorization.</p>
              
              {/* If registration show multi-stage tags indicator */}
              {showAuthModal === 'register' && (
                <div className="flex justify-center items-center gap-1.5 mt-4 text-[9px] font-black uppercase text-indigo-500">
                  <span className={`px-2 py-0.5 rounded ${authStep === 1 ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-400'}`}>1. Basic Profile</span>
                  <ChevronRight className="h-3 w-3 text-slate-350" />
                  <span className={`px-2 py-0.5 rounded ${authStep === 2 ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-400'}`}>2. Physical Address</span>
                  <ChevronRight className="h-3 w-3 text-slate-350" />
                  <span className={`px-2 py-0.5 rounded ${authStep === 3 ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-400'}`}>3. Preferences</span>
                </div>
              )}
            </div>

            <form onSubmit={showAuthModal === 'login' ? handleLogin : handleRegister} className="space-y-4">
              
              {/* LOGIN MODE FORM */}
              {showAuthModal === 'login' && (
                <div className="space-y-4 font-semibold text-xs text-slate-705">
                  {/* Unified Switcher inline */}
                  <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/50 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginType('customer');
                        setAuthEmail('user@stayvibe.com');
                        setAuthPassword('user123');
                        setAuthError(null);
                      }}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all text-center uppercase tracking-wide cursor-pointer ${
                        loginType === 'customer'
                          ? 'bg-indigo-655 bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Guest / Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginType('admin');
                        setAuthEmail('admin@stayvibe.com');
                        setAuthPassword('admin123');
                        setAuthError(null);
                      }}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all text-center uppercase tracking-wide cursor-pointer ${
                        loginType === 'admin'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Hotel Admin
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-505 block">Email Account Address</label>
                    <input 
                      type="email" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="E.g., user@stayvibe.com"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-505 block">Secure Passphrase</label>
                    <input 
                      type="password" 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (loginType === 'customer') {
                          setAuthEmail('user@stayvibe.com');
                          setAuthPassword('user123');
                        } else {
                          setAuthEmail('admin@stayvibe.com');
                          setAuthPassword('admin123');
                        }
                      }}
                      className="text-[10px] text-indigo-600 hover:underline font-extrabold cursor-pointer"
                    >
                      ✦ Click to Autofill Demo Credentials
                    </button>
                  </div>
                </div>
              )}

              {/* REGISTER MULTI-TAB WIZARD CONTROL */}
              {showAuthModal === 'register' && (
                <div className="font-semibold text-xs text-slate-705 space-y-4">
                  
                  {/* STEP 1: GENERAL CREDENTIALS */}
                  {authStep === 1 && (
                    <div className="space-y-3 animate-fade-in text-[11px]">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black block">Full Name</label>
                        <input type="text" placeholder="Alex Rivera" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl outline-none" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black block">Username</label>
                        <input type="text" placeholder="alex_vibe_99" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black block">Email Coordinates</label>
                        <input type="email" placeholder="alex@gmail.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl outline-none" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black block">Contact Telephone Number</label>
                        <input type="text" placeholder="+1 (555) 993-2111" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black block">System Password</label>
                        <input type="password" placeholder="Min 6 characters requested" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl outline-none" required />
                      </div>
                      <button type="button" onClick={() => setAuthStep(2)} className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-xl mt-2 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none">
                        <span>Continue Stage 2</span> <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: ADDRESS & RESIDENTIAL COORDINATES */}
                  {authStep === 2 && (
                    <div className="space-y-3 animate-fade-in text-[11px]">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black block font-bold">Physical Street Location</label>
                        <input type="text" placeholder="102 Pacific Crest Boulevard" value={authAddress} onChange={(e) => setAuthAddress(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black block">City</label>
                          <input type="text" placeholder="Los Angeles" value={authCity} onChange={(e) => setAuthCity(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black block">State / Code</label>
                          <input type="text" placeholder="California" value={authState} onChange={(e) => setAuthState(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black block">ZIP Code</label>
                          <input type="text" placeholder="90021" value={authZip} onChange={(e) => setAuthZip(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black block">Country</label>
                          <input type="text" placeholder="United States" value={authCountry} onChange={(e) => setAuthCountry(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl" />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setAuthStep(1)} className="w-1/2 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs">Back</button>
                        <button type="button" onClick={() => setAuthStep(3)} className="w-1/2 bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1">Next Step</button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: DEMOGRAPHICS AND STAY PREFERENCES */}
                  {authStep === 3 && (
                    <div className="space-y-3 animate-fade-in text-[11px]">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black block font-bold">Gender Identity</label>
                          <select value={authGender} onChange={(e) => setAuthGender(e.target.value as any)} className="w-full border border-slate-200 p-2.5 rounded-xl">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Rather not say</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black block">Date of Birth</label>
                          <input type="date" value={authDob} onChange={(e) => setAuthDob(e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black block">Stay Preferred Suite Arrangement</label>
                        <input type="text" placeholder="E.g., Non-smoking, high floor terrace options" value={authPrefRoom} onChange={(e) => setAuthPrefRoom(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black block font-bold">Favorite Destination Style</label>
                        <input type="text" placeholder="Tropical Beach Resorts or Winter Cabins" value={authPrefVibe} onChange={(e) => setAuthPrefVibe(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl" />
                      </div>

                      {/* Photo upload simulator */}
                      <div className="p-3 bg-slate-50 border border-slate-105 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-extrabold text-xs text-slate-800">Avatar Photograph</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">Simulate client JPEG format upload</p>
                        </div>
                        <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded inline-block cursor-pointer" onClick={() => alert("Simulated Avatar Upload Completed successfully!")}>Upload File</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setAuthStep(2)} className="w-1/3 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs">Back</button>
                        <button type="submit" className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1 cursor-pointer">
                          <UserCheck className="h-4 w-4" /> Secure Complete Register
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Notifications */}
              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-550 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-555 flex-shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {showAuthModal === 'login' && (
                <button
                  type="submit"
                  className="w-full bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Authenticate Session</span>
                </button>
              )}

            </form>

            <div className="mt-5 text-center text-xs">
              <span className="text-slate-400">
                {showAuthModal === 'login' ? 'New to our network?' : 'Already have a secure credential?'}
              </span>
              <button
                onClick={() => {
                  setAuthError(null);
                  setAuthSuccess(null);
                  setAuthStep(1);
                  setShowAuthModal(showAuthModal === 'login' ? 'register' : 'login');
                }}
                className="bg-transparent text-indigo-600 font-extrabold hover:underline ml-1.5 cursor-pointer focus:outline-none border-b border-transparent"
              >
                {showAuthModal === 'login' ? 'Create Account Wizard' : 'Sign In'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ---- LOGS PANEL DIAGNOSTIC DRAWER ---- */}
      {showLogsPanel && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-lg bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col p-5 overflow-hidden font-mono text-[11px] h-96">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="font-extrabold text-slate-300">API METRICS AUDIT TERMINAL</span>
            </div>
            <button onClick={() => setShowLogsPanel(false)} className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic">Listening for incoming API flows...</p>
            ) : (
              logs.map((log) => {
                const isError = log.level === 'error';
                return (
                  <div key={log.id} className="border-b border-slate-850/60 pb-2">
                    <span className={`font-bold ${isError ? 'text-rose-450 text-rose-400' : 'text-emerald-400'}`}>[{log.level.toUpperCase()}] [{log.category.toUpperCase()}]</span>
                    <p className="text-slate-200 mt-1 font-semibold break-all">{log.message}</p>
                    {log.details && <pre className="bg-slate-950 p-2 rounded text-[9px] text-slate-400 mt-1 whitespace-pre-wrap">{log.details}</pre>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ---- SIMULATED EMAILS DISPLAY PANEL ---- */}
      {showEmailsPanel && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col p-5 overflow-hidden h-[450px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-650"><Mail className="h-4 w-4" /></div>
              <span className="font-extrabold">SIMULATED EMAIL NOTIFICATIONS</span>
            </div>
            <button onClick={() => setShowEmailsPanel(false)} className="text-slate-400 p-1 rounded-full hover:bg-slate-100 focus:outline-none cursor-pointer"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
            {emails.length === 0 ? (
              <p className="text-slate-400 italic text-center p-8">No simulated emails.</p>
            ) : (
              emails.map((e) => (
                <div key={e.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase"><span>TO: {e.to}</span><span>{e.sentAt.split('T')[1].substring(0,8)}</span></div>
                  <h5 className="font-extrabold text-xs text-slate-800 mt-1">{e.subject}</h5>
                  <pre className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-100 font-mono mt-1 whitespace-pre-wrap">{e.body}</pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---- CUSTOM REACT MODAL OVERLAY (SAVES CONFIRM/ALERT FROM SANDBOX) ---- */}
      {customModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in font-sans text-slate-800">
          <div className="bg-white rounded-[2rem] max-w-md w-full border border-slate-200 p-6 space-y-6 relative shadow-2xl text-left scale-95 transition-all">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${customModal.type === 'confirm' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                <Info className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 leading-snug">
                {customModal.title || (customModal.type === 'confirm' ? 'Confirmation Required' : 'Notification')}
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              {customModal.message}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-150">
              {customModal.type === 'confirm' && (
                <button 
                  onClick={customModal.onCancel}
                  className="px-4 py-2 bg-slate-105 hover:bg-slate-150 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-sm"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={customModal.onConfirm}
                className="px-5 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                {customModal.type === 'confirm' ? 'Yes, Proceed' : 'Ok'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
