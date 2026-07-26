import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../../services/cart.service';
import { LucideAngularModule, Utensils, Sun, Moon, LogOut, LayoutDashboard, Grid2x2, User, Sparkles, ShoppingCart } from 'lucide-angular';
import { CartSheetComponent } from '../../../shared/components/cart-sheet/cart-sheet.component';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, CartSheetComponent],
  template: `
    <div class="flex flex-col min-h-screen w-full bg-background font-sans text-foreground transition-colors duration-500 selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      
      <!-- Authentic DineFlow Global Navbar -->
      <header class="sticky top-0 z-50 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-border/80 px-6 md:px-12 py-4 flex items-center justify-between shadow-sm transition-all">
        <!-- Brand Logo -->
        <a routerLink="/" class="flex items-center gap-2.5 group cursor-pointer decoration-none">
          <div class="size-9 rounded-full bg-[#241006] dark:bg-white flex items-center justify-center transition-transform group-hover:rotate-12 shadow-sm">
            <lucide-icon name="utensils" class="text-white dark:text-primary size-5"></lucide-icon>
          </div>
          <span class="text-xl font-black tracking-tighter uppercase text-[#241006] dark:text-white m-0">
            Dine Flow
          </span>
        </a>

        <!-- Center Navigation Links (Matching Authentic Design System) -->
        <nav class="hidden lg:flex items-center gap-10">
          <a href="/#items" class="text-sm font-bold text-[#241006]/75 dark:text-white/75 hover:text-[#241006] dark:hover:text-white transition-colors decoration-none">Menu +</a>
          <a href="/#about" class="text-sm font-bold text-[#241006]/75 dark:text-white/75 hover:text-[#241006] dark:hover:text-white transition-colors decoration-none">About Us</a>
          <a href="/#locations" class="text-sm font-bold text-[#241006]/75 dark:text-white/75 hover:text-[#241006] dark:hover:text-white transition-colors decoration-none">Locations</a>
          <a href="/#resources" class="text-sm font-bold text-[#241006]/75 dark:text-white/75 hover:text-[#241006] dark:hover:text-white transition-colors decoration-none">Resources</a>
          <a href="/#contact" class="text-sm font-bold text-[#241006]/75 dark:text-white/75 hover:text-[#241006] dark:hover:text-white transition-colors decoration-none">Contact Us</a>
        </nav>

        <!-- Right Action Controls -->
        <div class="flex items-center gap-4">
          
          <!-- Theme Toggle Pill -->
          <div class="flex items-center bg-[#f4f4f2] dark:bg-slate-800 rounded-full p-1 border-2 border-[#241006]/15 dark:border-white/15 shadow-sm gap-1">
            <button 
              (click)="setTheme('light')" 
              [ngClass]="theme() !== 'dark' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/30 scale-105' : 'text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white hover:bg-[#241006]/5 dark:hover:bg-white/5'"
              class="p-2 rounded-full transition-all duration-300 border-none cursor-pointer flex items-center justify-center" 
              title="Light Mode">
              <lucide-icon name="sun" class="size-4"></lucide-icon>
            </button>
            <button 
              (click)="setTheme('dark')" 
              [ngClass]="theme() === 'dark' ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/30 scale-105' : 'text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white hover:bg-[#241006]/5 dark:hover:bg-white/5'"
              class="p-2 rounded-full transition-all duration-300 border-none cursor-pointer flex items-center justify-center" 
              title="Dark Mode">
              <lucide-icon name="moon" class="size-4"></lucide-icon>
            </button>
          </div>

          <!-- User Profile or Sign In -->
          <ng-container *ngIf="!user()">
            <a routerLink="/login" class="bg-foreground text-background dark:bg-white dark:text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all shadow-md decoration-none">
              Sign In
            </a>
          </ng-container>

          <ng-container *ngIf="user()">
            <a [routerLink]="['/profile', user()?.id]" class="flex items-center gap-2 py-1 pl-1 pr-3 rounded-xl bg-muted/50 dark:bg-slate-800/80 border border-border/80 hover:border-primary/50 transition-all decoration-none text-foreground">
              <div class="size-7 rounded-lg bg-primary/15 text-primary font-black text-xs flex items-center justify-center overflow-hidden uppercase shrink-0">
                <span *ngIf="!user()?.avatar">{{ user()?.name?.charAt(0) || 'U' }}</span>
              </div>
              <span class="text-xs font-bold truncate max-w-[100px]">{{ (user()?.name || 'User').split(' ')[0] }}</span>
            </a>

            <button (click)="logout()" class="p-2 rounded-xl bg-muted/50 dark:bg-slate-800/80 border border-border/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all cursor-pointer flex items-center justify-center" title="Logout">
              <lucide-icon name="log-out" class="size-4"></lucide-icon>
            </button>
          </ng-container>

          <!-- Shopping Cart Trigger Button -->
          <button (click)="cartService.openCart()" class="relative p-2 rounded-xl bg-transparent border-none text-[#241006] dark:text-white hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center" title="Shopping Cart">
            <lucide-icon name="shopping-cart" class="size-7"></lucide-icon>
            <span *ngIf="cartService.items().length > 0" class="absolute -top-1 -right-1 bg-primary text-white text-[11px] font-black rounded-full px-1.5 py-0.5 shadow-md">
              {{ cartService.items().length }}
            </span>
          </button>
        </div>
      </header>

      <!-- Main Full-Bleed Content Area -->
      <main class="w-full flex-1 flex flex-col">
        <router-outlet></router-outlet>
      </main>

      <!-- Full-Screen Cart Drawer (outside header to prevent backdrop-blur clipping, sliding full height from right) -->
      <app-cart-sheet></app-cart-sheet>
    </div>
  `,
  styles: []
})
export class CustomerLayoutComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  router = inject(Router);
  
  user = this.authService.currentUser;
  theme = signal<'light' | 'dark' | 'system'>('dark');
  
  readonly Utensils = Utensils;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly LogOut = LogOut;
  readonly ShoppingCart = ShoppingCart;

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

