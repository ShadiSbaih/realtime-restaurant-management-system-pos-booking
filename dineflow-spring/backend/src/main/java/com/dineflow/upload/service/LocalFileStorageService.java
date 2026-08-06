package com.dineflow.upload.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class LocalFileStorageService {

    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of("image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif");
    private static final long MAX_SIZE = 10 * 1024 * 1024L; // 10 MB

    private final Path uploadDir;
    private final String baseUrl;

    public LocalFileStorageService(
            @Value("${app.upload.dir}") String uploadDir,
            @Value("${app.upload.base-url}") String baseUrl) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.baseUrl = baseUrl.endsWith("/")
                ? baseUrl.substring(0, baseUrl.length() - 1)
                : baseUrl;
    }

    @PostConstruct
    private void init() throws IOException {
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
    }

    /**
     * Validates, stores the uploaded image locally, and returns its public URL.
     */
    public String storeImage(MultipartFile file) throws IOException {
        validate(file);

        String filename = generateUniqueFilename(file.getOriginalFilename());
        Path target = uploadDir.resolve(filename).normalize();
        ensureInsideUploadDir(target);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        }

        return baseUrl + "/" + filename;
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only JPEG, PNG, WebP, and GIF images are allowed");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10 MB limit");
        }
    }

    private String generateUniqueFilename(String originalFilename) {
        String ext = extractExtension(originalFilename);
        return UUID.randomUUID() + "." + ext;
    }

    private String extractExtension(String originalFilename) {
        if (!StringUtils.hasText(originalFilename)) {
            return "bin";
        }
        String name = originalFilename.replaceAll("[\\\\/]", "");
        int dot = name.lastIndexOf('.');
        if (dot == -1 || dot == name.length() - 1) {
            return "bin";
        }
        String ext = name.substring(dot + 1).replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        return ext.isBlank() ? "bin" : ext;
    }

    private void ensureInsideUploadDir(Path target) {
        if (!target.startsWith(uploadDir)) {
            throw new IllegalArgumentException("Invalid filename: path traversal attempt detected");
        }
    }
}
