import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Utensils, Sparkles, ShieldCheck, Star, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-auth-wrapper',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="h-screen w-screen flex bg-background text-foreground overflow-hidden selection:bg-primary selection:text-white">
      
      <!-- Left Column: Authentication Form Area -->
      <div class="w-full lg:w-1/2 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto bg-background z-10" style="scrollbar-width: none;">
        
        <!-- Top Navigation & Brand Header -->
        <header class="flex items-center justify-between shrink-0">
          <a routerLink="/" class="flex items-center gap-2.5 no-underline group cursor-pointer">
            <span class="bg-primary/10 text-primary border border-primary/20 rounded-xl p-2 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <lucide-icon name="utensils" [size]="18"></lucide-icon>
            </span>
            <span class="font-black text-xl tracking-tight text-foreground">DineFlow</span>
          </a>

          <a routerLink="/" class="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors no-underline">
            <lucide-icon name="arrow-left" [size]="14"></lucide-icon>
            <span>Back to Home</span>
          </a>
        </header>

        <!-- Projected Auth Content (Login / Register Form) -->
        <main class="w-full max-w-[420px] mx-auto my-auto py-6 shrink-0">
          <ng-content></ng-content>
        </main>

        <!-- Bottom Security & Copyright Footer -->
        <footer class="flex items-center justify-between pt-4 border-t border-border/40 text-[11px] font-medium text-muted-foreground shrink-0">
          <div class="flex items-center gap-1.5">
            <lucide-icon name="shield-check" [size]="14" class="text-primary"></lucide-icon>
            <span>256-Bit SSL • Enterprise POS</span>
          </div>
          <div>
            &copy; 2026 DineFlow
          </div>
        </footer>

      </div>

      <!-- Right Column: Immersive Full-Height Culinary Showcase -->
      <div class="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden bg-slate-950 border-l border-border/60 select-none">
        
        <!-- Full-Bleed High-Resolution Photograph -->
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop"
          alt="Luxury Dining Experience"
          class="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse-soft transition-transform duration-1000"
          referrerpolicy="no-referrer"
        />
        
        <!-- Smooth Architectural Gradients for Flawless Contrast -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-transparent"></div>
        <div class="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>

        <!-- Top Right Status Badge -->
        <div class="absolute top-8 right-8 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white shadow-lg">
          <div class="size-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="text-[11px] font-bold tracking-wider uppercase text-white/90">Live POS Network Active</span>
        </div>

        <!-- Bottom Editorial Quote Card -->
        <div class="absolute bottom-8 left-8 right-8 z-10">
          <div class="p-6 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 shadow-2xl text-white">
            <!-- Star Rating -->
            <div class="flex items-center gap-1 mb-3">
              <div *ngFor="let i of [1, 2, 3, 4, 5]" class="text-amber-400 flex items-center justify-center">
                <lucide-icon name="star" [size]="14" class="fill-current"></lucide-icon>
              </div>
              <span class="ml-2 text-xs font-bold text-white/80 uppercase tracking-wider">Verified Excellence</span>
            </div>

            <!-- Quote -->
            <p class="text-base sm:text-lg font-medium text-white/95 leading-relaxed mb-4 italic font-serif">
              &ldquo;DineFlow transformed our kitchen throughput and table management with unmatched speed, clarity, and elegance.&rdquo;
            </p>

            <!-- Author -->
            <div class="flex items-center gap-3 pt-3 border-t border-white/15">
              <div class="size-9 rounded-full bg-gradient-to-tr from-amber-500 to-primary p-[2px] shrink-0">
                <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=200&auto=format&fit=crop" alt="Chef Marco Valenti" class="size-full rounded-full object-cover" />
              </div>
              <div>
                <p class="text-xs font-bold text-white m-0 tracking-wide">Chef Marco Valenti</p>
                <p class="text-[10px] font-medium text-white/65 m-0 mt-0.5">Executive Culinary Director • Osteria Valenti</p>
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
