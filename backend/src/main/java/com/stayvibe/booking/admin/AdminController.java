package com.stayvibe.booking.admin;

import com.stayvibe.booking.admin.dto.AdminStatsResponse;
import com.stayvibe.booking.auth.dto.UserResponse;
import com.stayvibe.booking.booking.dto.BookingResponse;
import com.stayvibe.booking.common.ApiResponse;
import com.stayvibe.booking.hotel.dto.HotelRequest;
import com.stayvibe.booking.hotel.dto.HotelResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("Admin stats fetched", adminService.getStats()));
    }

    @GetMapping("/hotels")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> getHotels() {
        return ResponseEntity.ok(ApiResponse.ok("Hotels fetched", adminService.getAllHotels()));
    }

    @PostMapping("/hotels")
    public ResponseEntity<ApiResponse<HotelResponse>> createHotel(@Valid @RequestBody HotelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Hotel created", adminService.createHotel(request)));
    }

    @PutMapping("/hotels/{id}")
    public ResponseEntity<ApiResponse<HotelResponse>> updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody HotelRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Hotel updated", adminService.updateHotel(id, request)));
    }

    @DeleteMapping("/hotels/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteHotel(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean permanent
    ) {
        adminService.deleteHotel(id, permanent);
        return ResponseEntity.ok(ApiResponse.ok("Hotel removed", Map.of("success", true)));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings() {
        return ResponseEntity.ok(ApiResponse.ok("Bookings fetched", adminService.getAllBookings()));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        if (status == null) {
            throw new IllegalArgumentException("Status is required.");
        }
        return ResponseEntity.ok(ApiResponse.ok("Booking updated", adminService.updateBookingStatus(id, status)));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.ok("Users fetched", adminService.getAllUsers()));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(ApiResponse.ok("User updated", adminService.updateUserStatus(id, body.get("status"))));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(ApiResponse.ok("User role updated", adminService.updateUserRole(id, body.get("role"))));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", Map.of("success", true)));
    }
}
