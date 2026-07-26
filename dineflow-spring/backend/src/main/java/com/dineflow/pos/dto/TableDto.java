package com.dineflow.pos.dto;

import com.dineflow.pos.entity.RestaurantTable;
import com.dineflow.pos.entity.TableShape;
import com.dineflow.pos.entity.TableStatus;
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
