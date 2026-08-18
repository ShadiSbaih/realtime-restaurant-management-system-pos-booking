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
    <div class="max-w-5xl mx-auto py-xl px-md space-y-xl bg-canvas">
      <h1 class="text-display-sm text-ink m-0">My Profile</h1>
      
      <!-- User Info -->
      <div class="bg-surface-bone border border-hairline rounded-md p-xl shadow-sm flex items-center gap-lg">
        <div class="size-24 rounded-full bg-surface-dark text-on-dark flex items-center justify-center text-heading-lg font-bold uppercase shrink-0">
          {{ user()?.name?.charAt(0) || 'U' }}
        </div>
        <div>
          <h2 class="text-heading-md text-ink m-0 mb-xs">{{ user()?.name }}</h2>
          <p class="text-body-md text-mute m-0">{{ user()?.email }}</p>
          <div class="mt-md flex gap-xs">
            <span class="inline-flex items-center rounded-full border border-hairline px-sm py-xs text-caption-tight bg-canvas text-charcoal">
              {{ user()?.role }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-xl">
        <!-- Order History -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg shadow-sm">
          <h3 class="text-heading-sm text-ink m-0 mb-md">Order History</h3>
          <div class="space-y-sm">
            <div *ngIf="orders().length === 0" class="text-mute text-body-sm">No orders found.</div>
            
            <div *ngFor="let order of orders()" class="border border-hairline rounded-md p-md bg-canvas transition-colors hover:bg-surface-bone">
              <div class="flex justify-between items-center mb-xs">
                <span class="font-bold text-body-sm text-ink">Order #{{ order.orderNumber }}</span>
                <span class="text-caption text-mute">{{ order.createdAt | date:'short' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="inline-flex items-center rounded-full border border-hairline px-sm py-xs text-caption-tight font-bold"
                      [ngClass]="{
                        'bg-[#fdf6b2]/30 text-[#8e4b10] border-[#fdf6b2]/50': order.status === 'PENDING',
                        'bg-[#e1effe]/30 text-[#1e429f] border-[#e1effe]/50': order.status === 'PREPARING',
                        'bg-[#def7ec]/30 text-[#03543f] border-[#def7ec]/50': order.status === 'SERVED'
                      }">
                  {{ order.status }}
                </span>
                <span class="font-bold text-ink">\${{ order.totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Reservations -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg shadow-sm">
          <h3 class="text-heading-sm text-ink m-0 mb-md">My Reservations</h3>
          <div class="space-y-sm">
            <div *ngIf="reservations().length === 0" class="text-mute text-body-sm">No reservations found.</div>
            
            <div *ngFor="let res of reservations()" class="border border-hairline rounded-md p-md bg-canvas transition-colors hover:bg-surface-bone">
              <div class="flex justify-between items-center mb-xs">
                <span class="font-bold text-body-sm text-ink">{{ res.reservationDate | date:'medium' }}</span>
                <span class="inline-flex items-center rounded-full border border-hairline px-sm py-xs text-caption-tight font-bold"
                      [ngClass]="{
                        'bg-[#fdf6b2]/30 text-[#8e4b10] border-[#fdf6b2]/50': res.status === 'PENDING',
                        'bg-[#def7ec]/30 text-[#03543f] border-[#def7ec]/50': res.status === 'CONFIRMED',
                        'bg-[#fde8e8]/30 text-[#9b1c1c] border-[#fde8e8]/50': res.status === 'CANCELLED'
                      }">
                  {{ res.status }}
                </span>
              </div>
              <div class="text-body-sm text-charcoal">
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
    const userId = this.user()?.id;
    if (!userId) return;
    this.orderService.getOrders(1, 20, userId).subscribe(res => {
      this.orders.set(res.data);
    });
  }
  
  loadReservations() {
    const userId = this.user()?.id;
    if (!userId) return;
    this.reservationService.getReservations(1, 20, userId).subscribe(res => {
      this.reservations.set(res.data);
    });
  }
}
