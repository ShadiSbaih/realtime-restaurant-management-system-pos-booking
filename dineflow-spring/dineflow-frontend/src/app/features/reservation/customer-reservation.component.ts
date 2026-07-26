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
    <div class="min-h-[calc(100vh-80px)] w-full flex flex-col lg:flex-row bg-background overflow-hidden">
      
      <!-- Left Side: Cinematic Full-Bleed Image -->
      <div class="w-full lg:w-1/2 relative min-h-[40vh] lg:min-h-full flex-shrink-0">
        <!-- High-res Image Cover -->
        <img src="/artisan_hero_platter.png" alt="Artisan Dining" class="absolute inset-0 w-full h-full object-cover object-center" />
        
        <!-- Premium Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
        
        <!-- Overlay Content -->
        <div class="absolute bottom-12 left-8 right-8 lg:left-16 lg:right-16 z-10">
        
          <h2 class="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4">
            Taste the<br/><span class="text-primary">Extraordinary</span>
          </h2>
          <p class="text-white/80 text-sm lg:text-base font-medium max-w-md leading-relaxed">
            Every detail is crafted with passion. Join us for a dining experience that transcends the ordinary and delights the senses.
          </p>
        </div>
      </div>

      <!-- Right Side: Sleek Booking Form -->
      <div class="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 relative bg-[#ffffff] dark:bg-[#0b0f19]">
        <div class="w-full max-w-md mx-auto lg:mx-0">
          
          <!-- Header -->
          <div class="mb-10">
            <h1 class="text-4xl font-black text-[#241006] dark:text-white uppercase tracking-tight m-0">
              Book Your Table
            </h1>
            <p class="text-[#241006]/60 dark:text-white/60 text-sm mt-3 font-medium">Select your details below to confirm your culinary experience.</p>
          </div>
          
          <form (ngSubmit)="submitReservation()" class="space-y-6">
            
            <div class="space-y-6">
              
              <!-- Date Input -->
              <div class="flex flex-col gap-2">
                <label class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#241006]/70 dark:text-white/70">
                  Date
                </label>
                <div class="relative group">
                  <input type="date" [(ngModel)]="date" name="date" required
                         class="w-full h-14 px-4 pr-12 bg-[#fbf9f6] dark:bg-slate-900 border border-[#241006]/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold text-[#241006] dark:text-white transition-all outline-none cursor-pointer hover:bg-white dark:hover:bg-slate-800 shadow-sm hide-native-icon">
                  <lucide-icon name="calendar" class="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-[#241006]/40 dark:text-white/40 group-focus-within:text-primary transition-colors pointer-events-none"></lucide-icon>
                </div>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <!-- Time Input -->
                <div class="flex flex-col gap-2">
                  <label class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#241006]/70 dark:text-white/70">
                    Time
                  </label>
                  <div class="relative group">
                    <input type="time" [(ngModel)]="time" name="time" required
                           class="w-full h-14 px-4 pr-12 bg-[#fbf9f6] dark:bg-slate-900 border border-[#241006]/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold text-[#241006] dark:text-white transition-all outline-none cursor-pointer hover:bg-white dark:hover:bg-slate-800 shadow-sm hide-native-icon">
                    <lucide-icon name="clock" class="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-[#241006]/40 dark:text-white/40 group-focus-within:text-primary transition-colors pointer-events-none"></lucide-icon>
                  </div>
                </div>
                
                <!-- Party Size Input -->
                <div class="flex flex-col gap-2">
                  <label class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#241006]/70 dark:text-white/70">
                    Party Size
                  </label>
                  <div class="relative group">
                    <input type="number" [(ngModel)]="people" name="people" min="1" max="20" required placeholder="Guests"
                           class="w-full h-14 px-4 pr-12 bg-[#fbf9f6] dark:bg-slate-900 border border-[#241006]/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold text-[#241006] dark:text-white transition-all outline-none hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                    <lucide-icon name="users" class="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-[#241006]/40 dark:text-white/40 group-focus-within:text-primary transition-colors pointer-events-none"></lucide-icon>
                  </div>
                </div>
              </div>
              
              <!-- Notes Input -->
              <div class="flex flex-col gap-2 pt-1">
                <label class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#241006]/70 dark:text-white/70">
                  <div class="flex items-center gap-1.5">
                    Special Requests
                  </div>
                  <span class="opacity-60 font-medium tracking-normal lowercase text-[10px]">(Optional)</span>
                </label>
                <div class="relative group">
                  <lucide-icon name="message-square" class="absolute right-4 top-4 size-5 text-[#241006]/40 dark:text-white/40 group-focus-within:text-primary transition-colors pointer-events-none"></lucide-icon>
                  <textarea [(ngModel)]="notes" name="notes" rows="3" placeholder="Dietary requirements, celebrations..."
                            class="w-full pl-4 pr-12 py-4 bg-[#fbf9f6] dark:bg-slate-900 border border-[#241006]/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold text-[#241006] dark:text-white transition-all outline-none resize-none hover:bg-white dark:hover:bg-slate-800 shadow-sm"></textarea>
                </div>
              </div>

            </div>
            
            <button type="submit" [disabled]="isLoading() || !date || !time || !people"
                    class="w-full h-14 mt-8 bg-[#241006] dark:bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-widest text-xs rounded-xl transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer border-none shadow-xl hover:-translate-y-1 hover:shadow-2xl disabled:hover:translate-y-0">
              <span *ngIf="!isLoading()">Confirm Reservation</span>
              <span *ngIf="isLoading()">Processing...</span>
              <lucide-icon *ngIf="!isLoading()" name="arrow-right" class="size-4"></lucide-icon>
            </button>
          </form>
          
        </div>
        
        <!-- Custom Success Overlay -->
        <div *ngIf="isSuccess()" class="absolute inset-0 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-50 transition-all duration-500 animate-in fade-in zoom-in-95">
          <div class="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
            <lucide-icon name="check" class="size-10"></lucide-icon>
          </div>
          <h2 class="text-3xl font-black text-[#241006] dark:text-white uppercase tracking-tight text-center mb-3">
            Table Reserved
          </h2>
          <p class="text-center text-[#241006]/70 dark:text-white/70 font-medium mb-8 max-w-[280px]">
            Your reservation request has been successfully submitted. We look forward to hosting you!
          </p>
          <button (click)="closeSuccess()" class="w-full max-w-[280px] h-14 bg-[#241006] dark:bg-white text-white dark:text-[#0b0f19] font-black uppercase tracking-widest text-xs rounded-xl transition-transform active:scale-95 flex items-center justify-center shadow-lg hover:shadow-xl">
            Return to Home
          </button>
        </div>

        <!-- Custom Error Toast -->
        <div *ngIf="errorMsg()" class="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl p-4 flex items-start gap-3 z-50 shadow-2xl animate-in slide-in-from-top-4 fade-in">
          <lucide-icon name="x-circle" class="size-5 text-red-500 mt-0.5 flex-shrink-0"></lucide-icon>
          <div class="flex-1">
            <h4 class="text-sm font-bold text-red-800 dark:text-red-200 uppercase tracking-wider mb-1">Error</h4>
            <p class="text-xs text-red-600 dark:text-red-400 font-medium">{{ errorMsg() }}</p>
          </div>
          <button type="button" (click)="errorMsg.set('')" class="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">
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
