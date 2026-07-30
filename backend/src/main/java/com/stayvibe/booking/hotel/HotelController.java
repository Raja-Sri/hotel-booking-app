package com.stayvibe.booking.hotel;

import com.stayvibe.booking.common.ApiResponse;
import com.stayvibe.booking.hotel.dto.HotelDetailResponse;
import com.stayvibe.booking.hotel.dto.HotelRequest;
import com.stayvibe.booking.hotel.dto.HotelResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HotelResponse>>> getHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean available
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Hotels fetched successfully", hotelService.getHotels(city, available)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelDetailResponse>> getHotelById(
            @PathVariable Long id,
            @RequestParam(required = false) LocalDate checkIn,
            @RequestParam(required = false) LocalDate checkOut
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Hotel fetched successfully",
                hotelService.getHotelById(id, checkIn, checkOut)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HotelResponse>> createHotel(@Valid @RequestBody HotelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Hotel created successfully", hotelService.createHotel(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelResponse>> updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody HotelRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Hotel updated successfully", hotelService.updateHotel(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.ok(ApiResponse.ok("Hotel deleted successfully", Map.of("success", true)));
    }
}
