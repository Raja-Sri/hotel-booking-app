package com.stayvibe.booking.hotel.dto;

import com.stayvibe.booking.room.Room;

import java.math.BigDecimal;
import java.util.List;

public class HotelRoomDetailResponse {

    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal pricePerNight;
    private Integer capacity;
    private Integer maxGuests;
    private String type;
    private String bedType;
    private String size;
    private Boolean available;
    private String imageUrl;
    private List<String> images;
    private List<String> amenities;
    private Integer count;
    private String availabilityStatus;

    public static HotelRoomDetailResponse from(Room room) {
        return from(room, false);
    }

    public static HotelRoomDetailResponse from(Room room, boolean dateBooked) {
        HotelRoomDetailResponse response = new HotelRoomDetailResponse();
        response.setId(String.valueOf(room.getId()));
        response.setName(room.getName());
        response.setDescription(room.getDescription());
        response.setPrice(room.getPricePerNight());
        response.setPricePerNight(room.getPricePerNight());
        response.setCapacity(room.getMaxGuests());
        response.setMaxGuests(room.getMaxGuests());
        response.setType(inferRoomType(room.getName()));
        response.setBedType(inferBedType(room.getName(), room.getMaxGuests()));
        response.setSize((28 + (room.getMaxGuests() == null ? 1 : room.getMaxGuests()) * 10) + " sqm");
        response.setAvailable(room.getAvailable());
        response.setAvailabilityStatus(resolveAvailabilityStatus(room, dateBooked));
        response.setImageUrl(room.getImage());
        response.setImages(room.getImage() != null ? List.of(room.getImage()) : List.of());
        response.setAmenities(room.getAmenities());
        response.setCount(1);
        return response;
    }

    private static String resolveAvailabilityStatus(Room room, boolean dateBooked) {
        if (Boolean.FALSE.equals(room.getAvailable()) || dateBooked) {
            return "BOOKED";
        }
        return "AVAILABLE";
    }

    private static String inferRoomType(String roomName) {
        if (roomName == null) {
            return "Room";
        }

        String name = roomName.toLowerCase();
        if (name.contains("suite")) {
            return "Suite";
        }
        if (name.contains("deluxe")) {
            return "Deluxe";
        }
        if (name.contains("single")) {
            return "Single";
        }
        if (name.contains("double") || name.contains("queen") || name.contains("king")) {
            return "Double";
        }
        return "Room";
    }

    private static String inferBedType(String roomName, Integer maxGuests) {
        if (roomName == null) {
            return maxGuests != null && maxGuests > 2 ? "King" : "Double";
        }

        String name = roomName.toLowerCase();
        if (name.contains("king")) {
            return "King";
        }
        if (name.contains("queen")) {
            return "Queen";
        }
        if (name.contains("single")) {
            return "Single";
        }
        return maxGuests != null && maxGuests > 2 ? "King" : "Double";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getMaxGuests() {
        return maxGuests;
    }

    public void setMaxGuests(Integer maxGuests) {
        this.maxGuests = maxGuests;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getBedType() {
        return bedType;
    }

    public void setBedType(String bedType) {
        this.bedType = bedType;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }
}