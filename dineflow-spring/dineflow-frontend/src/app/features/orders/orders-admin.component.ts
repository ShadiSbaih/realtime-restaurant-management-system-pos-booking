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
    <div class="flex flex-col gap-xl w-full h-full bg-canvas">
      <!-- Header & Stats -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-bone rounded-md border border-hairline p-xl shadow-sm">
        <div>
          <div class="flex items-center gap-sm">
            <div class="p-sm rounded-md bg-canvas border border-hairline text-primary">
              <lucide-icon name="shopping-bag" class="size-6"></lucide-icon>
            </div>
            <div>
              <h1 class="text-heading-lg font-bold tracking-tight text-ink m-0">Kitchen & Service KDS</h1>
              <p class="text-body-sm text-mute font-medium m-0 mt-xs">Real-time order tracking and kitchen management board</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-sm w-full md:w-auto justify-end">
          <button (click)="fetchOrders()" [disabled]="isLoading()" class="button-outline flex items-center gap-xs px-md py-sm">
            <lucide-icon name="refresh-cw" class="size-4" [class.animate-spin]="isLoading()"></lucide-icon>
            <span>Refresh Board</span>
          </button>
        </div>
      </div>

      <!-- Stat Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex items-center justify-between shadow-sm hover:border-[#333] transition-colors group">
          <div>
            <p class="text-caption-tight font-bold uppercase tracking-wider text-mute m-0">Total Orders</p>
            <h3 class="text-heading-lg font-bold text-ink m-0 mt-xs">{{ totalCount() }}</h3>
          </div>
          <div class="p-sm rounded-md bg-canvas text-charcoal border border-hairline group-hover:scale-110 transition-transform">
            <lucide-icon name="file-text" class="size-5"></lucide-icon>
          </div>
        </div>

        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex items-center justify-between shadow-sm hover:border-[#1e429f] transition-colors group">
          <div>
            <p class="text-caption-tight font-bold uppercase tracking-wider text-[#1e429f] m-0">In Kitchen</p>
            <h3 class="text-heading-lg font-bold text-[#1e429f] m-0 mt-xs">{{ kitchenCount() }}</h3>
          </div>
          <div class="p-sm rounded-md bg-[#1e429f]/10 text-[#1e429f] group-hover:scale-110 transition-transform">
            <lucide-icon name="clock" class="size-5"></lucide-icon>
          </div>
        </div>

        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex items-center justify-between shadow-sm hover:border-primary transition-colors group">
          <div>
            <p class="text-caption-tight font-bold uppercase tracking-wider text-primary m-0">Ready to Serve</p>
            <h3 class="text-heading-lg font-bold text-primary m-0 mt-xs">{{ readyCount() }}</h3>
          </div>
          <div class="p-sm rounded-md bg-primary/10 text-primary group-hover:scale-110 transition-transform">
            <lucide-icon name="check-circle" class="size-5"></lucide-icon>
          </div>
        </div>

        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex items-center justify-between shadow-sm hover:border-[#7c3aed] transition-colors group">
          <div>
            <p class="text-caption-tight font-bold uppercase tracking-wider text-[#7c3aed] m-0">Served Today</p>
            <h3 class="text-heading-lg font-bold text-[#7c3aed] m-0 mt-xs">{{ servedCount() }}</h3>
          </div>
          <div class="p-sm rounded-md bg-[#7c3aed]/10 text-[#7c3aed] group-hover:scale-110 transition-transform">
            <lucide-icon name="utensils" class="size-5"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Controls & Filter Bar -->
      <div class="bg-surface-bone border border-hairline rounded-md p-md flex flex-col sm:flex-row gap-md items-center shadow-sm">
        <div class="relative flex-1 w-full">
          <lucide-icon name="search" class="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mute pointer-events-none"></lucide-icon>
          <input type="text" placeholder="Search by Table, Customer name, or Order ID..."
            [(ngModel)]="searchQuery"
            class="w-full pl-[36px] h-[40px] rounded-md border border-hairline bg-canvas text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors" />
        </div>
        <!-- Status Filter Tabs -->
        <div class="flex items-center gap-sm flex-wrap w-full sm:w-auto overflow-x-auto pb-xs sm:pb-0 custom-scrollbar">
          <button *ngFor="let tab of statusTabs" (click)="selectedStatus = tab.value"
            class="px-md py-sm rounded-md text-caption-tight font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap flex items-center gap-xs"
            [ngClass]="selectedStatus === tab.value ? 'bg-ink text-canvas border-ink shadow-sm' : 'bg-canvas text-mute border-hairline hover:bg-surface-dark hover:text-canvas'">
            <span>{{ tab.label }}</span>
            <span class="px-1.5 py-0.5 rounded-full text-caption-tight"
              [ngClass]="selectedStatus === tab.value ? 'bg-surface-dark text-canvas' : 'bg-surface-bone text-ink'">
              {{ getCountForStatus(tab.value) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && filteredOrders().length === 0" class="flex flex-col items-center justify-center py-xxxl text-center border border-hairline rounded-md bg-surface-bone shadow-sm">
        <div class="bg-canvas p-lg rounded-full shadow-sm mb-md text-mute border border-hairline">
          <lucide-icon name="shopping-bag" class="size-10"></lucide-icon>
        </div>
        <h3 class="text-heading-md font-bold text-ink mb-xs m-0">No Orders Found</h3>
        <p class="text-body-sm text-mute max-w-sm m-0">No orders match the current search or status filter. Try clearing your filters or check back when new orders arrive.</p>
        <button (click)="resetFilters()" *ngIf="searchQuery || selectedStatus !== 'ALL'" class="mt-md button-outline">
          Reset Filters
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex flex-col items-center justify-center py-xxxl text-mute">
        <div class="animate-spin rounded-full size-10 border-b-2 border-primary mb-md"></div>
        <p class="font-bold text-body-sm m-0">Synchronizing Kitchen Orders...</p>
      </div>

      <!-- Orders Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-xl" *ngIf="!isLoading() && filteredOrders().length > 0">
        <div *ngFor="let order of filteredOrders()" 
          class="bg-surface-bone rounded-md border border-hairline shadow-sm overflow-hidden flex flex-col hover:border-[#333] transition-colors"
          [ngClass]="getCardAccentClass(order.status)">
          
          <!-- Card Header -->
          <div class="p-lg border-b border-hairline bg-canvas flex justify-between items-start">
            <div>
              <div class="flex items-center gap-sm mb-sm">
                <span class="text-caption-tight font-bold px-sm py-xs rounded-md bg-ink text-canvas shadow-sm flex items-center gap-xs">
                  <lucide-icon name="utensils" class="size-3"></lucide-icon>
                  Table {{ (order.table && order.table.name) ? order.table.name : 'Walk-in' }}
                </span>
                <span class="text-caption-tight font-bold px-sm py-xs rounded-md bg-surface-bone border border-hairline text-mute uppercase">{{ order.orderType || 'DINE_IN' }}</span>
                <span class="text-[10px] text-mute font-mono">#{{ order.id.substring(0,6) }}</span>
              </div>
              <h3 class="text-body-sm font-bold text-ink m-0">{{ order.customerName || 'Guest Customer' }}</h3>
              <p class="text-caption text-mute m-0 mt-0.5 flex items-center gap-xs">
                <span>{{ order.customerPhone || 'No contact phone' }}</span> • 
                <span class="font-bold text-ink">{{ getFormattedTime(order.createdAt) }}</span>
              </p>
            </div>
            <div class="flex flex-col items-end gap-xs">
              <span class="text-caption-tight font-bold uppercase px-sm py-xs rounded-md shadow-sm border"
                [ngClass]="getStatusBadgeClass(order.status)">
                {{ order.status }}
              </span>
              <span class="text-caption-tight font-bold px-sm py-0.5 rounded-full"
                [ngClass]="order.paymentStatus === 'PAID' ? 'bg-primary/10 text-primary' : 'bg-[#e05d0e]/10 text-[#e05d0e]'">
                {{ order.paymentStatus || 'PENDING' }}
              </span>
            </div>
          </div>

          <!-- Items List -->
          <div class="p-lg flex-1 overflow-y-auto max-h-[220px] divide-y divide-hairline bg-surface-bone">
            <div *ngFor="let item of order.items" class="py-sm first:pt-0 last:pb-0 flex justify-between items-start gap-md">
              <div class="flex items-start gap-sm flex-1">
                <span class="size-6 rounded-md bg-canvas border border-hairline text-charcoal font-bold text-caption flex items-center justify-center shrink-0 mt-0.5">
                  {{ item.quantity }}x
                </span>
                <div>
                  <p class="font-bold text-body-sm text-ink m-0 leading-tight">{{ item.menuItemName }}</p>
                  <p *ngIf="item.notes" class="text-caption text-[#e05d0e] font-medium m-0 mt-xs flex items-center gap-xs">
                    <lucide-icon name="alert-circle" class="size-3"></lucide-icon> {{ item.notes }}
                  </p>
                </div>
              </div>
              <span class="font-bold text-body-sm text-mute shrink-0">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Card Footer with Actions -->
          <div class="p-lg bg-canvas border-t border-hairline flex flex-col gap-md">
            <div class="flex justify-between items-baseline">
              <span class="text-caption-tight font-bold uppercase tracking-wider text-mute">Total Bill</span>
              <span class="text-heading-md font-bold text-primary">${{ (order.totalAmount || 0).toFixed(2) }}</span>
            </div>
            
            <!-- Quick Action Button -->
            <div class="flex gap-sm">
              <button *ngIf="order.status === 'PENDING'" (click)="quickUpdateStatus(order, 'PREPARING')"
                class="flex-1 py-sm bg-[#1e429f] hover:bg-[#1e429f]/90 text-canvas font-bold text-caption rounded-md transition-colors shadow-sm flex items-center justify-center gap-xs cursor-pointer border-none">
                <lucide-icon name="play" class="size-3.5"></lucide-icon> Start Preparing
              </button>
              <button *ngIf="order.status === 'PREPARING'" (click)="quickUpdateStatus(order, 'READY')"
                class="flex-1 py-sm button-dark transition-colors shadow-sm flex items-center justify-center gap-xs cursor-pointer border-none">
                <lucide-icon name="check" class="size-3.5"></lucide-icon> Mark Ready
              </button>
              <button *ngIf="order.status === 'READY'" (click)="quickUpdateStatus(order, 'SERVED')"
                class="flex-1 py-sm bg-[#7c3aed] hover:bg-[#7c3aed]/90 text-canvas font-bold text-caption rounded-md transition-colors shadow-sm flex items-center justify-center gap-xs cursor-pointer border-none">
                <lucide-icon name="utensils" class="size-3.5"></lucide-icon> Complete &amp; Serve
              </button>
              <button *ngIf="order.status === 'SERVED' || order.status === 'CANCELLED'" disabled
                class="flex-1 py-sm bg-surface-bone text-mute font-bold text-caption rounded-md opacity-60 border border-hairline flex items-center justify-center gap-xs cursor-not-allowed">
                <span>Completed</span>
              </button>
            </div>

            <!-- Manual Status Selector -->
            <div class="flex items-center gap-sm pt-xs">
              <span class="text-caption font-bold text-mute shrink-0">Status:</span>
              <select 
                class="flex-1 bg-canvas border border-hairline rounded-md px-sm py-xs text-caption font-bold focus:outline-none focus:border-[#333] cursor-pointer transition-colors text-ink"
                [value]="order.status"
                (change)="updateOrderStatus(order, $event)">
                <option value="PENDING">PENDING</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY">READY</option>
                <option value="SERVED">SERVED</option>
                <option value="CANCELLED">CANCELLED</option>
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
      case 'PENDING': return 'border-t-[3px] border-t-[#e05d0e]';
      case 'PREPARING': return 'border-t-[3px] border-t-[#1e429f]';
      case 'READY': return 'border-t-[3px] border-t-primary';
      case 'SERVED': return 'border-t-[3px] border-t-[#7c3aed]';
      case 'CANCELLED': return 'border-t-[3px] border-t-[#e02424]';
      default: return 'border-t-[3px] border-t-hairline';
    }
  }
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'PENDING': return 'bg-[#e05d0e]/10 text-[#e05d0e] border-[#e05d0e]/30';
      case 'PREPARING': return 'bg-[#1e429f]/10 text-[#1e429f] border-[#1e429f]/30 animate-pulse';
      case 'READY': return 'bg-primary/10 text-primary border-primary/30';
      case 'SERVED': return 'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/30';
      case 'CANCELLED': return 'bg-[#e02424]/10 text-[#e02424] border-[#e02424]/30';
      default: return 'bg-surface-bone text-mute border-hairline';
    }
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
