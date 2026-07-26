package com.dineflow.menu.controller;

import com.dineflow.auth.entity.User;
import com.dineflow.dashboard.service.ActivityLogService;
import com.dineflow.menu.dto.CategoryDto;
import com.dineflow.menu.entity.Category;
import com.dineflow.menu.repository.CategoryRepository;
import com.dineflow.realtime.RealtimeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final RealtimeService realtimeService;
    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAll() {
        List<CategoryDto> categories = categoryRepository.findAll().stream()
                .map(CategoryDto::fromEntity).toList();
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<CategoryDto> create(
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Category already exists");
        }
        String slug = request.getName().toLowerCase().replaceAll("\\s+", "-");
        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .build();
        Category saved = categoryRepository.save(category);
        realtimeService.broadcastMenuUpdated(Map.of("action", "category-created"));
        activityLogService.log(user, "CREATE_CATEGORY", "Category created: " + saved.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(CategoryDto.fromEntity(saved));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<CategoryDto> update(
            @PathVariable UUID id,
            @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User user
    ) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Category not found"));
        category.setName(request.getName());
        category.setSlug(request.getName().toLowerCase().replaceAll("\\s+", "-"));
        Category saved = categoryRepository.save(category);
        activityLogService.log(user, "UPDATE_CATEGORY", "Category updated: " + saved.getName());
        return ResponseEntity.ok(CategoryDto.fromEntity(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Category not found"));
        categoryRepository.delete(category);
        activityLogService.log(user, "DELETE_CATEGORY", "Category deleted: " + category.getName());
        return ResponseEntity.noContent().build();
    }

    @Data
    static class CategoryRequest {
        @NotBlank
        private String name;
    }
}
