package com.stayvibe.booking.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class RoomRequest {

    @NotNull(message = "Hotel id is required")
    private Long hotelId;

    @NotBlank(message = "Room name is required")
    @Size(max = 150, message = "Room name must be at most 150 characters")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price per night is required")
    @Positive(message = "Price per night must be greater than 0")
    private BigDecimal pricePerNight;

    @NotNull(message = "Maximum guests is required")
    @Positive(message = "Maximum guests must be greater than 0")
    private Integer maxGuests;

    private List<String> amenities = new ArrayList<>();

    @NotBlank(message = "Room image is required")
    private String image;

    @NotNull(message = "Availability status is required")
    private Boolean available;

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
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
}
