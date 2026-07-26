import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus, OrderType } from '../../core/models/order.model';
import { LucideAngularModule, ShoppingBag, Clock, CheckCircle, XCircle, FileText, Search, Filter, RefreshCw, Play, Check, DollarSign, Utensils, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-6 w-full h-full">
      <!-- Header & Stats -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="p-2.5 rounded-xl bg-primary/10 text-primary">
              <lucide-icon name="shopping-bag" [size]="22"></lucide-icon>
            </div>
            <div>
              <h1 class="text-2xl font-black tracking-tight text-foreground m-0">Kitchen & Service KDS</h1>
              <p class="text-sm text-muted-foreground font-medium m-0 mt-0.5">Real-time order tracking and kitchen management board</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <button (click)="fetchOrders()" [disabled]="isLoading()" class="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border border-border shadow-sm">
            <lucide-icon name="refresh-cw" [size]="15" [class.animate-spin]="isLoading()"></lucide-icon>
            <span>Refresh Board</span>
          </button>
        </div>
      </div>

      <!-- Stat Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Total Orders</p>
            <h3 class="text-2xl font-black text-foreground m-0 mt-1">{{ totalCount() }}</h3>
          </div>
          <div class="p-3 rounded-lg bg-slate-500/10 text-slate-500">
            <lucide-icon name="file-text" [size]="20"></lucide-icon>
          </div>
        </div>

        <div class="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">In Kitchen</p>
            <h3 class="text-2xl font-black text-blue-500 m-0 mt-1">{{ kitchenCount() }}</h3>
          </div>
          <div class="p-3 rounded-lg bg-blue-500/10 text-blue-500">
            <lucide-icon name="clock" [size]="20"></lucide-icon>
          </div>
        </div>

        <div class="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Ready to Serve</p>
            <h3 class="text-2xl font-black text-green-500 m-0 mt-1">{{ readyCount() }}</h3>
          </div>
          <div class="p-3 rounded-lg bg-green-500/10 text-green-500">
            <lucide-icon name="check-circle" [size]="20"></lucide-icon>
          </div>
        </div>

        <div class="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">Served Today</p>
            <h3 class="text-2xl font-black text-purple-500 m-0 mt-1">{{ servedCount() }}</h3>
          </div>
          <div class="p-3 rounded-lg bg-purple-500/10 text-purple-500">
            <lucide-icon name="utensils" [size]="20"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Controls & Filter Bar -->
      <div class="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center shadow-sm">
        <div class="relative flex-1 w-full">
          <lucide-icon name="search" [size]="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"></lucide-icon>
          <input type="text" placeholder="Search by Table, Customer name, or Order ID..."
            [(ngModel)]="searchQuery"
            class="w-full pl-10 h-10 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
        </div>
        <!-- Status Filter Tabs -->
        <div class="flex items-center gap-1.5 flex-wrap w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button *ngFor="let tab of statusTabs" (click)="selectedStatus = tab.value"
            class="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            [ngClass]="selectedStatus === tab.value ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-background text-muted-foreground border-border hover:bg-muted'">
            <span>{{ tab.label }}</span>
            <span class="px-1.5 py-0.5 rounded-md text-[10px]"
              [ngClass]="selectedStatus === tab.value ? 'bg-white/20' : 'bg-muted'">
              {{ getCountForStatus(tab.value) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && filteredOrders().length === 0" class="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card/50">
        <div class="bg-muted p-5 rounded-full shadow-inner mb-4 text-muted-foreground">
          <lucide-icon name="shopping-bag" [size]="40"></lucide-icon>
        </div>
        <h3 class="text-xl font-bold text-foreground mb-1">No Orders Found</h3>
        <p class="text-sm text-muted-foreground max-w-sm">No orders match the current search or status filter. Try clearing your filters or check back when new orders arrive.</p>
        <button (click)="resetFilters()" *ngIf="searchQuery || selectedStatus !== 'ALL'" class="mt-4 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-colors border-none cursor-pointer">
          Reset Filters
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p class="font-bold text-sm">Synchronizing Kitchen Orders...</p>
      </div>

      <!-- Orders Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" *ngIf="!isLoading() && filteredOrders().length > 0">
        <div *ngFor="let order of filteredOrders()" 
          class="bg-card rounded-2xl border border-border shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 border-t-4"
          [ngClass]="getCardAccentClass(order.status)">
          
          <!-- Card Header -->
          <div class="p-5 border-b border-border bg-muted/20 flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-black px-2.5 py-1 rounded-lg bg-primary text-primary-foreground shadow-sm flex items-center gap-1">
                  <lucide-icon name="utensils" [size]="12"></lucide-icon>
                  Table {{ (order.table && order.table.name) ? order.table.name : 'Walk-in' }}
                </span>
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">{{ order.orderType || 'DINE_IN' }}</span>
                <span class="text-[11px] text-muted-foreground font-mono">#{{ order.id.substring(0,6) }}</span>
              </div>
              <h3 class="text-base font-black text-foreground m-0">{{ order.customerName || 'Guest Customer' }}</h3>
              <p class="text-xs text-muted-foreground m-0 mt-0.5 flex items-center gap-1">
                <span>{{ order.customerPhone || 'No contact phone' }}</span> • 
                <span class="font-semibold text-foreground">{{ getFormattedTime(order.createdAt) }}</span>
              </p>
            </div>
            <div class="flex flex-col items-end gap-1.5">
              <span class="text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-sm border"
                [ngClass]="getStatusBadgeClass(order.status)">
                {{ order.status }}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                [ngClass]="order.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'">
                {{ order.paymentStatus || 'PENDING' }}
              </span>
            </div>
          </div>

          <!-- Items List -->
          <div class="p-5 flex-1 overflow-y-auto max-h-[220px] divide-y divide-border/50">
            <div *ngFor="let item of order.items" class="py-2.5 first:pt-0 last:pb-0 flex justify-between items-start gap-3">
              <div class="flex items-start gap-2.5 flex-1">
                <span class="size-6 rounded-md bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {{ item.quantity }}x
                </span>
                <div>
                  <p class="font-bold text-sm text-foreground m-0 leading-tight">{{ item.menuItemName }}</p>
                  <p *ngIf="item.notes" class="text-xs text-orange-500 font-medium m-0 mt-1 flex items-center gap-1">
                    <lucide-icon name="alert-circle" [size]="12"></lucide-icon> {{ item.notes }}
                  </p>
                </div>
              </div>
              <span class="font-bold text-sm text-muted-foreground shrink-0">\${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Card Footer with Actions -->
          <div class="p-5 bg-muted/20 border-t border-border flex flex-col gap-3.5">
            <div class="flex justify-between items-baseline">
              <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Bill</span>
              <span class="text-2xl font-black text-primary">\${{ (order.totalAmount || 0).toFixed(2) }}</span>
            </div>
            
            <!-- Quick Action Button -->
            <div class="flex gap-2">
              <button *ngIf="order.status === 'PENDING'" (click)="quickUpdateStatus(order, 'PREPARING')"
                class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer border-none">
                <lucide-icon name="play" [size]="14"></lucide-icon> Start Preparing
              </button>
              <button *ngIf="order.status === 'PREPARING'" (click)="quickUpdateStatus(order, 'READY')"
                class="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer border-none">
                <lucide-icon name="check" [size]="14"></lucide-icon> Mark Ready
              </button>
              <button *ngIf="order.status === 'READY'" (click)="quickUpdateStatus(order, 'SERVED')"
                class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer border-none">
                <lucide-icon name="utensils" [size]="14"></lucide-icon> Complete &amp; Serve
              </button>
              <button *ngIf="order.status === 'SERVED' || order.status === 'CANCELLED'" disabled
                class="flex-1 py-2 bg-muted text-muted-foreground font-bold text-xs rounded-xl opacity-60 border border-border flex items-center justify-center gap-1.5 cursor-not-allowed">
                <span>Completed</span>
              </button>
            </div>

            <!-- Manual Status Selector -->
            <div class="flex items-center gap-2 pt-1">
              <span class="text-[11px] font-bold text-muted-foreground shrink-0">Status:</span>
              <select 
                class="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors text-foreground"
                [value]="order.status"
                (change)="updateOrderStatus(order, $event)">
                <option value="PENDING" class="bg-card text-foreground">PENDING</option>
                <option value="PREPARING" class="bg-card text-foreground">PREPARING</option>
                <option value="READY" class="bg-card text-foreground">READY</option>
                <option value="SERVED" class="bg-card text-foreground">SERVED</option>
                <option value="CANCELLED" class="bg-card text-foreground">CANCELLED</option>
              </select>
            </div>
          </div>

        </div>
      </div>

    </div>
  `
})
export class OrdersAdminComponent implements OnInit {
  orders = signal<Order[]>([]);
  isLoading = signal(true);

  statusTabs = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Preparing', value: 'PREPARING' },
    { label: 'Ready', value: 'READY' },
    { label: 'Served', value: 'SERVED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  _searchQuery = signal('');
  get searchQuery() { return this._searchQuery(); }
  set searchQuery(v: string) { this._searchQuery.set(v); }

  _selectedStatus = signal('ALL');
  get selectedStatus() { return this._selectedStatus(); }
  set selectedStatus(v: string) { this._selectedStatus.set(v); }

  // Icons
  readonly ShoppingBag = ShoppingBag;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly FileText = FileText;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.isLoading.set(true);
    this.orderService.getOrders(1, 100).subscribe({
      next: (res) => {
        this.orders.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  filteredOrders = computed(() => {
    let list = this.orders();
    const q = this._searchQuery().toLowerCase().trim();
    const st = this._selectedStatus();

    if (q) {
      list = list.filter(o => 
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.table && o.table.name && o.table.name.toLowerCase().includes(q)) ||
        o.id.toLowerCase().includes(q)
      );
    }
    if (st !== 'ALL') {
      list = list.filter(o => o.status === st);
    }
    return list;
  });

  totalCount = computed(() => this.orders().length);
  kitchenCount = computed(() => this.orders().filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length);
  readyCount = computed(() => this.orders().filter(o => o.status === 'READY').length);
  servedCount = computed(() => this.orders().filter(o => o.status === 'SERVED').length);

  getCountForStatus(status: string): number {
    if (status === 'ALL') return this.orders().length;
    return this.orders().filter(o => o.status === status).length;
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
  }

  quickUpdateStatus(order: Order, newStatus: string) {
    this.orderService.updateOrder(order.id, { status: newStatus as any }).subscribe({
      next: () => {
        this.fetchOrders();
      },
      error: () => {
        alert('Failed to update order status');
      }
    });
  }

  updateOrderStatus(order: Order, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    
    this.orderService.updateOrder(order.id, { status: newStatus as any }).subscribe({
      next: () => {
        this.fetchOrders();
      },
      error: () => {
        alert('Failed to update order status');
        select.value = order.status; // Revert select
      }
    });
  }

  getCardAccentClass(status: string): string {
    switch(status) {
      case 'PENDING': return 'border-t-orange-500';
      case 'PREPARING': return 'border-t-blue-500';
      case 'READY': return 'border-t-green-500';
      case 'SERVED': return 'border-t-purple-500';
      case 'CANCELLED': return 'border-t-red-500';
      default: return 'border-t-border';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'PENDING': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'PREPARING': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 animate-pulse';
      case 'READY': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 font-black';
      case 'SERVED': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'CANCELLED': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  }

  getFormattedTime(dateStr?: string): string {
    if (!dateStr) return 'Just now';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Today';
    }
  }
}
