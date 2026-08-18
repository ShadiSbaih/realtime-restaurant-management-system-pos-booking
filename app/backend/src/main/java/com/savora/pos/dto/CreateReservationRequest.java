package com.savora.pos.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class CreateReservationRequest {
    private String customerName;
    private UUID tableId;
    private Instant date;
    private Integer guests;
}
