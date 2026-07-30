package com.stayvibe.booking.room;

import com.stayvibe.booking.common.ApiResponse;
import com.stayvibe.booking.room.dto.RoomRequest;
import com.stayvibe.booking.room.dto.RoomResponse;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping("/rooms")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Room created", roomService.createRoom(request)));
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Room updated", roomService.updateRoom(id, request)));
    }

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAllRooms() {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getAllRooms()));
    }

    @GetMapping("/rooms/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getRoomById(id)));
    }

    @GetMapping("/hotels/{hotelId}/rooms")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getRoomsByHotel(@PathVariable Long hotelId) {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getRoomsByHotel(hotelId)));
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.ok("Room deleted", Map.of("success", true)));
    }

    @DeleteMapping("/hotels/{hotelId}/rooms/{roomId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteRoomFromHotel(
            @PathVariable Long hotelId,
            @PathVariable Long roomId
    ) {
        roomService.deleteRoomFromHotel(hotelId, roomId);
        return ResponseEntity.ok(ApiResponse.ok("Room deleted", Map.of("success", true)));
    }
}
