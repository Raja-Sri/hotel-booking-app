package com.stayvibe.booking.hotel.dto;

import com.stayvibe.booking.booking.BookingRepository;
import com.stayvibe.booking.booking.BookingStatus;
import com.stayvibe.booking.hotel.Hotel;
import com.stayvibe.booking.room.Room;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class HotelDetailResponse {

    private Long id;
    private String name;
    private String description;
    private String city;
    private String address;
    private Integer stars;
    private Double rating;
    private Integer reviewCount;
    private List<String> amenities;
    private List<String> images;
    private String imageUrl;
    private BigDecimal pricePerNight;
    private Boolean available;
    private String status;
    private Boolean featured;
    private Boolean popular;
    private List<HotelRoomDetailResponse> rooms;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static HotelDetailResponse from(Hotel hotel, List<Room> rooms) {
        return from(hotel, rooms, null, null, null);
    }

    public static HotelDetailResponse from(
            Hotel hotel,
            List<Room> rooms,
            LocalDate checkIn,
            LocalDate checkOut,
            BookingRepository bookingRepository
    ) {
        HotelDetailResponse response = new HotelDetailResponse();
        response.setId(hotel.getId());
        response.setName(hotel.getName());
        response.setDescription(hotel.getDescription());
        response.setCity(hotel.getCity());
        response.setAddress(hotel.getAddress());
        response.setStars(toStars(hotel.getRating()));
        response.setRating(hotel.getRating());
        response.setReviewCount(0);
        response.setAmenities(hotel.getAmenities());
        response.setImages(hotel.getImages());
        response.setImageUrl(firstImage(hotel.getImages()));
        response.setPricePerNight(hotel.getPricePerNight());
        response.setAvailable(hotel.getAvailable());
        response.setStatus(Boolean.FALSE.equals(hotel.getAvailable()) ? "disabled" : "available");
        response.setFeatured(false);
        response.setPopular(false);
        response.setRooms(rooms.stream()
                .map(room -> HotelRoomDetailResponse.from(room, isRoomBookedForDates(room, checkIn, checkOut, bookingRepository)))
                .toList());
        response.setCreatedAt(hotel.getCreatedAt());
        response.setUpdatedAt(hotel.getUpdatedAt());
        return response;
    }

    private static boolean isRoomBookedForDates(
            Room room,
            LocalDate checkIn,
            LocalDate checkOut,
            BookingRepository bookingRepository
    ) {
        if (checkIn == null || checkOut == null || bookingRepository == null) {
            return false;
        }

        return bookingRepository.existsByRoomIdAndBookingStatusAndCheckInDateLessThanAndCheckOutDateGreaterThan(
                room.getId(),
                BookingStatus.CONFIRMED,
                checkOut,
                checkIn
        );
    }

    private static String firstImage(List<String> images) {
        return images == null || images.isEmpty() ? null : images.get(0);
    }

    private static Integer toStars(Double rating) {
        if (rating == null) {
            return 0;
        }
        return Math.max(1, Math.min(5, (int) Math.round(rating / 2.0)));
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getStars() {
        return stars;
    }

    public void setStars(Integer stars) {
        this.stars = stars;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    public Boolean getPopular() {
        return popular;
    }

    public void setPopular(Boolean popular) {
        this.popular = popular;
    }

    public List<HotelRoomDetailResponse> getRooms() {
        return rooms;
    }

    public void setRooms(List<HotelRoomDetailResponse> rooms) {
        this.rooms = rooms;
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