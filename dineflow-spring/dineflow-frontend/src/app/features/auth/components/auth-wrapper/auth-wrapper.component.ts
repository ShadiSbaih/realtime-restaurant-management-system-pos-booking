import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Utensils, Sparkles, ShieldCheck, Star, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-auth-wrapper',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="h-screen w-screen flex bg-canvas text-ink overflow-hidden selection:bg-primary selection:text-white">
      
      <!-- Left Column: Authentication Form Area -->
      <div class="w-full lg:w-1/2 h-full flex flex-col justify-between p-lg sm:p-xl lg:p-xxxl overflow-y-auto bg-canvas z-10 custom-scrollbar">
        
        <!-- Top Navigation & Brand Header -->
        <header class="flex items-center justify-between shrink-0">
          <a routerLink="/" class="flex items-center gap-xs no-underline group cursor-pointer">
            <span class="text-ink">
              <lucide-icon name="utensils" class="size-5"></lucide-icon>
            </span>
            <span class="text-heading-md text-ink m-0">DineFlow</span>
          </a>

          <a routerLink="/" class="flex items-center gap-xs button-ghost">
            <lucide-icon name="arrow-left" class="size-4"></lucide-icon>
            <span>Back to Home</span>
          </a>
        </header>

        <!-- Projected Auth Content (Login / Register Form) -->
        <main class="w-full max-w-[420px] mx-auto my-auto py-xl shrink-0">
          <ng-content></ng-content>
        </main>

        <!-- Bottom Security & Copyright Footer -->
        <footer class="flex items-center justify-between pt-md text-caption text-mute shrink-0">
          <div class="flex items-center gap-xs">
            <lucide-icon name="shield-check" class="size-4 text-primary"></lucide-icon>
            <span>256-Bit SSL • Enterprise POS</span>
          </div>
          <div>
            &copy; 2026 DineFlow
          </div>
        </footer>

      </div>

      <!-- Right Column: Immersive Full-Height Culinary Showcase -->
      <div class="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden bg-surface-deep border-l border-hairline select-none">
        
        <!-- Full-Bleed High-Resolution Photograph -->
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop"
          alt="Luxury Dining Experience"
          class="absolute inset-0 w-full h-full object-cover opacity-80"
          referrerpolicy="no-referrer"
        />
        
        <div class="absolute inset-0 bg-gradient-to-t from-surface-deep via-surface-deep/50 to-transparent"></div>

        <!-- Top Right Status Badge -->
        <div class="absolute top-xl right-xl flex items-center gap-xs px-sm py-xs rounded-full bg-surface-dark/80 backdrop-blur-sm border border-[#333] text-on-dark shadow-sm">
          <div class="size-2 rounded-full bg-[#2b9a66] animate-pulse"></div>
          <span class="text-caption-tight">Live POS Network Active</span>
        </div>

        <!-- Bottom Editorial Quote Card -->
        <div class="absolute bottom-xl left-xl right-xl z-10">
          <div class="p-xl rounded-md bg-surface-dark/90 backdrop-blur-sm border border-[#333] shadow-md text-on-dark">
            <!-- Star Rating -->
            <div class="flex items-center gap-1 mb-md">
              <div *ngFor="let i of [1, 2, 3, 4, 5]" class="text-[#241006]">
                <lucide-icon name="star" class="size-3 fill-on-dark text-on-dark"></lucide-icon>
              </div>
              <span class="ml-xs text-caption-tight">Verified Excellence</span>
            </div>

            <!-- Quote -->
            <p class="text-heading-sm text-on-dark leading-relaxed mb-md">
              "DineFlow transformed our kitchen throughput and table management with unmatched speed, clarity, and elegance."
            </p>

            <!-- Author -->
            <div class="flex items-center gap-sm pt-md border-t border-[#333]">
              <div class="size-10 rounded-full shrink-0">
                <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=200&auto=format&fit=crop" alt="Chef Marco Valenti" class="size-full rounded-full object-cover" />
              </div>
              <div>
                <p class="text-body-sm text-on-dark font-bold m-0">Chef Marco Valenti</p>
                <p class="text-caption text-on-dark-mute m-0">Executive Culinary Director • Osteria Valenti</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class AuthWrapperComponent {
  readonly Utensils = Utensils;
  readonly Sparkles = Sparkles;
  readonly ShieldCheck = ShieldCheck;
  readonly Star = Star;
  readonly ArrowLeft = ArrowLeft;
}
