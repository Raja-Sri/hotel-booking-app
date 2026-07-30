import { Hotel, Room } from '../types';

/** Map backend hotel DTO to frontend Hotel shape */
export function mapHotelFromApi(raw: Record<string, unknown>): Hotel {
  const rooms = Array.isArray(raw.rooms)
    ? (raw.rooms as Record<string, unknown>[]).map(mapRoomFromApi)
    : [];

  const images = Array.isArray(raw.images) ? (raw.images as string[]) : [];
  const imageUrl = (raw.imageUrl as string) || images[0] || '';

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    city: String(raw.city ?? ''),
    address: String(raw.address ?? ''),
    stars: Number(raw.stars ?? 0),
    rating: Number(raw.rating ?? 0),
    reviewCount: Number(raw.reviewCount ?? 0),
    imageUrl,
    description: String(raw.description ?? ''),
    amenities: Array.isArray(raw.amenities) ? (raw.amenities as string[]) : [],
    rooms,
    featured: Boolean(raw.featured),
    popular: Boolean(raw.popular),
    status: (raw.status as Hotel['status']) || (raw.available === false ? 'disabled' : 'available'),
    pricePerNight: raw.pricePerNight != null ? Number(raw.pricePerNight) : undefined,
  };
}

export function mapRoomFromApi(raw: Record<string, unknown>): Room {
  const price = Number(raw.price ?? raw.pricePerNight ?? 0);
  const imageUrl = String(raw.imageUrl ?? raw.image ?? '');
  const typeRaw = String(raw.type ?? 'Double');
  const validTypes: Room['type'][] = ['Single', 'Double', 'Suite', 'Deluxe', 'Presidential'];
  const type = validTypes.includes(typeRaw as Room['type']) ? (typeRaw as Room['type']) : 'Double';

  const availabilityRaw = String(raw.availabilityStatus ?? '').toUpperCase();
  const availabilityStatus: Room['availabilityStatus'] =
    availabilityRaw === 'BOOKED' ? 'BOOKED' : 'AVAILABLE';

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    type,
    price,
    capacity: Number(raw.capacity ?? raw.maxGuests ?? 1),
    imageUrl,
    amenities: Array.isArray(raw.amenities) ? (raw.amenities as string[]) : [],
    description: String(raw.description ?? ''),
    count: Number(raw.count ?? 1),
    availabilityStatus,
  };
}
