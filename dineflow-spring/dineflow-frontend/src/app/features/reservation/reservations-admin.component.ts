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
    <div class="flex flex-col gap-xl w-full bg-canvas">

      <!-- Header -->
      <div>
        <h1 class="text-heading-lg font-bold tracking-tight text-ink m-0">Reservations Management</h1>
        <div class="flex items-center gap-sm mt-xs">
          <h2 class="text-heading-sm font-bold text-ink m-0">All Reservations</h2>
          <span class="text-mute text-body-sm">/ Manage guest bookings and statuses</span>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex items-center justify-center py-xxxl">
        <div class="animate-spin rounded-full size-8 border-b-2 border-primary"></div>
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading() && reservations().length === 0"
        class="text-center py-xxxl border border-hairline rounded-md text-mute bg-surface-bone">
        No reservations found.
      </div>

      <!-- Cards -->
      <div class="flex flex-col gap-md">
        <div *ngFor="let res of reservations()"
          class="bg-surface-bone border border-hairline rounded-md overflow-hidden shadow-sm hover:border-[#333] transition-colors">

          <!-- Top Row: status icon + date/status label + time -->
          <div class="px-xl py-md flex items-center justify-between gap-md bg-canvas">

            <!-- Status icon -->
            <div class="shrink-0">
              <div *ngIf="res.status === 'CONFIRMED'"
                class="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <lucide-icon name="check-circle" class="size-5"></lucide-icon>
              </div>
              <div *ngIf="res.status === 'PENDING'"
                class="size-10 rounded-md bg-[#e05d0e]/10 text-[#e05d0e] flex items-center justify-center">
                <lucide-icon name="clock" class="size-5"></lucide-icon>
              </div>
              <div *ngIf="res.status === 'CANCELLED'"
                class="size-10 rounded-md bg-[#e02424]/10 text-[#e02424] flex items-center justify-center">
                <lucide-icon name="x-circle" class="size-5"></lucide-icon>
              </div>
              <div *ngIf="res.status === 'COMPLETED'"
                class="size-10 rounded-md bg-[#1e429f]/10 text-[#1e429f] flex items-center justify-center">
                <lucide-icon name="check-circle" class="size-5"></lucide-icon>
              </div>
            </div>

            <!-- Date + status label -->
            <div class="flex-1">
              <p class="font-bold text-ink m-0 text-body-sm">{{ res.reservationDate | date:'EEEE, MMMM d, y' }}</p>
              <p class="text-caption font-bold m-0"
                [class.text-primary]="res.status === 'CONFIRMED'"
                [class.text-[#e05d0e]]="res.status === 'PENDING'"
                [class.text-[#e02424]]="res.status === 'CANCELLED'"
                [class.text-[#1e429f]]="res.status === 'COMPLETED'">
                {{ getStatusLabel(res.status) }}
              </p>
            </div>

            <!-- Time -->
            <div class="text-heading-md font-bold text-ink shrink-0">
              {{ res.reservationDate | date:'h:mm a' }}
            </div>
          </div>

          <!-- Detail chips -->
          <div class="px-xl py-md border-t border-hairline bg-surface-bone grid grid-cols-3 gap-md">

            <div class="flex items-center gap-sm">
              <lucide-icon name="users" class="size-4 text-mute shrink-0"></lucide-icon>
              <div>
                <p class="text-caption font-bold uppercase tracking-widest text-mute m-0">Party Size</p>
                <p class="text-body-sm font-bold text-ink m-0">{{ res.guests || res.partySize || 1 }} Guests</p>
              </div>
            </div>

            <div class="flex items-center gap-sm">
              <lucide-icon name="map-pin" class="size-4 text-mute shrink-0"></lucide-icon>
              <div>
                <p class="text-caption font-bold uppercase tracking-widest text-mute m-0">Table / Area</p>
                <p class="text-body-sm font-bold text-ink m-0">
                  {{ res.table ? (res.table.name + ' • ' + res.table.section) : 'Unassigned' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-sm">
              <lucide-icon name="calendar" class="size-4 text-mute shrink-0"></lucide-icon>
              <div>
                <p class="text-caption font-bold uppercase tracking-widest text-mute m-0">Reserved Under</p>
                <p class="text-body-sm font-bold text-ink m-0">
                  {{ res.user?.name || res.customerName || 'Guest' }}
                </p>
              </div>
            </div>

          </div>

          <!-- Admin Controls -->
          <div class="px-xl py-md border-t border-hairline flex items-center justify-between bg-surface-dark">
            <div class="flex items-center gap-xs text-caption font-bold uppercase tracking-widest text-primary">
              <lucide-icon name="settings-2" class="size-3.5"></lucide-icon>
              Admin Controls
            </div>
            <div class="flex items-center gap-sm">
              <span class="text-caption font-bold text-mute">Update Status:</span>
              <select [value]="res.status" (change)="onStatusChange(res, $event)"
                class="bg-canvas border border-hairline rounded-md px-sm py-xs text-caption font-bold focus:outline-none focus:border-[#333] cursor-pointer text-ink">
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
