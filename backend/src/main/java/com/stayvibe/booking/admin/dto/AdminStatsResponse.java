package com.stayvibe.booking.admin.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AdminStatsResponse {

    private long totalHotels;
    private long totalRooms;
    private long totalUsers;
    private long totalBookings;
    private long activeBookings;
    private long cancelledBookings;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private BigDecimal projectionRemainingRevenue = BigDecimal.ZERO;
    private double occupancyRatePercent;
    private List<MonthlyRevenuePoint> monthlyRevenue = new ArrayList<>();
    private List<Map<String, Object>> hotelPerformance = new ArrayList<>();

    public long getTotalHotels() {
        return totalHotels;
    }

    public void setTotalHotels(long totalHotels) {
        this.totalHotels = totalHotels;
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getProjectionRemainingRevenue() {
        return projectionRemainingRevenue;
    }

    public void setProjectionRemainingRevenue(BigDecimal projectionRemainingRevenue) {
        this.projectionRemainingRevenue = projectionRemainingRevenue;
    }

    public double getOccupancyRatePercent() {
        return occupancyRatePercent;
    }

    public void setOccupancyRatePercent(double occupancyRatePercent) {
        this.occupancyRatePercent = occupancyRatePercent;
    }

    public List<MonthlyRevenuePoint> getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(List<MonthlyRevenuePoint> monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public List<Map<String, Object>> getHotelPerformance() {
        return hotelPerformance;
    }

    public void setHotelPerformance(List<Map<String, Object>> hotelPerformance) {
        this.hotelPerformance = hotelPerformance;
    }
}
