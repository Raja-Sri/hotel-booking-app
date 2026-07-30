package com.stayvibe.booking.hotel;

import com.stayvibe.booking.booking.BookingRepository;
import com.stayvibe.booking.common.ResourceNotFoundException;
import com.stayvibe.booking.hotel.dto.HotelDetailResponse;
import com.stayvibe.booking.hotel.dto.HotelRequest;
import com.stayvibe.booking.hotel.dto.HotelResponse;
import com.stayvibe.booking.room.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class HotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public HotelService(
            HotelRepository hotelRepository,
            RoomRepository roomRepository,
            BookingRepository bookingRepository
    ) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<HotelResponse> getHotels(String city, Boolean available) {
        List<Hotel> hotels;

        if (hasText(city) && available != null) {
            hotels = hotelRepository.findByCityContainingIgnoreCaseAndAvailable(city.trim(), available);
        } else if (hasText(city)) {
            hotels = hotelRepository.findByCityContainingIgnoreCase(city.trim());
        } else if (available != null) {
            hotels = hotelRepository.findByAvailable(available);
        } else {
            hotels = hotelRepository.findAll();
        }

        return hotels.stream()
                .map(HotelResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public HotelDetailResponse getHotelById(Long id) {
        return getHotelById(id, null, null);
    }

    @Transactional(readOnly = true)
    public HotelDetailResponse getHotelById(Long id, LocalDate checkIn, LocalDate checkOut) {
        Hotel hotel = findHotel(id);
        return HotelDetailResponse.from(
                hotel,
                roomRepository.findByHotelId(id),
                checkIn,
                checkOut,
                bookingRepository
        );
    }

    @Transactional
    public HotelResponse createHotel(HotelRequest request) {
        Hotel hotel = new Hotel();
        copyRequestToHotel(request, hotel);
        return HotelResponse.from(hotelRepository.save(hotel));
    }

    @Transactional
    public HotelResponse updateHotel(Long id, HotelRequest request) {
        Hotel hotel = findHotel(id);
        copyRequestToHotel(request, hotel);
        return HotelResponse.from(hotelRepository.save(hotel));
    }

    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = findHotel(id);
        hotelRepository.delete(hotel);
    }

    private Hotel findHotel(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
    }

    private void copyRequestToHotel(HotelRequest request, Hotel hotel) {
        hotel.setName(request.getName().trim());
        hotel.setDescription(request.getDescription().trim());
        hotel.setCity(request.getCity().trim());
        hotel.setAddress(request.getAddress().trim());
        hotel.setRating(request.getRating());
        hotel.setAmenities(request.getAmenities());
        hotel.setImages(request.getImages());
        hotel.setPricePerNight(request.getPricePerNight());
        hotel.setAvailable(request.getAvailable());
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}