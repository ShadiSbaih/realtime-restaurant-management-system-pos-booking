import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { filter } from 'rxjs/operators';
import {
  LucideAngularModule, Utensils, Settings, LogOut,
  LayoutDashboard, ChevronRight, UtensilsCrossed,
  BookOpen, Users, Grid2x2, ShoppingBag, Activity,
  Calendar, ChefHat, Sun, Moon, Monitor
} from 'lucide-angular';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="flex h-screen w-full overflow-hidden font-sans" [class]="themeClass()">
      <div class="flex h-screen w-full overflow-hidden bg-background text-foreground">

        <!-- Sidebar -->
        <aside class="w-60 h-full flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 overflow-y-auto">

          <!-- Logo -->
          <div class="px-4 py-5 border-b border-sidebar-border">
            <a routerLink="/" class="flex items-center gap-2 no-underline">
              <span class="bg-primary/20 text-primary rounded-md p-1.5 flex items-center justify-center">
                <lucide-icon name="utensils" [size]="18"></lucide-icon>
              </span>
              <span class="font-black text-lg tracking-tight text-foreground">DineFlow</span>
            </a>
          </div>

          <!-- Nav -->
          <nav class="flex-1 py-4 px-2 flex flex-col gap-1">

            <!-- ADMINISTRATION -->
            <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1 mt-2">Administration</p>

            <!-- Dashboard (collapsible) -->
            <div>
              <button (click)="toggleSection('dashboard')"
                class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors"
                [class.text-foreground]="openSections().includes('dashboard')"
                [class.text-muted-foreground]="!openSections().includes('dashboard')">
                <span class="flex items-center gap-3">
                  <lucide-icon name="layout-dashboard" [size]="16"></lucide-icon>
                  Dashboard
                </span>
                <lucide-icon name="chevron-right" [size]="14"
                  class="transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('dashboard')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('dashboard')" class="pl-8 flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/admin/dashboard"
                  routerLinkActive="bg-primary text-primary-foreground font-semibold"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline transition-colors">
                  Overview
                </a>
                <a routerLink="/admin/activities-log"
                  routerLinkActive="bg-primary text-primary-foreground font-semibold"
                  class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline transition-colors">
                  Activities Log
                </a>
              </div>
            </div>

            <!-- Menu Management (collapsible) -->
            <div>
              <button (click)="toggleSection('menu')"
                class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors"
                [class.text-foreground]="openSections().includes('menu')"
                [class.text-muted-foreground]="!openSections().includes('menu')">
                <span class="flex items-center gap-3">
                  <lucide-icon name="utensils-crossed" [size]="16"></lucide-icon>
                  Menu Management
                </span>
                <lucide-icon name="chevron-right" [size]="14"
                  class="transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('menu')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('menu')" class="pl-8 flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/admin/menu"
                  routerLinkActive="bg-primary text-primary-foreground font-semibold"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline transition-colors">
                  All Menu Items
                </a>
                <a routerLink="/admin/menu/categories"
                  routerLinkActive="bg-primary text-primary-foreground font-semibold"
                  class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline transition-colors">
                  Categories &amp; Create Item
                </a>
              </div>
            </div>

            <!-- Bookings (collapsible) -->
            <div>
              <button (click)="toggleSection('bookings')"
                class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors"
                [class.text-foreground]="openSections().includes('bookings')"
                [class.text-muted-foreground]="!openSections().includes('bookings')">
                <span class="flex items-center gap-3">
                  <lucide-icon name="calendar" [size]="16"></lucide-icon>
                  Bookings
                </span>
                <lucide-icon name="chevron-right" [size]="14"
                  class="transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('bookings')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('bookings')" class="pl-8 flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/admin/reservations"
                  routerLinkActive="bg-primary text-primary-foreground font-semibold"
                  class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline transition-colors">
                  Reservations
                </a>
              </div>
            </div>

            <!-- Users & Staff (admin only, collapsible) -->
            <div *ngIf="authService.hasRole(['ADMIN'])">
              <button (click)="toggleSection('users')"
                class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors"
                [class.text-foreground]="openSections().includes('users')"
                [class.text-muted-foreground]="!openSections().includes('users')">
                <span class="flex items-center gap-3">
                  <lucide-icon name="users" [size]="16"></lucide-icon>
                  Users &amp; Staff
                </span>
                <lucide-icon name="chevron-right" [size]="14"
                  class="transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('users')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('users')" class="pl-8 flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/admin/users"
                  routerLinkActive="bg-primary text-primary-foreground font-semibold"
                  class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline transition-colors">
                  User Management
                </a>
              </div>
            </div>

            <!-- POINT OF SALE -->
            <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1 mt-4">Point of Sale</p>

            <!-- Point of Sale (collapsible) -->
            <div>
              <button (click)="toggleSection('pos')"
                class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors"
                [class.text-foreground]="openSections().includes('pos')"
                [class.text-muted-foreground]="!openSections().includes('pos')">
                <span class="flex items-center gap-3">
                  <lucide-icon name="grid-2x2" [size]="16"></lucide-icon>
                  Point of Sale
                </span>
                <lucide-icon name="chevron-right" [size]="14"
                  class="transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('pos')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('pos')" class="pl-8 flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/pos/tables"
                  routerLinkActive="bg-primary text-primary-foreground font-semibold"
                  class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline transition-colors">
                  Tables
                </a>
                <a routerLink="/pos/new-order"
                  routerLinkActive="bg-primary text-primary-foreground font-semibold"
                  class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline transition-colors">
                  New Order
                </a>
              </div>
            </div>

            <!-- Kitchen & Orders (collapsible) -->
            <div>
              <button (click)="toggleSection('kitchen')"
                class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors"
                [class.text-foreground]="openSections().includes('kitchen')"
                [class.text-muted-foreground]="!openSections().includes('kitchen')">
                <span class="flex items-center gap-3">
                  <lucide-icon name="chef-hat" [size]="16"></lucide-icon>
                  Kitchen &amp; Orders
                </span>
                <lucide-icon name="chevron-right" [size]="14"
                  class="transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('kitchen')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('kitchen')" class="pl-8 flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/admin/orders"
                  routerLinkActive="bg-primary text-primary-foreground font-semibold"
                  class="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 no-underline transition-colors">
                  All Orders
                </a>
              </div>
            </div>

          </nav>

          <!-- Bottom -->
          <div class="border-t border-sidebar-border p-3 flex flex-col gap-2">

            <!-- Theme Switcher -->
            <div class="flex items-center justify-center gap-2 bg-muted/30 rounded-lg p-1.5">
              <button (click)="setTheme('light')" [class.bg-background]="theme() === 'light'"
                class="flex-1 flex items-center justify-center py-1 rounded-md transition-all text-base cursor-pointer border-none"
                title="Light Mode">🌞</button>
              <button (click)="setTheme('dark')" [class.bg-background]="theme() === 'dark'"
                class="flex-1 flex items-center justify-center py-1 rounded-md transition-all text-base cursor-pointer border-none"
                title="Dark Mode">🌙</button>
              <button (click)="setTheme('system')" [class.bg-background]="theme() === 'system'"
                class="flex-1 flex items-center justify-center py-1 rounded-md transition-all text-base cursor-pointer border-none"
                title="System">💻</button>
            </div>

            <!-- User -->
            <div class="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div class="size-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0 uppercase overflow-hidden">
                <img *ngIf="user()?.avatar" [src]="user()?.avatar" class="size-full object-cover" alt="avatar" />
                <span *ngIf="!user()?.avatar">{{ user()?.name?.charAt(0) || 'U' }}</span>
              </div>
              <div class="flex flex-col overflow-hidden flex-1">
                <span class="text-sm font-semibold text-foreground truncate">{{ user()?.name || 'Admin' }}</span>
                <span class="text-[11px] text-muted-foreground truncate">{{ user()?.email }}</span>
              </div>
            </div>

            <!-- Settings -->
            <button class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors w-full border-none bg-transparent cursor-pointer">
              <lucide-icon name="settings" [size]="15"></lucide-icon>
              Settings
            </button>

            <!-- Logout -->
            <button (click)="logout()" class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full border-none bg-transparent cursor-pointer">
              <lucide-icon name="log-out" [size]="15"></lucide-icon>
              Log out
            </button>

          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col overflow-hidden bg-background">
          <div class="flex-1 overflow-auto p-6">
            <router-outlet></router-outlet>
          </div>
        </main>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .rotate-90 { transform: rotate(90deg); }
    aside { scrollbar-width: none; }
    aside::-webkit-scrollbar { display: none; }
  `]
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);
  user = this.authService.currentUser;

  openSections = signal<string[]>(['dashboard', 'pos']);
  theme = signal<'light' | 'dark' | 'system'>('dark');

  // Icons registered for lucide-angular
  readonly Utensils = Utensils;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly LayoutDashboard = LayoutDashboard;
  readonly ChevronRight = ChevronRight;
  readonly UtensilsCrossed = UtensilsCrossed;
  readonly BookOpen = BookOpen;
  readonly Users = Users;
  readonly Grid2x2 = Grid2x2;
  readonly ShoppingBag = ShoppingBag;
  readonly Activity = Activity;
  readonly Calendar = Calendar;
  readonly ChefHat = ChefHat;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Monitor = Monitor;

  constructor() {
    // Auto-expand the relevant section when the route changes
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url: string = e.urlAfterRedirects || e.url || '';
        if (url.includes('/admin/dashboard') || url.includes('/admin/activities')) {
          this.openSection('dashboard');
        } else if (url.includes('/admin/menu')) {
          this.openSection('menu');
        } else if (url.includes('/admin/reservations')) {
          this.openSection('bookings');
        } else if (url.includes('/admin/users')) {
          this.openSection('users');
        } else if (url.includes('/pos/tables') || url.includes('/pos/new-order')) {
          this.openSection('pos');
        } else if (url.includes('/admin/orders')) {
          this.openSection('kitchen');
        }
      });

    // Restore persisted theme preference
    const saved = localStorage.getItem('dineflow-theme') as 'light' | 'dark' | 'system' | null;
    if (saved) {
      this.theme.set(saved);
      this.applyThemeToDom(saved);
    } else {
      this.applyThemeToDom('dark');
    }
  }

  openSection(section: string): void {
    if (!this.openSections().includes(section)) {
      this.openSections.update(s => [...s, section]);
    }
  }

  toggleSection(section: string): void {
    this.openSections.update(s =>
      s.includes(section) ? s.filter(x => x !== section) : [...s, section]
    );
  }

  themeClass(): string {
    const t = this.theme();
    if (t === 'dark') return 'dark';
    if (t === 'light') return '';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : '';
  }

  setTheme(t: 'light' | 'dark' | 'system'): void {
    this.theme.set(t);
    localStorage.setItem('dineflow-theme', t);
    this.applyThemeToDom(t);
  }

  private applyThemeToDom(t: 'light' | 'dark' | 'system'): void {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else if (t === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
