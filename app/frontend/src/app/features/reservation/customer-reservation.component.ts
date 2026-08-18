import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../core/services/reservation.service';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-customer-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-[calc(100vh-80px)] w-full flex flex-col lg:flex-row bg-canvas overflow-hidden">
      
      <!-- Left Side: Cinematic Full-Bleed Image -->
      <div class="w-full lg:w-1/2 relative min-h-[40vh] lg:min-h-full flex-shrink-0">
        <!-- High-res Image Cover -->
        <img src="/artisan_hero_platter.png" alt="Artisan Dining" class="absolute inset-0 w-full h-full object-cover object-center opacity-90" />
        
        <!-- Premium Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-surface-deep via-surface-deep/40 to-transparent"></div>
        
        <!-- Overlay Content -->
        <div class="absolute bottom-xl left-lg right-lg lg:left-xxxl lg:right-xxxl z-10">
        
          <h2 class="text-display-lg text-on-dark mb-sm m-0">
            Taste the<br/><span class="text-primary">Extraordinary</span>
          </h2>
          <p class="text-body-lg text-on-dark-mute m-0 max-w-md">
            Every detail is crafted with passion. Join us for a dining experience that transcends the ordinary and delights the senses.
          </p>
        </div>
      </div>

      <!-- Right Side: Sleek Booking Form -->
      <div class="w-full lg:w-1/2 flex flex-col justify-center px-lg py-xl lg:px-xxxl relative bg-canvas text-ink">
        <div class="w-full max-w-md mx-auto lg:mx-0">
          
          <!-- Header -->
          <div class="mb-xxl">
            <h1 class="text-display-md text-ink m-0">
              Book Your Table
            </h1>
            <p class="text-body-md text-mute mt-xs m-0">Select your details below to confirm your culinary experience.</p>
          </div>
          
          <form (ngSubmit)="submitReservation()" class="space-y-xl">
            
            <div class="space-y-lg">
              
              <!-- Date Input -->
              <div class="flex flex-col gap-xs">
                <label class="flex items-center gap-xs text-caption-tight text-charcoal">
                  Date
                </label>
                <div class="relative group">
                  <input type="date" [(ngModel)]="date" name="date" required
                         class="w-full h-[48px] px-sm pr-lg bg-surface-bone border border-hairline focus:border-[#333] rounded-md text-body-md text-ink transition-colors outline-none cursor-pointer hide-native-icon">
                  <lucide-icon name="calendar" class="absolute right-sm top-1/2 -translate-y-1/2 size-5 text-mute group-focus-within:text-ink transition-colors pointer-events-none"></lucide-icon>
                </div>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                <!-- Time Input -->
                <div class="flex flex-col gap-xs">
                  <label class="flex items-center gap-xs text-caption-tight text-charcoal">
                    Time
                  </label>
                  <div class="relative group">
                    <input type="time" [(ngModel)]="time" name="time" required
                           class="w-full h-[48px] px-sm pr-lg bg-surface-bone border border-hairline focus:border-[#333] rounded-md text-body-md text-ink transition-colors outline-none cursor-pointer hide-native-icon">
                    <lucide-icon name="clock" class="absolute right-sm top-1/2 -translate-y-1/2 size-5 text-mute group-focus-within:text-ink transition-colors pointer-events-none"></lucide-icon>
                  </div>
                </div>
                
                <!-- Party Size Input -->
                <div class="flex flex-col gap-xs">
                  <label class="flex items-center gap-xs text-caption-tight text-charcoal">
                    Party Size
                  </label>
                  <div class="relative group">
                    <input type="number" [(ngModel)]="people" name="people" min="1" max="20" required placeholder="Guests"
                           class="w-full h-[48px] px-sm pr-lg bg-surface-bone border border-hairline focus:border-[#333] rounded-md text-body-md text-ink transition-colors outline-none cursor-pointer">
                    <lucide-icon name="users" class="absolute right-sm top-1/2 -translate-y-1/2 size-5 text-mute group-focus-within:text-ink transition-colors pointer-events-none"></lucide-icon>
                  </div>
                </div>
              </div>
              
              <!-- Notes Input -->
              <div class="flex flex-col gap-xs pt-xs">
                <label class="flex items-center justify-between text-caption-tight text-charcoal">
                  <div class="flex items-center gap-xs">
                    Special Requests
                  </div>
                  <span class="text-mute">(Optional)</span>
                </label>
                <div class="relative group">
                  <lucide-icon name="message-square" class="absolute right-sm top-sm size-5 text-mute group-focus-within:text-ink transition-colors pointer-events-none"></lucide-icon>
                  <textarea [(ngModel)]="notes" name="notes" rows="3" placeholder="Dietary requirements, celebrations..."
                            class="w-full p-sm pr-lg bg-surface-bone border border-hairline focus:border-[#333] rounded-md text-body-md text-ink transition-colors outline-none resize-none"></textarea>
                </div>
              </div>

            </div>
            
            <button type="submit" [disabled]="isLoading() || !date || !time || !people"
                    class="w-full button-dark mt-xl flex items-center justify-center gap-xs disabled:opacity-50">
              <span *ngIf="!isLoading()">Confirm Reservation</span>
              <span *ngIf="isLoading()">Processing...</span>
              <lucide-icon *ngIf="!isLoading()" name="arrow-right" class="size-4"></lucide-icon>
            </button>
          </form>
          
        </div>
        
        <!-- Custom Success Overlay -->
        <div *ngIf="isSuccess()" class="absolute inset-0 bg-canvas/95 backdrop-blur-sm flex flex-col items-center justify-center p-xl z-50 transition-all duration-500 animate-in fade-in zoom-in-95">
          <div class="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-xl">
            <lucide-icon name="check" class="size-10"></lucide-icon>
          </div>
          <h2 class="text-display-sm text-ink text-center m-0 mb-sm">
            Table Reserved
          </h2>
          <p class="text-center text-mute text-body-md m-0 mb-xl max-w-[280px]">
            Your reservation request has been successfully submitted. We look forward to hosting you!
          </p>
          <button (click)="closeSuccess()" class="w-full max-w-[280px] button-dark flex items-center justify-center">
            Return to Home
          </button>
        </div>

        <!-- Custom Error Toast -->
        <div *ngIf="errorMsg()" class="absolute top-lg left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-primary/10 border border-primary/20 rounded-md p-md flex items-start gap-sm z-50 shadow-md animate-in slide-in-from-top-4 fade-in">
          <lucide-icon name="x-circle" class="size-5 text-primary mt-xs flex-shrink-0"></lucide-icon>
          <div class="flex-1">
            <h4 class="text-body-sm font-bold text-primary uppercase mb-xs m-0">Error</h4>
            <p class="text-caption text-primary/80 m-0">{{ errorMsg() }}</p>
          </div>
          <button type="button" (click)="errorMsg.set('')" class="text-primary hover:text-primary/80 transition-colors bg-transparent border-none cursor-pointer">
            <lucide-icon name="x" class="size-4"></lucide-icon>
          </button>
        </div>

      </div>
      
    </div>
  `,
  styles: [`
    /* Hide native date/time icons and stretch the clickable area */
    .hide-native-icon::-webkit-calendar-picker-indicator {
      position: absolute;
      right: 0;
      top: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      opacity: 0;
      cursor: pointer;
    }
    
    /* Remove number spin buttons */
    input[type="number"]::-webkit-inner-spin-button, 
    input[type="number"]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
  `]
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
  isSuccess = signal(false);
  errorMsg = signal('');

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
    this.errorMsg.set('');
    
    this.reservationService.createReservation(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err.error?.message || 'Could not create reservation. Please try again.');
        
        // Auto-hide toast after 5 seconds
        setTimeout(() => this.errorMsg.set(''), 5000);
      }
    });
  }
  
  closeSuccess() {
    this.isSuccess.set(false);
    this.router.navigate(['/']);
  }
}
