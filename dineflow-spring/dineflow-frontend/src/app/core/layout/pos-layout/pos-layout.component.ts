import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { filter } from 'rxjs/operators';
import { LucideAngularModule, Utensils, Settings, LogOut, LayoutDashboard, ChevronRight, UtensilsCrossed, Calendar, Users, Grid2x2, ChefHat } from 'lucide-angular';

@Component({
  selector: 'app-pos-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="flex h-screen w-full overflow-hidden" [class]="themeClass()">
    <div class="flex h-screen w-full overflow-hidden bg-background text-foreground">

      <!-- Sidebar (same as admin) -->
      <aside class="w-60 h-full flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 overflow-y-auto" style="scrollbar-width:none">

        <div class="px-4 py-5 border-b border-sidebar-border">
          <a routerLink="/" class="flex items-center gap-2 no-underline">
            <span class="bg-primary/20 text-primary rounded-md p-1.5 flex items-center justify-center">
              <lucide-icon name="utensils" [size]="18"></lucide-icon>
            </span>
            <span class="font-black text-lg tracking-tight text-foreground">DineFlow</span>
          </a>
        </div>

        <nav class="flex-1 py-4 px-2 flex flex-col gap-1">
          <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1 mt-2">Administration</p>

          <div>
            <button (click)="toggleSection('dashboard')" class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-muted-foreground">
              <span class="flex items-center gap-3"><lucide-icon name="layout-dashboard" [size]="16"></lucide-icon>Dashboard</span>
              <lucide-icon name="chevron-right" [size]="14" [class.rotate-90]="openSections().includes('dashboard')"></lucide-icon>
            </button>
            <div *ngIf="openSections().includes('dashboard')" class="pl-8 flex flex-col gap-0.5 mt-0.5">
              <a routerLink="/admin/dashboard" class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline">Overview</a>
              <a routerLink="/admin/activities-log" class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline">Activities Log</a>
            </div>
          </div>

          <a routerLink="/admin/menu" class="flex items-center justify-between px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 no-underline transition-colors">
            <span class="flex items-center gap-3"><lucide-icon name="utensils-crossed" [size]="16"></lucide-icon>Menu Management</span>
            <lucide-icon name="chevron-right" [size]="14"></lucide-icon>
          </a>

          <a routerLink="/admin/reservations" class="flex items-center justify-between px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 no-underline transition-colors">
            <span class="flex items-center gap-3"><lucide-icon name="calendar" [size]="16"></lucide-icon>Bookings</span>
            <lucide-icon name="chevron-right" [size]="14"></lucide-icon>
          </a>

          <a *ngIf="authService.hasRole(['ADMIN'])" routerLink="/admin/users" class="flex items-center justify-between px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 no-underline transition-colors">
            <span class="flex items-center gap-3"><lucide-icon name="users" [size]="16"></lucide-icon>Users &amp; Staff</span>
            <lucide-icon name="chevron-right" [size]="14"></lucide-icon>
          </a>

          <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1 mt-4">Point of Sale</p>

          <div>
            <button (click)="toggleSection('pos')" class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-foreground font-medium">
              <span class="flex items-center gap-3"><lucide-icon name="grid-2x2" [size]="16"></lucide-icon>Point of Sale</span>
              <lucide-icon name="chevron-right" [size]="14" [class.rotate-90]="openSections().includes('pos')"></lucide-icon>
            </button>
            <div *ngIf="openSections().includes('pos')" class="pl-8 flex flex-col gap-0.5 mt-0.5">
              <a routerLink="/pos/tables" routerLinkActive="bg-primary text-primary-foreground font-semibold" class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline">Tables</a>
              <a routerLink="/pos/new-order" routerLinkActive="bg-primary text-primary-foreground font-semibold" class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline">New Order</a>
            </div>
          </div>

          <div>
            <button (click)="toggleSection('kitchen')" class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-muted-foreground">
              <span class="flex items-center gap-3"><lucide-icon name="chef-hat" [size]="16"></lucide-icon>Kitchen &amp; Orders</span>
              <lucide-icon name="chevron-right" [size]="14" [class.rotate-90]="openSections().includes('kitchen')"></lucide-icon>
            </button>
            <div *ngIf="openSections().includes('kitchen')" class="pl-8 flex flex-col gap-0.5 mt-0.5">
              <a routerLink="/admin/orders" class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline">All Orders</a>
            </div>
          </div>
        </nav>

        <!-- Bottom -->
        <div class="border-t border-sidebar-border p-3 flex flex-col gap-2">
          <div class="flex items-center justify-center gap-2 bg-muted/30 rounded-lg p-1.5">
            <button (click)="setTheme('light')" [class.bg-background]="theme() === 'light'" class="flex-1 flex items-center justify-center py-1 rounded-md text-base cursor-pointer border-none">🌞</button>
            <button (click)="setTheme('dark')" [class.bg-background]="theme() === 'dark'" class="flex-1 flex items-center justify-center py-1 rounded-md text-base cursor-pointer border-none">🌙</button>
            <button (click)="setTheme('system')" [class.bg-background]="theme() === 'system'" class="flex-1 flex items-center justify-center py-1 rounded-md text-base cursor-pointer border-none">💻</button>
          </div>
          <div class="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
            <div class="size-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0 uppercase overflow-hidden">
              <img *ngIf="user()?.avatar" [src]="user()?.avatar" class="size-full object-cover" />
              <span *ngIf="!user()?.avatar">{{ user()?.name?.charAt(0) || 'U' }}</span>
            </div>
            <div class="flex flex-col overflow-hidden flex-1">
              <span class="text-sm font-semibold text-foreground truncate">{{ user()?.name }}</span>
              <span class="text-[11px] text-muted-foreground truncate">{{ user()?.email }}</span>
            </div>
          </div>
          <button class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md w-full border-none bg-transparent cursor-pointer">
            <lucide-icon name="settings" [size]="15"></lucide-icon> Settings
          </button>
          <button (click)="logout()" class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md w-full border-none bg-transparent cursor-pointer">
            <lucide-icon name="log-out" [size]="15"></lucide-icon> Log out
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="flex-1 flex flex-col overflow-hidden bg-background">
        <div class="flex-1 overflow-auto p-6">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
    </div>
  `,
  styles: [`.rotate-90 { transform: rotate(90deg); }`]
})
export class PosLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);
  user = this.authService.currentUser;
  openSections = signal<string[]>(['pos']);
  theme = signal<'light' | 'dark' | 'system'>('dark');

  constructor() {
    const saved = localStorage.getItem('dineflow-theme') as any;
    if (saved) this.theme.set(saved);
  }

  themeClass() {
    const t = this.theme();
    if (t === 'dark') return 'dark';
    if (t === 'light') return '';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : '';
  }

  toggleSection(s: string) {
    this.openSections.update(arr => arr.includes(s) ? arr.filter(x => x !== s) : [...arr, s]);
  }

  setTheme(t: 'light' | 'dark' | 'system') {
    this.theme.set(t);
    localStorage.setItem('dineflow-theme', t);
    const root = document.documentElement;
    if (t === 'dark') root.classList.add('dark');
    else if (t === 'light') root.classList.remove('dark');
    else { if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark'); else root.classList.remove('dark'); }
  }

  logout() { this.authService.logout(); }
}
