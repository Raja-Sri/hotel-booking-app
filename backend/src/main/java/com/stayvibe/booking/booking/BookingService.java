package com.stayvibe.booking.booking;

import com.stayvibe.booking.booking.dto.BookingRequest;
import com.stayvibe.booking.booking.dto.BookingResponse;
import com.stayvibe.booking.common.ResourceNotFoundException;
import com.stayvibe.booking.hotel.Hotel;
import com.stayvibe.booking.hotel.HotelRepository;
import com.stayvibe.booking.room.Room;
import com.stayvibe.booking.room.RoomRepository;
import com.stayvibe.booking.user.User;
import com.stayvibe.booking.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            HotelRepository hotelRepository,
            RoomRepository roomRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        validateBookingRequest(request);

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.getHotelId()));

        if (Boolean.FALSE.equals(hotel.getAvailable())) {
            throw new IllegalArgumentException("Booking cannot be created because this hotel is currently unavailable.");
        }

        Room room = null;
        if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));
            if (!room.getHotel().getId().equals(hotel.getId())) {
                throw new IllegalArgumentException("Room does not belong to the selected hotel.");
            }
            if (Boolean.FALSE.equals(room.getAvailable())) {
                throw new IllegalArgumentException("Selected room is not available.");
            }

            validateGuestCapacity(room, request.getGuests());
            validateRoomNotOverlapping(room.getId(), request.getCheckInDate(), request.getCheckOutDate());
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal nightlyRate = room != null ? room.getPricePerNight() : hotel.getPricePerNight();
        BigDecimal totalPrice = nightlyRate.multiply(BigDecimal.valueOf(nights));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setHotel(hotel);
        booking.setRoom(room);
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setGuests(request.getGuests());
        booking.setTotalPrice(totalPrice);
        booking.setBookingStatus(BookingStatus.CONFIRMED);

        Booking savedBooking = bookingRepository.save(booking);
        return BookingResponse.from(savedBooking);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        return BookingResponse.from(findBooking(id));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        return bookingRepository.findByUserId(userId)
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByHotel(Long hotelId) {
        if (!hotelRepository.existsById(hotelId)) {
            throw new ResourceNotFoundException("Hotel not found with id: " + hotelId);
        }

        return bookingRepository.findByHotelId(hotelId)
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional
    public BookingResponse cancelBooking(Long id) {
        Booking booking = findBooking(id);

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled.");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);
        return BookingResponse.from(savedBooking);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = findBooking(id);
        booking.setBookingStatus(status);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    private void validateBookingRequest(BookingRequest request) {
        if (request.getGuests() == null || request.getGuests() <= 0) {
            throw new IllegalArgumentException("Guests must be greater than 0.");
        }

        if (request.getCheckInDate() == null || request.getCheckOutDate() == null) {
            throw new IllegalArgumentException("Check-in date and check-out date are required.");
        }

        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date.");
        }
    }

    private void validateGuestCapacity(Room room, Integer guests) {
        if (room.getMaxGuests() != null && guests > room.getMaxGuests()) {
            throw new IllegalArgumentException(
                    "Guest count exceeds room capacity. Maximum guests allowed: " + room.getMaxGuests() + "."
            );
        }
    }

    private void validateRoomNotOverlapping(Long roomId, LocalDate checkIn, LocalDate checkOut) {
        boolean overlapping = bookingRepository
                .existsByRoomIdAndBookingStatusAndCheckInDateLessThanAndCheckOutDateGreaterThan(
                        roomId,
                        BookingStatus.CONFIRMED,
                        checkOut,
                        checkIn
                );

        if (overlapping) {
            throw new IllegalArgumentException("Room is already booked for the selected dates.");
        }
    }
}
