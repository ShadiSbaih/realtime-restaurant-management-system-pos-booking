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
            <span class="text-primary font-black uppercase tracking-widest text-[10px] mb-2 block">Reservations</span>
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
                  <lucide-icon name="calendar" class="size-3.5 text-primary"></lucide-icon>
                  Date
                </label>
                <input type="date" [(ngModel)]="date" name="date" required
                       class="w-full h-14 px-4 bg-[#fbf9f6] dark:bg-slate-900 border border-[#241006]/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold text-[#241006] dark:text-white transition-all outline-none cursor-pointer hover:bg-white dark:hover:bg-slate-800 shadow-sm">
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <!-- Time Input -->
                <div class="flex flex-col gap-2">
                  <label class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#241006]/70 dark:text-white/70">
                    <lucide-icon name="clock" class="size-3.5 text-primary"></lucide-icon>
                    Time
                  </label>
                  <input type="time" [(ngModel)]="time" name="time" required
                         class="w-full h-14 px-4 bg-[#fbf9f6] dark:bg-slate-900 border border-[#241006]/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold text-[#241006] dark:text-white transition-all outline-none cursor-pointer hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                </div>
                
                <!-- Party Size Input -->
                <div class="flex flex-col gap-2">
                  <label class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#241006]/70 dark:text-white/70">
                    <lucide-icon name="users" class="size-3.5 text-primary"></lucide-icon>
                    Party Size
                  </label>
                  <input type="number" [(ngModel)]="people" name="people" min="1" max="20" required placeholder="Guests"
                         class="w-full h-14 px-4 bg-[#fbf9f6] dark:bg-slate-900 border border-[#241006]/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold text-[#241006] dark:text-white transition-all outline-none hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                </div>
              </div>
              
              <!-- Notes Input -->
              <div class="flex flex-col gap-2 pt-1">
                <label class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#241006]/70 dark:text-white/70">
                  <div class="flex items-center gap-1.5">
                    <lucide-icon name="message-square" class="size-3.5 text-primary"></lucide-icon>
                    Special Requests
                  </div>
                  <span class="opacity-60 font-medium tracking-normal lowercase text-[10px]">(Optional)</span>
                </label>
                <textarea [(ngModel)]="notes" name="notes" rows="3" placeholder="Dietary requirements, celebrations..."
                          class="w-full p-4 bg-[#fbf9f6] dark:bg-slate-900 border border-[#241006]/10 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold text-[#241006] dark:text-white transition-all outline-none resize-none hover:bg-white dark:hover:bg-slate-800 shadow-sm"></textarea>
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
