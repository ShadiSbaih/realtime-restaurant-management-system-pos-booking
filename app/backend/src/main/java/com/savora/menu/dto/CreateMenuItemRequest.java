package com.savora.menu.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateMenuItemRequest {
    @NotBlank
    private String name;

    private String description;

    @NotNull @DecimalMin("0.0")
    private BigDecimal price;

    private BigDecimal discount;
    private String image;
    private Boolean isAvailable;
    private String recipe;

    @NotNull
    private UUID categoryId;
}
