import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

public class MavenWrapperDownloader {

    public static void main(String[] args) throws IOException {
        if (args.length != 2) {
            throw new IllegalArgumentException("Usage: MavenWrapperDownloader <url> <output-file>");
        }

        URI uri = URI.create(args[0]);
        Path output = Path.of(args[1]);

        Files.createDirectories(output.getParent());
        try (InputStream inputStream = uri.toURL().openStream()) {
            Files.copy(inputStream, output, StandardCopyOption.REPLACE_EXISTING);
        }
    }
}
