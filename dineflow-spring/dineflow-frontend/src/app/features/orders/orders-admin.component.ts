import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { LucideAngularModule, ShoppingBag, Clock, CheckCircle, XCircle, FileText } from 'lucide-angular';

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-6 w-full h-full">
      <!-- Header -->
      <div class="bg-card rounded-xl border border-border p-6 flex justify-between items-end shadow-sm">
        <div>
          <h2 class="text-2xl font-black tracking-tight text-foreground m-0">All Orders</h2>
          <p class="text-sm text-muted-foreground font-medium mt-1 mb-0">Manage Orders and statuses</p>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && orders().length === 0" class="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-slate-50/50 dark:bg-muted/20">
        <div class="bg-white dark:bg-card p-4 rounded-full shadow-sm mb-4 text-slate-400">
          <lucide-icon [img]="ShoppingBag" [size]="40"></lucide-icon>
        </div>
        <h3 class="text-xl font-bold text-foreground mb-1">No Orders Found</h3>
        <p class="text-sm text-muted-foreground">There are no orders in the system.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p>Loading Orders...</p>
      </div>

      <!-- Orders List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="!isLoading()">
        <div *ngFor="let order of orders()" class="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
          
          <div class="p-5 border-b border-border bg-muted/20 flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">Table {{ order.table?.name || 'N/A' }}</span>
                <span class="text-xs text-muted-foreground font-mono">#{{ order.id.substring(0,8) }}</span>
              </div>
              <h3 class="text-lg font-bold text-foreground m-0 mt-2">{{ order.customerName || 'Walk-in Customer' }}</h3>
              <p class="text-xs text-muted-foreground mt-1">{{ order.customerPhone || 'No phone provided' }}</p>
            </div>
            <div class="text-right">
              <span class="text-sm font-semibold whitespace-nowrap" [ngClass]="getStatusColor(order.status)">
                {{ order.status }}
              </span>
            </div>
          </div>

          <div class="p-5 flex-1 overflow-y-auto min-h-[120px]">
            <ul class="space-y-3 m-0 p-0 list-none">
              <li *ngFor="let item of order.items" class="flex justify-between items-center text-sm py-1 border-b border-border/50 last:border-0">
                <div class="flex gap-2">
                  <span class="font-medium">{{ item.quantity }}x</span>
                  <span class="font-medium text-foreground">{{ item.menuItemName }}</span>
                </div>
                <span class="font-medium text-muted-foreground">\${{ (item.price * item.quantity).toFixed(2) }}</span>
              </li>
            </ul>
          </div>

          <div class="p-5 bg-muted/10 border-t border-border">
            <div class="flex justify-between items-center mb-4">
              <span class="font-semibold text-muted-foreground">Total</span>
              <span class="text-xl font-black text-primary">\${{ order.totalAmount.toFixed(2) }}</span>
            </div>
            
            <div class="flex gap-2">
              <select 
                class="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
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
        this.orders.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
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

  getStatusColor(status: string): string {
    switch(status) {
      case 'PENDING': return 'text-orange-500';
      case 'PREPARING': return 'text-blue-500';
      case 'READY': return 'text-green-500';
      case 'SERVED': return 'text-slate-500';
      case 'CANCELLED': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  }
}
