package com.stayvibe.booking.hotel;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findByCityContainingIgnoreCase(String city);

    List<Hotel> findByAvailable(Boolean available);

    List<Hotel> findByCityContainingIgnoreCaseAndAvailable(String city, Boolean available);

    Optional<Hotel> findByNameIgnoreCaseAndAddressIgnoreCase(String name, String address);
}
