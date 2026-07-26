export interface StatEntry {
  value: number;
  trend: number;
}

export interface DashboardStats {
  revenue: StatEntry;
  orders: StatEntry;
  dineIn: StatEntry;
  takeAway: StatEntry;
}

export interface SalesDataPoint {
  day: string;
  total: number;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface DashboardCharts {
  salesData: SalesDataPoint[];
  categoryData: CategoryDataPoint[];
  totalIncome: number;
}

export interface TrendingDish {
  id: string;
  name: string;
  image: string;
  orders: number;
}

export interface OutOfStockItem {
  id: string;
  name: string;
  image: string;
}

export interface DashboardLists {
  trendingDishes: TrendingDish[];
  outOfStock: OutOfStockItem[];
}
