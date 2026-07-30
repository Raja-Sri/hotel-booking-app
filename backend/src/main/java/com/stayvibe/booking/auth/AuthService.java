package com.stayvibe.booking.auth;

import com.stayvibe.booking.auth.dto.AuthResponse;
import com.stayvibe.booking.auth.dto.LoginRequest;
import com.stayvibe.booking.auth.dto.RegisterRequest;
import com.stayvibe.booking.auth.dto.UserResponse;
import com.stayvibe.booking.common.PhoneValidator;
import com.stayvibe.booking.security.CustomUserDetailsService;
import com.stayvibe.booking.security.JwtService;
import com.stayvibe.booking.user.Role;
import com.stayvibe.booking.user.User;
import com.stayvibe.booking.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            CustomUserDetailsService userDetailsService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        log.info("Registration requested for email={}", email);

        if (userRepository.existsByEmail(email)) {
            log.warn("Registration rejected because email already exists: {}", email);
            throw new IllegalArgumentException("Email is already registered.");
        }

        String phone = normalizePhone(request.getPhone());
        PhoneValidator.validate(phone);

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setEnabled(true);

        User savedUser = userRepository.saveAndFlush(user);
        log.info("User persisted successfully. id={}, email={}", savedUser.getId(), savedUser.getEmail());

        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(token, UserResponse.from(savedUser));
    }

    public AuthResponse loginCustomer(LoginRequest request) {
        return loginWithRole(request, Role.CUSTOMER, "Admin accounts cannot use customer login.");
    }

    public AuthResponse loginAdmin(LoginRequest request) {
        return loginWithRole(request, Role.ADMIN, "Customer accounts cannot access admin portal.");
    }

    private AuthResponse loginWithRole(LoginRequest request, Role requiredRole, String wrongRoleMessage) {
        String email = normalizeEmail(request.getEmail());
        log.info("Login requested for email={}, requiredRole={}", email, requiredRole);

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userDetailsService.loadDomainUserByEmail(email);

        if (user.getRole() != requiredRole) {
            log.warn("Login rejected for email={}: expected role {}, found {}", email, requiredRole, user.getRole());
            if (requiredRole == Role.ADMIN) {
                throw new IllegalArgumentException(wrongRoleMessage);
            }
            throw new IllegalArgumentException(wrongRoleMessage);
        }

        if (!user.isEnabled()) {
            throw new IllegalArgumentException("Account is disabled.");
        }

        String token = jwtService.generateToken(user);
        log.info("Login successful for user id={}, email={}, role={}", user.getId(), user.getEmail(), user.getRole());

        return new AuthResponse(token, UserResponse.from(user));
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return UserResponse.from(user);
    }

    private String normalizeEmail(String email) {
        return email.toLowerCase().trim();
    }

    private String normalizePhone(String phone) {
        if (phone == null) {
            return null;
        }
        return phone.replaceAll("\\D", "");
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.stayvibe.booking.common.ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }
}
