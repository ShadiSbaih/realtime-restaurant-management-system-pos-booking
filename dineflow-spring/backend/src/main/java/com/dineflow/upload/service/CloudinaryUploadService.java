package com.dineflow.upload.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryUploadService {

    private final Cloudinary cloudinary;

    @Value("${app.cloudinary.folder:dineflow}")
    private String folder;

    private static final List<String> ALLOWED_TYPES =
            List.of("image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif");
    private static final long MAX_SIZE = 10 * 1024 * 1024L; // 10 MB

    /**
     * Uploads an image to Cloudinary and returns its secure CDN URL.
     */
    @SuppressWarnings("unchecked")
    public String upload(MultipartFile file) throws IOException {
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only JPEG, PNG, WebP, and GIF images are allowed");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10 MB limit");
        }

        Map result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder + "/menu",
                "resource_type", "image",
                "overwrite", false
        ));

        return (String) result.get("secure_url");
    }
}
