import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus, OrderType } from '../../core/models/order.model';

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-xl w-full h-full bg-canvas">
      <!-- Header & Stats -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
        <div>
          <h1 class="text-heading-lg font-bold text-ink m-0 tracking-tight">Orders</h1>
          <p class="text-body-sm text-mute mt-xs m-0">Kitchen management and real-time tracking</p>
        </div>
        <div class="flex items-center gap-sm">
          <button (click)="fetchOrders()" [disabled]="isLoading()" class="px-md py-sm rounded-md border border-hairline bg-surface-bone text-body-sm font-medium text-ink hover:border-[#333] transition-colors cursor-pointer flex items-center gap-xs shadow-sm">
            <span [class.animate-spin]="isLoading()" class="text-lg leading-none mt-[-2px]">↻</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Stat Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex flex-col gap-xs hover:border-[#333] transition-colors shadow-sm">
          <p class="text-caption-tight font-bold uppercase tracking-wider text-mute m-0">Total Orders</p>
          <h3 class="text-heading-lg font-bold text-ink m-0">{{ totalCount() }}</h3>
        </div>

        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex flex-col gap-xs hover:border-[#1e429f] transition-colors shadow-sm">
          <p class="text-caption-tight font-bold uppercase tracking-wider text-[#1e429f] m-0">In Kitchen</p>
          <h3 class="text-heading-lg font-bold text-[#1e429f] m-0">{{ kitchenCount() }}</h3>
        </div>

        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex flex-col gap-xs hover:border-primary transition-colors shadow-sm">
          <p class="text-caption-tight font-bold uppercase tracking-wider text-primary m-0">Ready to Serve</p>
          <h3 class="text-heading-lg font-bold text-primary m-0">{{ readyCount() }}</h3>
        </div>

        <div class="bg-surface-bone border border-hairline rounded-md p-lg flex flex-col gap-xs hover:border-[#7c3aed] transition-colors shadow-sm">
          <p class="text-caption-tight font-bold uppercase tracking-wider text-[#7c3aed] m-0">Served Today</p>
          <h3 class="text-heading-lg font-bold text-[#7c3aed] m-0">{{ servedCount() }}</h3>
        </div>
      </div>

      <!-- Controls & Filter Bar -->
      <div class="flex flex-col md:flex-row gap-md items-center justify-between border border-hairline bg-surface-bone rounded-md p-sm shadow-sm">
        <div class="flex items-center gap-sm w-full md:w-auto overflow-x-auto custom-scrollbar">
          <button *ngFor="let tab of statusTabs" (click)="selectedStatus = tab.value"
            class="px-md py-sm rounded-md text-caption-tight font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-xs outline-none border-none"
            [ngClass]="selectedStatus === tab.value ? 'bg-ink text-canvas shadow-sm' : 'bg-transparent text-mute hover:bg-canvas hover:text-ink'">
            <span>{{ tab.label }}</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px]"
              [ngClass]="selectedStatus === tab.value ? 'bg-surface-dark text-canvas' : 'bg-canvas text-ink'">
              {{ getCountForStatus(tab.value) }}
            </span>
          </button>
        </div>
        
        <div class="relative w-full md:w-72">
          <input type="text" placeholder="Search orders..."
            [(ngModel)]="searchQuery"
            class="w-full h-[40px] px-md rounded-md border border-hairline bg-canvas text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors shadow-sm" />
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && filteredOrders().length === 0" class="flex flex-col items-center justify-center py-xxxl text-center border border-hairline bg-surface-bone rounded-md mt-md shadow-sm">
        <h3 class="text-body-lg font-medium text-ink mb-xs m-0">No Orders Found</h3>
        <p class="text-body-sm text-mute max-w-sm m-0">No orders match the current search or status filter.</p>
        <button (click)="resetFilters()" *ngIf="searchQuery || selectedStatus !== 'ALL'" class="mt-md text-body-sm font-medium text-ink hover:text-mute cursor-pointer bg-transparent border-b border-ink pb-0.5 outline-none">
          Reset Filters
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex flex-col items-center justify-center py-xxxl text-mute mt-md">
        <p class="text-body-sm m-0 animate-pulse font-bold">Synchronizing Kitchen Orders...</p>
      </div>

      <!-- Orders Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-xl mt-md" *ngIf="!isLoading() && filteredOrders().length > 0">
        <div *ngFor="let order of filteredOrders()" 
          class="bg-canvas rounded-md border border-hairline flex flex-col hover:border-[#333] transition-colors shadow-sm overflow-hidden">
          
          <!-- Card Header -->
          <div class="p-lg bg-surface-bone border-b border-hairline flex flex-col gap-sm">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-baseline gap-xs">
                  <h3 class="text-heading-sm font-bold text-ink m-0">Table {{ (order.table && order.table.name) ? order.table.name : 'Walk-in' }}</h3>
                  <span class="text-caption-tight text-mute uppercase font-bold">{{ order.orderType || 'DINE IN' }}</span>
                </div>
                <div class="flex items-center gap-xs mt-1">
                  <span class="text-body-sm font-medium text-ink">{{ order.customerName || 'Guest' }}</span>
                  <span class="text-caption text-mute">·</span>
                  <span class="text-caption text-mute">{{ getFormattedTime(order.createdAt) }}</span>
                </div>
              </div>
              <div class="flex flex-col items-end gap-xs">
                <span class="text-[10px] uppercase font-bold tracking-widest px-sm py-0.5 rounded-full"
                  [ngClass]="order.paymentStatus === 'PAID' ? 'bg-primary/10 text-primary' : 'bg-[#e05d0e]/10 text-[#e05d0e]'">
                  {{ order.paymentStatus || 'PENDING' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div class="p-lg flex-1 overflow-y-auto max-h-[220px] custom-scrollbar">
            <div class="flex flex-col gap-md">
              <div *ngFor="let item of order.items" class="flex justify-between items-start">
                <div class="flex items-start gap-md">
                  <span class="text-body-sm font-bold text-ink shrink-0 bg-surface-bone px-sm py-xs rounded-md border border-hairline min-w-[32px] text-center">{{ item.quantity }}x</span>
                  <div class="flex flex-col mt-xs">
                    <span class="text-body-sm font-bold text-ink leading-tight">{{ item.menuItemName }}</span>
                    <span *ngIf="item.notes" class="text-caption font-medium text-[#e05d0e] mt-1">{{ item.notes }}</span>
                  </div>
                </div>
                <span class="text-body-sm font-bold text-mute shrink-0 mt-xs">\${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Card Footer with Actions -->
          <div class="p-lg bg-surface-bone border-t border-hairline flex flex-col gap-md">
            <div class="flex justify-between items-center">
              <span class="text-caption-tight font-bold uppercase tracking-wider text-mute">Total Bill</span>
              <span class="text-heading-sm font-bold text-primary">\${{ (order.totalAmount || 0).toFixed(2) }}</span>
            </div>
            
            <!-- Quick Action Button -->
            <div class="flex w-full">
              <button *ngIf="order.status === 'PENDING'" (click)="quickUpdateStatus(order, 'PREPARING')"
                class="w-full py-sm bg-[#1e429f] hover:bg-[#1e429f]/90 text-canvas font-bold text-caption rounded-md transition-colors cursor-pointer border-none shadow-sm">
                Start Preparing
              </button>
              <button *ngIf="order.status === 'PREPARING'" (click)="quickUpdateStatus(order, 'READY')"
                class="w-full py-sm bg-ink hover:bg-[#333] text-canvas font-bold text-caption rounded-md transition-colors cursor-pointer border-none shadow-sm">
                Mark Ready
              </button>
              <button *ngIf="order.status === 'READY'" (click)="quickUpdateStatus(order, 'SERVED')"
                class="w-full py-sm bg-[#7c3aed] hover:bg-[#7c3aed]/90 text-canvas font-bold text-caption rounded-md transition-colors cursor-pointer border-none shadow-sm">
                Complete &amp; Serve
              </button>
              <button *ngIf="order.status === 'SERVED' || order.status === 'CANCELLED'" disabled
                class="w-full py-sm bg-canvas text-mute font-bold text-caption rounded-md opacity-60 border border-hairline cursor-not-allowed">
                Completed
              </button>
            </div>

            <!-- Manual Status Selector -->
            <div class="flex items-center gap-sm pt-xs">
              <span class="text-caption font-bold text-mute shrink-0">Status:</span>
              <select 
                class="flex-1 bg-canvas border border-hairline rounded-md px-sm py-xs text-caption font-bold focus:outline-none focus:border-[#333] cursor-pointer transition-colors text-ink shadow-sm"
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
      case 'PENDING': return 'border-t-4 border-t-[#e05d0e]';
      case 'PREPARING': return 'border-t-4 border-t-[#1e429f]';
      case 'READY': return 'border-t-4 border-t-primary';
      case 'SERVED': return 'border-t-4 border-t-[#7c3aed]';
      case 'CANCELLED': return 'border-t-4 border-t-[#e02424]';
      default: return 'border-t-4 border-t-hairline';
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
