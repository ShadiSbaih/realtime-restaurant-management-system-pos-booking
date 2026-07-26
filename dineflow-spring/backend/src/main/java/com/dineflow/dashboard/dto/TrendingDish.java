package com.dineflow.dashboard.dto;

import lombok.*; import java.util.UUID;

@Data @AllArgsConstructor
public class TrendingDish { private UUID id; private String name; private String image; private int orders; }
