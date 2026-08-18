package com.savora.dashboard.dto;

import lombok.*; import java.util.UUID;

@Data @AllArgsConstructor
public class SalesDataPoint { private String day; private double total; }
