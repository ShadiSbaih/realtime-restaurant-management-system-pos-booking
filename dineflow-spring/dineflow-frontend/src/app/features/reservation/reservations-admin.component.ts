import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../core/services/reservation.service';
import { Reservation, BookingStatus } from '../../core/models/reservation.model';
import { LucideAngularModule, Calendar, CheckCircle2, XCircle } from 'lucide-angular';

@Component({
  selector: 'app-reservations-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col gap-6 w-full">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <lucide-icon name="calendar" [size]="28" class="text-primary"></lucide-icon>
            Reservations Management
          </h2>
          <p class="text-muted-foreground mt-1">View and manage table bookings.</p>
        </div>
      </div>
      
      <div class="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border sticky top-0">
              <tr>
                <th class="px-6 py-4 font-medium">Customer</th>
                <th class="px-6 py-4 font-medium">Date & Time</th>
                <th class="px-6 py-4 font-medium">Party Size</th>
                <th class="px-6 py-4 font-medium">Table</th>
                <th class="px-6 py-4 font-medium">Status</th>
                <th class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="isLoading()" class="border-b border-border">
                <td colspan="6" class="px-6 py-8 text-center text-muted-foreground">Loading reservations...</td>
              </tr>
              <tr *ngIf="!isLoading() && reservations().length === 0" class="border-b border-border">
                <td colspan="6" class="px-6 py-8 text-center text-muted-foreground">No reservations found.</td>
              </tr>
              <tr *ngFor="let res of reservations()" class="border-b border-border hover:bg-muted/30 transition-colors">
                <td class="px-6 py-4">
                  <div class="font-medium text-foreground">{{ res.user?.name || 'Walk-in/Guest' }}</div>
                  <div class="text-xs text-muted-foreground">{{ res.user?.email }}</div>
                </td>
                <td class="px-6 py-4 text-foreground">{{ res.reservationDate | date:'short' }}</td>
                <td class="px-6 py-4 text-foreground">{{ res.partySize }} People</td>
                <td class="px-6 py-4 text-foreground">{{ res.table?.name || 'Unassigned' }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        [ngClass]="{
                          'bg-yellow-500/10 text-yellow-500': res.status === 'PENDING',
                          'bg-green-500/10 text-green-500': res.status === 'CONFIRMED',
                          'bg-red-500/10 text-red-500 border-red-500/20': res.status === 'CANCELLED'
                        }">
                    {{ res.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2" *ngIf="res.status === 'PENDING'">
                    <button (click)="updateStatus(res, BookingStatus.CONFIRMED)" class="p-1.5 text-green-500 hover:bg-green-500/10 rounded-md transition-colors" title="Confirm">
                      <lucide-icon name="check-circle-2" [size]="18"></lucide-icon>
                    </button>
                    <button (click)="updateStatus(res, BookingStatus.CANCELLED)" class="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Cancel">
                      <lucide-icon name="x-circle" [size]="18"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
  
  readonly Calendar = Calendar;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly BookingStatus = BookingStatus;

  ngOnInit() {
    this.loadReservations();
  }
  
  loadReservations() {
    this.isLoading.set(true);
    this.reservationService.getReservations(1, 50).subscribe({
      next: (res) => {
        this.reservations.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
  
  updateStatus(res: Reservation, status: BookingStatus) {
    if (confirm(`Are you sure you want to mark this reservation as ${status}?`)) {
      this.reservationService.updateStatus(res.id, status).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (err: any) => {
          alert('Error updating reservation: ' + (err.error?.message || 'Unknown error'));
        }
      });
    }
  }
}
