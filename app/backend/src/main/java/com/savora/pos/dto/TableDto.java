package com.savora.pos.dto;

import com.savora.pos.entity.RestaurantTable;
import com.savora.pos.entity.TableShape;
import com.savora.pos.entity.TableStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class TableDto {
    private UUID id;
    private String name;
    private Integer seats;
    private String section;
    private TableShape shape;
    private TableStatus status;
    private List<ReservationDto> reservations;

    public static TableDto fromEntity(RestaurantTable t) {
        return TableDto.builder()
                .id(t.getId())
                .name(t.getName())
                .seats(t.getSeats())
                .section(t.getSection())
                .shape(t.getShape())
                .status(t.getStatus())
                .build();
    }
}
