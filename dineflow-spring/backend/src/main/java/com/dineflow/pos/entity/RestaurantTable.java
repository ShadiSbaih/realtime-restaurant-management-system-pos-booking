package com.dineflow.pos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "restaurant_tables")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Integer seats;

    @Column(nullable = false)
    private String section = "Main Dining Room";

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "table_shape", nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private TableShape shape = TableShape.square;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "table_status", nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private TableStatus status = TableStatus.AVAILABLE;

    @OneToMany(mappedBy = "table", fetch = FetchType.LAZY)
    private List<Reservation> reservations;

    @OneToMany(mappedBy = "table", fetch = FetchType.LAZY)
    private List<Order> orders;
}
