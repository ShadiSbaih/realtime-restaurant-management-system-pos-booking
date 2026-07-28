package com.dineflow.menu.service;

import com.dineflow.auth.entity.User;
import com.dineflow.dashboard.service.ActivityLogService;
import com.dineflow.menu.dto.*;
import com.dineflow.menu.entity.Category;
import com.dineflow.menu.entity.Feedback;
import com.dineflow.menu.entity.MenuItem;
import com.dineflow.menu.repository.CategoryRepository;
import com.dineflow.menu.repository.FeedbackRepository;
import com.dineflow.menu.repository.MenuItemRepository;
import com.dineflow.realtime.RealtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final FeedbackRepository feedbackRepository;
    private final RealtimeService realtimeService;
    private final ActivityLogService activityLogService;

    public Page<MenuItemDto> getMenuItems(int page, int limit, UUID categoryId, String search, boolean isAdmin) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by("name").ascending());
        Page<MenuItem> items;
        
        if (search != null && search.trim().isEmpty()) {
            search = null;
        }

        if (isAdmin) {
            items = menuItemRepository.findFiltered(categoryId, search, pageRequest);
        } else {
            items = menuItemRepository.findAvailableFiltered(categoryId, search, pageRequest);
        }
        return items.map(MenuItemDto::fromEntity);
    }

    public MenuItemDto getMenuItemById(UUID id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Menu item not found: " + id));
        return MenuItemDto.fromEntity(item);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public MenuItemDto createMenuItem(CreateMenuItemRequest request, User currentUser) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Category not found"));

        MenuItem item = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .discount(request.getDiscount() != null ? request.getDiscount() : java.math.BigDecimal.ZERO)
                .image(request.getImage())
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .category(category)
                .build();
        MenuItem saved = menuItemRepository.save(item);
        realtimeService.broadcastMenuUpdated(Map.of("action", "created", "itemId", saved.getId()));
        activityLogService.log(currentUser, "CREATE_MENU_ITEM", "Menu item created: " + saved.getName());
        return MenuItemDto.fromEntity(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public MenuItemDto updateMenuItem(UUID id, UpdateMenuItemRequest request, User currentUser) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Menu item not found"));

        if (request.getName() != null) item.setName(request.getName().trim());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getPrice() != null) item.setPrice(request.getPrice());
        if (request.getDiscount() != null) item.setDiscount(request.getDiscount());
        if (request.getImage() != null) item.setImage(request.getImage());
        if (request.getIsAvailable() != null) item.setIsAvailable(request.getIsAvailable());
        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Category not found"));
            item.setCategory(cat);
        }

        MenuItem saved = menuItemRepository.save(item);
        realtimeService.broadcastMenuUpdated(Map.of("action", "updated", "itemId", saved.getId()));
        activityLogService.log(currentUser, "UPDATE_MENU_ITEM", "Menu item updated: " + saved.getName());
        return MenuItemDto.fromEntity(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public void deleteMenuItem(UUID id, User currentUser) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Menu item not found"));
        menuItemRepository.delete(item);
        realtimeService.broadcastMenuUpdated(Map.of("action", "deleted", "itemId", id));
        activityLogService.log(currentUser, "DELETE_MENU_ITEM", "Menu item deleted: " + id);
    }

    @Transactional
    public void submitFeedback(UUID menuItemId, FeedbackRequest request, User currentUser) {
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Menu item not found"));
        Feedback feedback = Feedback.builder()
                .menuItem(item)
                .rating(request.getRating())
                .comment(request.getComment())
                .user(currentUser)
                .build();
        feedbackRepository.save(feedback);
    }
}
