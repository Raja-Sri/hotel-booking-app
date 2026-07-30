package com.stayvibe.booking.booking.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public class BookingRequest {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Hotel id is required")
    private Long hotelId;

    private Long roomId;

    @NotNull(message = "Check-in date is required")
    @JsonAlias("checkIn")
    private LocalDate checkInDate;

    @NotNull(message = "Check-out date is required")
    @JsonAlias("checkOut")
    private LocalDate checkOutDate;

    @NotNull(message = "Guests is required")
    @Positive(message = "Guests must be greater than 0")
    private Integer guests;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public Integer getGuests() {
        return guests;
    }

    public void setGuests(Integer guests) {
        this.guests = guests;
    }
}
