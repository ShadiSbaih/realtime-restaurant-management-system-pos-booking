import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { curveCatmullRom as d3CurveCatmullRom } from 'd3-shape';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats, TrendingDish, OutOfStockItem } from '../../core/models/dashboard.model';
import { LucideAngularModule, Sparkles, DollarSign, ShoppingBag, Utensils, Coffee, MoreHorizontal } from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, LucideAngularModule, DatePipe],
  template: `
    <div class="flex flex-col gap-6 w-full pb-10">

      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-black tracking-tight text-foreground m-0">Dine Flow Overview</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ today | date:'EEEE, MMM d, y' }}</p>
      </div>

      <!-- AI Briefing Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- Executive Briefing -->
        <div class="relative rounded-xl p-6 overflow-hidden flex flex-col gap-3 min-h-[160px]"
             style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%);">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-purple-200">
              <lucide-icon name="sparkles" [size]="16"></lucide-icon>
              <span class="text-[11px] font-black uppercase tracking-widest">Executive Briefing</span>
            </div>
            <span class="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
              {{ briefingAge() }}
            </span>
          </div>
          <p class="text-white text-sm leading-relaxed flex-1 m-0">
            {{ executiveBriefing() || 'Loading AI briefing...' }}
          </p>
          <button (click)="runAiBriefing('executive')" [disabled]="isBriefingLoading()"
            class="self-start flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors border-none cursor-pointer disabled:opacity-50">
            <lucide-icon name="sparkles" [size]="12"></lucide-icon>
            {{ isBriefingLoading() ? 'Generating...' : 'Run AI Now' }}
          </button>
        </div>

        <!-- Demand Forecast -->
        <div class="relative rounded-xl p-6 overflow-hidden flex flex-col gap-3 min-h-[160px]"
             style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #b91c1c 100%);">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-orange-200">
              <lucide-icon name="sparkles" [size]="16"></lucide-icon>
              <span class="text-[11px] font-black uppercase tracking-widest">Demand Forecast</span>
            </div>
            <button (click)="runAiBriefing('forecast')" [disabled]="isForecastLoading()"
              class="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors border-none cursor-pointer disabled:opacity-50">
              <lucide-icon name="sparkles" [size]="12"></lucide-icon>
              {{ isForecastLoading() ? 'Generating...' : 'Run AI Now' }}
            </button>
          </div>
          <p class="text-white text-sm leading-relaxed flex-1 m-0">
            {{ demandForecast() || 'Loading demand forecast...' }}
          </p>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4" *ngIf="stats()">

        <!-- Revenue -->
        <div class="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase tracking-widest text-muted-foreground">Revenue</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full"
              [ngClass]="{
                'bg-green-500/10 text-green-500': (stats()?.revenue?.trend ?? 0) >= 0,
                'bg-red-500/10 text-red-500': (stats()?.revenue?.trend ?? 0) < 0
              }">
              {{ (stats()?.revenue?.trend ?? 0) >= 0 ? '+' : '' }}{{ stats()?.revenue?.trend }}%
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="size-11 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
              <lucide-icon name="dollar-sign" [size]="20"></lucide-icon>
            </div>
            <span class="text-3xl font-black text-foreground">\${{ stats()?.revenue?.value | number:'1.0-0' }}</span>
          </div>
        </div>

        <!-- Total Orders -->
        <div class="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Orders</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full"
              [ngClass]="{
                'bg-green-500/10 text-green-500': (stats()?.orders?.trend ?? 0) >= 0,
                'bg-red-500/10 text-red-500': (stats()?.orders?.trend ?? 0) < 0
              }">
              {{ (stats()?.orders?.trend ?? 0) >= 0 ? '+' : '' }}{{ stats()?.orders?.trend }}%
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="size-11 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <lucide-icon name="shopping-bag" [size]="20"></lucide-icon>
            </div>
            <span class="text-3xl font-black text-foreground">{{ stats()?.orders?.value }}</span>
          </div>
        </div>

        <!-- Dine In -->
        <div class="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase tracking-widest text-muted-foreground">Dine In</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full"
              [ngClass]="{
                'bg-green-500/10 text-green-500': (stats()?.dineIn?.trend ?? 0) > 0,
                'bg-muted text-muted-foreground': (stats()?.dineIn?.trend ?? 0) === 0,
                'bg-red-500/10 text-red-500': (stats()?.dineIn?.trend ?? 0) < 0
              }">
              {{ (stats()?.dineIn?.trend ?? 0) > 0 ? '+' : '' }}{{ stats()?.dineIn?.trend }}%
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="size-11 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
              <lucide-icon name="utensils" [size]="20"></lucide-icon>
            </div>
            <span class="text-3xl font-black text-foreground">{{ stats()?.dineIn?.value }}</span>
          </div>
        </div>

        <!-- Take Away -->
        <div class="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase tracking-widest text-muted-foreground">Take Away</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full"
              [ngClass]="{
                'bg-green-500/10 text-green-500': (stats()?.takeAway?.trend ?? 0) >= 0,
                'bg-red-500/10 text-red-500': (stats()?.takeAway?.trend ?? 0) < 0
              }">
              {{ (stats()?.takeAway?.trend ?? 0) >= 0 ? '+' : '' }}{{ stats()?.takeAway?.trend }}%
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="size-11 rounded-full bg-amber-600/20 text-amber-600 flex items-center justify-center shrink-0">
              <lucide-icon name="coffee" [size]="20"></lucide-icon>
            </div>
            <span class="text-3xl font-black text-foreground">{{ stats()?.takeAway?.value }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Sales Line Chart -->
        <div class="bg-card border border-border rounded-xl p-5 lg:col-span-2 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-black text-foreground m-0">Past 7days Sales</h3>
            <button class="text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer p-1">
              <lucide-icon name="more-horizontal" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="h-[260px] w-full">
            <ngx-charts-area-chart
              [results]="salesChartData"
              [scheme]="chartColorScheme"
              [gradient]="true"
              [xAxis]="true"
              [yAxis]="true"
              [legend]="false"
              [showXAxisLabel]="false"
              [showYAxisLabel]="false"
              [animations]="true"
              [curve]="curveCatmullRom">
            </ngx-charts-area-chart>
          </div>
        </div>

        <!-- Total Income Donut -->
        <div class="bg-card border border-border rounded-xl p-5 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-black text-foreground m-0">Total Income</h3>
            <button class="text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer p-1">
              <lucide-icon name="more-horizontal" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="flex-1 flex flex-col items-center justify-center gap-3">
            <div class="relative">
              <ngx-charts-pie-chart
                [results]="incomeDonutData"
                [scheme]="donutColorScheme"
                [gradient]="false"
                [legend]="false"
                [labels]="false"
                [doughnut]="true"
                [arcWidth]="0.35"
                [animations]="true"
                [view]="[200, 200]">
              </ngx-charts-pie-chart>
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="text-center">
                  <div class="text-2xl font-black text-foreground">\${{ totalIncome() | number:'1.0-0' }}</div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4 text-xs">
              <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-primary"></div><span class="text-muted-foreground">Revenue</span></div>
              <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-green-500"></div><span class="text-muted-foreground">Pending</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trending + Out of Stock -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div class="bg-card border border-border rounded-xl p-5">
          <h3 class="font-black text-foreground m-0 mb-4">Trending Dishes</h3>
          <div class="flex flex-col gap-3">
            <div *ngIf="trending().length === 0" class="text-muted-foreground text-sm py-4 text-center">No trending data</div>
            <div *ngFor="let item of trending()" class="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
              <div class="size-10 rounded-lg border border-border bg-cover bg-center shrink-0"
                   [style.backgroundImage]="'url(' + (item.image || '') + ')'"></div>
              <div class="flex-1">
                <p class="font-semibold text-foreground text-sm m-0">{{ item.name }}</p>
                <p class="text-xs text-muted-foreground m-0">{{ item.orders }} orders this week</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-card border border-border rounded-xl p-5">
          <h3 class="font-black text-foreground m-0 mb-4">Out of Stock Alerts</h3>
          <div class="flex flex-col gap-3">
            <div *ngIf="outOfStock().length === 0" class="text-muted-foreground text-sm py-4 text-center">All items in stock ✓</div>
            <div *ngFor="let item of outOfStock()" class="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
              <div class="size-10 rounded-lg border border-border bg-cover bg-center shrink-0 grayscale opacity-60"
                   [style.backgroundImage]="'url(' + (item.image || '') + ')'"></div>
              <div class="flex-1">
                <p class="font-semibold text-foreground text-sm m-0">{{ item.name }}</p>
                <p class="text-xs text-destructive m-0 font-medium">Currently Unavailable</p>
              </div>
              <button class="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 rounded-md border-none cursor-pointer font-medium transition-colors">
                Restock
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`:host { display: block; width: 100%; }`]
})
export class DashboardComponent implements OnInit {
  LegendPosition = LegendPosition;
  today = new Date();

  stats = signal<DashboardStats | null>(null);
  trending = signal<TrendingDish[]>([]);
  outOfStock = signal<OutOfStockItem[]>([]);
  totalIncome = signal<number>(0);

  executiveBriefing = signal<string>('The business has demonstrated impressive revenue efficiency this past week.');
  demandForecast = signal<string>('Anticipate a significant surge in premium spending as customers receive their month-end salaries.');
  briefingAge = signal<string>('JUST NOW');
  isBriefingLoading = signal(false);
  isForecastLoading = signal(false);

  salesChartData: any[] = [];
  incomeDonutData: any[] = [];

  curveCatmullRom = d3CurveCatmullRom;

  readonly Sparkles = Sparkles;
  readonly DollarSign = DollarSign;
  readonly ShoppingBag = ShoppingBag;
  readonly Utensils = Utensils;
  readonly Coffee = Coffee;
  readonly MoreHorizontal = MoreHorizontal;

  chartColorScheme: Color = {
    name: 'custom', selectable: true, group: ScaleType.Ordinal, domain: ['#ff6347']
  };

  donutColorScheme: Color = {
    name: 'donut', selectable: true, group: ScaleType.Ordinal, domain: ['#ff6347', '#10b981']
  };

  constructor(private dashboardService: DashboardService, private http: HttpClient) {}

  ngOnInit() {
    this.dashboardService.getStats().subscribe(res => this.stats.set(res));
    this.dashboardService.getCharts().subscribe(res => {
      this.salesChartData = [{ name: 'Revenue', series: res.salesData.map((d: any) => ({ name: d.day, value: d.total })) }];
      this.totalIncome.set(res.totalIncome ?? 0);
      this.incomeDonutData = [
        { name: 'Revenue', value: res.totalIncome ?? 0 },
        { name: 'Pending', value: Math.round((res.totalIncome ?? 0) * 0.15) }
      ];
    });
    this.dashboardService.getLists().subscribe(res => {
      this.trending.set(res.trendingDishes);
      this.outOfStock.set(res.outOfStock);
    });
  }

  runAiBriefing(type: 'executive' | 'forecast') {
    if (type === 'executive') {
      this.isBriefingLoading.set(true);
      this.http.post<any>(`${environment.apiUrl}/ai/generate-item`, {}).subscribe({
        next: () => {
          this.briefingAge.set('JUST NOW');
          this.isBriefingLoading.set(false);
        },
        error: () => {
          this.isBriefingLoading.set(false);
        }
      });
    } else {
      this.isForecastLoading.set(true);
      setTimeout(() => {
        this.demandForecast.set('Based on current trends, expect higher demand for dine-in orders this weekend.');
        this.isForecastLoading.set(false);
      }, 1500);
    }
  }
}
