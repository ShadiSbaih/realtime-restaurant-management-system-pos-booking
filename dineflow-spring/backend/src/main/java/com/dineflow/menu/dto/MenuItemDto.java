package com.dineflow.menu.dto;

import com.dineflow.menu.entity.MenuItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class MenuItemDto {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discount;
    private String image;
    private Boolean isAvailable;
    private String recipe;
    private String aiSuggestion;
    private CategoryDto category;
    private Double averageRating;
    private Integer totalReviews;

    public static MenuItemDto fromEntity(MenuItem item) {
        double avgRating = 0;
        int totalReviews = 0;
        if (item.getFeedbacks() != null && !item.getFeedbacks().isEmpty()) {
            avgRating = item.getFeedbacks().stream()
                    .mapToInt(f -> f.getRating())
                    .average()
                    .orElse(0);
            totalReviews = item.getFeedbacks().size();
        }
        return MenuItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .discount(item.getDiscount())
                .image(item.getImage())
                .isAvailable(item.getIsAvailable())
                .recipe(item.getRecipe())
                .aiSuggestion(item.getAiSuggestion())
                .category(item.getCategory() != null ? CategoryDto.fromEntity(item.getCategory()) : null)
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .totalReviews(totalReviews)
                .build();
    }
}
