package com.stayvibe.booking.booking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.stayvibe.booking.booking.Booking;
import com.stayvibe.booking.booking.BookingStatus;
import com.stayvibe.booking.room.Room;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingResponse {

    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String hotelId;
    private String hotelName;
    private String roomId;
    private String roomName;
    private String roomType;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guests;
    private BigDecimal totalPrice;
    private String status;
    private LocalDateTime createdAt;

    public static BookingResponse from(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(String.valueOf(booking.getId()));
        response.setUserId(String.valueOf(booking.getUser().getId()));
        response.setUserName(booking.getUser().getName());
        response.setUserEmail(booking.getUser().getEmail());
        response.setHotelId(String.valueOf(booking.getHotel().getId()));
        response.setHotelName(booking.getHotel().getName());
        response.setCheckInDate(booking.getCheckInDate());
        response.setCheckOutDate(booking.getCheckOutDate());
        response.setGuests(booking.getGuests());
        response.setTotalPrice(booking.getTotalPrice());
        response.setStatus(toFrontendStatus(booking.getBookingStatus()));
        response.setCreatedAt(booking.getCreatedAt());

        Room room = booking.getRoom();
        if (room != null) {
            response.setRoomId(String.valueOf(room.getId()));
            response.setRoomName(room.getName());
            response.setRoomType(room.getName());
        }

        return response;
    }

    private static String toFrontendStatus(BookingStatus bookingStatus) {
        if (bookingStatus == null) {
            return "pending";
        }
        return switch (bookingStatus) {
            case CONFIRMED -> "confirmed";
            case CANCELLED -> "cancelled";
        };
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getHotelId() {
        return hotelId;
    }

    public void setHotelId(String hotelId) {
        this.hotelId = hotelId;
    }

    public String getHotelName() {
        return hotelName;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    @JsonProperty("checkIn")
    public LocalDate getCheckIn() {
        return checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    @JsonProperty("checkOut")
    public LocalDate getCheckOut() {
        return checkOutDate;
    }

    public Integer getGuests() {
        return guests;
    }

    public void setGuests(Integer guests) {
        this.guests = guests;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
