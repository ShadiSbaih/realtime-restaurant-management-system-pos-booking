package com.savora.menu.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class UpdateMenuItemRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discount;
    private String image;
    private Boolean isAvailable;
    private String recipe;
    private UUID categoryId;
}
