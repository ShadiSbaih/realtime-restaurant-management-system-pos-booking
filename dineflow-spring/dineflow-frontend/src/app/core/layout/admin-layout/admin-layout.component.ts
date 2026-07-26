import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { LucideAngularModule, Utensils, User, Settings, LogOut, LayoutDashboard, ShoppingCart, Menu, Grid2x2, Calendar, Users, Activity } from 'lucide-angular';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="flex h-screen w-full bg-secondary overflow-hidden font-sans text-foreground">
      
      <!-- Sidebar -->
      <aside class="w-[19rem] h-full flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300">
        <!-- Header -->
        <div class="p-4 mt-2">
          <a routerLink="/" class="flex items-center gap-3 decoration-none">
            <span class="rounded-lg bg-primary/30 p-2 text-primary flex items-center justify-center">
              <lucide-icon name="utensils" [size]="20"></lucide-icon>
            </span>
            <h1 class="text-xl font-extrabold tracking-tight text-foreground m-0">
              DineFlow
            </h1>
          </a>
        </div>
        
        <!-- Content (Nav Menu) -->
        <div class="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-6">
          
          <!-- Administration Section -->
          <div>
            <h4 class="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Administration</h4>
            <nav class="flex flex-col gap-1">
              <a routerLink="/admin/dashboard" routerLinkActive="bg-primary text-primary-foreground font-medium" 
                 [routerLinkActiveOptions]="{exact: true}"
                 class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors">
                <lucide-icon name="layout-dashboard" [size]="18"></lucide-icon>
                <span>Dashboard</span>
              </a>
              <a routerLink="/admin/orders" routerLinkActive="bg-primary text-primary-foreground font-medium" 
                 class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors">
                <lucide-icon name="shopping-cart" [size]="18"></lucide-icon>
                <span>Orders</span>
              </a>
              <a routerLink="/admin/menu" routerLinkActive="bg-primary text-primary-foreground font-medium" 
                 class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors">
                <lucide-icon name="menu" [size]="18"></lucide-icon>
                <span>Menu</span>
              </a>
              <a *ngIf="authService.hasRole(['ADMIN'])" routerLink="/admin/users" routerLinkActive="bg-primary text-primary-foreground font-medium" 
                 class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors">
                <lucide-icon name="users" [size]="18"></lucide-icon>
                <span>Users</span>
              </a>
              <a routerLink="/admin/reservations" routerLinkActive="bg-primary text-primary-foreground font-medium" 
                 class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors">
                <lucide-icon name="calendar" [size]="18"></lucide-icon>
                <span>Reservations</span>
              </a>
              <a *ngIf="authService.hasRole(['ADMIN'])" routerLink="/admin/activities-log" routerLinkActive="bg-primary text-primary-foreground font-medium" 
                 class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors">
                <lucide-icon name="activity" [size]="18"></lucide-icon>
                <span>Activities Log</span>
              </a>
            </nav>
          </div>

          <!-- POS Section -->
          <div>
            <h4 class="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Point of Sale</h4>
            <nav class="flex flex-col gap-1">
              <a routerLink="/pos" 
                 class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors">
                <lucide-icon [img]="Grid2x2" [size]="18"></lucide-icon>
                <span>Floor Plan</span>
              </a>
            </nav>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-primary/5 shadow-xl rounded-lg m-2 p-2 pt-2 border border-border/50">
          <div class="flex flex-col gap-1">
            
            <!-- User Profile Button -->
            <button class="border border-border/50 bg-background rounded-lg p-2 w-full flex items-center gap-3 hover:bg-muted transition-colors text-left">
              <div class="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                <lucide-icon name="user" [size]="16"></lucide-icon>
              </div>
              <div class="flex flex-col items-start text-sm leading-tight overflow-hidden">
                <span class="font-semibold text-foreground truncate w-full">
                  {{ user()?.name || 'Admin User' }}
                </span>
                <span class="text-xs text-muted-foreground truncate w-full">
                  {{ user()?.email || 'admin@restaurant.com' }}
                </span>
              </div>
            </button>

            <!-- Settings Button -->
            <button class="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted mt-1">
              <lucide-icon name="settings" [size]="16"></lucide-icon>
              <span>Settings</span>
            </button>
            
            <!-- Logout Button -->
            <button (click)="logout()" class="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
              <lucide-icon name="log-out" [size]="16"></lucide-icon>
              <span>Log out</span>
            </button>
            
          </div>
        </div>
      </aside>

      <!-- Main Content Inset -->
      <main class="flex-1 flex flex-col bg-card/50 overflow-hidden relative">
        <!-- Topbar Mobile Trigger (Optional, leaving space for it) -->
        <header class="h-14 border-b border-border bg-background/80 backdrop-blur flex items-center px-4 shrink-0">
          <h2 class="text-lg font-semibold text-foreground m-0">Admin Portal</h2>
        </header>
        
        <div class="flex-1 overflow-auto p-4 md:p-6">
          <router-outlet></router-outlet>
        </div>
      </main>
      
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  user = this.authService.currentUser;
  
  // Icon imports for lucide-angular
  readonly Utensils = Utensils;
  readonly User = User;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly LayoutDashboard = LayoutDashboard;
  readonly ShoppingCart = ShoppingCart;
  readonly Menu = Menu;
  readonly Grid2x2 = Grid2x2;
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly Activity = Activity;
  
  logout() {
    this.authService.logout();
  }
}
