package com.savora.dashboard.service;

import com.savora.dashboard.dto.*;
import com.savora.menu.repository.MenuItemRepository;
import com.savora.pos.entity.Order;
import com.savora.pos.entity.OrderType;
import com.savora.pos.entity.PaymentStatus;
import com.savora.pos.repository.OrderItemRepository;
import com.savora.pos.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;

    // ─── Stats (7-day vs previous 7-day trend) ───────────────────

    public DashboardStatsResponse getStats() {
        Instant now = Instant.now();
        Instant sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);
        Instant fourteenDaysAgo = now.minus(14, ChronoUnit.DAYS);

        List<Order> currentOrders = orderRepository.findRecentOrders(sevenDaysAgo);
        List<Order> previousOrders = orderRepository.findRecentOrders(fourteenDaysAgo)
                .stream().filter(o -> o.getCreatedAt().isBefore(sevenDaysAgo)).toList();

        double currentRevenue = currentOrders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(o -> o.getTotalAmount().doubleValue()).sum();
        double previousRevenue = previousOrders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(o -> o.getTotalAmount().doubleValue()).sum();

        long currentDineIn = currentOrders.stream().filter(o -> o.getOrderType() == OrderType.DINE_IN).count();
        long previousDineIn = previousOrders.stream().filter(o -> o.getOrderType() == OrderType.DINE_IN).count();

        long currentTakeAway = currentOrders.stream()
                .filter(o -> o.getOrderType() == OrderType.TAKEAWAY || o.getOrderType() == OrderType.DELIVERY).count();
        long previousTakeAway = previousOrders.stream()
                .filter(o -> o.getOrderType() == OrderType.TAKEAWAY || o.getOrderType() == OrderType.DELIVERY).count();

        return DashboardStatsResponse.builder()
                .revenue(StatEntry.of(currentRevenue, trend(currentRevenue, previousRevenue)))
                .orders(StatEntry.of((double) currentOrders.size(), trend(currentOrders.size(), previousOrders.size())))
                .dineIn(StatEntry.of((double) currentDineIn, trend(currentDineIn, previousDineIn)))
                .takeAway(StatEntry.of((double) currentTakeAway, trend(currentTakeAway, previousTakeAway)))
                .build();
    }

    // ─── Charts ───────────────────────────────────────────────────

    public DashboardChartsResponse getCharts() {
        Instant now = Instant.now();
        Instant sevenDaysAgo = now.minus(6, ChronoUnit.DAYS).truncatedTo(java.time.temporal.ChronoUnit.DAYS);

        List<Order> orders = orderRepository.findPaidOrdersWithItemsSince(sevenDaysAgo);

        // Daily sales map
        Map<String, Double> dailySales = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            Instant day = now.minus(i, ChronoUnit.DAYS);
            String label = java.time.ZonedDateTime.ofInstant(day, java.time.ZoneOffset.UTC)
                    .getDayOfWeek().getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH);
            dailySales.put(label, 0.0);
        }

        double totalIncome = 0;
        for (Order order : orders) {
            totalIncome += order.getTotalAmount().doubleValue();
            String label = java.time.ZonedDateTime.ofInstant(order.getCreatedAt(), java.time.ZoneOffset.UTC)
                    .getDayOfWeek().getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH);
            dailySales.merge(label, order.getTotalAmount().doubleValue(), Double::sum);
        }

        List<SalesDataPoint> salesData = dailySales.entrySet().stream()
                .map(e -> new SalesDataPoint(e.getKey(), Math.round(e.getValue() * 100.0) / 100.0))
                .toList();

        // Category revenue
        Map<String, Double> categoryTotals = new HashMap<>();
        for (Order order : orders) {
            if (order.getItems() != null) {
                for (var item : order.getItems()) {
                    String catName = item.getMenuItem() != null && item.getMenuItem().getCategory() != null
                            ? item.getMenuItem().getCategory().getName() : "Uncategorized";
                    double itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())).doubleValue();
                    categoryTotals.merge(catName, itemTotal, Double::sum);
                }
            }
        }

        String[] colors = {"#10b981", "#ef4444", "#eab308", "#3b82f6", "#8b5cf6", "#f97316"};
        List<CategoryDataPoint> categoryData = categoryTotals.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .collect(Collectors.collectingAndThen(Collectors.toList(), list -> {
                    List<CategoryDataPoint> result = new ArrayList<>();
                    for (int i = 0; i < list.size(); i++) {
                        result.add(new CategoryDataPoint(list.get(i).getKey(),
                                Math.round(list.get(i).getValue() * 100.0) / 100.0,
                                colors[i % colors.length]));
                    }
                    return result;
                }));

        if (categoryData.isEmpty()) {
            categoryData = List.of(new CategoryDataPoint("No Sales Yet", 1.0, "#e2e8f0"));
        }

        return DashboardChartsResponse.builder()
                .salesData(salesData)
                .categoryData(categoryData)
                .totalIncome(Math.round(totalIncome * 100.0) / 100.0)
                .build();
    }

    // ─── Lists ────────────────────────────────────────────────────

    public DashboardListsResponse getLists() {
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        var recentItems = orderItemRepository.findRecentOrderItemsWithMenuItems(sevenDaysAgo);

        Map<UUID, TrendingDish> counts = new LinkedHashMap<>();
        for (var item : recentItems) {
            UUID id = item.getMenuItem().getId();
            counts.merge(id, new TrendingDish(id, item.getMenuItem().getName(),
                            item.getMenuItem().getImage(), item.getQuantity()),
                    (a, b) -> { a.setOrders(a.getOrders() + b.getOrders()); return a; });
        }

        List<TrendingDish> trending = counts.values().stream()
                .sorted(Comparator.comparingInt(TrendingDish::getOrders).reversed())
                .limit(4).toList();

        var outOfStock = menuItemRepository.findAllUnavailable(PageRequest.of(0, 4))
                .stream().map(m -> new OutOfStockItem(m.getId(), m.getName(), m.getImage())).toList();

        return DashboardListsResponse.builder()
                .trendingDishes(trending)
                .outOfStock(outOfStock)
                .build();
    }

    private int trend(double current, double previous) {
        if (previous == 0) return current > 0 ? 100 : 0;
        return (int) Math.round(((current - previous) / previous) * 100);
    }
}
