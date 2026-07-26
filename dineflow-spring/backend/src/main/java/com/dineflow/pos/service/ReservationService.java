package com.dineflow.pos.service;

import com.dineflow.auth.entity.User;
import com.dineflow.dashboard.service.ActivityLogService;
import com.dineflow.pos.dto.*;
import com.dineflow.pos.entity.*;
import com.dineflow.pos.repository.ReservationRepository;
import com.dineflow.pos.repository.TableRepository;
import com.dineflow.realtime.RealtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TableRepository tableRepository;
    private final RealtimeService realtimeService;
    private final ActivityLogService activityLogService;

    @Transactional
    public ReservationDto createReservation(CreateReservationRequest request, User currentUser) {
        if (request.getDate() == null || request.getGuests() == null || request.getTableId() == null) {
            throw new IllegalArgumentException("Missing required fields: date, guests, tableId");
        }

        RestaurantTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Table not found"));

        // Prevent double booking within 2-hour window
        Instant requestedTime = request.getDate();
        Instant twoHoursBefore = requestedTime.minus(2, ChronoUnit.HOURS);
        Instant twoHoursAfter = requestedTime.plus(2, ChronoUnit.HOURS);

        List<Reservation> conflicts = reservationRepository.findConflicting(
                request.getTableId(),
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED),
                twoHoursBefore,
                twoHoursAfter
        );
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Table is already booked around this time.");
        }

        String customerName = request.getCustomerName() != null
                ? request.getCustomerName()
                : (currentUser != null ? currentUser.getName() : "Guest");

        Reservation reservation = Reservation.builder()
                .customerName(customerName)
                .user(currentUser)
                .table(table)
                .reservationDate(requestedTime)
                .guests(request.getGuests())
                .status(BookingStatus.PENDING)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        realtimeService.broadcastNewReservation(Map.of(
                "name", saved.getCustomerName(),
                "time", saved.getReservationDate().toString()
        ));

        return ReservationDto.fromEntity(saved);
    }

    public Page<ReservationDto> getReservations(int page, int limit, UUID userId) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by("reservationDate").ascending());
        Page<Reservation> reservations = userId != null
                ? reservationRepository.findByUserId(userId, pageRequest)
                : reservationRepository.findAll(pageRequest);
        return reservations.map(ReservationDto::fromEntity);
    }

    @Transactional
    public ReservationDto updateReservationStatus(UUID id, String status, User currentUser) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Reservation not found"));

        BookingStatus newStatus = BookingStatus.valueOf(status.toUpperCase());
        if (currentUser != null && currentUser.getRole() == com.dineflow.auth.entity.Role.CUSTOMER) {
            if (newStatus != BookingStatus.CANCELLED) {
                throw new IllegalArgumentException("Customers can only cancel reservations.");
            }
            if (reservation.getUser() == null || !reservation.getUser().getId().equals(currentUser.getId())) {
                throw new IllegalArgumentException("You can only cancel your own reservations.");
            }
        }
        reservation.setStatus(newStatus);

        RestaurantTable table = reservation.getTable();

        if (newStatus == BookingStatus.CANCELLED) {
            table.setStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);
        } else if (newStatus == BookingStatus.CONFIRMED || newStatus == BookingStatus.COMPLETED) {
            table.setStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);
        }

        Reservation saved = reservationRepository.save(reservation);

        realtimeService.broadcastReservationStatus(Map.of(
                "status", newStatus.name(),
                "name", saved.getCustomerName(),
                "time", saved.getReservationDate().toString()
        ));

        activityLogService.log(currentUser, "UPDATE_RESERVATION",
                "Reservation updated: " + saved.getId() + ", New Status: " + newStatus.name());

        return ReservationDto.fromEntity(saved);
    }
}
