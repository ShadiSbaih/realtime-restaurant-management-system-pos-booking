import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats, SalesDataPoint, CategoryDataPoint, TrendingDish, OutOfStockItem } from '../../core/models/dashboard.model';
import { LucideAngularModule, DollarSign, ShoppingBag, Utensils, Box } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-6 w-full h-full pb-8">
      
      <!-- Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" *ngIf="stats()">
        
        <!-- Revenue Card -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
            <lucide-icon name="dollar-sign" [size]="24"></lucide-icon>
          </div>
          <div class="flex flex-col flex-1">
            <span class="text-sm font-medium text-muted-foreground">Total Revenue (7d)</span>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-foreground">\${{ stats()?.revenue?.value | number:'1.2-2' }}</span>
              <span class="text-sm font-medium" 
                    [class.text-green-500]="(stats()?.revenue?.trend ?? 0) >= 0"
                    [class.text-red-500]="(stats()?.revenue?.trend ?? 0) < 0">
                {{ (stats()?.revenue?.trend ?? 0) >= 0 ? '+' : '' }}{{ stats()?.revenue?.trend }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Orders Card -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <lucide-icon name="shopping-bag" [size]="24"></lucide-icon>
          </div>
          <div class="flex flex-col flex-1">
            <span class="text-sm font-medium text-muted-foreground">Total Orders</span>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-foreground">{{ stats()?.orders?.value }}</span>
              <span class="text-sm font-medium" 
                    [class.text-green-500]="(stats()?.orders?.trend ?? 0) >= 0"
                    [class.text-red-500]="(stats()?.orders?.trend ?? 0) < 0">
                {{ (stats()?.orders?.trend ?? 0) >= 0 ? '+' : '' }}{{ stats()?.orders?.trend }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Dine In Card -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <lucide-icon name="utensils" [size]="24"></lucide-icon>
          </div>
          <div class="flex flex-col flex-1">
            <span class="text-sm font-medium text-muted-foreground">Dine-In</span>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-foreground">{{ stats()?.dineIn?.value }}</span>
              <span class="text-sm font-medium" 
                    [class.text-green-500]="(stats()?.dineIn?.trend ?? 0) >= 0"
                    [class.text-red-500]="(stats()?.dineIn?.trend ?? 0) < 0">
                {{ (stats()?.dineIn?.trend ?? 0) >= 0 ? '+' : '' }}{{ stats()?.dineIn?.trend }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Takeaway Card -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <lucide-icon name="box" [size]="24"></lucide-icon>
          </div>
          <div class="flex flex-col flex-1">
            <span class="text-sm font-medium text-muted-foreground">Takeaway</span>
            <div class="flex items-center justify-between mt-1">
              <span class="text-2xl font-bold text-foreground">{{ stats()?.takeAway?.value }}</span>
              <span class="text-sm font-medium" 
                    [class.text-green-500]="(stats()?.takeAway?.trend ?? 0) >= 0"
                    [class.text-red-500]="(stats()?.takeAway?.trend ?? 0) < 0">
                {{ (stats()?.takeAway?.trend ?? 0) >= 0 ? '+' : '' }}{{ stats()?.takeAway?.trend }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Revenue Area Chart -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h4 class="text-lg font-semibold text-foreground m-0 mb-6">Revenue Over Time (7 Days)</h4>
          <div class="flex-1 h-[300px] w-full relative">
            <!-- Ensure parent is display:block or relative for ngx-charts to measure correctly -->
            <ngx-charts-area-chart
              [results]="salesChartData"
              [scheme]="chartColorScheme"
              [gradient]="true"
              [xAxis]="true"
              [yAxis]="true"
              [legend]="false"
              [showXAxisLabel]="true"
              [showYAxisLabel]="true"
              xAxisLabel="Day"
              yAxisLabel="Revenue ($)"
              [animations]="true">
            </ngx-charts-area-chart>
          </div>
        </div>
        
        <!-- Category Pie Chart -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <h4 class="text-lg font-semibold text-foreground m-0 mb-6">Sales by Category</h4>
          <div class="flex-1 h-[300px] w-full flex items-center justify-center">
            <ngx-charts-pie-chart
              [results]="categoryChartData"
              [scheme]="pieColorScheme"
              [gradient]="true"
              [legend]="true"
              [legendPosition]="LegendPosition.Below"
              [labels]="false"
              [doughnut]="true"
              [animations]="true">
            </ngx-charts-pie-chart>
          </div>
        </div>
      </div>

      <!-- Lists Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Trending Dishes -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h4 class="text-lg font-semibold text-foreground m-0 mb-6">Trending Dishes</h4>
          <div class="flex flex-col gap-4">
            <div *ngIf="trending().length === 0" class="text-center text-muted-foreground py-4">No data available</div>
            
            <div *ngFor="let item of trending()" class="flex items-center gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
              <div class="size-12 rounded-lg bg-cover bg-center border border-border shrink-0" 
                   [style.backgroundImage]="'url(' + (item.image || 'assets/placeholder.png') + ')'"></div>
              <div class="flex flex-col flex-1">
                <span class="font-medium text-foreground">{{ item.name }}</span>
                <span class="text-sm text-muted-foreground">{{ item.orders }} orders this week</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Out of Stock -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h4 class="text-lg font-semibold text-foreground m-0 mb-6">Out of Stock Alerts</h4>
          <div class="flex flex-col gap-4">
             <div *ngIf="outOfStock().length === 0" class="text-center text-muted-foreground py-4">All items are in stock!</div>
             
             <div *ngFor="let item of outOfStock()" class="flex items-center gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
              <div class="size-12 rounded-lg bg-cover bg-center border border-border shrink-0 grayscale opacity-80" 
                   [style.backgroundImage]="'url(' + (item.image || 'assets/placeholder.png') + ')'"></div>
              <div class="flex flex-col flex-1">
                <span class="font-medium text-foreground">{{ item.name }}</span>
                <span class="text-sm text-destructive font-medium">Currently Unavailable</span>
              </div>
              <button class="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-md hover:bg-secondary/80 transition-colors">
                Restock
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class DashboardComponent implements OnInit {
  Math = Math;
  LegendPosition = LegendPosition;
  stats = signal<DashboardStats | null>(null);
  trending = signal<TrendingDish[]>([]);
  outOfStock = signal<OutOfStockItem[]>([]);
  
  salesChartData: any[] = [];
  categoryChartData: any[] = [];
  
  readonly DollarSign = DollarSign;
  readonly ShoppingBag = ShoppingBag;
  readonly Utensils = Utensils;
  readonly Box = Box;
  
  chartColorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#ff6347'] // Tomato Primary
  };
  
  pieColorScheme: Color = {
    name: 'pie',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#ff6347', '#ff8c00', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6'] // Matching warm colors
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getStats().subscribe(res => this.stats.set(res));
    
    this.dashboardService.getCharts().subscribe(res => {
      this.salesChartData = [
        {
          name: 'Revenue',
          series: res.salesData.map(d => ({ name: d.day, value: d.total }))
        }
      ];
      this.categoryChartData = res.categoryData.map(d => ({ name: d.name, value: d.value }));
    });
    
    this.dashboardService.getLists().subscribe(res => {
      this.trending.set(res.trendingDishes);
      this.outOfStock.set(res.outOfStock);
    });
  }
}
