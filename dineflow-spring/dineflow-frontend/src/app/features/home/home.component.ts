import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { ItemsComponent } from './components/items/items.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ItemsComponent],
  template: `
    <div class="space-y-8 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
      
      <!-- Signature DineFlow Hero Box (Warm Salmon/Orange Gradient in ALL modes) -->
      <div class="relative min-h-[75vh] rounded-[32px] overflow-hidden bg-gradient-to-br from-[#fbd6cb] via-[#f4401c] to-[#d9381e] transition-all duration-700 shadow-2xl flex items-center">
        
        <!-- Authentic Halftone Dotted Pattern Overlay -->
        <div
          class="absolute inset-0 opacity-25 pointer-events-none"
          style="--dot-color:#241006; background-image: radial-gradient(var(--dot-color) 2px, transparent 2px); background-size: 24px 24px; mask-image: linear-gradient(to bottom, transparent, black 60%); -webkit-mask-image: linear-gradient(to bottom, transparent, black 60%);"
        ></div>

        <!-- Hero Content Grid (2 Columns, cleanly contained without overflow) -->
        <section class="relative z-10 w-full px-6 sm:px-12 lg:px-16 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Text Content (7 Columns) -->
          <div class="lg:col-span-7 space-y-8 text-center lg:text-left z-20">
            
        
            <!-- High-contrast typography: #241006 coffee obsidian and crisp white -->
            <h1 class="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.9] text-[#241006] uppercase m-0 drop-shadow-sm">
              FUEL <span class="text-white underline decoration-4 underline-offset-8 drop-shadow-md">your day</span><br />
              THE <span class="text-white drop-shadow-md">healthy</span> WAY
            </h1>
            
            <p class="text-base sm:text-xl text-[#241006]/95 max-w-lg mx-auto lg:mx-0 leading-relaxed font-bold">
              Discover our customizable salads, bowls, and artisan creations made from the freshest organic ingredients, sourced directly from local sustainable farms.
            </p>

            <!-- Action Buttons matching original styling -->
            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <a href="/#items" class="bg-[#241006] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest hover:scale-105 hover:shadow-2xl hover:shadow-black/30 transition-all decoration-none flex items-center gap-2">
                <span>Order Food</span>
                <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
              </a>
              
              <a routerLink="/reservation" class="bg-white/95 backdrop-blur-md text-[#241006] border border-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-white transition-all shadow-lg decoration-none">
                Make Reservation
              </a>
            </div>

            <!-- Quick Stats Pill -->
            <div class="pt-4 flex items-center justify-center lg:justify-start gap-6 text-[#241006]/90 text-xs font-black uppercase tracking-wider">
              <div class="flex items-center gap-1.5">
                <lucide-icon name="check-circle-2" [size]="16" class="text-white drop-shadow-sm"></lucide-icon>
                <span>100% Organic Produce</span>
              </div>
              <div class="flex items-center gap-1.5">
                <lucide-icon name="clock" [size]="16" class="text-white drop-shadow-sm"></lucide-icon>
                <span>15-Min Average Prep</span>
              </div>
            </div>

          </div>

          <!-- Hero Image Container (5 Columns, perfectly centered and contained) -->
          <div class="lg:col-span-5 flex justify-center items-center relative z-10 py-6 lg:py-0">
            <div class="relative w-full max-w-md lg:max-w-none aspect-square flex items-center justify-center">
              
              <!-- Subtle glow behind food tray -->
              <div class="absolute inset-4 rounded-full bg-white/30 blur-2xl pointer-events-none"></div>
              
              <!-- Cleanly contained hero image without horizontal overflow -->
              <img src="/hero.png" alt="Healthy Food Tray" class="w-full h-auto max-h-[480px] object-contain drop-shadow-[0_25px_35px_rgba(36,16,6,0.35)] animate-float transition-transform hover:scale-105 duration-500 relative z-10" />
            </div>
          </div>

        </section>
      </div>

      <!-- Items / Menu Section -->
      <div class="w-full pt-8 pb-16" id="items">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-border pb-4">
          <div>
            <span class="text-xs font-black uppercase tracking-widest text-primary mb-1 block">Fresh From Our Kitchen</span>
            <h2 class="font-black text-2xl sm:text-3xl text-foreground m-0">
              Choose Any Meal From Here
            </h2>
          </div>
          <p class="text-xs font-semibold text-muted-foreground m-0 max-w-xs">
            Handcrafted daily by executive chefs using seasonal local harvest.
          </p>
        </div>
        
        <app-items></app-items>
      </div>

    </div>
  `,
  styles: []
})
export class HomeComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  user = this.authService.currentUser;
}
