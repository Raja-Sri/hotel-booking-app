package com.stayvibe.booking.data;

import com.stayvibe.booking.user.Role;
import com.stayvibe.booking.user.User;
import com.stayvibe.booking.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(UserDataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.user-seeder.enabled:true}")
    private boolean enabled;

    public UserDataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!enabled) {
            return;
        }
        seedUser("admin@stayvibe.com", "System Admin", "admin123", Role.ADMIN);
        seedUser("user@stayvibe.com", "Demo User", "user123", Role.CUSTOMER);
    }

    private void seedUser(String email, String name, String password, Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEnabled(true);
        userRepository.save(user);
        log.info("Seeded default user: {}", email);
    }
}
