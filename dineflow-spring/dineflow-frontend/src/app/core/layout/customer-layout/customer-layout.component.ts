import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { LucideAngularModule, Utensils, Sun, Moon, LogOut } from 'lucide-angular';
import { CartSheetComponent } from '../../../shared/components/cart-sheet/cart-sheet.component';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, CartSheetComponent],
  template: `
    <div class="flex flex-col min-h-screen w-full bg-nova-paper dark:bg-slate-950 font-sans text-foreground transition-colors duration-500">
      <!-- Navbar -->
      <header class="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between shadow-sm">
        <a routerLink="/" class="flex items-center gap-2 group cursor-pointer decoration-none">
          <div class="size-9 rounded-full bg-[#241006] dark:bg-white flex items-center justify-center transition-transform group-hover:rotate-12">
            <lucide-icon name="utensils" class="text-white dark:text-primary size-5"></lucide-icon>
          </div>
          <span class="text-xl font-black tracking-tighter uppercase text-[#241006] dark:text-white m-0">
            Dine Flow
          </span>
        </a>

        <div class="flex items-center gap-3">
          <!-- Theme Toggle -->
          <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-border">
            <button (click)="setTheme('light')" [class.bg-primary]="theme() === 'light'" [class.text-white]="theme() === 'light'" class="p-1.5 rounded-full text-xs text-foreground hover:bg-white dark:hover:bg-slate-700 transition-all border-none bg-transparent cursor-pointer flex items-center justify-center" title="Light Mode">
              <lucide-icon name="sun" class="size-3.5"></lucide-icon>
            </button>
            <button (click)="setTheme('dark')" [class.bg-primary]="theme() === 'dark'" [class.text-white]="theme() === 'dark'" class="p-1.5 rounded-full text-xs text-foreground hover:bg-white dark:hover:bg-slate-700 transition-all border-none bg-transparent cursor-pointer flex items-center justify-center" title="Dark Mode">
              <lucide-icon name="moon" class="size-3.5"></lucide-icon>
            </button>
          </div>

          <ng-container *ngIf="user()">
            <a [routerLink]="['/profile', user()?.id]" class="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-border shadow-sm hover:border-primary transition-all decoration-none text-foreground">
              <div class="size-7 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center overflow-hidden uppercase shrink-0">
                <img *ngIf="user()?.avatar" [src]="user()?.avatar" class="size-full object-cover" alt="Avatar" />
                <span *ngIf="!user()?.avatar">{{ user()?.name?.charAt(0) || 'U' }}</span>
              </div>
              <span class="text-xs font-bold truncate max-w-[90px]">{{ user()?.name }}</span>
            </a>

            <button (click)="logout()" class="p-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-all cursor-pointer border-solid flex items-center justify-center" title="Logout">
              <lucide-icon name="log-out" class="size-4"></lucide-icon>
            </button>
          </ng-container>

          <app-cart-sheet></app-cart-sheet>
        </div>
      </header>

      <!-- Main Content -->
      <main class="w-full flex-1 p-4 md:p-8 max-w-7xl mx-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class CustomerLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  user = this.authService.currentUser;
  theme = signal<'light' | 'dark' | 'system'>('dark');
  
  readonly Utensils = Utensils;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly LogOut = LogOut;

  constructor() {
    const saved = localStorage.getItem('dineflow-theme') as 'light' | 'dark' | 'system' | null;
    if (saved) {
      this.theme.set(saved);
      this.applyThemeToDom(saved);
    }
  }

  setTheme(t: 'light' | 'dark' | 'system') {
    this.theme.set(t);
    localStorage.setItem('dineflow-theme', t);
    this.applyThemeToDom(t);
  }

  private applyThemeToDom(t: 'light' | 'dark' | 'system') {
    const root = document.documentElement;
    if (t === 'dark') root.classList.add('dark');
    else if (t === 'light') root.classList.remove('dark');
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

