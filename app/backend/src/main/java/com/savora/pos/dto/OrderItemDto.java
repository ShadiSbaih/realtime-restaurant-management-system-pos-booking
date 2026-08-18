package com.savora.pos.dto;

import com.savora.pos.entity.OrderItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class OrderItemDto {
    private UUID id;
    private UUID menuItemId;
    private String menuItemName;
    private String menuItemImage;
    private Integer quantity;
    private BigDecimal price;
    private String notes;

    public static OrderItemDto fromEntity(OrderItem item) {
        return OrderItemDto.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItem() != null ? item.getMenuItem().getId() : null)
                .menuItemName(item.getMenuItem() != null ? item.getMenuItem().getName() : null)
                .menuItemImage(item.getMenuItem() != null ? item.getMenuItem().getImage() : null)
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .notes(item.getNotes())
                .build();
    }
}
