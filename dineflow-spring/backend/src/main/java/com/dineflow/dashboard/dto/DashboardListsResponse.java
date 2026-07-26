package com.dineflow.dashboard.dto;

import lombok.*; import java.util.List;

@Data @Builder
public class DashboardListsResponse {
    private List<TrendingDish> trendingDishes;
    private List<OutOfStockItem> outOfStock;
}
