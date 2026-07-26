import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-pos-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen w-full bg-background overflow-hidden font-sans">
      
      <!-- Left Sidebar (Narrow for POS) -->
      <aside class="w-20 h-full flex flex-col bg-card border-r border-border shadow-sm z-20">
        
        <!-- Logo -->
        <div class="h-16 flex items-center justify-center border-b border-border">
          <div class="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
            DF
          </div>
        </div>
        
        <!-- Navigation Icons -->
        <div class="flex-1 flex flex-col items-center py-6 gap-6">
          <a routerLink="/pos" class="size-12 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all group relative cursor-pointer">
            <!-- Icon placeholder -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <div class="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-50">Floor Plan</div>
          </a>
          
          <a routerLink="/admin/dashboard" *ngIf="authService.hasRole(['ADMIN', 'MANAGER'])" class="size-12 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all group relative cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            <div class="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-50">Admin Panel</div>
          </a>
        </div>
        
        <!-- Bottom Actions (User / Logout) -->
        <div class="pb-6 pt-4 border-t border-border flex flex-col items-center gap-4">
          <button class="size-10 rounded-full bg-secondary text-secondary-foreground border border-border shadow-sm flex items-center justify-center font-medium hover:bg-muted transition-colors cursor-pointer" title="{{ user()?.name }}">
            {{ user()?.name?.charAt(0) || 'U' }}
          </button>
          
          <button (click)="logout()" class="size-10 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </aside>

      <!-- Main Workspace -->
      <main class="flex-1 h-full overflow-hidden relative">
        <router-outlet></router-outlet>
      </main>
      
    </div>
  `,
  styles: []
})
export class PosLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);
  user = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
