import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Utensils, Zap, BarChart3, Table as TableIcon } from 'lucide-angular';

@Component({
  selector: 'app-auth-wrapper',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-background">
      <div
        class="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[750px] border border-slate-100 dark:border-slate-800 transition-all animate-in fade-in zoom-in duration-500"
      >
        <!-- Left Side: Projected Content (Forms) -->
        <ng-content></ng-content>

        <!-- Right Side - Visual -->
        <div class="hidden md:block flex-1 relative p-3">
          <div class="w-full h-full rounded-xl overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop"
              alt="Restaurant Interior"
              class="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div class="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent"></div>

            <!-- Top Right Card -->
            <div class="absolute top-8 right-8 w-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-800/50">
              <div class="text-3xl font-black text-slate-900 dark:text-white mb-1">
                2,500+
              </div>
              <div class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight mb-4">
                Restaurants trust <br /> DineFlow daily
              </div>
              <div class="flex -space-x-2">
                <div *ngFor="let i of [1, 2, 3, 4]" class="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden">
                  <img [src]="'https://i.pravatar.cc/100?img=' + (i + 10)" alt="User" />
                </div>
                <div class="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  +1k
                </div>
              </div>
            </div>

            <!-- Logo Overlay -->
            <div class="absolute top-12 left-12 flex items-center gap-3 text-white group">
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <lucide-icon name="utensils" class="text-white w-6 h-6"></lucide-icon>
              </div>
              <span class="text-2xl font-black tracking-tighter">
                DineFlow
              </span>
            </div>

            <!-- Center Text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-12 text-white mt-32 pointer-events-none">
              <h2 class="text-4xl font-black tracking-tight mb-4 leading-none">
                Efficiency <br /> Meets Elegance
              </h2>
              <p class="text-sm font-medium opacity-90 leading-relaxed max-w-xs">
                Manage your entire restaurant ecosystem from a single, beautiful
                interface.
              </p>
            </div>

            <!-- Bottom Tags -->
            <div class="absolute bottom-12 left-0 right-0 flex flex-wrap justify-center gap-3 px-8">
              <div class="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest">
                <div class="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <lucide-icon name="zap" class="size-3"></lucide-icon>
                </div>
                Fast_Sync
              </div>
              <div class="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest">
                <div class="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <lucide-icon name="table" class="size-3"></lucide-icon>
                </div>
                Live_Floor
              </div>
              <div class="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest">
                <div class="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                  <lucide-icon name="bar-chart-3" class="size-3"></lucide-icon>
                </div>
                AI_Insights
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
  readonly Zap = Zap;
  readonly BarChart3 = BarChart3;
  readonly TableIcon = TableIcon;
}
