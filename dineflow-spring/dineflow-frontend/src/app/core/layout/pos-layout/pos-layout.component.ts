import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { filter } from 'rxjs/operators';
import { LucideAngularModule, Utensils, Settings, LogOut, LayoutDashboard, ChevronRight, UtensilsCrossed, Calendar, Users, Grid2x2, ChefHat, Sun, Moon, Monitor } from 'lucide-angular';

@Component({
  selector: 'app-pos-layout',
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
            <ng-container *ngIf="authService.hasRole(['ADMIN', 'MANAGER'])">
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

              <!-- Menu Management -->
              <a routerLink="/admin/menu" class="w-full flex items-center justify-between px-md py-sm rounded-md text-body-sm text-mute hover:bg-black/5 dark:hover:bg-white/10 hover:text-ink no-underline transition-colors border-none bg-transparent">
                <span class="flex items-center gap-sm"><lucide-icon name="utensils-crossed" class="size-4"></lucide-icon>Menu Management</span>
                <lucide-icon name="chevron-right" class="size-3.5"></lucide-icon>
              </a>

              <!-- Bookings -->
              <a routerLink="/admin/reservations" class="w-full flex items-center justify-between px-md py-sm rounded-md text-body-sm text-mute hover:bg-black/5 dark:hover:bg-white/10 hover:text-ink no-underline transition-colors border-none bg-transparent">
                <span class="flex items-center gap-sm"><lucide-icon name="calendar" class="size-4"></lucide-icon>Bookings</span>
                <lucide-icon name="chevron-right" class="size-3.5"></lucide-icon>
              </a>

              <!-- Users & Staff -->
              <a *ngIf="authService.hasRole(['ADMIN'])" routerLink="/admin/users" class="w-full flex items-center justify-between px-md py-sm rounded-md text-body-sm text-mute hover:bg-black/5 dark:hover:bg-white/10 hover:text-ink no-underline transition-colors border-none bg-transparent">
                <span class="flex items-center gap-sm"><lucide-icon name="users" class="size-4"></lucide-icon>Users &amp; Staff</span>
                <lucide-icon name="chevron-right" class="size-3.5"></lucide-icon>
              </a>
            </ng-container>

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
  styles: [`.rotate-90 { transform: rotate(90deg); }`]
})
export class PosLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);
  user = this.authService.currentUser;
  openSections = signal<string[]>(['pos']);
  theme = signal<'light' | 'dark' | 'system'>('dark');
  
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Monitor = Monitor;

  constructor() {
    const saved = localStorage.getItem('savora-theme') as any;
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
    localStorage.setItem('savora-theme', t);
    const root = document.documentElement;
    if (t === 'dark') root.classList.add('dark');
    else if (t === 'light') root.classList.remove('dark');
    else { if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark'); else root.classList.remove('dark'); }
  }

  logout() { this.authService.logout(); }
}
