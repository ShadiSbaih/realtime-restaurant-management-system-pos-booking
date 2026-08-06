package com.dineflow.upload.controller;

import com.dineflow.upload.service.LocalFileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class FileUploadController {

    private final LocalFileStorageService localFileStorageService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String url = localFileStorageService.storeImage(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
