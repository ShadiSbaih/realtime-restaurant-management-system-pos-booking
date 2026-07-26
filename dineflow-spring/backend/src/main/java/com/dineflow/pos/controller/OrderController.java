package com.dineflow.pos.controller;

import com.dineflow.auth.entity.User;
import com.dineflow.common.dto.PaginatedResponse;
import com.dineflow.pos.dto.*;
import com.dineflow.pos.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<OrderDto> createPosOrder(
            @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createPosOrder(request, user));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<PaginatedResponse<OrderDto>> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) UUID userId
    ) {
        Page<OrderDto> orders = orderService.getOrders(page, limit, userId);
        return ResponseEntity.ok(PaginatedResponse.from(orders));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<OrderDto> updateOrder(
            @PathVariable UUID id,
            @RequestBody UpdateOrderRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(orderService.updateOrder(id, request, user));
    }
}
