package com.savora.dashboard.dto;

import lombok.*; import java.util.UUID;

@Data @AllArgsConstructor
public class OutOfStockItem { private UUID id; private String name; private String image; }
