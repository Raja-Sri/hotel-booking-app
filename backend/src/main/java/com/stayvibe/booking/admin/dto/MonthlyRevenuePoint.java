package com.stayvibe.booking.admin.dto;

import java.math.BigDecimal;

public class MonthlyRevenuePoint {

    private String month;
    private BigDecimal revenue;

    public MonthlyRevenuePoint() {
    }

    public MonthlyRevenuePoint(String month, BigDecimal revenue) {
        this.month = month;
        this.revenue = revenue;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }
}
