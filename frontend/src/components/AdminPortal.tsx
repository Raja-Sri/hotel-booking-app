import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building, 
  Users, 
  FileText, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XSquare, 
  PhoneCall, 
  AlertTriangle, 
  Calendar, 
  PlusCircle, 
  Mail, 
  Printer, 
  RefreshCcw, 
  Ban, 
  UserCheck, 
  Activity, 
  Hotel as HotelIcon, 
  Check, 
  X,
  CreditCard,
  MapPin,
  Clock,
  Briefcase,
  Sliders,
  ChevronRight,
  ChevronDown,
  Lock,
  ArrowUpDown,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Hotel, Room, Booking, User, SystemLog } from '../types';
import { mapAdminStats } from '../utils/adminStats';

interface AdminPortalProps {
  adminUser: User;
  onRefreshGlobalData: () => void;
  showCustomConfirm?: (message: string, onConfirm: () => void) => void;
  showCustomAlert?: (message: string, onOk?: () => void) => void;
}

export default function AdminPortal({ 
  adminUser, 
  onRefreshGlobalData,
  showCustomConfirm,
  showCustomAlert
}: AdminPortalProps) {
  // Navigation tabs within Admin Center
  const [adminTab, setAdminTab] = useState<'overview' | 'hotels' | 'bookings' | 'offline' | 'users' | 'reports'>('overview');

  const confirmFn = showCustomConfirm || ((msg: string, cb: () => void) => { if (window.confirm(msg)) cb(); });
  const alertFn = showCustomAlert || ((msg: string) => window.alert(msg));

  // Stats / Analytics data
  const [stats, setStats] = useState<any>({
    totalHotels: 0,
    totalRooms: 0,
    totalUsers: 0,
    totalBookings: 0,
    activeBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    projectionRemainingRevenue: 0,
    occupancyRatePercent: 0,
    monthlyRevenue: [],
    hotelPerformance: []
  });

  // Hot lists loaded from back-end
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Search, Filters & Sorting
  const [hotelSearch, setHotelSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
  const [hotelCityFilter, setHotelCityFilter] = useState('');
  const [hotelStatusFilter, setHotelStatusFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingSourceFilter, setBookingSourceFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Multi-item / Bulk selections
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);

  // Detailed Modal controllers
  const [hotelModal, setHotelModal] = useState<{ mode: 'add' | 'edit' | 'view'; data?: any } | null>(null);
  const [bookingRescheduleModal, setBookingRescheduleModal] = useState<Booking | null>(null);
  const [quickWalkInModal, setQuickWalkInModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);

  // Form states: New / Edit Hotel Custom Inputs
  const [hotelFormName, setHotelFormName] = useState('');
  const [hotelFormCity, setHotelFormCity] = useState('');
  const [hotelFormAddress, setHotelFormAddress] = useState('');
  const [hotelFormState, setHotelFormState] = useState('');
  const [hotelFormCountry, setHotelFormCountry] = useState('United States');
  const [hotelFormZip, setHotelFormZip] = useState('');
  const [hotelFormRating, setHotelFormRating] = useState('8.5');
  const [hotelFormStars, setHotelFormStars] = useState('4');
  const [hotelFormDesc, setHotelFormDesc] = useState('');
  const [hotelFormImage, setHotelFormImage] = useState('');
  const [hotelFormAmenities, setHotelFormAmenities] = useState<string[]>([]);
  const [hotelFormFeatured, setHotelFormFeatured] = useState(false);
  const [hotelFormPopular, setHotelFormPopular] = useState(false);
  const [hotelFormCheckIn, setHotelFormCheckIn] = useState('15:00');
  const [hotelFormCheckOut, setHotelFormCheckOut] = useState('11:00');
  const [hotelFormCancellationPolicy, setHotelFormCancellationPolicy] = useState('Free cancellation up to 24 hours before stay');
  const [hotelFormPhone, setHotelFormPhone] = useState('');
  const [hotelFormEmail, setHotelFormEmail] = useState('');
  const [hotelFormRooms, setHotelFormRooms] = useState<Room[]>([
    {
      id: 'r-custom-1',
      name: 'Deluxe Executive Suite',
      type: 'Suite',
      price: 250,
      capacity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
      amenities: ['King Bed', 'Rain Shower', 'Workspace', 'Nespresso Machine'],
      description: 'A grand luxury executive suite styled with contemporary layout preferences.',
      count: 10
    }
  ]);

  // Form states: Manual Offline Booking inputs
  const [offName, setOffName] = useState('');
  const [offEmail, setOffEmail] = useState('');
  const [offPhone, setOffPhone] = useState('');
  const [offHotelId, setOffHotelId] = useState('');
  const [offRoomId, setOffRoomId] = useState('');
  const [offCheckIn, setOffCheckIn] = useState('2026-06-01');
  const [offCheckOut, setOffCheckOut] = useState('2026-06-04');
  const [offGuests, setOffGuests] = useState(2);
  const [offPaymentMethod, setOffPaymentMethod] = useState<'upi' | 'credit_card' | 'cash_on_arrival' | 'pay_at_hotel'>('pay_at_hotel');
  const [offAdvancePayment, setOffAdvancePayment] = useState('0');
  const [offRequests, setOffRequests] = useState('');

  // Form states: Booking rescheduling inputs
  const [reschedCheckIn, setReschedCheckIn] = useState('');
  const [reschedCheckOut, setReschedCheckOut] = useState('');
  const [reschedGuests, setReschedGuests] = useState(2);

  // Load Admin states on mount and when admin tabs alternate
  useEffect(() => {
    fetchStats();
    fetchHotels();
    fetchBookings();
    fetchUsers();
  }, [adminTab]);

  const apiHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-email': adminUser.email,
    };
    const token = localStorage.getItem('stayvibe_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: apiHeaders() });
      const data = await res.json();
      if (res.ok) {
        const payload = data?.data ?? data;
        setStats(mapAdminStats(payload));
      }
    } catch (e) {
      console.error('Error fetching admin statistics:', e);
    }
  };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hotels', { headers: apiHeaders() });
      const data = await res.json();
      if (res.ok) {
        const list = Array.isArray(data.hotels) ? data.hotels : [];
        setHotels(list.map((h: Record<string, unknown>) => ({
          ...h,
          id: String(h.id ?? ''),
          imageUrl: String(h.imageUrl ?? (Array.isArray(h.images) ? h.images[0] : '')),
          rooms: Array.isArray(h.rooms) ? h.rooms : [],
          status: h.status || (h.available === false ? 'disabled' : 'available'),
        })) as Hotel[]);
      }
    } catch (e) {
      console.error('Core hotel query errored:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings', { headers: apiHeaders() });
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
    } catch (e) {
      console.error('Bookings retrieve error:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: apiHeaders() });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch (e) {
      console.error('User querying error:', e);
    }
  };

  // Switch tabs & trigger UI reload
  const handleTabChange = (tab: typeof adminTab) => {
    setAdminTab(tab);
  };

  // ---- CRUD HANDLERS ----

  // 1. Hotel Add / Edit Save
  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelFormName || !hotelFormCity || !hotelFormAddress) {
      alert('Hotel Name, City, and Full Address are mandatory parameters.');
      return;
    }

    const payload = {
      name: hotelFormName,
      city: hotelFormCity,
      address: hotelFormAddress,
      state: hotelFormState,
      country: hotelFormCountry,
      zipCode: hotelFormZip,
      rating: parseFloat(hotelFormRating) || 8.5,
      stars: parseInt(hotelFormStars) || 4,
      description: hotelFormDesc,
      imageUrl: hotelFormImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      amenities: hotelFormAmenities.length ? hotelFormAmenities : ['Free WiFi', 'Air Conditioning'],
      rooms: hotelFormRooms,
      featured: hotelFormFeatured,
      popular: hotelFormPopular,
      status: 'available',
      policies: {
        checkInTime: hotelFormCheckIn,
        checkOutTime: hotelFormCheckOut,
        cancellation: hotelFormCancellationPolicy
      },
      contactDetails: {
        phone: hotelFormPhone,
        email: hotelFormEmail
      }
    };

    try {
      let res;
      if (hotelModal && hotelModal.mode === 'edit') {
        const hotelId = hotelModal.data.id;
        res = await fetch(`/api/admin/hotels/${hotelId}`, {
          method: 'PUT',
          headers: apiHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/admin/hotels', {
          method: 'POST',
          headers: apiHeaders(),
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        alert(hotelModal?.mode === 'edit' ? 'Hotel updated successfully!' : 'Hotel added successfully!');
        setHotelModal(null);
        fetchHotels();
        onRefreshGlobalData();
      } else {
        const errorData = await res.json();
        alert(`Failed to save: ${errorData.error}`);
      }
    } catch (err) {
      alert('Error connecting with backend administrative services.');
    }
  };

  // Helper: Open Modal to Add Hotel
  const openAddHotelModal = () => {
    setHotelFormName('');
    setHotelFormCity('');
    setHotelFormAddress('');
    setHotelFormState('');
    setHotelFormCountry('United States');
    setHotelFormZip('');
    setHotelFormRating('8.5');
    setHotelFormStars('4');
    setHotelFormDesc('');
    setHotelFormImage('');
    setHotelFormAmenities(['Free WiFi', 'Air Conditioning']);
    setHotelFormFeatured(false);
    setHotelFormPopular(false);
    setHotelFormCheckIn('15:00');
    setHotelFormCheckOut('11:00');
    setHotelFormCancellationPolicy('Free cancellation up to 24 hours before stay');
    setHotelFormPhone('+1 555-010-2211');
    setHotelFormEmail('reservations@stayvibe.com');
    setHotelFormRooms([
      {
        id: 'r-' + Date.now() + '-1',
        name: 'Deluxe Executive King Suite',
        type: 'Suite',
        price: 280,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
        amenities: ['King Bed', 'City Skyline View', 'Workplace Desk', 'Luxury Tub'],
        description: 'Luxurious suite featuring high ceilings and custom design elements.',
        count: 15
      },
      {
        id: 'r-' + Date.now() + '-2',
        name: 'Presidential Penthouse',
        type: 'Presidential',
        price: 980,
        capacity: 4,
        imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        amenities: ['Two King Bedrooms', 'Private Terrace', 'Cocktail Lounge bar', '24h butler'],
        description: 'Immersive penthouse looking over city limits, customized for optimal premium stays.',
        count: 2
      }
    ]);
    setHotelModal({ mode: 'add' });
  };

  // Helper: Open Modal to Edit Hotel
  const openEditHotelModal = (hotel: Hotel) => {
    setHotelFormName(hotel.name);
    setHotelFormCity(hotel.city);
    setHotelFormAddress(hotel.address);
    setHotelFormState(hotel.state || '');
    setHotelFormCountry(hotel.country || 'USA');
    setHotelFormZip(hotel.zipCode || '');
    setHotelFormRating(hotel.rating.toString());
    setHotelFormStars(hotel.stars.toString());
    setHotelFormDesc(hotel.description);
    setHotelFormImage(hotel.imageUrl);
    setHotelFormAmenities(hotel.amenities);
    setHotelFormFeatured(!!hotel.featured);
    setHotelFormPopular(!!hotel.popular);
    setHotelFormCheckIn(hotel.policies?.checkInTime || '15:00');
    setHotelFormCheckOut(hotel.policies?.checkOutTime || '11:00');
    setHotelFormCancellationPolicy(hotel.policies?.cancellation || 'Free 24h before arrival');
    setHotelFormPhone(hotel.contactDetails?.phone || '');
    setHotelFormEmail(hotel.contactDetails?.email || '');
    setHotelFormRooms(hotel.rooms);
    setHotelModal({ mode: 'edit', data: hotel });
  };

  // 2. Disable or Soft Delete Hotel
  const handleToggleHotelAvailability = async (hotelId: string, currentStatus: Hotel['status']) => {
    const nextStatus = currentStatus === 'available' ? 'disabled' : 'available';
    const message = `Are you sure you want to mark this hotel property as ${nextStatus.toUpperCase()}?`;
    if (!confirm(message)) return;

    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}`, {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        alert(`Hotel status successfully changed to ${nextStatus}!`);
        fetchHotels();
        onRefreshGlobalData();
      }
    } catch (e) {
      alert('Error updating availability index.');
    }
  };

  // 3. Permanent delete hotel
  const handleDeleteHotelPermanent = async (hotelId: string) => {
    confirmFn('WARNING: Are you absolutely sure you want to PERMANENTLY remove this hotel? All suites ledger index associated will retire.', async () => {
      try {
        const res = await fetch(`/api/admin/hotels/${hotelId}?permanent=true`, {
          method: 'DELETE',
          headers: apiHeaders()
        });
        if (res.ok) {
          alertFn('Hotel permanently purged from system database directory.');
          fetchHotels();
          onRefreshGlobalData();
        } else {
          alertFn('Failed to delete hotel.');
        }
      } catch (e) {
        alertFn('Error contacting backup ledger.');
      }
    });
  };

  // Bulk operation Hotels
  const handleBulkDeactivateHotelsSubmit = async () => {
    if (!selectedHotelIds.length) return;
    if (!confirm(`Confirm bulk deactivation of ${selectedHotelIds.length} properties?`)) return;

    try {
      await Promise.all(selectedHotelIds.map(id => 
        fetch(`/api/admin/hotels/${id}`, {
          method: 'PUT',
          headers: apiHeaders(),
          body: JSON.stringify({ status: 'disabled' })
        })
      ));
      alert('Bulk properties disabled successfully.');
      setSelectedHotelIds([]);
      fetchHotels();
      onRefreshGlobalData();
    } catch (err) {
      alert('Error during bulk hotel database adjustments.');
    }
  };

  // 4. Booking control modifications
  const handleUpdateBookingState = async (bookingId: string, reqStatus: Booking['status'], reqPaymentStatus?: Booking['paymentStatus']) => {
    if (!confirm(`Apply the action to Booking ${bookingId}? Status will change to: ${reqStatus}`)) return;

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({ status: reqStatus, paymentStatus: reqPaymentStatus })
      });
      if (res.ok) {
        alert('Booking status modified successfully! Associated alerts dispatched to user email.');
        fetchBookings();
        onRefreshGlobalData();
      } else {
        const errorData = await res.json();
        alert(`Failed: ${errorData.error}`);
      }
    } catch (e) {
      alert('Error linking transactions with core booking controllers.');
    }
  };

  // Reschedule booking
  const handleRescheduleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRescheduleModal) return;
    if (!reschedCheckIn || !reschedCheckOut) {
      alert('Provide valid Check-In and Check-Out bounds.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/bookings/${bookingRescheduleModal.id}/reschedule`, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({
          checkIn: reschedCheckIn,
          checkOut: reschedCheckOut,
          guests: reschedGuests
        })
      });
      if (res.ok) {
        alert('Rescheduled successfully! Updated invoice sent.');
        setBookingRescheduleModal(null);
        fetchBookings();
        onRefreshGlobalData();
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (err) {
      alert('Error connecting with date-overlap checker.');
    }
  };

  // Open Reschedule Form helper
  const openRescheduleForm = (booking: Booking) => {
    setBookingRescheduleModal(booking);
    setReschedCheckIn(booking.checkIn);
    setReschedCheckOut(booking.checkOut);
    setReschedGuests(booking.guests);
  };

  // 5. Offline Booking execution
  const handleOfflineBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offName || !offEmail || !offHotelId || !offRoomId || !offCheckIn || !offCheckOut) {
      alert('Please fill out Name, Email, Hotel, Suite, and Stay details.');
      return;
    }

    const payload = {
      customerName: offName,
      customerEmail: offEmail,
      customerPhone: offPhone,
      hotelId: offHotelId,
      roomId: offRoomId,
      checkIn: offCheckIn,
      checkOut: offCheckOut,
      guests: offGuests,
      paymentMethod: offPaymentMethod,
      advancePayment: parseFloat(offAdvancePayment) || 0,
      specialRequests: offRequests
    };

    try {
      const res = await fetch('/api/admin/bookings/offline', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Offline booking created successfully! Ref: ${data.booking.id}`);
        setQuickWalkInModal(false);
        setOffName('');
        setOffEmail('');
        setOffPhone('');
        setOffAdvancePayment('0');
        setOffRequests('');
        fetchBookings();
        onRefreshGlobalData();
        // Redirect to invoice print view
        setSelectedReceipt(data.booking);
      } else {
        const err = await res.json();
        alert(`Verification Failure: ${err.error}`);
      }
    } catch (err) {
      alert('Overbooking limit protection restricted block.');
    }
  };

  // Calculate Offline suite total
  const calculatedOfflineSuiteTotal = useMemo(() => {
    if (!offHotelId || !offRoomId) return 0;
    const hotel = hotels.find(h => h.id === offHotelId);
    if (!hotel) return 0;
    const room = hotel.rooms.find(r => r.id === offRoomId);
    if (!room) return 0;

    const nights = Math.max(1, Math.round((new Date(offCheckOut).getTime() - new Date(offCheckIn).getTime()) / (1000 * 60 * 60 * 24))) || 1;
    return nights * room.price;
  }, [offHotelId, offRoomId, offCheckIn, offCheckOut, hotels]);

  // Handle selected offline hotel change, auto-select first available room
  const handleOfflineHotelChange = (hId: string) => {
    setOffHotelId(hId);
    const targetHotel = hotels.find(h => h.id === hId);
    if (targetHotel && targetHotel.rooms.length) {
      setOffRoomId(targetHotel.rooms[0].id);
    } else {
      setOffRoomId('');
    }
  };

  // 6. User Management controls
  const handleToggleBlockStatus = async (userId: string, currentStatus: User['status']) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    if (!confirm(`Are you sure you want to change this customer status to: ${nextStatus.toUpperCase()}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        alert('User status changed! Blocking blocks authentication attempts.');
        fetchUsers();
      }
    } catch (e) {
      alert('Error updating user state.');
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: User['role']) => {
    const nextRole = currentRole === 'ROLE_USER' ? 'ROLE_ADMIN' : 'ROLE_USER';
    if (!confirm(`Confirm change role of user to: ${nextRole}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({ role: nextRole })
      });
      if (res.ok) {
        alert('User system role modified.');
        fetchUsers();
      }
    } catch (e) {
      alert('Error updating database role credentials.');
    }
  };

  const handleDeleteUserAccount = async (userId: string) => {
    if (!confirm('DANGER: Permanently delete this customer account? Historic active reservations won\'t wipe but user profile will clear.')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: apiHeaders()
      });
      if (res.ok) {
        alert('User permanently deleted.');
        fetchUsers();
      }
    } catch (err) {
      alert('Error purged database accounts profile.');
    }
  };

  // Custom data reports downloaders
  const handleCSVExport = (type: 'bookings' | 'hotels' | 'users' | 'revenue') => {
    let header = '';
    let rows = '';

    if (type === 'bookings') {
      header = 'Booking ID,Customer Name,Email,Hotel,Room Suite,CheckIn,CheckOut,Occupants,Total Price,Status,Source,Payment\n';
      bookings.forEach(b => {
        rows += `"${b.id}","${b.userName}","${b.userEmail}","${b.hotelName}","${b.roomName}","${b.checkIn}","${b.checkOut}",${b.guests},${b.totalPrice},"${b.status}","${b.bookingSource}","${b.paymentStatus}"\r\n`;
      });
    } else if (type === 'hotels') {
      header = 'Hotel ID,Property Name,City,Address,Stars,Rating,Rooms Types Count,Availability Status\n';
      hotels.forEach(h => {
        rows += `"${h.id}","${h.name}","${h.city}","${h.address}",${h.stars},${h.rating},${h.rooms.length},"${h.status}"\r\n`;
      });
    } else if (type === 'users') {
      header = 'User ID,Full Name,Username,Email,Phone,Role,Status,Registered At\n';
      users.forEach(u => {
        rows += `"${u.id}","${u.name}","${u.username}","${u.email}","${u.phone}","${u.role}","${u.status}","${u.createdAt}"\r\n`;
      });
    } else {
      header = 'Metrique Analytics Overview Table,Value Sum\n';
      rows += `Total Computed Income Revenue,$${stats.totalRevenue}\r\n`;
      rows += `Awaiting Desk Collections Remaining,$${stats.projectionRemainingRevenue}\r\n`;
      rows += `Occupancy Rate Dial Percentage,${stats.occupancyRatePercent}%\r\n`;
      rows += `Active Ledger Count,${stats.activeBookings}\r\n`;
      rows += `Archived Cancellations Count,${stats.cancelledBookings}\r\n`;
    }

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stayvibe_report_${type}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Receipt simulator
  const triggerPrintReceipt = () => {
    window.print();
  };

  // Toggle single amenity on hotel forms
  const handleFormToggleAmenity = (amenity: string) => {
    setHotelFormAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const amenitiesPresetList = [
    'Free WiFi', 'Luxury Spa', 'Indoor Pool', 'Michelin Star Dining', '24h Concierge',
    'Air Conditioning', 'Self Check-in Kiosks', 'Laundry Facilities', 'Valet Parking',
    'Heated Rooftop Pool', 'Boutique Coffee Station', 'American Bar'
  ];

  // ---- COMPUTE LOCAL FILTERS & SORTS ----
  const processedHotelsLocal = useMemo(() => {
    return hotels.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(hotelSearch.toLowerCase()) || 
                            h.city.toLowerCase().includes(hotelSearch.toLowerCase()) ||
                            h.address.toLowerCase().includes(hotelSearch.toLowerCase());
      const matchesCity = hotelCityFilter ? h.city === hotelCityFilter : true;
      const matchesStatus = hotelStatusFilter !== 'all' ? h.status === hotelStatusFilter : true;
      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [hotels, hotelSearch, hotelCityFilter, hotelStatusFilter]);

  const processedBookingsLocal = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.id.toLowerCase().includes(bookingSearch.toLowerCase()) || 
                            b.userName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                            b.userEmail.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                            b.hotelName.toLowerCase().includes(bookingSearch.toLowerCase());
      const matchesStatus = bookingStatusFilter !== 'all' ? b.status === bookingStatusFilter : true;
      const matchesSource = bookingSourceFilter !== 'all' ? b.bookingSource === bookingSourceFilter : true;
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [bookings, bookingSearch, bookingStatusFilter, bookingSourceFilter]);

  const processedUsersLocal = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                            u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                            (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
                            (u.phone && u.phone.includes(userSearch));
      const matchesRole = userRoleFilter !== 'all' ? u.role === userRoleFilter : true;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  return (
    <div id="admin_portal_root" className="min-h-[70vh] flex flex-col md:flex-row gap-6 bg-slate-900 text-slate-100 p-4 sm:p-6 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-3xl">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 flex flex-col gap-6 flex-shrink-0 bg-slate-950 p-6 rounded-[2rem] border border-slate-800">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 font-extrabold text-sm">
            👑
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight text-white uppercase">StayVibe Admin</h3>
            <p className="text-[10px] text-slate-400 font-bold block truncate max-w-[140px]" title={adminUser.email}>
              {adminUser.email}
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <button
            onClick={() => handleTabChange('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              adminTab === 'overview'
                ? 'bg-rose-550 bg-rose-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => handleTabChange('hotels')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              adminTab === 'hotels'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Hotels Management</span>
          </button>

          <button
            onClick={() => handleTabChange('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              adminTab === 'bookings'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>All Bookings Ledger</span>
          </button>

          <button
            onClick={() => {
              // Open walk-in direct
              setOffHotelId(hotels.length ? hotels[0].id : '');
              if (hotels.length && hotels[0].rooms.length) {
                setOffRoomId(hotels[0].rooms[0].id);
              }
              setAdminTab('offline');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              adminTab === 'offline'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <PhoneCall className="h-4 w-4" />
            <span>Walk-In Reservation</span>
          </button>

          <button
            onClick={() => handleTabChange('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              adminTab === 'users'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Users Management</span>
          </button>

          <button
            onClick={() => handleTabChange('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              adminTab === 'reports'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Finance & CSV Reports</span>
          </button>
        </nav>

        {/* Diagnostic widget inside sidebar */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Live Node
          </div>
          <p className="text-[10px] text-slate-405 text-slate-400 font-mono">
            Vibe DB Sync: OK<br />
            Auth engine: Active<br />
            SSL cert: Secured
          </p>
        </div>
      </aside>

      {/* 2. CHOSEN CONTENT GRID CONTROLLER */}
      <section className="flex-1 min-w-0 bg-slate-950/60 p-6 sm:p-8 rounded-[2rem] border border-slate-850/50 flex flex-col gap-8">
        
        {/* TAB A: OVERVIEW PANEL WITH HIGH POLISH COUNTERS & CHART */}
        {adminTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header section with quick buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">ADMIN DASHBOARD</span>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Properties Overview Hub</h1>
              </div>
              <button
                onClick={() => {
                  setOffHotelId(hotels.length ? hotels[0].id : '');
                  if (hotels.length && hotels[0].rooms.length) {
                    setOffRoomId(hotels[0].rooms[0].id);
                  }
                  setQuickWalkInModal(true);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Quick Walk-In Entry</span>
              </button>
            </div>

            {/* HIGH END BENTO GRID STATISTICS COUNTERS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-rose-500/20 transition-all">
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">Total Hotels</span>
                  <span className="text-3xl font-black text-white mt-1.5 block">{stats.totalHotels}</span>
                  <span className="text-[9px] text-emerald-400 font-bold mt-1 block">Live & operational</span>
                </div>
                <div className="bg-rose-500/10 text-rose-450 text-rose-500 p-3.5 rounded-xl">
                  <Building className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">Total Users</span>
                  <span className="text-3xl font-black text-white mt-1.5 block">{stats.totalUsers}</span>
                  <span className="text-[9px] text-emerald-400 font-bold mt-1 block">Unified secure logins</span>
                </div>
                <div className="bg-indigo-500/10 text-indigo-400 p-3.5 rounded-xl">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">Revenue Overview</span>
                  <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-450 text-white mt-1.5 block">
                    ${stats.totalRevenue}
                  </span>
                  <span className="text-[9px] text-amber-400 font-bold mt-1 block">
                    Awaiting: ${stats.projectionRemainingRevenue}
                  </span>
                </div>
                <div className="bg-emerald-500/10 text-emerald-450 text-emerald-400 p-3.5 rounded-xl">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-violet-500/20 transition-all">
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block">Occupancy Analytics</span>
                  <span className="text-3xl font-black text-white mt-1.5 block">{stats.occupancyRatePercent}%</span>
                  <span className="text-[9px] text-indigo-400 font-bold mt-1 block">Rooms capacity filled</span>
                </div>
                <div className="bg-violet-500/10 text-violet-400 p-3.5 rounded-xl">
                  <Activity className="h-5 w-5" />
                </div>
              </div>

            </div>

            {/* DYNAMIC METRIC CHARTS & STATISTICS VISUALIZATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Dynamic Revenue Weekly Bar Chart (Standard SVG representation) */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Monthly Consolidated Revenue Overview</h3>
                    <p className="text-[11px] text-slate-400">Aggregated income calculation timeline metric scale</p>
                  </div>
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <TrendingUp className="h-3.5 w-3.5" /> High Performance
                  </span>
                </div>

                {/* Gorgeous Responsive SVG Bar Chart */}
                <div className="h-64 flex items-end justify-between pt-6 px-4">
                  {(Array.isArray(stats.monthlyRevenue) ? stats.monthlyRevenue : []).map((unit: any, index: number) => {
                    const chartData = Array.isArray(stats.monthlyRevenue) ? stats.monthlyRevenue : [];
                    const maxVal = chartData.length
                      ? Math.max(...chartData.map((m: any) => Number(m.revenue) || 0), 1)
                      : 1;
                    const revenue = Number(unit.revenue) || 0;
                    const heightPercent = Math.max(10, Math.round((revenue / maxVal) * 80));
                    return (
                      <div key={index} className="flex flex-col items-center gap-3 w-1/6 group">
                        {/* Dynamic Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 bg-slate-950 border border-slate-800 text-[10px] text-white font-mono rounded px-2 py-1 transition-all mb-[-8px] z-10 font-bold">
                          ${revenue}
                        </div>
                        <div className="w-8 sm:w-10 bg-gradient-to-t from-rose-600 to-rose-500 rounded-t-lg transition-all duration-700 pointer-events-auto cursor-pointer group-hover:from-rose-500 group-hover:to-rose-400 flex items-center justify-center text-[10px] font-sans font-extrabold text-white" style={{ height: `${heightPercent}%` }}>
                          <span className="rotate-270 scale-90 opacity-0 group-hover:opacity-100 transition-opacity">
                            ${Math.round(revenue / 100) / 10}k
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-450 text-slate-400">{unit.month}</span>
                      </div>
                    );
                  })}
                  {(!Array.isArray(stats.monthlyRevenue) || stats.monthlyRevenue.length === 0) && (
                    <p className="text-xs text-slate-500 w-full text-center py-10">No revenue data yet.</p>
                  )}
                </div>
              </div>

              {/* Occupancy and Bookings Breakdown circles */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white pb-3 border-b border-slate-800 mb-4">
                    Booking Statistics Archive
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-450 text-slate-400 font-semibold flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Active Bookings
                      </span>
                      <span className="font-mono font-bold text-white">{stats.activeBookings} stays</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-450 text-slate-400 font-semibold flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Cancelled Bookings
                      </span>
                      <span className="font-mono font-bold text-white">{stats.cancelledBookings} holds</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-450 text-slate-400 font-semibold flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> Overall Operations
                      </span>
                      <span className="font-mono font-bold text-white">{stats.totalBookings} records</span>
                    </div>
                  </div>
                </div>

                {/* Interactive radial progress mockup representing active rate */}
                <div className="pt-6 border-t border-slate-800 flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-slate-800">
                    <span className="text-xs font-black text-rose-500">{stats.occupancyRatePercent}%</span>
                    <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin duration-3000 pointer-events-none" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">Consolidated Occupancy Rate</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Real-time occupancy threshold benchmark index</p>
                  </div>
                </div>
              </div>

            </div>

            {/* RECENT RECORDS SUB SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Booking ledgers */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h3 className="font-extrabold text-sm text-white mb-4 flex justify-between items-center">
                  <span>Recent Bookings</span>
                  <button onClick={() => setAdminTab('bookings')} className="text-xs text-rose-400 hover:underline">
                    View All
                  </button>
                </h3>
                <div className="space-y-3.5">
                  {bookings.slice(0, 4).map((b) => (
                    <div key={b.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs transition-hover hover:border-slate-700">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white">{b.userName}</span>
                          <span className="text-[10px] bg-slate-800 font-mono text-slate-400 px-1 py-0.2 rounded font-bold uppercase">{b.bookingSource}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{b.hotelName} • {b.roomType}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-white block">${b.totalPrice}</span>
                        <span className={`text-[9px] mt-1 font-bold inline-block uppercase px-1.5 py-0.5 rounded-md ${
                          b.status === 'cancelled' ? 'bg-rose-500/25 text-rose-450 text-rose-400' : 'bg-emerald-500/25 text-emerald-450 text-emerald-400'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!bookings.length && (
                    <p className="text-xs text-slate-500 py-6 text-center">No bookings registered yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Added Hotels */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h3 className="font-extrabold text-sm text-white mb-4 flex justify-between items-center">
                  <span>Hotels Listing Overview</span>
                  <button onClick={() => setAdminTab('hotels')} className="text-xs text-rose-400 hover:underline">
                    Manage Properties
                  </button>
                </h3>
                <div className="space-y-3.5">
                  {hotels.slice(0, 4).map((h) => (
                    <div key={h.id} className="bg-slate-950 p-3 px-4 rounded-xl border border-slate-800 flex items-center gap-3.5 transition-hover hover:border-slate-700">
                      <img src={h.imageUrl} alt={h.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-white text-xs truncate block">{h.name}</span>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-rose-400" /> {h.city}, {h.country || 'USA'}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        h.status === 'available' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {h.status}
                      </span>
                    </div>
                  ))}
                  {!hotels.length && (
                    <p className="text-xs text-slate-500 py-6 text-center">No hotel assets loaded yet.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB B: HOTELS MANAGEMENT WITH FULL CRUD AND FILTERS */}
        {adminTab === 'hotels' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-2xl font-black text-white">Hotels Directory Registry</h1>
                <p className="text-xs text-slate-400 mt-1">Add, edit, soft-disable, and manage global luxury listings.</p>
              </div>
              <div className="flex gap-2">
                {selectedHotelIds.length > 0 && (
                  <button
                    onClick={handleBulkDeactivateHotelsSubmit}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                  >
                    Bulk Disable ({selectedHotelIds.length})
                  </button>
                )}
                <button
                  onClick={openAddHotelModal}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add Hotel Property
                </button>
              </div>
            </div>

            {/* FILTER SEARCH CRITERIA */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search hotels by moniker name or city location..."
                  value={hotelSearch}
                  onChange={(e) => setHotelSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-slate-700"
                />
              </div>

              <select
                value={hotelStatusFilter}
                onChange={(e) => setHotelStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-2 px-3 text-xs outline-none cursor-pointer focus:border-slate-700"
              >
                <option value="all">Status: All</option>
                <option value="available">Status: Available</option>
                <option value="disabled">Status: Disabled</option>
              </select>

              <button
                onClick={() => handleCSVExport('hotels')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5"
                title="Download spreadsheet metrics"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>

            {/* HOTELS LISTING PORTAL TABLE */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-855 text-slate-400 font-extrabold uppercase">
                    <th className="p-4 w-10">
                      <input 
                        type="checkbox"
                        checked={selectedHotelIds.length === processedHotelsLocal.length && processedHotelsLocal.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHotelIds(processedHotelsLocal.map(h => h.id));
                          } else {
                            setSelectedHotelIds([]);
                          }
                        }}
                        className="rounded border-slate-840 accent-rose-600 bg-slate-950"
                      />
                    </th>
                    <th className="p-4">Hotel Property</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Suites Count</th>
                    <th className="p-4">Rating Index</th>
                    <th className="p-4">Nightly Base</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {processedHotelsLocal.map((hotel) => {
                    const basePrice = hotel.rooms && hotel.rooms.length ? Math.min(...hotel.rooms.map(r => r.price)) : 100;
                    const isSelected = selectedHotelIds.includes(hotel.id);
                    return (
                      <tr key={hotel.id} className="hover:bg-slate-850/30 transition-all font-semibold">
                        <td className="p-4">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedHotelIds(prev => 
                                prev.includes(hotel.id) ? prev.filter(id => id !== hotel.id) : [...prev, hotel.id]
                              );
                            }}
                            className="rounded border-slate-840 accent-rose-600 bg-slate-950"
                          />
                        </td>
                        <td className="p-4 flex items-center gap-3">
                          <img src={hotel.imageUrl} alt={hotel.name} className="w-10 h-10 object-cover rounded-xl" />
                          <div>
                            <span className="font-extrabold text-white block text-sm leading-snug">{hotel.name}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              {hotel.featured && <span className="text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.2 rounded uppercase">Featured</span>}
                              {hotel.popular && <span className="text-[9px] font-bold bg-indigo-500 text-white px-1.5 py-0.2 rounded uppercase">Popular</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300">
                          <div className="flex items-center gap-1 text-slate-300">
                            <MapPin className="h-3.5 w-3.5 text-slate-500" />
                            <span>{hotel.city}, {hotel.country || 'USA'}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 block truncate max-w-[150px]">{hotel.address}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-400">{hotel.rooms ? hotel.rooms.length : 0} types</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-amber-400">★ {hotel.stars}</span>
                            <span className="text-slate-500">({hotel.rating}/10)</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-black text-rose-400 text-sm">${basePrice}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleHotelAvailability(hotel.id, hotel.status)}
                            className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                              hotel.status === 'available'
                                ? 'bg-emerald-550/15 text-emerald-400 hover:bg-emerald-550/25 border border-emerald-555/20'
                                : 'bg-slate-800 text-slate-450 hover:bg-slate-700'
                            }`}
                          >
                            {hotel.status}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => openEditHotelModal(hotel)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg transition-all inline-flex"
                            title="Edit specifications"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHotelPermanent(hotel.id)}
                            className="bg-rose-950 hover:bg-rose-900 text-rose-400 p-2 rounded-lg transition-all inline-flex"
                            title="Delete permanent"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!processedHotelsLocal.length && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-505 font-medium text-slate-400">
                        No property items found matching selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB C: ALL BOOKINGS LEDGER WITH RESCHEDULE & REFUND OPERATIONS */}
        {adminTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-2xl font-black text-white">Global Reservations Registry</h1>
                <p className="text-xs text-slate-405 text-slate-405 text-slate-400 mt-1">
                  Manage walk-ins and client reservations. Handle cancellations, reschedule dates, and print vouchers.
                </p>
              </div>
              <button
                onClick={() => handleCSVExport('bookings')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 select-all"
              >
                <Download className="h-4 w-4" /> Export CSV Record
              </button>
            </div>

            {/* Search Criteria Bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search bookings by Guest Name, Email, Confirmation ID..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-slate-700"
                />
              </div>

              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-2 px-3 text-xs outline-none cursor-pointer focus:border-slate-700"
              >
                <option value="all">Status: All</option>
                <option value="confirmed">Status: Confirmed</option>
                <option value="cancelled">Status: Cancelled</option>
              </select>

              <select
                value={bookingSourceFilter}
                onChange={(e) => setBookingSourceFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-2 px-3 text-xs outline-none cursor-pointer focus:border-slate-700"
              >
                <option value="all">Source: All</option>
                <option value="online">Source: Online</option>
                <option value="offline">Source: Offline</option>
              </select>
            </div>

            {/* LEDGER DATA TABLE */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-855 text-slate-400 font-extrabold uppercase">
                    <th className="p-4">Ref Code</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Stay & Suite</th>
                    <th className="p-4">Timeline Dates</th>
                    <th className="p-4">Calculated Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4 w-10">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {processedBookingsLocal.map((b) => {
                    const isCancelled = b.status === 'cancelled';
                    return (
                      <tr key={b.id} className={`hover:bg-slate-850/30 transition-all font-semibold ${isCancelled ? 'opacity-55' : ''}`}>
                        <td className="p-4 font-mono font-black text-rose-400 text-xs uppercase">{b.id}</td>
                        <td className="p-4">
                          <span className="font-extrabold text-white block text-sm leading-snug">{b.userName}</span>
                          <span className="text-[10px] text-slate-450 block text-slate-400 truncate max-w-[150px]">{b.userEmail}</span>
                          {b.customerPhone && <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{b.customerPhone}</span>}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-white block truncate max-w-[150px]">{b.hotelName}</span>
                          <span className="text-[10px] text-rose-400 block mt-0.5 font-semibold">{b.roomName} ({b.roomType})</span>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-350 flex flex-col gap-0.5">
                            <span>Check-In: <strong className="text-slate-200">{b.checkIn}</strong></span>
                            <span>Check-Out: <strong className="text-slate-200">{b.checkOut}</strong></span>
                            <span className="text-[10px] text-slate-500">({b.guests} occupants)</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono">
                          <span className="font-black text-white text-base block">${b.totalPrice}</span>
                          {b.bookingSource === 'offline' && <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1 py-0.1 rounded uppercase block w-max mt-0.5 font-bold">Offline Desk</span>}
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            b.paymentStatus === 'paid' ? 'bg-emerald-500/15 text-emerald-400' :
                            b.paymentStatus === 'partially_paid' ? 'bg-amber-500/15 text-amber-400' :
                            b.paymentStatus === 'refunded' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-slate-850 text-slate-400'
                          }`}>
                            {b.paymentStatus ? b.paymentStatus.replace('_', ' ') : 'Paid'}
                          </span>
                          <span className="text-[9px] text-slate-450 block mt-1 uppercase text-slate-400">Via: {b.paymentMethod ? b.paymentMethod.replace('_', ' ') : 'Credit Card'}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.7 rounded-full inline-block ${
                            b.status === 'confirmed' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap space-x-1">
                          {!isCancelled && (
                            <>
                              <button
                                onClick={() => openRescheduleForm(b)}
                                className="bg-slate-800 hover:bg-slate-750 text-indigo-300 px-2 py-1.5 rounded-lg text-xs"
                                title="Reschedule Date bounds"
                              >
                                Edit Dates
                              </button>
                              <button
                                onClick={() => handleUpdateBookingState(b.id, 'cancelled', 'refunded')}
                                className="bg-rose-955 bg-rose-950 text-rose-400 px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-900 transition-all font-bold"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedReceipt(b)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg text-xs transition-all inline-flex"
                            title="Receipt details"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!processedBookingsLocal.length && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                        No checkin ledger records matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB D: MANUAL OFFLINE BOOKING INTERFACE */}
        {(adminTab === 'offline' || quickWalkInModal) && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto w-full bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800">
            <div className="pb-4 border-b border-slate-800">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> MANUAL WALK-IN RECONCILIATION
              </span>
              <h2 className="text-xl font-black text-white mt-1">Register Desk Walk-In or Phone Booking</h2>
              <p className="text-xs text-slate-400 mt-1">
                Calculate base suite taxes automatically, bypass credit limits, and print instant transaction drafts.
              </p>
            </div>

            <form onSubmit={handleOfflineBookingSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Guest General */}
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase">Guest Representative Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Johnathan Doe"
                    value={offName}
                    onChange={(e) => setOffName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl outline-none focus:border-slate-700"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Email Contact</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    value={offEmail}
                    onChange={(e) => setOffEmail(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl outline-none focus:border-slate-700"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+1 555-019-2834"
                    value={offPhone}
                    onChange={(e) => setOffPhone(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl outline-none"
                  />
                </div>

                {/* Property Match */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Selected Hotel Property</label>
                  <select
                    value={offHotelId}
                    onChange={(e) => handleOfflineHotelChange(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 p-3 rounded-xl outline-none focus:border-slate-700"
                    required
                  >
                    <option value="">-- Choose Hotel --</option>
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Suite Type</label>
                  <select
                    value={offRoomId}
                    onChange={(e) => setOffRoomId(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 p-3 rounded-xl outline-none focus:border-slate-700"
                    required
                    disabled={!offHotelId}
                  >
                    <option value="">-- Select Suite --</option>
                    {offHotelId && hotels.find(h => h.id === offHotelId)?.rooms.map((room) => (
                      <option key={room.id} value={room.id}>{room.name} (${room.price}/night)</option>
                    ))}
                  </select>
                </div>

                {/* Timeline Inputs */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Check-In</label>
                  <input 
                    type="date"
                    value={offCheckIn}
                    onChange={(e) => setOffCheckIn(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Check-Out</label>
                  <input 
                    type="date"
                    value={offCheckOut}
                    onChange={(e) => setOffCheckOut(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl outline-none"
                    required
                    min={offCheckIn}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Guests Limit</label>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={offGuests}
                    onChange={(e) => setOffGuests(parseInt(e.target.value) || 1)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Advance Cash Collection</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="Enter advance collected value"
                    value={offAdvancePayment}
                    onChange={(e) => setOffAdvancePayment(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase block">Settlement Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                    {[
                      { key: 'cash_on_arrival', name: 'Cash Entry' },
                      { key: 'credit_card', name: 'Credit card swipe' },
                      { key: 'upi', name: 'UPI instant desk' },
                      { key: 'pay_at_hotel', name: 'Pending post' }
                    ].map((m) => (
                      <label key={m.key} className={`flex items-center justify-center p-3 border-2 rounded-xl text-center text-xs font-semibold cursor-pointer transition-all ${
                        offPaymentMethod === m.key 
                          ? 'border-rose-600 bg-rose-600/10 text-rose-450 text-white' 
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}>
                        <input 
                          type="radio" 
                          name="offPaymentMethodRadio"
                          checked={offPaymentMethod === m.key}
                          onChange={() => setOffPaymentMethod(m.key as any)}
                          className="sr-only"
                        />
                        {m.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase">Optional Special Requests</label>
                  <textarea 
                    placeholder="Luggage storage details or custom arrangements..."
                    value={offRequests}
                    onChange={(e) => setOffRequests(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl outline-none"
                    rows={2}
                  />
                </div>

              </div>

              {/* Dynamic cost overview */}
              {calculatedOfflineSuiteTotal > 0 && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-between text-xs font-sans">
                  <div className="space-y-1">
                    <p className="text-slate-400 font-semibold">Total Calculated Cost of stay:</p>
                    <p className="text-[10px] text-slate-500">Includes all seasonal suite taxes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-mono font-black text-rose-400">${calculatedOfflineSuiteTotal}</p>
                    <p className="text-[10px] text-slate-400">Due collection: ${(calculatedOfflineSuiteTotal - (parseFloat(offAdvancePayment) || 0))}</p>
                  </div>
                </div>
              )}

              {/* Action row */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3.5">
                {quickWalkInModal && (
                  <button
                    type="button"
                    onClick={() => setQuickWalkInModal(false)}
                    className="text-xs font-extrabold text-slate-400 hover:text-white px-4 py-2"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" /> Confirm Walk-In Registration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB E: USER REGISTRATION & CONTROL TABLE (BLOCK/ROLES) */}
        {adminTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-2xl font-black text-white">Guest Profiles Directory</h1>
                <p className="text-xs text-slate-400 mt-1">Review unified guest profiles, secure sessions, promote administratives, or block offenders.</p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Registered profiles limit: <strong className="text-rose-455 text-rose-500">{users.length} accounts</strong>
              </span>
            </div>

            {/* User Search Panel */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Query user database profiles by name, email, or telephone contact..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-slate-700"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-2 px-3 text-xs outline-none cursor-pointer focus:border-slate-700"
              >
                <option value="all">Role: All</option>
                <option value="ROLE_USER">Role: Normal User</option>
                <option value="ROLE_ADMIN">Role: Admin</option>
              </select>

              <button
                onClick={() => handleCSVExport('users')}
                className="bg-slate-800 hover:bg-slate-705 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Download className="h-4 w-4" /> Export Guests List
              </button>
            </div>

            {/* USERS ROBUST TABLE */}
            <div className="bg-slate-900 rounded-3xl border border-slate-880 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-855 text-slate-400 font-extrabold uppercase">
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Security Credentials</th>
                    <th className="p-4">Phone / Profile</th>
                    <th className="p-4">Address Ledger</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Level Role</th>
                    <th className="p-4 text-right">Actions Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {processedUsersLocal.map((user) => {
                    const isSelfAdmin = user.email.toLowerCase() === adminUser.email.toLowerCase();
                    return (
                      <tr key={user.id} className="hover:bg-slate-850/30 transition-all font-semibold">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-black border border-indigo-500/20">
                              {user.name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2)}
                            </div>
                            <div>
                              <span className="font-extrabold text-white block text-sm leading-snug">{user.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">User ID: {user.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-white block">{user.email}</span>
                          <span className="text-[10px] text-slate-500 block">Registered: {new Date(user.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-300 font-mono">{user.phone || 'N/A'}</span>
                          <span className="text-[10px] text-slate-500 block uppercase mt-0.5">DOB: {user.dob || 'None'}</span>
                        </td>
                        <td className="p-4">
                          {user.address && user.address.city ? (
                            <div className="text-slate-350 leading-normal max-w-[170px] truncate">
                              <span>{user.address.fullAddress}</span>
                              <span className="text-[10px] text-slate-500 block mt-0.5">{user.address.city}, {user.address.state}, {user.address.country}</span>
                            </div>
                          ) : (
                            <span className="text-slate-505 text-slate-400 italic">No address populated</span>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleBlockStatus(user.id, user.status)}
                            disabled={isSelfAdmin}
                            className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                              user.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-450 text-rose-400 border border-rose-500/20'
                            } disabled:opacity-45 disabled:cursor-not-allowed`}
                            title={isSelfAdmin ? 'Cannot block yourself' : 'Toggle status block'}
                          >
                            {user.status === 'active' ? '● Active' : '◼ Suspended'}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleUserRole(user.id, user.role)}
                            disabled={isSelfAdmin}
                            className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                              user.role === 'ROLE_ADMIN'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            } disabled:opacity-45 disabled:cursor-not-allowed`}
                            title={isSelfAdmin ? 'Cannot change own role' : 'Toggle Authorization level'}
                          >
                            {user.role === 'ROLE_ADMIN' ? '👑 Admin' : 'Agent User'}
                          </button>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteUserAccount(user.id)}
                            disabled={isSelfAdmin}
                            className="bg-rose-955 bg-rose-950 hover:bg-rose-900 text-rose-400 p-2 rounded-lg text-xs transition-colors disabled:opacity-45"
                            title="Delete user account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!processedUsersLocal.length && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                        No registered customer accounts matching.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB F: GRAPH REPORTS DOWNLOADS AND EXPORTS */}
        {adminTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
            <div className="pb-4 border-b border-slate-800">
              <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">Core reports & statistics</span>
              <h1 className="text-2xl font-black text-white mt-1">Export Administrative Reports</h1>
              <p className="text-xs text-slate-400 mt-1">Execute direct CSV structured dumps of the properties registries, users, transaction vouchers, and monthly financial summaries.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-indigo-500/15 text-indigo-400 flex items-center justify-center rounded-xl font-bold">
                    🏨
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Hotels Directory Database</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Downloads comprehensive list of hotels including dynamic address metrics, rooms metadata capacity counts, star ratios, ratings, and disabled status indicators.
                  </p>
                </div>
                <button
                  onClick={() => handleCSVExport('hotels')}
                  className="mt-6 bg-slate-800 hover:bg-indigo-600 text-white font-bold text-xs py-3 w-full rounded-xl transition-all block text-center"
                >
                  Download Hotels Spreadsheet
                </button>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-emerald-500/15 text-emerald-400 flex items-center justify-center rounded-xl font-bold">
                    📝
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Vouchers Transactions History</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Downloads complete history of booking confirmed and cancelled vouchers including user demographics, pre-paid quantities, checkin-checkout ranges, and desk balances.
                  </p>
                </div>
                <button
                  onClick={() => handleCSVExport('bookings')}
                  className="mt-6 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold text-xs py-3 w-full rounded-xl transition-all block text-center animate-pulse"
                >
                  Download Bookings Excel
                </button>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-violet-500/15 text-violet-400 flex items-center justify-center rounded-xl font-bold">
                    👥
                  </div>
                  <h4 className="font-extrabold text-sm text-white font-sans">Guest Profiling Registry</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Query full profiling accounts report including registration date ranges, contact information, state/country addresses, and status blocks.
                  </p>
                </div>
                <button
                  onClick={() => handleCSVExport('users')}
                  className="mt-6 bg-slate-800 hover:bg-violet-650 text-white font-bold text-xs py-3 w-full rounded-xl transition-all block text-center"
                >
                  Download Customers Archive
                </button>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-rose-500/15 text-rose-550 text-rose-400 flex items-center justify-center rounded-xl font-bold">
                    📊
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Financial Yield Performance</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Summary metrics layout covering computed total gross income, remaining desk dues, occupancies benchmark rate, monthly projections, and performance by property.
                  </p>
                </div>
                <button
                  onClick={() => handleCSVExport('revenue')}
                  className="mt-6 bg-slate-800 hover:bg-rose-600 text-white font-bold text-xs py-3 w-full rounded-xl transition-all block text-center"
                >
                  Download Yield Excel summary
                </button>
              </div>

            </div>
          </div>
        )}

      </section>

      {/* ---- ADMIN AUXILIARY MODAL LAYER 1: ADD / EDIT HOTEL PROPERTIES ---- */}
      {hotelModal && (hotelModal.mode === 'add' || hotelModal.mode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in text-slate-950 font-sans">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col text-slate-800">
            {/* Header backdrop */}
            <div className="bg-slate-900 px-8 py-5 flex items-center justify-between text-white flex-shrink-0">
              <div>
                <h3 className="font-black text-lg">{hotelModal.mode === 'add' ? 'Create Luxury Venue Asset' : 'Edit Hotel Specifications'}</h3>
                <p className="text-xs text-slate-400">Map properties coordinates, total rooms structures, base nightly rate guides, and policies.</p>
              </div>
              <button onClick={() => setHotelModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form body container */}
            <form onSubmit={handleSaveHotel} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              
              {/* Core Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">Hotel Name</label>
                  <input 
                    type="text" 
                    value={hotelFormName}
                    onChange={(e) => setHotelFormName(e.target.value)}
                    placeholder="E.g., Grand Palace Hotel"
                    className="border border-slate-250 p-2.5 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">City Region</label>
                  <input 
                    type="text" 
                    value={hotelFormCity}
                    onChange={(e) => setHotelFormCity(e.target.value)}
                    placeholder="E.g., Tokyo or Paris"
                    className="border border-slate-250 p-2.5 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">Full Physical Street Address</label>
                  <input 
                    type="text" 
                    value={hotelFormAddress}
                    onChange={(e) => setHotelFormAddress(e.target.value)}
                    placeholder="Provide full coordinates detail..."
                    className="border border-slate-250 p-2.5 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">State / Province</label>
                  <input 
                    type="text" 
                    value={hotelFormState}
                    onChange={(e) => setHotelFormState(e.target.value)}
                    className="border border-slate-250 p-2.5 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">Country</label>
                  <input 
                    type="text" 
                    value={hotelFormCountry}
                    onChange={(e) => setHotelFormCountry(e.target.value)}
                    className="border border-slate-250 p-2.5 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">Thumbnail / Image URL</label>
                  <input 
                    type="text" 
                    value={hotelFormImage}
                    onChange={(e) => setHotelFormImage(e.target.value)}
                    placeholder="Unsplash premium URL..."
                    className="border border-slate-250 p-2.5 rounded-xl text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">Stars Ratio (1-5)</label>
                  <select
                    value={hotelFormStars}
                    onChange={(e) => setHotelFormStars(e.target.value)}
                    className="border border-slate-250 p-2.5 rounded-xl text-xs"
                  >
                    <option value="5">5 Star Palace</option>
                    <option value="4">4 Star Quality</option>
                    <option value="3">3 Star Economy</option>
                  </select>
                </div>

              </div>

              {/* Status checkboxes */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hotelFormFeatured}
                    onChange={(e) => setHotelFormFeatured(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span>Featured Hotel (Highlight Banner)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hotelFormPopular}
                    onChange={(e) => setHotelFormPopular(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span>Popular Hotel (Best Vibe ranking)</span>
                </label>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase">Marketing Description</label>
                <textarea 
                  rows={3}
                  value={hotelFormDesc}
                  onChange={(e) => setHotelFormDesc(e.target.value)}
                  placeholder="Express properties proximity to metro connectivities, luxury view suites, wellness spa clubs..."
                  className="border border-slate-250 p-2.5 rounded-xl text-xs outline-none focus:border-slate-400 font-sans leading-normal"
                />
              </div>

              {/* Amenities selection checkboxes helper */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase block">Selected Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {amenitiesPresetList.map((amen) => {
                    const hasAmen = hotelFormAmenities.includes(amen);
                    return (
                      <label key={amen} className={`flex items-center gap-2 p-2 px-3 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        hasAmen ? 'bg-slate-100 border-slate-300 text-slate-805' : 'text-slate-500 hover:bg-slate-50'
                      }`}>
                        <input 
                          type="checkbox"
                          checked={hasAmen}
                          onChange={() => handleFormToggleAmenity(amen)}
                          className="sr-only"
                        />
                        <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all ${
                          hasAmen ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                        }`}>
                          {hasAmen && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                        <span>{amen}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Policies & Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">Check-In timing</label>
                  <input 
                    type="text" 
                    value={hotelFormCheckIn}
                    onChange={(e) => setHotelFormCheckIn(e.target.value)}
                    className="border border-slate-250 p-2.5 rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">Check-Out timing</label>
                  <input 
                    type="text" 
                    value={hotelFormCheckOut}
                    onChange={(e) => setHotelFormCheckOut(e.target.value)}
                    className="border border-slate-250 p-2.5 rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">Contact Telephone</label>
                  <input 
                    type="text" 
                    value={hotelFormPhone}
                    onChange={(e) => setHotelFormPhone(e.target.value)}
                    className="border border-slate-250 p-2.5 rounded-xl text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">Contact Email</label>
                  <input 
                    type="email" 
                    value={hotelFormEmail}
                    onChange={(e) => setHotelFormEmail(e.target.value)}
                    className="border border-slate-250 p-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Submit panel */}
              <div className="flex items-center justify-end gap-3.5 pt-5 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setHotelModal(null)}
                  className="text-xs font-extrabold text-slate-500 hover:text-slate-805 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" /> Save Specifications Registry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---- ADMIN AUXILIARY MODAL LAYER 2: RESCHEDULE STAY DATES ---- */}
      {bookingRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in text-slate-950 font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-slate-200 p-6 sm:p-8 space-y-5 text-slate-800">
            <div>
              <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest block">Stay bounds realignment</span>
              <h3 className="font-black text-lg text-slate-805 mt-1">Modify Reservation Dates</h3>
              <p className="text-xs text-slate-500 mt-1">Ref Code: {bookingRescheduleModal.id} for {bookingRescheduleModal.userName}</p>
            </div>

            <form onSubmit={handleRescheduleBookingSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">New Check-In Date</label>
                <input 
                  type="date"
                  value={reschedCheckIn}
                  onChange={(e) => setReschedCheckIn(e.target.value)}
                  className="border border-slate-250 p-3 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">New Check-Out Date</label>
                <input 
                  type="date"
                  value={reschedCheckOut}
                  onChange={(e) => setReschedCheckOut(e.target.value)}
                  className="border border-slate-250 p-3 rounded-xl text-xs font-semibold"
                  required
                  min={reschedCheckIn}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Occupants Count</label>
                <input 
                  type="number"
                  min="1"
                  max="10"
                  value={reschedGuests}
                  onChange={(e) => setReschedGuests(parseInt(e.target.value) || 1)}
                  className="border border-slate-250 p-3 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setBookingRescheduleModal(null)}
                  className="text-slate-500 font-extrabold px-3 py-2 hover:text-slate-805"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow"
                >
                  Confirm Re-allocations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- ADMIN AUXILIARY MODAL LAYER 3: RECEIPT AND INVOICE PREVIEW ON DESK ---- */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in text-slate-800 font-sans">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-8 space-y-6 shadow-2xl relative border border-slate-100 my-8">
            
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-6 right-6 bg-slate-100 hover:bg-slate-205 text-slate-700 p-2 rounded-full cursor-pointer transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Print Section wrapper */}
            <div id="stayvibe_printable_invoice" className="space-y-6">
              
              {/* Logo row */}
              <div className="flex justify-between items-start pb-5 border-b-2 border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg">S</span>
                    <span className="text-xl font-black text-slate-800 tracking-tight">StayVibe Collection</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">OFFICIAL STAY VOUCHER INVOICE</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-mono text-[10px] text-slate-450 uppercase block">Confirmation Reference</p>
                  <p className="font-mono font-black text-slate-808 text-indigo-600 text-base">{selectedReceipt.id}</p>
                </div>
              </div>

              {/* Guest / stay ledger */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-extrabold text-slate-700 uppercase tracking-wide block mb-1">GUEST INFORMATION</h4>
                  <p className="font-black text-sm text-slate-900">{selectedReceipt.userName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedReceipt.userEmail}</p>
                  {selectedReceipt.customerPhone && <p className="text-[10px] font-mono text-slate-500 mt-0.5">{selectedReceipt.customerPhone}</p>}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-700 uppercase tracking-wide block mb-1">PROPERTY DETAILS</h4>
                  <p className="font-black text-sm text-slate-900">{selectedReceipt.hotelName}</p>
                  <p className="text-[11px] text-slate-505 mt-0.5 text-rose-500 font-semibold">{selectedReceipt.roomName} ({selectedReceipt.roomType})</p>
                </div>
              </div>

              {/* Timeline date bounds */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-3 gap-2 text-xs font-sans">
                <div>
                  <span className="text-[10px] text-slate-450 uppercase font-black">Check-In</span>
                  <p className="font-bold text-slate-800 mt-1">{selectedReceipt.checkIn}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-455 uppercase font-black">Check-Out</span>
                  <p className="font-bold text-slate-800 mt-1">{selectedReceipt.checkOut}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 uppercase font-black">Guests</span>
                  <p className="font-bold text-slate-800 mt-1">{selectedReceipt.guests} occupants</p>
                </div>
              </div>

              {/* Invoice Table calculations */}
              <div className="space-y-3.5 pt-2">
                <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wide">FEE TRANSACTION LEDGER</h4>
                
                <div className="border-t border-slate-100 divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2.5">
                    <span className="text-slate-500 font-semibold">Accommodation Period Rate</span>
                    <span className="font-mono font-bold">${selectedReceipt.totalPrice}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-slate-505 font-semibold">Federal Taxes and Lodging Surcharges</span>
                    <span className="text-emerald-555 font-bold">Inclusive</span>
                  </div>
                  <div className="flex justify-between py-2.5 bg-slate-50/50 px-2 rounded-lg text-slate-900 font-bold">
                    <span>Total Net Price Due:</span>
                    <span className="font-mono text-sm">${selectedReceipt.totalPrice}</span>
                  </div>
                </div>

                {/* Received check column */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100/50">
                  <div>
                    <span className="text-slate-500 uppercase font-bold text-[10px] block">Advance collected receipt:</span>
                    <span className="font-mono font-black text-indigo-700 text-base mt-1 block">${selectedReceipt.advancePayment}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 uppercase font-bold text-[10px] block">Remaining balance due onarrival:</span>
                    <span className="font-mono font-black text-slate-805 text-base mt-1 block">${selectedReceipt.remainingBalance}</span>
                  </div>
                </div>
              </div>

              {/* Security instructions block */}
              <div className="p-3 text-[10px] bg-slate-50 text-slate-500 rounded-xl leading-normal border border-slate-100">
                ✔️ Show this voucher receipt either paper printed or on personal phone screen at arrival reception. Check-In opens at 3:00 PM local property timezone guidelines. Pre-paid guarantees are protected under regional hospitality terms.
              </div>

            </div>

            {/* Print action row */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Confirmed active voucher
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Close Receipt
                </button>
                <button
                  onClick={triggerPrintReceipt}
                  className="bg-rose-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-rose-700 flex items-center gap-1 shadow-sm inline-flex cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Print Voucher
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
