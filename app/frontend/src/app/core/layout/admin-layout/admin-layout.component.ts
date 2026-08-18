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
      <div class="flex h-screen w-full overflow-hidden bg-canvas text-ink">

        <!-- Sidebar -->
        <aside class="w-60 h-full flex flex-col bg-surface-bone border-r border-hairline shrink-0 overflow-y-auto">

          <!-- Logo -->
          <div class="px-md py-lg border-b border-hairline">
            <a routerLink="/" class="flex items-center gap-sm no-underline">
              <img src="/logo.png" alt="Savora Logo" class="h-8 w-auto object-contain drop-shadow-sm" />
              <span class="font-bold text-heading-md tracking-tight text-ink">Savora</span>
            </a>
          </div>

          <!-- Nav -->
          <nav class="flex-1 py-md px-sm flex flex-col gap-xs">

            <!-- ADMINISTRATION -->
            <p class="text-caption font-bold uppercase tracking-widest text-mute px-sm mb-xs mt-sm">Administration</p>

            <!-- Dashboard (collapsible) -->
            <div>
              <button (click)="toggleSection('dashboard')"
                class="w-full flex items-center justify-between px-md py-sm rounded-md text-body-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
                [class.text-ink]="openSections().includes('dashboard')"
                [class.text-mute]="!openSections().includes('dashboard')">
                <span class="flex items-center gap-sm">
                  <lucide-icon name="layout-dashboard" class="size-4"></lucide-icon>
                  Dashboard
                </span>
                <lucide-icon name="chevron-right" class="size-3.5 transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('dashboard')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('dashboard')" class="pl-xl flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/admin/dashboard"
                  routerLinkActive="bg-canvas text-ink font-bold border border-hairline shadow-sm"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="block px-md py-xs rounded-md text-body-sm text-mute hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 no-underline transition-colors border border-transparent">
                  Overview
                </a>
                <a routerLink="/admin/activities-log"
                  routerLinkActive="bg-canvas text-ink font-bold border border-hairline shadow-sm"
                  class="block px-md py-xs rounded-md text-body-sm text-mute hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 no-underline transition-colors border border-transparent">
                  Activities Log
                </a>
              </div>
            </div>

            <!-- Menu Management (collapsible) -->
            <div>
              <button (click)="toggleSection('menu')"
                class="w-full flex items-center justify-between px-md py-sm rounded-md text-body-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
                [class.text-ink]="openSections().includes('menu')"
                [class.text-mute]="!openSections().includes('menu')">
                <span class="flex items-center gap-sm">
                  <lucide-icon name="utensils-crossed" class="size-4"></lucide-icon>
                  Menu Management
                </span>
                <lucide-icon name="chevron-right" class="size-3.5 transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('menu')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('menu')" class="pl-xl flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/admin/menu"
                  routerLinkActive="bg-canvas text-ink font-bold border border-hairline shadow-sm"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="block px-md py-xs rounded-md text-body-sm text-mute hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 no-underline transition-colors border border-transparent">
                  All Menu Items
                </a>
                <a routerLink="/admin/menu/categories"
                  routerLinkActive="bg-canvas text-ink font-bold border border-hairline shadow-sm"
                  class="block px-md py-xs rounded-md text-body-sm text-mute hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 no-underline transition-colors border border-transparent">
                  Categories &amp; Create Item
                </a>
              </div>
            </div>

            <!-- Bookings (collapsible) -->
            <div>
              <button (click)="toggleSection('bookings')"
                class="w-full flex items-center justify-between px-md py-sm rounded-md text-body-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
                [class.text-ink]="openSections().includes('bookings')"
                [class.text-mute]="!openSections().includes('bookings')">
                <span class="flex items-center gap-sm">
                  <lucide-icon name="calendar" class="size-4"></lucide-icon>
                  Bookings
                </span>
                <lucide-icon name="chevron-right" class="size-3.5 transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('bookings')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('bookings')" class="pl-xl flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/admin/reservations"
                  routerLinkActive="bg-canvas text-ink font-bold border border-hairline shadow-sm"
                  class="block px-md py-xs rounded-md text-body-sm text-mute hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 no-underline transition-colors border border-transparent">
                  Reservations
                </a>
              </div>
            </div>

            <!-- Users & Staff (admin only, collapsible) -->
            <div *ngIf="authService.hasRole(['ADMIN'])">
              <button (click)="toggleSection('users')"
                class="w-full flex items-center justify-between px-md py-sm rounded-md text-body-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
                [class.text-ink]="openSections().includes('users')"
                [class.text-mute]="!openSections().includes('users')">
                <span class="flex items-center gap-sm">
                  <lucide-icon name="users" class="size-4"></lucide-icon>
                  Users &amp; Staff
                </span>
                <lucide-icon name="chevron-right" class="size-3.5 transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('users')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('users')" class="pl-xl flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/admin/users"
                  routerLinkActive="bg-canvas text-ink font-bold border border-hairline shadow-sm"
                  class="block px-md py-xs rounded-md text-body-sm text-mute hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 no-underline transition-colors border border-transparent">
                  User Management
                </a>
              </div>
            </div>

            <!-- POINT OF SALE -->
            <p class="text-caption font-bold uppercase tracking-widest text-mute px-sm mb-xs mt-md">Point of Sale</p>

            <!-- Point of Sale (collapsible) -->
            <div>
              <button (click)="toggleSection('pos')"
                class="w-full flex items-center justify-between px-md py-sm rounded-md text-body-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
                [class.text-ink]="openSections().includes('pos')"
                [class.text-mute]="!openSections().includes('pos')">
                <span class="flex items-center gap-sm">
                  <lucide-icon name="grid-2x2" class="size-4"></lucide-icon>
                  Point of Sale
                </span>
                <lucide-icon name="chevron-right" class="size-3.5 transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('pos')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('pos')" class="pl-xl flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/pos/tables"
                  routerLinkActive="bg-canvas text-ink font-bold border border-hairline shadow-sm"
                  class="block px-md py-xs rounded-md text-body-sm text-mute hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 no-underline transition-colors border border-transparent">
                  Tables
                </a>
                <a routerLink="/pos/new-order"
                  routerLinkActive="bg-canvas text-ink font-bold border border-hairline shadow-sm"
                  class="block px-md py-xs rounded-md text-body-sm text-mute hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 no-underline transition-colors border border-transparent">
                  New Order
                </a>
              </div>
            </div>

            <!-- Kitchen & Orders (collapsible) -->
            <div>
              <button (click)="toggleSection('kitchen')"
                class="w-full flex items-center justify-between px-md py-sm rounded-md text-body-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
                [class.text-ink]="openSections().includes('kitchen')"
                [class.text-mute]="!openSections().includes('kitchen')">
                <span class="flex items-center gap-sm">
                  <lucide-icon name="chef-hat" class="size-4"></lucide-icon>
                  Kitchen &amp; Orders
                </span>
                <lucide-icon name="chevron-right" class="size-3.5 transition-transform duration-200"
                  [class.rotate-90]="openSections().includes('kitchen')"></lucide-icon>
              </button>
              <div *ngIf="openSections().includes('kitchen')" class="pl-xl flex flex-col gap-0.5 mt-0.5">
                <a routerLink="/admin/orders"
                  routerLinkActive="bg-canvas text-ink font-bold border border-hairline shadow-sm"
                  class="block px-md py-xs rounded-md text-body-sm text-mute hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 no-underline transition-colors border border-transparent">
                  All Orders
                </a>
              </div>
            </div>

          </nav>

          <!-- Bottom -->
          <div class="border-t border-hairline p-sm flex flex-col gap-sm">

            <!-- Theme Switcher -->
            <div class="flex items-center justify-center gap-1 bg-surface-bone border border-hairline rounded-md p-1">
              <button (click)="setTheme('light')" [class.bg-canvas]="theme() === 'light'" [class.shadow-sm]="theme() === 'light'"
                class="flex-1 flex items-center justify-center py-1.5 rounded-[4px] transition-all text-caption cursor-pointer border-none bg-transparent"
                title="Light Mode">
                <lucide-icon [img]="Sun" class="size-4" [class.text-ink]="theme() === 'light'" [class.text-mute]="theme() !== 'light'"></lucide-icon>
              </button>
              <button (click)="setTheme('dark')" [class.bg-canvas]="theme() === 'dark'" [class.shadow-sm]="theme() === 'dark'"
                class="flex-1 flex items-center justify-center py-1.5 rounded-[4px] transition-all text-caption cursor-pointer border-none bg-transparent"
                title="Dark Mode">
                <lucide-icon [img]="Moon" class="size-4" [class.text-ink]="theme() === 'dark'" [class.text-mute]="theme() !== 'dark'"></lucide-icon>
              </button>
              <button (click)="setTheme('system')" [class.bg-canvas]="theme() === 'system'" [class.shadow-sm]="theme() === 'system'"
                class="flex-1 flex items-center justify-center py-1.5 rounded-[4px] transition-all text-caption cursor-pointer border-none bg-transparent"
                title="System">
                <lucide-icon [img]="Monitor" class="size-4" [class.text-ink]="theme() === 'system'" [class.text-mute]="theme() !== 'system'"></lucide-icon>
              </button>
            </div>

            <!-- User -->
            <div class="flex items-center gap-sm p-sm rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
              <div class="size-8 rounded-md bg-canvas border border-hairline text-ink font-bold text-caption flex items-center justify-center shrink-0 uppercase overflow-hidden">
                <img *ngIf="user()?.image" [src]="user()?.image" class="size-full object-cover" alt="avatar" />
                <span *ngIf="!user()?.image">{{ user()?.name?.charAt(0) || 'U' }}</span>
              </div>
              <div class="flex flex-col overflow-hidden flex-1">
                <span class="text-body-sm font-bold text-ink truncate">{{ user()?.name || 'Admin' }}</span>
                <span class="text-caption text-mute truncate">{{ user()?.email }}</span>
              </div>
            </div>

            <!-- Settings -->
            <button class="flex items-center gap-sm px-md py-sm text-body-sm text-mute hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors w-full border-none bg-transparent cursor-pointer">
              <lucide-icon name="settings" class="size-4"></lucide-icon>
              Settings
            </button>

            <!-- Logout -->
            <button (click)="logout()" class="flex items-center gap-sm px-md py-sm text-body-sm text-mute hover:text-[#e02424] hover:bg-[#e02424]/10 rounded-md transition-colors w-full border-none bg-transparent cursor-pointer">
              <lucide-icon name="log-out" class="size-4"></lucide-icon>
              Log out
            </button>

          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col overflow-hidden bg-canvas">
          <div class="flex-1 overflow-auto p-xl">
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
    const saved = localStorage.getItem('savora-theme') as 'light' | 'dark' | 'system' | null;
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
    localStorage.setItem('savora-theme', t);
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
