package com.savora.dashboard.dto;

import lombok.*; import java.util.List;

@Data @Builder
public class DashboardChartsResponse {
    private List<SalesDataPoint> salesData;
    private List<CategoryDataPoint> categoryData;
    private double totalIncome;
}
