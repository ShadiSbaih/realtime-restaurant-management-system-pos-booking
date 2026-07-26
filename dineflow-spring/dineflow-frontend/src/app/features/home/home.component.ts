import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LucideAngularModule, Utensils } from 'lucide-angular';
import { ItemsComponent } from './components/items/items.component';
import { CartSheetComponent } from '../../shared/components/cart-sheet/cart-sheet.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ItemsComponent, CartSheetComponent],
  template: `
    <div class="space-y-2">
      <!-- Hero Section -->
      <div class="relative min-h-[calc(100vh-1.5rem)] rounded-xl overflow-hidden bg-gradient-to-br from-[#fbd6cb] via-[#f4401c] to-primary dark:from-slate-900 dark:via-primary/20 dark:to-slate-950 transition-all duration-700">
        <!-- Halftone Dotted Pattern Overlay -->
        <div
          class="absolute inset-0 opacity-20 dark:opacity-20 pointer-events-none"
          style="--dot-color:#241006; background-image: radial-gradient(var(--dot-color) 2px, transparent 2px); background-size: 24px 24px; mask-image: linear-gradient(to bottom, transparent, black 60%); -webkit-mask-image: linear-gradient(to bottom, transparent, black 60%);"
        ></div>

        <!-- Header -->
        <header class="relative z-50 w-full lg:max-w-[80%] mx-auto px-8 lg:px-12 py-8 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2 group cursor-pointer decoration-none">
            <div class="size-6 lg:size-10 rounded-full bg-[#241006] dark:bg-white flex items-center justify-center transition-transform group-hover:rotate-12">
              <lucide-icon name="utensils" class="text-white dark:text-primary size-4 lg:size-6"></lucide-icon>
            </div>
            <span class="text-lg lg:text-2xl font-black tracking-tighter uppercase text-[#241006] dark:text-white m-0">
              Dine Flow
            </span>
          </a>

          <div class="hidden lg:flex items-center gap-10">
            <a href="#menu" class="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors decoration-none">Menu +</a>
            <a href="#about" class="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors decoration-none">About Us</a>
            <a href="#locations" class="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors decoration-none">Locations</a>
            <a href="#resources" class="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors decoration-none">Resources</a>
            <a href="#contact" class="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors decoration-none">Contact Us</a>
          </div>

          <div class="flex items-center gap-4">
            <ng-container *ngIf="!user()">
              <a routerLink="/login" class="bg-[#241006] dark:bg-white text-white dark:text-primary px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg decoration-none">
                Sign In
              </a>
            </ng-container>
            <ng-container *ngIf="user()">
              <ng-container *ngIf="authService.hasRole(['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN'])">
                <a routerLink="/admin/dashboard" class="bg-[#241006] dark:bg-white text-white dark:text-primary px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg decoration-none">
                  Portal
                </a>
              </ng-container>
              <a [routerLink]="['/profile', user()?.id]" class="text-sm font-medium text-[#241006] dark:text-white decoration-none hover:underline">
                Welcome, {{ user()?.name }}
              </a>
              <button (click)="logout()" class="text-sm font-medium text-[#241006] dark:text-white decoration-none cursor-pointer border-0 bg-transparent hover:underline">
                 Logout
              </button>
            </ng-container>

            <!-- Cart Sheet Trigger -->
            <app-cart-sheet></app-cart-sheet>
          </div>
        </header>

        <!-- Hero Content -->
        <section class="relative z-10 max-w-[80%] mx-auto px-8 lg:px-12 flex flex-col lg:flex-row items-center min-h-[80vh] pt-12 lg:pt-0">
          <!-- Text Content -->
          <div class="w-full lg:max-w-2xl space-y-8 text-center lg:text-left z-20">
            <div>
              <h1 class="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] text-[#241006] dark:text-white uppercase m-0">
                FUEL <span class="text-luxury text-white dark:text-primary lowercase">Your day</span><br />
                the <span class="text-luxury lowercase">healthy</span> way
              </h1>
              <p class="mt-8 text-lg md:text-xl text-[#241006]/80 dark:text-white/80 max-w-md mx-auto lg:mx-0 leading-relaxed font-medium">
                Discover our customizable salads and bowls made from the freshest ingredients, sourced from local farms.
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a routerLink="/#items" class="bg-[#241006] dark:bg-white text-white dark:text-primary px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-black/20 decoration-none">
                Order Food
              </a>
              <a routerLink="/reservation" class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[#241006] dark:text-white border border-white/20 px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-lg decoration-none">
                Make Reservation
              </a>
            </div>
          </div>

          <!-- Hero Image Container -->
          <div class="relative w-[120%] left-[10%] mt-8 lg:absolute lg:right-[-14%] lg:bottom-[-5%] lg:left-auto lg:w-[70%] lg:mt-0 pointer-events-none z-10">
            <img src="/hero.png" alt="Healthy Food Tray" class="w-full h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] animate-float" />
          </div>
        </section>
      </div>

      <!-- Items Section -->
      <div class="min-h-[500px] mt-8" id="items">
        <h1 class="font-bold text-xl text-primary mb-4 ml-5 mt-3">
          Choose Any Meal From Here
        </h1>
        
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
  
  readonly Utensils = Utensils;

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
