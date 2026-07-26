import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { ReservationService } from '../../core/services/reservation.service';
import { Reservation } from '../../core/models/reservation.model';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl mx-auto py-8 space-y-8">
      <h1 class="text-3xl font-bold text-foreground">My Profile</h1>
      
      <!-- User Info -->
      <div class="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-6">
        <div class="size-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-4xl font-bold uppercase">
          {{ user()?.name?.charAt(0) || 'U' }}
        </div>
        <div>
          <h2 class="text-2xl font-bold text-foreground mb-1">{{ user()?.name }}</h2>
          <p class="text-muted-foreground">{{ user()?.email }}</p>
          <div class="mt-4 flex gap-2">
            <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
              {{ user()?.role }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Order History -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 class="text-xl font-bold text-foreground mb-4">Order History</h3>
          <div class="space-y-4">
            <div *ngIf="orders().length === 0" class="text-muted-foreground text-sm">No orders found.</div>
            
            <div *ngFor="let order of orders()" class="border border-border rounded-lg p-4 bg-background">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-sm">Order #{{ order.orderNumber }}</span>
                <span class="text-xs text-muted-foreground">{{ order.createdAt | date:'short' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                      [ngClass]="{
                        'bg-yellow-500/10 text-yellow-500': order.status === 'PENDING',
                        'bg-blue-500/10 text-blue-500': order.status === 'PREPARING',
                        'bg-green-500/10 text-green-500': order.status === 'SERVED'
                      }">
                  {{ order.status }}
                </span>
                <span class="font-bold">\${{ order.totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Reservations -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 class="text-xl font-bold text-foreground mb-4">My Reservations</h3>
          <div class="space-y-4">
            <div *ngIf="reservations().length === 0" class="text-muted-foreground text-sm">No reservations found.</div>
            
            <div *ngFor="let res of reservations()" class="border border-border rounded-lg p-4 bg-background">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-sm">{{ res.reservationDate | date:'medium' }}</span>
                <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                      [ngClass]="{
                        'bg-yellow-500/10 text-yellow-500': res.status === 'PENDING',
                        'bg-green-500/10 text-green-500': res.status === 'CONFIRMED',
                        'bg-red-500/10 text-red-500': res.status === 'CANCELLED'
                      }">
                  {{ res.status }}
                </span>
              </div>
              <div class="text-sm text-muted-foreground">
                Party of {{ res.partySize }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CustomerProfileComponent implements OnInit {
  authService = inject(AuthService);
  orderService = inject(OrderService);
  reservationService = inject(ReservationService);
  
  user = this.authService.currentUser;
  
  orders = signal<Order[]>([]);
  reservations = signal<Reservation[]>([]);

  ngOnInit() {
    this.loadOrders();
    this.loadReservations();
  }
  
  loadOrders() {
    // Note: Assuming backend order service can fetch orders by user. 
    // MERN backend had /api/orders/user/:id or similar.
    // In Spring, we might need a specific endpoint if not already there.
    this.orderService.getOrders(1, 10).subscribe(res => {
      // Temporary: filter locally if no specific endpoint exists
      const myOrders = res.data.filter(o => o.user?.id === this.user()?.id);
      this.orders.set(myOrders);
    });
  }
  
  loadReservations() {
    this.reservationService.getReservations(1, 10).subscribe(res => {
      // Temporary: filter locally
      const myRes = res.data.filter(r => r.user?.id === this.user()?.id);
      this.reservations.set(myRes);
    });
  }
}
