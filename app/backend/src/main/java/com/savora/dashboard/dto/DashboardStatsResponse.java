package com.savora.dashboard.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DashboardStatsResponse {
    private StatEntry revenue;
    private StatEntry orders;
    private StatEntry dineIn;
    private StatEntry takeAway;
}
