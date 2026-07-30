package com.stayvibe.booking.auth.dto;

import com.stayvibe.booking.user.Role;
import com.stayvibe.booking.user.User;

import java.time.LocalDateTime;

public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        UserResponse response = new UserResponse();
        response.setId(String.valueOf(user.getId()));
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(toFrontendRole(user.getRole()));
        response.setStatus(user.isEnabled() ? "active" : "blocked");
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    private static String toFrontendRole(Role role) {
        return role == Role.ADMIN ? "ROLE_ADMIN" : "ROLE_USER";
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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
