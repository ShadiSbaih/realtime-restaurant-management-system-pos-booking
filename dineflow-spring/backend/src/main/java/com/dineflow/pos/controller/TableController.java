package com.dineflow.pos.controller;

import com.dineflow.auth.entity.User;
import com.dineflow.pos.dto.*;
import com.dineflow.pos.entity.TableStatus;
import com.dineflow.pos.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'KITCHEN')")
    public ResponseEntity<List<TableDto>> getAllTables() {
        return ResponseEntity.ok(tableService.getAllTables());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'KITCHEN')")
    public ResponseEntity<TableDto> getTableById(@PathVariable UUID id) {
        return ResponseEntity.ok(tableService.getTableById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TableDto> createTable(
            @RequestBody CreateTableRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tableService.createTable(request, user));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TableDto> updateTable(
            @PathVariable UUID id,
            @RequestBody CreateTableRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(tableService.updateTable(id, request, user));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TableDto> updateTableStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user
    ) {
        TableStatus status = TableStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(tableService.updateTableStatus(id, status, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteTable(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        tableService.deleteTable(id, user);
        return ResponseEntity.noContent().build();
    }
}
