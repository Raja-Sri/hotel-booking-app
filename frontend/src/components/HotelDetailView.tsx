import React from 'react';
import { 
  ChevronLeft, 
  MapPin, 
  Star, 
  Users, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Coffee, 
  Clock, 
  Bed, 
  Maximize2,
  Tv,
  Wine
} from 'lucide-react';
import { Hotel, Room } from '../types';

interface HotelDetailViewProps {
  hotel: Hotel;
  onBack: () => void;
  onReserveRoom: (room: Room) => void;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export default function HotelDetailView({
  hotel,
  onBack,
  onReserveRoom,
  checkIn,
  checkOut,
  guests
}: HotelDetailViewProps) {
  // Derive nightly stay calculation
  const getNights = () => {
    try {
      const start = new Date(checkIn).getTime();
      const end = new Date(checkOut).getTime();
      const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  const nights = getNights();

  // Star Rating Breakdown mock metrics for premium touch
  const ratingsBreakdown = [
    { label: "Bespoke Comfort & Bedding", score: 4.9, pct: "98%" },
    { label: "Atmosphere & Vibe Design", score: 4.8, pct: "96%" },
    { label: "High-Tech Amenities & WiFi", score: 4.7, pct: "94%" },
    { label: "Staff & 24h Concierge Desk", score: 4.9, pct: "98%" }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-luxury-navy text-left">
      {/* Breadcrumbs and navigation controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-luxury-stone">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#a88d5e]">
          <button 
            onClick={onBack}
            className="hover:text-luxury-navy transition-colors flex items-center gap-1 cursor-pointer font-extrabold"
          >
            Explore Hotels
          </button>
          <span>/</span>
          <span className="text-luxury-navy truncate max-w-[200px] sm:max-w-xs">{hotel.name}</span>
        </div>
        
        <button
          onClick={onBack}
          className="bg-white hover:bg-luxury-beige text-luxury-navy text-xs font-black px-4 py-2.5 rounded-xl border border-luxury-stone transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Grid Listing</span>
        </button>
      </div>

      {/* Dynamic Immersive Hero Section of Details View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Banner with high precision aspect-ratio display */}
        <div className="lg:col-span-7 h-96 sm:h-[450px] rounded-3xl bg-luxury-beige overflow-hidden relative shadow-lg group">
          <img 
            src={hotel.imageUrl} 
            alt={hotel.name} 
            className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-102" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy/80 via-luxury-navy/20 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col justify-end space-y-1">
            {hotel.featured && (
              <span className="bg-luxury-gold text-luxury-navy w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2.5 shadow border border-luxury-beige">
                ✦ Signature Vibe Selection ✦
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-none drop-shadow">{hotel.name}</h1>
            <p className="flex items-center gap-1.5 text-xs text-luxury-beige font-semibold pt-1">
              <MapPin className="h-3.5 w-3.5 text-luxury-gold" />
              <span>{hotel.address}, {hotel.city}, {hotel.country || 'Switzerland'}</span>
            </p>
          </div>
        </div>

        {/* Property Highlights & Star Ratings Chart (Bento layout style) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-8 border border-luxury-stone shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-black text-luxury-gold-dark font-mono block">Curative Experience</span>
                <h2 className="text-xl font-black text-luxury-navy mt-1">Property Vibe Score</h2>
              </div>
              <div className="flex items-center gap-1 bg-luxury-beige px-3 py-1 rounded-xl text-luxury-gold-dark font-extrabold text-xs border border-luxury-stone shadow-inner">
                <Star className="h-4 w-4 fill-luxury-gold text-luxury-gold" />
                <span>★ {hotel.stars}.0 / 5.0</span>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-luxury-clay leading-relaxed">
              {hotel.description}
            </p>
          </div>

          {/* Luxury Quality Breakdown Gauge Bars */}
          <div className="space-y-3 pt-4 border-t border-luxury-stone">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-luxury-navy">Guest Valuation Metrics</h3>
            <div className="space-y-2.5">
              {ratingsBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-luxury-navy">
                    <span>{item.label}</span>
                    <span className="font-mono text-luxury-gold-dark">{item.score} / 5</span>
                  </div>
                  <div className="h-1.5 w-full bg-luxury-cream rounded-full overflow-hidden border border-luxury-stone/30">
                    <div 
                      className="h-full bg-luxury-gold rounded-full" 
                      style={{ width: item.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-luxury-stone font-semibold text-luxury-navy">
            <div className="space-y-1">
              <span className="text-[9px] uppercase text-luxury-clay block font-mono">Check-In Clock</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-luxury-gold-dark" />
                <span>{hotel.policies?.checkInTime || '15:00 PM'} onwards</span>
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase text-luxury-clay block font-mono">Checkout Limit</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-luxury-gold-dark" />
                <span>{hotel.policies?.checkOutTime || '11:00 AM'} noon</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Property-wide signature amenities cards */}
      <div className="bg-white rounded-3xl p-6 border border-luxury-stone shadow-sm">
        <h3 className="text-xs uppercase tracking-widest font-black text-[#a88d5e] mb-4 block font-mono">
          ✦ Premium Standard Inclusions & Experiences ✦
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(hotel.amenities || []).map((amenity) => (
            <div 
              key={amenity}
              className="bg-luxury-cream border border-luxury-stone px-4 py-3 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5 transition hover:bg-luxury-beige"
            >
              <div className="p-1.5 bg-white rounded-lg border border-luxury-stone shadow-xs text-luxury-gold-dark">
                {amenity.includes('WiFi') && <Sparkles className="h-4 w-4" />}
                {amenity.includes('Pool') && <Coffee className="h-4 w-4" />}
                {amenity.includes('Spa') && <ShieldCheck className="h-4 w-4" />}
                {!amenity.includes('WiFi') && !amenity.includes('Pool') && !amenity.includes('Spa') && <Check className="h-4 w-4 stroke-[3]" />}
              </div>
              <span className="text-[11px] font-bold text-luxury-navy leading-none">{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AVAILABLE ROOMS NAVIGATION TAB CONTAINER */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-luxury-navy">Available Chamber Suites</h2>
          <p className="text-xs text-luxury-clay mt-1 leading-snug font-semibold">
            Reserved stay period limits: <strong className="text-luxury-gold-dark font-mono font-black">{checkIn}</strong> to <strong className="text-luxury-gold-dark font-mono font-black">{checkOut}</strong> (Staying for <span className="font-black text-luxury-navy">{nights} {nights > 1 ? 'nights' : 'night'}</span> • {guests} standard guests)
          </p>
        </div>

        {/* Real room loops explaining room types with rich images and ratings */}
        <div className="grid grid-cols-1 gap-6">
          {hotel.rooms?.map((room) => {
            // Curate beautiful room star ratings and occupancy summaries
            const roomId = String(room.id || "1");
            const lastDigit = parseInt(roomId.slice(-1)) || 1;
            const reviewScore = Number((4.6 + lastDigit * 0.1).toFixed(1));
            const reviewCount = 20 + lastDigit * 15;
            const isBooked = room.availabilityStatus === 'BOOKED';
            const exceedsCapacity = guests > room.capacity;
            const canReserve = !isBooked && !exceedsCapacity;

            return (
              <div 
                key={room.id}
                className="bg-white rounded-3xl overflow-hidden border border-luxury-stone hover:border-luxury-gold transition-all shadow-sm flex flex-col lg:flex-row group"
              >
                {/* Chamber Suite Image Layout */}
                <div className="w-full lg:w-[320px] xl:w-[380px] h-64 lg:h-auto bg-luxury-cream relative overflow-hidden flex-shrink-0">
                  <img 
                  src={room.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80"}
                    alt={room.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="absolute top-4 left-4 bg-luxury-navy text-white px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase border border-luxury-stone shadow-sm">
                    {room.type} Suite
                  </div>
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase border shadow-sm ${
                    isBooked
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-emerald-600 text-white border-emerald-500'
                  }`}>
                    {isBooked ? 'BOOKED' : 'AVAILABLE'}
                  </div>
                </div>

                {/* Chamber Suite Description details pane */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-luxury-stone pb-3">
                      <div>
                        <h4 className="text-lg font-black text-luxury-navy tracking-tight">{room.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-luxury-clay font-semibold mt-1">
                          <Users className="h-3.5 w-3.5 text-luxury-gold-dark" />
                          <span>Accommodates up to {room.capacity} global citizens</span>
                        </div>
                      </div>

                      {/* Suite Star Rating */}
                      <div className="flex items-center gap-1.5 bg-luxury-cream border border-luxury-stone px-3 py-1 rounded-xl w-fit">
                        <Star className="h-3.5 w-3.5 fill-luxury-gold text-luxury-gold" />
                        <span className="text-xs font-black text-luxury-navy font-mono">★ {reviewScore}</span>
                        <span className="text-[10px] text-luxury-clay font-semibold">({reviewCount} guest reviews)</span>
                      </div>
                    </div>

                    {/* Room Specific Description details paragraph requested */}
                    <p className="text-xs sm:text-sm text-luxury-clay leading-relaxed font-semibold">
                      {room.description || `Savor Swiss-style structural beauty. This luxury space contains comprehensive thermal soundproofing, premium bedding configurations, organic coffee amenities, and elegant workspace lounge areas.`}
                    </p>

                    {/* Specifications badges bento */}
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <div className="bg-luxury-cream border border-luxury-stone px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-bold text-luxury-navy">
                        <Bed className="h-3.5 w-3.5 text-[#a88d5e]" />
                        <span>{room.capacity > 2 ? 'King Size Double' : 'Double Bed Layer'}</span>
                      </div>
                      <div className="bg-luxury-cream border border-luxury-stone px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-bold text-luxury-navy">
                        <Maximize2 className="h-3.5 w-3.5 text-[#a88d5e]" />
                        <span>{28 + (room.capacity * 10)} sqm Private Lounges</span>
                      </div>
                      <div className="bg-luxury-cream border border-luxury-stone px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-bold text-luxury-navy">
                        <Wine className="h-3.5 w-3.5 text-[#a88d5e]" />
                        <span>Bespoke Mini-Bar Loaded</span>
                      </div>
                    </div>
                  </div>

                  {/* Chamber Suite pricing section and booking function */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-luxury-stone gap-4">
                    <div className="text-left">
                      <span className="text-[9px] font-black text-[#a88d5e] uppercase tracking-wider block font-mono">Rate for stayperiod</span>
                      <span className="text-2xl font-black text-luxury-navy">
                        ${room.price}
                        <span className="text-xs text-luxury-clay font-bold"> /night</span>
                      </span>
                      <span className="text-[10px] font-bold text-luxury-gold-dark block mt-0.5">
                        Est. total for stay: ${room.price * nights} ({nights} {nights === 1 ? 'Nite' : 'Nites'})
                      </span>
                    </div>

                    {exceedsCapacity && (
                      <p className="text-[10px] font-bold text-rose-600 sm:text-right">
                        Guest count exceeds room capacity. Maximum guests allowed: {room.capacity}.
                      </p>
                    )}

                    <button
                      onClick={() => onReserveRoom(room)}
                      disabled={!canReserve}
                      className="bg-luxury-navy hover:bg-luxury-navy-light text-white font-black text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shadow-luxury-navy/10 transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-luxury-navy"
                    >
                      <span>{isBooked ? 'Unavailable for Selected Dates' : 'Reserve & Setup Settlement'}</span>
                      {canReserve && <Sparkles className="h-3.5 w-3.5 text-luxury-gold" />}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
