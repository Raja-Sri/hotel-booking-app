package com.stayvibe.booking.common;

public final class PhoneValidator {

    private static final String PHONE_PATTERN = "^[1-9]\\d{9}$";

    private PhoneValidator() {
    }

    public static void validate(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("Phone number is required.");
        }
        String normalized = phone.trim();
        if (!normalized.matches(PHONE_PATTERN)) {
            throw new IllegalArgumentException(
                    "Phone must be exactly 10 digits, numbers only, cannot start with 0, and cannot be all zeros."
            );
        }
    }
}
