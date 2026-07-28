import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../../services/cart.service';
import { LucideAngularModule, Utensils, LogOut, LayoutDashboard, Grid2x2, User, Sparkles, ShoppingCart, Github } from 'lucide-angular';
import { CartSheetComponent } from '../../../shared/components/cart-sheet/cart-sheet.component';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, CartSheetComponent],
  template: `
    <div class="flex flex-col min-h-screen w-full bg-canvas font-body text-body-md text-ink overflow-x-hidden">
      
      <!-- Replicate Nav Bar -->
      <header class="sticky top-0 z-50 w-full bg-canvas h-[60px] border-b border-hairline px-lg md:px-xl flex items-center justify-between transition-all">
        <!-- Brand Logo -->
        <a routerLink="/" class="flex items-center gap-xs cursor-pointer decoration-none">
          <lucide-icon name="utensils" class="text-ink size-5"></lucide-icon>
          <span class="text-button-md text-ink m-0 ml-xs">
            DineFlow
          </span>
        </a>

        <!-- Center Navigation Links -->
        <nav class="hidden lg:flex items-center gap-md">
          <a href="/#items" class="button-ghost decoration-none">Explore Menu</a>
          <a href="/#locations" class="button-ghost decoration-none">Locations</a>
          <a href="/#resources" class="button-ghost decoration-none">Resources</a>
          <a href="/#contact" class="button-ghost decoration-none">Contact Us</a>
        </nav>

        <!-- Right Action Controls -->
        <div class="flex items-center gap-sm">
          
          <button (click)="cartService.openCart()" class="button-icon relative" title="Shopping Cart">
            <lucide-icon name="shopping-cart" class="size-4"></lucide-icon>
            <span *ngIf="cartService.items().length > 0" class="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
              {{ cartService.items().length }}
            </span>
          </button>

          <!-- User Profile or Sign In -->
          <ng-container *ngIf="!user()">
            <a routerLink="/login" class="button-primary decoration-none">
              Sign in
            </a>
          </ng-container>

          <ng-container *ngIf="user()">
            <a [routerLink]="['/profile', user()?.id]" class="button-ghost flex items-center gap-2 decoration-none border border-hairline">
              <span class="text-xs">{{ (user()?.name || 'User').split(' ')[0] }}</span>
            </a>

            <button (click)="logout()" class="button-icon text-mute hover:text-ink" title="Logout">
              <lucide-icon name="log-out" class="size-4"></lucide-icon>
            </button>
          </ng-container>

        </div>
      </header>

      <!-- Main Full-Bleed Content Area -->
      <main class="w-full flex-1 flex flex-col">
        <router-outlet></router-outlet>
      </main>

      <!-- Full-Screen Cart Drawer -->
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
  
  readonly Utensils = Utensils;
  readonly LogOut = LogOut;
  readonly ShoppingCart = ShoppingCart;
  readonly Github = Github;
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

