package com.dineflow.pos.repository;

import com.dineflow.pos.entity.BookingStatus;
import com.dineflow.pos.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    Page<Reservation> findAll(Pageable pageable);
    Page<Reservation> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT r FROM Reservation r WHERE r.table.id = :tableId " +
           "AND r.status IN :statuses " +
           "AND r.reservationDate >= :from AND r.reservationDate <= :to")
    List<Reservation> findConflicting(
            @Param("tableId") UUID tableId,
            @Param("statuses") List<BookingStatus> statuses,
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    @Query("SELECT r FROM Reservation r WHERE " +
           "r.status IN :statuses " +
           "AND r.reservationDate >= :from AND r.reservationDate <= :to")
    List<Reservation> findActiveReservationsBetween(
            @Param("statuses") List<BookingStatus> statuses,
            @Param("from") Instant from,
            @Param("to") Instant to
    );
}
