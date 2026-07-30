package com.stayvibe.booking.room;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotelId(Long hotelId);

    List<Room> findByAvailable(Boolean available);

    List<Room> findByHotelIdAndAvailable(Long hotelId, Boolean available);

    boolean existsByHotelIdAndNameIgnoreCase(Long hotelId, String name);
}
