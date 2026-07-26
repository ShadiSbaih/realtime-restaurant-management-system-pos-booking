import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../core/services/reservation.service';
import { Reservation, BookingStatus } from '../../core/models/reservation.model';
import { LucideAngularModule, Calendar, CheckCircle, Clock, XCircle, Users, MapPin, Settings2 } from 'lucide-angular';

@Component({
  selector: 'app-reservations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-6 w-full">

      <!-- Header -->
      <div>
        <h1 class="text-3xl font-black tracking-tight text-foreground m-0">Reservations Management</h1>
        <div class="flex items-center gap-2 mt-1">
          <h2 class="text-xl font-bold text-foreground m-0">All Reservations</h2>
          <span class="text-muted-foreground text-sm">/ Manage guest bookings and statuses</span>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading() && reservations().length === 0"
        class="text-center py-20 border-2 border-dashed border-border rounded-xl text-muted-foreground">
        No reservations found.
      </div>

      <!-- Cards -->
      <div class="flex flex-col gap-4">
        <div *ngFor="let res of reservations()"
          class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">

          <!-- Top Row: status icon + date/status label + time -->
          <div class="px-6 py-4 flex items-center justify-between gap-4">

            <!-- Status icon -->
            <div class="shrink-0">
              <div *ngIf="res.status === 'CONFIRMED'"
                class="size-10 rounded-full bg-green-500 flex items-center justify-center">
                <lucide-icon name="check-circle" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div *ngIf="res.status === 'PENDING'"
                class="size-10 rounded-full bg-orange-500 flex items-center justify-center">
                <lucide-icon name="clock" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div *ngIf="res.status === 'CANCELLED'"
                class="size-10 rounded-full bg-red-500 flex items-center justify-center">
                <lucide-icon name="x-circle" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div *ngIf="res.status === 'COMPLETED'"
                class="size-10 rounded-full bg-blue-500 flex items-center justify-center">
                <lucide-icon name="check-circle" [size]="20" class="text-white"></lucide-icon>
              </div>
            </div>

            <!-- Date + status label -->
            <div class="flex-1">
              <p class="font-bold text-foreground m-0">{{ res.reservationDate | date:'EEEE, MMMM d, y' }}</p>
              <p class="text-sm m-0"
                [class.text-green-500]="res.status === 'CONFIRMED'"
                [class.text-orange-500]="res.status === 'PENDING'"
                [class.text-red-500]="res.status === 'CANCELLED'"
                [class.text-blue-500]="res.status === 'COMPLETED'">
                {{ getStatusLabel(res.status) }}
              </p>
            </div>

            <!-- Time -->
            <div class="text-2xl font-black text-foreground shrink-0">
              {{ res.reservationDate | date:'h:mm a' }}
            </div>
          </div>

          <!-- Detail chips -->
          <div class="px-6 py-3 border-t border-border bg-muted/20 grid grid-cols-3 gap-4">

            <div class="flex items-center gap-2">
              <lucide-icon name="users" [size]="14" class="text-muted-foreground shrink-0"></lucide-icon>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground m-0">Party Size</p>
                <p class="text-sm font-semibold text-foreground m-0">{{ res.guests || res.partySize || 1 }} Guests</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <lucide-icon name="map-pin" [size]="14" class="text-muted-foreground shrink-0"></lucide-icon>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground m-0">Table / Area</p>
                <p class="text-sm font-semibold text-foreground m-0">
                  {{ res.table ? (res.table.name + ' • ' + res.table.section) : 'Unassigned' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <lucide-icon name="calendar" [size]="14" class="text-muted-foreground shrink-0"></lucide-icon>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground m-0">Reserved Under</p>
                <p class="text-sm font-semibold text-foreground m-0">
                  {{ res.user?.name || res.customerName || 'Guest' }}
                </p>
              </div>
            </div>

          </div>

          <!-- Admin Controls -->
          <div class="px-6 py-3 border-t border-border flex items-center justify-between bg-muted/10">
            <div class="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary">
              <lucide-icon name="settings-2" [size]="13"></lucide-icon>
              Admin Controls
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground font-medium">Update Status:</span>
              <select [value]="res.status" (change)="onStatusChange(res, $event)"
                class="bg-background border border-border rounded-md px-2 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: []
})
export class ReservationsAdminComponent implements OnInit {
  reservationService = inject(ReservationService);

  reservations = signal<Reservation[]>([]);
  isLoading = signal(false);
  readonly BookingStatus = BookingStatus;

  ngOnInit() { this.loadReservations(); }

  loadReservations() {
    this.isLoading.set(true);
    this.reservationService.getReservations(1, 50).subscribe({
      next: (res) => { this.reservations.set(res.data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  onStatusChange(res: Reservation, event: Event) {
    const select = event.target as HTMLSelectElement;
    const status = select.value as BookingStatus;
    this.reservationService.updateStatus(res.id, status).subscribe({
      next: () => this.loadReservations(),
      error: (err: any) => {
        alert('Error: ' + (err.error?.message || 'Unknown'));
        select.value = res.status;
      }
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmed';
      case 'PENDING':   return 'Pending Review';
      case 'CANCELLED': return 'Cancelled';
      case 'COMPLETED': return 'Completed';
      default:          return status;
    }
  }
}
