package com.stayvibe.booking.data;

import com.stayvibe.booking.data.dto.HotelImportDto;
import com.stayvibe.booking.data.dto.RoomImportDto;
import com.stayvibe.booking.hotel.Hotel;
import com.stayvibe.booking.hotel.HotelRepository;
import com.stayvibe.booking.room.Room;
import com.stayvibe.booking.room.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class HotelImportService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    public HotelImportService(HotelRepository hotelRepository, RoomRepository roomRepository) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional
    public ImportResult importHotels(List<HotelImportDto> hotelDtos) {
        int hotelsCreated = 0;
        int hotelsUpdated = 0;
        int hotelsDeleted = 0;
        int hotelsSkipped = 0;
        int roomsCreated = 0;
        int roomsUpdated = 0;
        int roomsDeleted = 0;
        int roomsSkipped = 0;

        List<HotelImportDto> validHotels = hotelDtos.stream()
                .filter(this::isValidHotel)
                .toList();

        Set<String> frontendHotelKeys = validHotels.stream()
                .map(this::hotelKey)
                .collect(Collectors.toSet());

        for (Hotel existingHotel : hotelRepository.findAll()) {
            if (!frontendHotelKeys.contains(hotelKey(existingHotel))) {
                List<Room> staleRooms = roomRepository.findByHotelId(existingHotel.getId());
                roomsDeleted += staleRooms.size();
                roomRepository.deleteAll(staleRooms);
                hotelRepository.delete(existingHotel);
                hotelsDeleted++;
            }
        }

        for (HotelImportDto hotelDto : hotelDtos) {
            if (!isValidHotel(hotelDto)) {
                hotelsSkipped++;
                continue;
            }

            Optional<Hotel> existingHotel = hotelRepository.findByNameIgnoreCaseAndAddressIgnoreCase(
                    hotelDto.getName().trim(),
                    hotelDto.getAddress().trim()
            );

            Hotel hotel;
            if (existingHotel.isPresent()) {
                hotel = existingHotel.get();
                updateHotel(hotel, hotelDto);
                hotel = hotelRepository.save(hotel);
                hotelsUpdated++;
            } else {
                hotel = hotelRepository.save(mapNewHotel(hotelDto));
                hotelsCreated++;
            }

            RoomSyncResult roomResult = syncRooms(hotel, hotelDto);
            roomsCreated += roomResult.roomsCreated();
            roomsUpdated += roomResult.roomsUpdated();
            roomsDeleted += roomResult.roomsDeleted();
            roomsSkipped += roomResult.roomsSkipped();
        }

        return new ImportResult(
                hotelsCreated,
                hotelsUpdated,
                hotelsDeleted,
                hotelsSkipped,
                roomsCreated,
                roomsUpdated,
                roomsDeleted,
                roomsSkipped
        );
    }

    private RoomSyncResult syncRooms(Hotel hotel, HotelImportDto hotelDto) {
        int roomsCreated = 0;
        int roomsUpdated = 0;
        int roomsDeleted = 0;
        int roomsSkipped = 0;

        List<RoomImportDto> validRooms = safeRooms(hotelDto).stream()
                .filter(this::isValidRoom)
                .toList();

        Set<String> frontendRoomNames = validRooms.stream()
                .map(room -> normalize(room.getName()))
                .collect(Collectors.toSet());

        List<Room> existingRooms = roomRepository.findByHotelId(hotel.getId());
        Map<String, Room> existingRoomsByName = existingRooms.stream()
                .collect(Collectors.toMap(room -> normalize(room.getName()), Function.identity(), (first, second) -> first));

        for (Room existingRoom : existingRooms) {
            if (!frontendRoomNames.contains(normalize(existingRoom.getName()))) {
                roomRepository.delete(existingRoom);
                roomsDeleted++;
            }
        }

        for (RoomImportDto roomDto : safeRooms(hotelDto)) {
            if (!isValidRoom(roomDto)) {
                roomsSkipped++;
                continue;
            }

            Room room = existingRoomsByName.get(normalize(roomDto.getName()));
            if (room == null) {
                roomRepository.save(mapNewRoom(roomDto, hotel));
                roomsCreated++;
            } else {
                updateRoom(room, roomDto, hotel);
                roomRepository.save(room);
                roomsUpdated++;
            }
        }

        return new RoomSyncResult(roomsCreated, roomsUpdated, roomsDeleted, roomsSkipped);
    }

    private Hotel mapNewHotel(HotelImportDto dto) {
        Hotel hotel = new Hotel();
        updateHotel(hotel, dto);
        return hotel;
    }

    private void updateHotel(Hotel hotel, HotelImportDto dto) {
        hotel.setName(dto.getName().trim());
        hotel.setDescription(defaultText(dto.getDescription(), "No description available."));
        hotel.setCity(defaultText(dto.getCity(), "Unknown"));
        hotel.setAddress(dto.getAddress().trim());
        hotel.setRating(dto.getRating() == null ? 0.0 : dto.getRating());
        hotel.setAmenities(dto.getAmenities() == null ? List.of() : dto.getAmenities());
        hotel.setImages(resolveHotelImages(dto));
        hotel.setPricePerNight(resolveHotelPrice(dto));
        hotel.setAvailable(resolveAvailability(dto.getAvailable(), dto.getStatus()));
    }

    private Room mapNewRoom(RoomImportDto dto, Hotel hotel) {
        Room room = new Room();
        updateRoom(room, dto, hotel);
        return room;
    }

    private void updateRoom(Room room, RoomImportDto dto, Hotel hotel) {
        room.setHotel(hotel);
        room.setName(dto.getName().trim());
        room.setDescription(defaultText(dto.getDescription(), "No room description available."));
        room.setPricePerNight(dto.getPrice());
        room.setMaxGuests(dto.getCapacity());
        room.setAmenities(dto.getAmenities() == null ? List.of() : dto.getAmenities());
        room.setImage(defaultText(dto.getImageUrl(), "https://images.unsplash.com/photo-1618773928121-c32242e63f39"));
        room.setAvailable(resolveAvailability(dto.getAvailable(), dto.getStatus()));
    }

    private List<String> resolveHotelImages(HotelImportDto dto) {
        List<String> images = new ArrayList<>();

        if (hasText(dto.getImageUrl())) {
            images.add(dto.getImageUrl().trim());
        }

        if (dto.getImages() != null) {
            dto.getImages()
                    .stream()
                    .filter(this::hasText)
                    .map(String::trim)
                    .filter(image -> !images.contains(image))
                    .forEach(images::add);
        }

        return images;
    }

    private BigDecimal resolveHotelPrice(HotelImportDto dto) {
        if (dto.getPricePerNight() != null && dto.getPricePerNight().compareTo(BigDecimal.ZERO) > 0) {
            return dto.getPricePerNight();
        }

        return calculateStartingPrice(dto);
    }

    private boolean resolveAvailability(Boolean available, String status) {
        if (available != null) {
            return available;
        }

        if (hasText(status)) {
            return "available".equalsIgnoreCase(status.trim());
        }

        return true;
    }

    private BigDecimal calculateStartingPrice(HotelImportDto dto) {
        return safeRooms(dto)
                .stream()
                .map(RoomImportDto::getPrice)
                .filter(price -> price != null && price.compareTo(BigDecimal.ZERO) > 0)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ONE);
    }

    private List<RoomImportDto> safeRooms(HotelImportDto dto) {
        return dto.getRooms() == null ? List.of() : dto.getRooms();
    }

    private boolean isValidHotel(HotelImportDto dto) {
        return dto != null && hasText(dto.getName()) && hasText(dto.getAddress());
    }

    private boolean isValidRoom(RoomImportDto dto) {
        return dto != null
                && hasText(dto.getName())
                && dto.getPrice() != null
                && dto.getPrice().compareTo(BigDecimal.ZERO) > 0
                && dto.getCapacity() != null
                && dto.getCapacity() > 0;
    }

    private String hotelKey(HotelImportDto dto) {
        return normalize(dto.getName()) + "|" + normalize(dto.getAddress());
    }

    private String hotelKey(Hotel hotel) {
        return normalize(hotel.getName()) + "|" + normalize(hotel.getAddress());
    }

    private String defaultText(String value, String fallback) {
        return hasText(value) ? value.trim() : fallback;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    public record ImportResult(
            int hotelsCreated,
            int hotelsUpdated,
            int hotelsDeleted,
            int hotelsSkipped,
            int roomsCreated,
            int roomsUpdated,
            int roomsDeleted,
            int roomsSkipped
    ) {
    }

    private record RoomSyncResult(
            int roomsCreated,
            int roomsUpdated,
            int roomsDeleted,
            int roomsSkipped
    ) {
    }
}