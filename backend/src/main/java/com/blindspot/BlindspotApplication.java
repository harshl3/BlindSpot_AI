package com.blindspot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class BlindspotApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(BlindspotApplication.class, args);
    }

    private static void loadDotEnv() {
        Path[] candidatePaths = {
            Paths.get(".env"),
            Paths.get("backend", ".env"),
            Paths.get("..", ".env"),
            Paths.get("..", "backend", ".env")
        };

        for (Path p : candidatePaths) {
            if (Files.exists(p) && !Files.isDirectory(p)) {
                try {
                    List<String> lines = Files.readAllLines(p);
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                            continue;
                        }
                        int idx = trimmed.indexOf('=');
                        if (idx > 0) {
                            String key = trimmed.substring(0, idx).trim();
                            String val = trimmed.substring(idx + 1).trim();
                            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                                val = val.substring(1, val.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                    System.out.println("[BlindspotApplication] Loaded environment properties from " + p.toAbsolutePath());
                    break;
                } catch (Exception e) {
                    System.err.println("[BlindspotApplication] Notice: Could not read .env at " + p + ": " + e.getMessage());
                }
            }
        }
    }
}
