package com.dineflow.pos.service;

import com.dineflow.auth.entity.User;
import com.dineflow.dashboard.service.ActivityLogService;
import com.dineflow.pos.dto.*;
import com.dineflow.pos.entity.*;
import com.dineflow.pos.repository.ReservationRepository;
import com.dineflow.pos.repository.TableRepository;
import com.dineflow.realtime.RealtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TableRepository tableRepository;
    private final ReservationRepository reservationRepository;
    private final RealtimeService realtimeService;
    private final ActivityLogService activityLogService;

    public List<TableDto> getAllTables() {
        java.time.ZonedDateTime now = java.time.ZonedDateTime.now(java.time.ZoneId.systemDefault());
        java.time.Instant startOfDay = now.toLocalDate().atStartOfDay(now.getZone()).toInstant();
        java.time.Instant endOfDay = now.toLocalDate().atTime(java.time.LocalTime.MAX).atZone(now.getZone()).toInstant();

        List<Reservation> todaysReservations = reservationRepository.findActiveReservationsBetween(
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED),
                startOfDay,
                endOfDay
        );

        Map<UUID, List<ReservationDto>> reservationsByTable = new java.util.HashMap<>();
        for (Reservation r : todaysReservations) {
            reservationsByTable
                .computeIfAbsent(r.getTable().getId(), k -> new java.util.ArrayList<>())
                .add(ReservationDto.fromEntity(r));
        }

        return tableRepository.findAll().stream().map(t -> {
            TableDto dto = TableDto.fromEntity(t);
            dto.setReservations(reservationsByTable.getOrDefault(t.getId(), new java.util.ArrayList<>()));
            return dto;
        }).toList();
    }

    public TableDto getTableById(UUID id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Table not found: " + id));
        return TableDto.fromEntity(table);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public TableDto createTable(CreateTableRequest request, User currentUser) {
        if (tableRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Table with this name already exists");
        }
        RestaurantTable table = RestaurantTable.builder()
                .name(request.getName())
                .seats(request.getSeats())
                .section(request.getSection() != null ? request.getSection() : "Main Dining Room")
                .shape(request.getShape() != null ? request.getShape() : TableShape.square)
                .status(TableStatus.AVAILABLE)
                .build();
        RestaurantTable saved = tableRepository.save(table);
        realtimeService.broadcastTableUpdated(Map.of("action", "created", "tableId", saved.getId()));
        activityLogService.log(currentUser, "CREATE_TABLE", "Table created: " + saved.getName());
        return TableDto.fromEntity(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public TableDto updateTable(UUID id, CreateTableRequest request, User currentUser) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Table not found"));
        if (request.getName() != null && !request.getName().equals(table.getName())) {
            tableRepository.findByName(request.getName()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) throw new IllegalArgumentException("Name already in use");
            });
            table.setName(request.getName());
        }
        if (request.getSeats() != null) table.setSeats(request.getSeats());
        if (request.getSection() != null) table.setSection(request.getSection());
        if (request.getShape() != null) table.setShape(request.getShape());
        RestaurantTable saved = tableRepository.save(table);
        realtimeService.broadcastTableUpdated(Map.of("action", "updated", "tableId", saved.getId()));
        activityLogService.log(currentUser, "UPDATE_TABLE", "Table updated: " + saved.getName());
        return TableDto.fromEntity(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public TableDto updateTableStatus(UUID id, TableStatus status, User currentUser) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Table not found"));
        table.setStatus(status);
        RestaurantTable saved = tableRepository.save(table);
        realtimeService.broadcastTableUpdated(Map.of("action", "status-changed", "tableId", saved.getId(), "status", status.name()));
        activityLogService.log(currentUser, "UPDATE_TABLE_STATUS", "Table " + saved.getName() + " status → " + status.name());
        return TableDto.fromEntity(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public void deleteTable(UUID id, User currentUser) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Table not found"));

        // Cannot delete table with active reservations
        var activeReservations = reservationRepository.findConflicting(
                id, List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED),
                java.time.Instant.now().minusSeconds(86400 * 365),
                java.time.Instant.now().plusSeconds(86400 * 365)
        );
        if (!activeReservations.isEmpty()) {
            throw new IllegalStateException("Cannot delete table with active reservations");
        }

        tableRepository.delete(table);
        realtimeService.broadcastTableUpdated(Map.of("action", "deleted", "tableId", id));
        activityLogService.log(currentUser, "DELETE_TABLE", "Table deleted: " + table.getName());
    }
}
