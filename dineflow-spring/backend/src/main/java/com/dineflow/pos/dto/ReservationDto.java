package com.dineflow.pos.dto;

import com.dineflow.pos.entity.BookingStatus;
import com.dineflow.pos.entity.Reservation;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ReservationDto {
    private UUID id;
    private String customerName;
    private UUID userId;
    private Integer guests;
    private Instant reservationDate;
    private BookingStatus status;
    private TableDto table;

    public static ReservationDto fromEntity(Reservation r) {
        return ReservationDto.builder()
                .id(r.getId())
                .customerName(r.getCustomerName())
                .userId(r.getUser() != null ? r.getUser().getId() : null)
                .guests(r.getGuests())
                .reservationDate(r.getReservationDate())
                .status(r.getStatus())
                .table(r.getTable() != null ? TableDto.fromEntity(r.getTable()) : null)
                .build();
    }
}
