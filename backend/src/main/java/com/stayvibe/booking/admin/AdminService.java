package com.stayvibe.booking.admin;

import com.stayvibe.booking.admin.dto.AdminStatsResponse;
import com.stayvibe.booking.admin.dto.MonthlyRevenuePoint;
import com.stayvibe.booking.auth.dto.UserResponse;
import com.stayvibe.booking.booking.Booking;
import com.stayvibe.booking.booking.BookingRepository;
import com.stayvibe.booking.booking.BookingStatus;
import com.stayvibe.booking.booking.dto.BookingResponse;
import com.stayvibe.booking.common.ResourceNotFoundException;
import com.stayvibe.booking.hotel.Hotel;
import com.stayvibe.booking.hotel.HotelRepository;
import com.stayvibe.booking.hotel.dto.HotelRequest;
import com.stayvibe.booking.hotel.dto.HotelResponse;
import com.stayvibe.booking.room.RoomRepository;
import com.stayvibe.booking.user.Role;
import com.stayvibe.booking.user.User;
import com.stayvibe.booking.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final com.stayvibe.booking.hotel.HotelService hotelService;
    private final com.stayvibe.booking.booking.BookingService bookingService;

    public AdminService(
            HotelRepository hotelRepository,
            RoomRepository roomRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository,
            com.stayvibe.booking.hotel.HotelService hotelService,
            com.stayvibe.booking.booking.BookingService bookingService
    ) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.hotelService = hotelService;
        this.bookingService = bookingService;
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        List<Hotel> hotels = hotelRepository.findAll();
        List<Booking> bookings = bookingRepository.findAll();
        List<User> users = userRepository.findAll();

        long confirmed = bookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED).count();
        long cancelled = bookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CANCELLED).count();

        BigDecimal totalRevenue = bookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalRooms = roomRepository.count();
        double occupancyRatePercent = totalRooms == 0
                ? 0.0
                : Math.round(Math.min(100.0, (confirmed * 100.0) / totalRooms));

        AdminStatsResponse stats = new AdminStatsResponse();
        stats.setTotalHotels(hotels.size());
        stats.setTotalRooms(totalRooms);
        stats.setTotalBookings(bookings.size());
        stats.setActiveBookings(confirmed);
        stats.setCancelledBookings(cancelled);
        stats.setTotalUsers(users.size());
        stats.setTotalRevenue(totalRevenue);
        stats.setProjectionRemainingRevenue(BigDecimal.ZERO);
        stats.setOccupancyRatePercent(occupancyRatePercent);
        stats.setMonthlyRevenue(buildMonthlyRevenue(bookings));
        stats.setHotelPerformance(buildHotelPerformance(hotels, bookings));
        return stats;
    }

    @Transactional(readOnly = true)
    public List<HotelResponse> getAllHotels() {
        return hotelRepository.findAll().stream()
                .map(hotel -> HotelResponse.from(hotel, roomRepository.findByHotelId(hotel.getId())))
                .toList();
    }

    @Transactional
    public HotelResponse createHotel(HotelRequest request) {
        return hotelService.createHotel(request);
    }

    @Transactional
    public HotelResponse updateHotel(Long id, HotelRequest request) {
        return hotelService.updateHotel(id, request);
    }

    @Transactional
    public void deleteHotel(Long id, boolean permanent) {
        if (permanent) {
            hotelService.deleteHotel(id);
            return;
        }
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        hotel.setAvailable(false);
        hotelRepository.save(hotel);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, String status) {
        BookingStatus bookingStatus = switch (status.toLowerCase()) {
            case "confirmed" -> BookingStatus.CONFIRMED;
            case "cancelled" -> BookingStatus.CANCELLED;
            default -> throw new IllegalArgumentException("Invalid booking status: " + status);
        };
        return bookingService.updateBookingStatus(id, bookingStatus);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public UserResponse updateUserStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEnabled("active".equalsIgnoreCase(status));
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setRole("ROLE_ADMIN".equals(role) ? Role.ADMIN : Role.CUSTOMER);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    private List<MonthlyRevenuePoint> buildMonthlyRevenue(List<Booking> bookings) {
        List<MonthlyRevenuePoint> result = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String label = month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            BigDecimal revenue = bookings.stream()
                    .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                    .filter(b -> b.getCreatedAt() != null
                            && b.getCreatedAt().getMonth() == month.getMonth()
                            && b.getCreatedAt().getYear() == month.getYear())
                    .map(Booking::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            result.add(new MonthlyRevenuePoint(label, revenue));
        }
        return result;
    }

    private List<Map<String, Object>> buildHotelPerformance(List<Hotel> hotels, List<Booking> bookings) {
        return hotels.stream()
                .map(hotel -> {
                    List<Booking> hotelBookings = bookings.stream()
                            .filter(b -> b.getHotel().getId().equals(hotel.getId())
                                    && b.getBookingStatus() == BookingStatus.CONFIRMED)
                            .toList();
                    BigDecimal revenue = hotelBookings.stream()
                            .map(Booking::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("id", hotel.getId());
                    entry.put("name", hotel.getName());
                    entry.put("city", hotel.getCity());
                    entry.put("bookingsCount", hotelBookings.size());
                    entry.put("revenue", revenue);
                    entry.put("stars", Math.max(1, Math.min(5, (int) Math.round(hotel.getRating() / 2.0))));
                    return entry;
                })
                .sorted((a, b) -> ((BigDecimal) b.get("revenue")).compareTo((BigDecimal) a.get("revenue")))
                .toList();
    }
}
