package com.dineflow.pos.controller;

import com.dineflow.auth.entity.User;
import com.dineflow.common.dto.PaginatedResponse;
import com.dineflow.pos.dto.*;
import com.dineflow.pos.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<PaginatedResponse<ReservationDto>> getReservations(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) UUID userId
    ) {
        Page<ReservationDto> result = reservationService.getReservations(page, limit, userId);
        return ResponseEntity.ok(PaginatedResponse.from(result));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ReservationDto> createReservation(
            @RequestBody CreateReservationRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createReservation(request, user));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ReservationDto> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(id, body.get("status"), user));
    }
}
