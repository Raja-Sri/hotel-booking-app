package com.stayvibe.booking.data;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stayvibe.booking.data.dto.HotelImportDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Component
public class HotelDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(HotelDataSeeder.class);

    private final ObjectMapper objectMapper;
    private final HotelImportService hotelImportService;
    private final boolean enabled;
    private final String hotelsJsonPath;

    public HotelDataSeeder(
            ObjectMapper objectMapper,
            HotelImportService hotelImportService,
            @Value("${app.data-seeder.enabled:true}") boolean enabled,
            @Value("${app.data-seeder.hotels-json-path:frontend/.data/hotels.json}") String hotelsJsonPath
    ) {
        this.objectMapper = objectMapper;
        this.hotelImportService = hotelImportService;
        this.enabled = enabled;
        this.hotelsJsonPath = hotelsJsonPath;
    }

    @Override
    public void run(String... args) {
        if (!enabled) {
            log.info("Hotel data seeder is disabled.");
            return;
        }

        Path path = resolveSeedFilePath();
        if (path == null) {
            log.warn("Hotel seed file not found at '{}'. Startup will continue without importing hotel data.", hotelsJsonPath);
            return;
        }

        try {
            List<HotelImportDto> hotels = readHotels(path);
            HotelImportService.ImportResult result = hotelImportService.importHotels(hotels);

            log.info(
                    "Hotel seed sync completed. hotelsCreated={}, hotelsUpdated={}, hotelsDeleted={}, hotelsSkipped={}, roomsCreated={}, roomsUpdated={}, roomsDeleted={}, roomsSkipped={}",
                    result.hotelsCreated(),
                    result.hotelsUpdated(),
                    result.hotelsDeleted(),
                    result.hotelsSkipped(),
                    result.roomsCreated(),
                    result.roomsUpdated(),
                    result.roomsDeleted(),
                    result.roomsSkipped()
            );
        } catch (IOException exception) {
            log.error("Unable to read hotel seed file '{}'. Startup will continue without importing hotel data.", path, exception);
        } catch (RuntimeException exception) {
            log.error("Hotel seed import failed. Startup will continue, but seed data may be incomplete.", exception);
        }
    }

    private List<HotelImportDto> readHotels(Path path) throws IOException {
        JsonNode root = objectMapper.readTree(path.toFile());
        JsonNode hotelsNode = root.isArray() ? root : root.path("hotels");

        if (!hotelsNode.isArray()) {
            log.warn("Hotel seed file '{}' does not contain a hotel array.", path);
            return List.of();
        }

        return objectMapper.convertValue(hotelsNode, new TypeReference<>() {
        });
    }

    private Path resolveSeedFilePath() {
        Path configuredPath = Path.of(hotelsJsonPath).normalize();
        if (Files.exists(configuredPath)) {
            return configuredPath;
        }

        Path backendSiblingPath = Path.of("..", hotelsJsonPath).normalize();
        if (Files.exists(backendSiblingPath)) {
            return backendSiblingPath;
        }

        return null;
    }
}
