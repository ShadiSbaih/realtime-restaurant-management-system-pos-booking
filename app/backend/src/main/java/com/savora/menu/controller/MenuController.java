package com.savora.menu.controller;

import com.savora.auth.entity.User;
import com.savora.common.dto.PaginatedResponse;
import com.savora.menu.dto.*;
import com.savora.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<PaginatedResponse<MenuItemDto>> getMenuItems(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int limit,
            @RequestParam(required = false) UUID category,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal User user
    ) {
        boolean isAdmin = user != null && (user.getRole().name().equals("ADMIN") || user.getRole().name().equals("MANAGER"));
        Page<MenuItemDto> result = menuService.getMenuItems(page, limit, category, search, isAdmin);
        return ResponseEntity.ok(PaginatedResponse.from(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItemDto> getMenuItemById(@PathVariable UUID id) {
        return ResponseEntity.ok(menuService.getMenuItemById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MenuItemDto> createMenuItem(
            @Valid @RequestBody CreateMenuItemRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.createMenuItem(request, user));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MenuItemDto> createMenuItemManually(
            @Valid @RequestBody CreateMenuItemRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.createMenuItem(request, user));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MenuItemDto> updateMenuItem(
            @PathVariable UUID id,
            @RequestBody UpdateMenuItemRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(menuService.updateMenuItem(id, request, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        menuService.deleteMenuItem(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{menuItemId}/feedback")
    public ResponseEntity<Void> submitFeedback(
            @PathVariable UUID menuItemId,
            @Valid @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal User user
    ) {
        menuService.submitFeedback(menuItemId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
