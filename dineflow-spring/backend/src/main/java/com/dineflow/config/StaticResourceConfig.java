package com.dineflow.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Static resource config — local disk serving removed.
 * Menu images are now served directly via Cloudinary CDN.
 */
@Configuration
@Slf4j
public class StaticResourceConfig implements WebMvcConfigurer {
    // No local file serving needed — Cloudinary CDN handles it
}
