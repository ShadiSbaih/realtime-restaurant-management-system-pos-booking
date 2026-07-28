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
    <div class="flex flex-col gap-xl w-full pb-xl">

      <!-- Page Header -->
      <div>
        <h1 class="text-display-sm font-bold tracking-tight text-ink m-0">Dine Flow Overview</h1>
        <p class="text-caption text-mute mt-xs m-0">{{ today | date:'EEEE, MMM d, y' }}</p>
      </div>

      <!-- AI Briefing Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-md">

        <!-- Executive Briefing -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex flex-col gap-sm min-h-[160px] shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-xs text-primary">
              <lucide-icon name="sparkles" class="size-4"></lucide-icon>
              <span class="text-caption-tight font-bold uppercase tracking-widest">Executive Briefing</span>
            </div>
            <span class="text-caption-tight font-bold bg-primary/10 text-primary px-xs py-0.5 rounded-full">
              {{ briefingAge() }}
            </span>
          </div>
          <p class="text-ink text-body-sm leading-relaxed flex-1 m-0">
            {{ executiveBriefing() || 'Loading AI briefing...' }}
          </p>
          <button (click)="runAiBriefing('executive')" [disabled]="isBriefingLoading()"
            class="self-start flex items-center gap-xs button-outline px-sm py-xs text-caption-tight font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50">
            <lucide-icon name="sparkles" class="size-3"></lucide-icon>
            {{ isBriefingLoading() ? 'Generating...' : 'Run AI Now' }}
          </button>
        </div>

        <!-- Demand Forecast -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex flex-col gap-sm min-h-[160px] shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-xs text-[#e05d0e]">
              <lucide-icon name="sparkles" class="size-4"></lucide-icon>
              <span class="text-caption-tight font-bold uppercase tracking-widest">Demand Forecast</span>
            </div>
            <button (click)="runAiBriefing('forecast')" [disabled]="isForecastLoading()"
              class="flex items-center gap-xs button-outline px-sm py-xs text-caption-tight font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50">
              <lucide-icon name="sparkles" class="size-3"></lucide-icon>
              {{ isForecastLoading() ? 'Generating...' : 'Run AI Now' }}
            </button>
          </div>
          <p class="text-ink text-body-sm leading-relaxed flex-1 m-0">
            {{ demandForecast() || 'Loading demand forecast...' }}
          </p>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-md" *ngIf="stats()">

        <!-- Revenue -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex flex-col gap-sm shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-caption-tight font-bold uppercase tracking-widest text-mute">Revenue</span>
            <span class="text-caption-tight font-bold px-xs py-0.5 rounded-full"
              [ngClass]="{
                'bg-primary/10 text-primary': (stats()?.revenue?.trend ?? 0) >= 0,
                'bg-[#e02424]/10 text-[#e02424]': (stats()?.revenue?.trend ?? 0) < 0
              }">
              {{ (stats()?.revenue?.trend ?? 0) >= 0 ? '+' : '' }}{{ stats()?.revenue?.trend }}%
            </span>
          </div>
          <div class="flex items-center gap-md">
            <div class="size-10 rounded-md bg-canvas border border-hairline text-primary flex items-center justify-center shrink-0">
              <lucide-icon name="dollar-sign" class="size-5"></lucide-icon>
            </div>
            <span class="text-heading-lg font-bold text-ink">${{ stats()?.revenue?.value | number:'1.0-0' }}</span>
          </div>
        </div>

        <!-- Total Orders -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex flex-col gap-sm shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-caption-tight font-bold uppercase tracking-widest text-mute">Total Orders</span>
            <span class="text-caption-tight font-bold px-xs py-0.5 rounded-full"
              [ngClass]="{
                'bg-primary/10 text-primary': (stats()?.orders?.trend ?? 0) >= 0,
                'bg-[#e02424]/10 text-[#e02424]': (stats()?.orders?.trend ?? 0) < 0
              }">
              {{ (stats()?.orders?.trend ?? 0) >= 0 ? '+' : '' }}{{ stats()?.orders?.trend }}%
            </span>
          </div>
          <div class="flex items-center gap-md">
            <div class="size-10 rounded-md bg-canvas border border-hairline text-primary flex items-center justify-center shrink-0">
              <lucide-icon name="shopping-bag" class="size-5"></lucide-icon>
            </div>
            <span class="text-heading-lg font-bold text-ink">{{ stats()?.orders?.value }}</span>
          </div>
        </div>

        <!-- Dine In -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex flex-col gap-sm shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-caption-tight font-bold uppercase tracking-widest text-mute">Dine In</span>
            <span class="text-caption-tight font-bold px-xs py-0.5 rounded-full"
              [ngClass]="{
                'bg-primary/10 text-primary': (stats()?.dineIn?.trend ?? 0) > 0,
                'bg-canvas text-mute': (stats()?.dineIn?.trend ?? 0) === 0,
                'bg-[#e02424]/10 text-[#e02424]': (stats()?.dineIn?.trend ?? 0) < 0
              }">
              {{ (stats()?.dineIn?.trend ?? 0) > 0 ? '+' : '' }}{{ stats()?.dineIn?.trend }}%
            </span>
          </div>
          <div class="flex items-center gap-md">
            <div class="size-10 rounded-md bg-canvas border border-hairline text-[#e02424] flex items-center justify-center shrink-0">
              <lucide-icon name="utensils" class="size-5"></lucide-icon>
            </div>
            <span class="text-heading-lg font-bold text-ink">{{ stats()?.dineIn?.value }}</span>
          </div>
        </div>

        <!-- Take Away -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex flex-col gap-sm shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-caption-tight font-bold uppercase tracking-widest text-mute">Take Away</span>
            <span class="text-caption-tight font-bold px-xs py-0.5 rounded-full"
              [ngClass]="{
                'bg-primary/10 text-primary': (stats()?.takeAway?.trend ?? 0) >= 0,
                'bg-[#e02424]/10 text-[#e02424]': (stats()?.takeAway?.trend ?? 0) < 0
              }">
              {{ (stats()?.takeAway?.trend ?? 0) >= 0 ? '+' : '' }}{{ stats()?.takeAway?.trend }}%
            </span>
          </div>
          <div class="flex items-center gap-md">
            <div class="size-10 rounded-md bg-canvas border border-hairline text-[#e05d0e] flex items-center justify-center shrink-0">
              <lucide-icon name="coffee" class="size-5"></lucide-icon>
            </div>
            <span class="text-heading-lg font-bold text-ink">{{ stats()?.takeAway?.value }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-md">

        <!-- Sales Line Chart -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg lg:col-span-2 flex flex-col shadow-sm">
          <div class="flex items-center justify-between mb-md">
            <h3 class="font-bold text-heading-sm text-ink m-0">Past 7days Sales</h3>
            <button class="text-mute hover:text-ink border-none bg-transparent cursor-pointer p-xs">
              <lucide-icon name="more-horizontal" class="size-4.5"></lucide-icon>
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
        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex flex-col shadow-sm">
          <div class="flex items-center justify-between mb-md">
            <h3 class="font-bold text-heading-sm text-ink m-0">Total Income</h3>
            <button class="text-mute hover:text-ink border-none bg-transparent cursor-pointer p-xs">
              <lucide-icon name="more-horizontal" class="size-4.5"></lucide-icon>
            </button>
          </div>
          <div class="flex-1 flex flex-col items-center justify-center gap-sm">
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
                  <div class="text-heading-lg font-bold text-ink">${{ totalIncome() | number:'1.0-0' }}</div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-md text-caption">
              <div class="flex items-center gap-xs"><div class="size-3 rounded-full bg-primary"></div><span class="text-mute">Revenue</span></div>
              <div class="flex items-center gap-xs"><div class="size-3 rounded-full bg-[#10b981]"></div><span class="text-mute">Pending</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trending + Out of Stock -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-md">

        <div class="bg-surface-bone border border-hairline rounded-md p-lg shadow-sm">
          <h3 class="font-bold text-heading-sm text-ink m-0 mb-md">Trending Dishes</h3>
          <div class="flex flex-col gap-sm">
            <div *ngIf="trending().length === 0" class="text-mute text-body-sm py-md text-center">No trending data</div>
            <div *ngFor="let item of trending()" class="flex items-center gap-sm py-sm border-b border-hairline/40 last:border-0">
              <div class="size-10 rounded-md border border-hairline bg-cover bg-center shrink-0"
                   [style.backgroundImage]="'url(' + (item.image || '') + ')'"></div>
              <div class="flex-1">
                <p class="font-bold text-ink text-body-sm m-0">{{ item.name }}</p>
                <p class="text-caption text-mute m-0">{{ item.orders }} orders this week</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-surface-bone border border-hairline rounded-md p-lg shadow-sm">
          <h3 class="font-bold text-heading-sm text-ink m-0 mb-md">Out of Stock Alerts</h3>
          <div class="flex flex-col gap-sm">
            <div *ngIf="outOfStock().length === 0" class="text-mute text-body-sm py-md text-center">All items in stock ✓</div>
            <div *ngFor="let item of outOfStock()" class="flex items-center gap-sm py-sm border-b border-hairline/40 last:border-0">
              <div class="size-10 rounded-md border border-hairline bg-cover bg-center shrink-0 grayscale opacity-60"
                   [style.backgroundImage]="'url(' + (item.image || '') + ')'"></div>
              <div class="flex-1">
                <p class="font-bold text-ink text-body-sm m-0">{{ item.name }}</p>
                <p class="text-caption text-[#e02424] m-0 font-medium">Currently Unavailable</p>
              </div>
              <button class="button-ghost p-xs text-caption-tight">
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
