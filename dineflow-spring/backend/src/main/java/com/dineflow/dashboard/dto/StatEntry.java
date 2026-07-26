package com.dineflow.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class StatEntry {
    private double value;
    private int trend;
    public static StatEntry of(double value, int trend) { return new StatEntry(value, trend); }
}
