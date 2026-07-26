import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../core/services/reservation.service';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto py-8">
      <h1 class="text-3xl font-bold mb-6 text-foreground">Book a Table</h1>
      
      <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form (ngSubmit)="submitReservation()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-foreground">Date</label>
              <input type="date" [(ngModel)]="date" name="date" required
                     class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-foreground">Time</label>
              <input type="time" [(ngModel)]="time" name="time" required
                     class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-foreground">Number of People</label>
              <input type="number" [(ngModel)]="people" name="people" min="1" max="20" required
                     class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            </div>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">Special Requests (Optional)</label>
            <textarea [(ngModel)]="notes" name="notes" rows="3"
                      class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"></textarea>
          </div>
          
          <button type="submit" [disabled]="isLoading()"
                  class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
            {{ isLoading() ? 'Submitting...' : 'Request Reservation' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class CustomerReservationComponent implements OnInit {
  reservationService = inject(ReservationService);
  authService = inject(AuthService);
  router = inject(Router);
  
  date = '';
  time = '';
  people = 2;
  notes = '';
  
  isLoading = signal(false);

  ngOnInit() {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
    }
  }

  submitReservation() {
    if (!this.date || !this.time || !this.people) return;
    
    // Combine date and time into ISO string
    const dateTimeStr = `${this.date}T${this.time}:00Z`; // Simplified for example
    
    const request = {
      date: new Date(dateTimeStr).toISOString(),
      guests: this.people,
      customerName: this.authService.currentUser()?.name || 'Customer'
    };
    
    this.isLoading.set(true);
    this.reservationService.createReservation(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        alert('Reservation requested successfully! Wait for confirmation.');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        alert('Error: ' + (err.error?.message || 'Could not create reservation'));
      }
    });
  }
}
