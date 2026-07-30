package com.stayvibe.booking.room.dto;

import com.stayvibe.booking.room.Room;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class RoomResponse {

    private Long id;
    private Long hotelId;
    private String hotelName;
    private String name;
    private String description;
    private BigDecimal pricePerNight;
    private Integer maxGuests;
    private List<String> amenities;
    private String image;
    private Boolean available;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RoomResponse from(Room room) {
        RoomResponse response = new RoomResponse();
        response.setId(room.getId());
        response.setHotelId(room.getHotel().getId());
        response.setHotelName(room.getHotel().getName());
        response.setName(room.getName());
        response.setDescription(room.getDescription());
        response.setPricePerNight(room.getPricePerNight());
        response.setMaxGuests(room.getMaxGuests());
        response.setAmenities(room.getAmenities());
        response.setImage(room.getImage());
        response.setAvailable(room.getAvailable());
        response.setCreatedAt(room.getCreatedAt());
        response.setUpdatedAt(room.getUpdatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public String getHotelName() {
        return hotelName;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
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

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public Integer getMaxGuests() {
        return maxGuests;
    }

    public void setMaxGuests(Integer maxGuests) {
        this.maxGuests = maxGuests;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
