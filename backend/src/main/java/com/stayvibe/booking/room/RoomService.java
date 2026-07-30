package com.stayvibe.booking.room;

import com.stayvibe.booking.common.ResourceNotFoundException;
import com.stayvibe.booking.hotel.Hotel;
import com.stayvibe.booking.hotel.HotelRepository;
import com.stayvibe.booking.room.dto.RoomRequest;
import com.stayvibe.booking.room.dto.RoomResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    public RoomService(RoomRepository roomRepository, HotelRepository hotelRepository) {
        this.roomRepository = roomRepository;
        this.hotelRepository = hotelRepository;
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.getHotelId()));

        Room room = new Room();
        room.setHotel(hotel);
        copyRequestToRoom(request, room);

        return RoomResponse.from(roomRepository.save(room));
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll()
                .stream()
                .map(RoomResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id) {
        return RoomResponse.from(findRoom(id));
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByHotel(Long hotelId) {
        if (!hotelRepository.existsById(hotelId)) {
            throw new ResourceNotFoundException("Hotel not found with id: " + hotelId);
        }

        return roomRepository.findByHotelId(hotelId)
                .stream()
                .map(RoomResponse::from)
                .toList();
    }

    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = findRoom(id);
        if (request.getHotelId() != null && !request.getHotelId().equals(room.getHotel().getId())) {
            Hotel hotel = hotelRepository.findById(request.getHotelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.getHotelId()));
            room.setHotel(hotel);
        }
        copyRequestToRoom(request, room);
        return RoomResponse.from(roomRepository.save(room));
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = findRoom(id);
        roomRepository.delete(room);
    }

    private Room findRoom(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
    }

    @Transactional
    public void deleteRoomFromHotel(Long hotelId, Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        if (!room.getHotel().getId().equals(hotelId)) 
        {
            throw new RuntimeException("Room does not belong to this hotel");
        }
        roomRepository.delete(room);
    }

    private void copyRequestToRoom(RoomRequest request, Room room) {
        room.setName(request.getName().trim());
        room.setDescription(request.getDescription().trim());
        room.setPricePerNight(request.getPricePerNight());
        room.setMaxGuests(request.getMaxGuests());
        room.setAmenities(request.getAmenities());
        room.setImage(request.getImage().trim());
        room.setAvailable(request.getAvailable());
    }
}
