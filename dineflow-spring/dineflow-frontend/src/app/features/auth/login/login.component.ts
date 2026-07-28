import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule, Utensils, Eye, EyeOff, ArrowRight, Mail, Lock, ShieldCheck, Sparkles, Key } from 'lucide-angular';
import { AuthWrapperComponent } from '../components/auth-wrapper/auth-wrapper.component';
import { CustomInputComponent } from '../components/custom-input/custom-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, AuthWrapperComponent, CustomInputComponent],
  template: `
    <app-auth-wrapper>
      <div class="flex flex-col w-full">
        
        <!-- Headline -->
        <div class="mb-xl">
          <h1 class="text-display-md text-ink mb-xs m-0">
            Sign in to portal
          </h1>
          <p class="text-body-md text-mute m-0">
            Enter your credentials to access your restaurant POS and dashboard.
          </p>
        </div>

        <!-- Sleek Demo Access Pill Bar -->
        <div class="mb-xl p-md rounded-md bg-surface-bone border border-hairline flex flex-col gap-sm">
          <div class="flex items-center justify-between text-caption-tight text-mute">
            <span class="flex items-center gap-xs text-ink">
              <lucide-icon name="sparkles" class="size-3 text-primary animate-pulse"></lucide-icon>
              <span>Quick Demo Roles:</span>
            </span>
            <span>Click to auto-fill</span>
          </div>
          
          <div class="grid grid-cols-2 gap-sm">
            <button *ngFor="let demo of demoAccounts" type="button"
              (click)="prefillDemo(demo)"
              class="px-sm py-xs rounded-full text-caption-tight transition-colors cursor-pointer border flex items-center gap-xs text-left"
              [ngClass]="activeDemoRole() === demo.role ? 'bg-ink text-canvas border-ink' : 'bg-canvas text-charcoal border-hairline hover:bg-surface-bone'">
              <span>{{ demo.badge }}</span>
              <span class="truncate">{{ demo.label }}</span>
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-sm">
          <app-custom-input
            name="email"
            [(ngModel)]="email"
            label="Email Address"
            placeholder="name@dineflow.com"
            type="email"
            startIcon="mail"
            [disabled]="isLoading()"
            required
          ></app-custom-input>

          <div class="relative">
            <app-custom-input
              name="password"
              [(ngModel)]="password"
              label="Password"
              placeholder="••••••••"
              [type]="showPassword ? 'text' : 'password'"
              startIcon="lock"
              [disabled]="isLoading()"
              [endIconTemplate]="true"
              required
            >
              <button
                end-icon
                type="button"
                (click)="showPassword = !showPassword"
                class="button-icon text-mute hover:text-ink cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                [disabled]="isLoading()"
              >
                <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" class="size-4"></lucide-icon>
              </button>
            </app-custom-input>
            <div class="flex justify-end -mt-md mb-md">
              <a href="javascript:void(0)" (click)="forgotPassword()" class="text-caption-tight text-primary hover:underline">Forgot password?</a>
            </div>
          </div>

          <div *ngIf="error()" class="p-sm rounded-md bg-primary/10 border border-primary/20 text-primary text-body-sm flex items-center gap-xs mb-md">
            <lucide-icon name="shield-check" class="size-4 shrink-0"></lucide-icon>
            <span>{{ error() }}</span>
          </div>

          <button
            type="submit"
            class="w-full button-primary mt-sm flex items-center justify-center gap-xs"
            [disabled]="!loginForm.form.valid || isLoading()"
          >
            <span *ngIf="isLoading()" class="animate-spin rounded-full h-4 w-4 border-b-2 border-on-primary"></span>
            <span>{{ isLoading() ? 'Signing in...' : 'Sign In' }}</span>
            <lucide-icon name="arrow-right" class="size-4" *ngIf="!isLoading()"></lucide-icon>
          </button>
        </form>

        <!-- Subtle Divider -->
        <div class="relative my-xl">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-hairline"></div>
          </div>
          <div class="relative flex justify-center text-caption-tight text-mute uppercase tracking-widest">
            <span class="px-sm bg-canvas">
              Or continue with
            </span>
          </div>
        </div>

        <!-- SSO Options -->
        <div class="grid grid-cols-2 gap-sm mb-xl">
          <button type="button"
            class="w-full button-outline flex items-center justify-center gap-xs disabled:opacity-50"
            (click)="handleSocialSignIn('Google')"
            [disabled]="isLoading()">
            <svg viewBox="0 0 24 24" class="size-3.5 text-[#4285F4] fill-current shrink-0">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.79-4.01-8.79-8.92s3.95-8.92 8.79-8.92c2.75 0 4.6 1.17 5.65 2.18l2.59-2.5c-1.66-1.55-3.82-2.5-8.24-2.5-6.63 0-12 5.37-12 12s5.37 12 12 12c6.92 0 11.52-4.87 11.52-11.72 0-.79-.08-1.39-.18-1.99h-11.34z" />
            </svg>
            <span>Google</span>
          </button>

          <button type="button"
            class="w-full button-outline flex items-center justify-center gap-xs disabled:opacity-50"
            (click)="handleSocialSignIn('Passkey')"
            [disabled]="isLoading()">
            <lucide-icon name="key" class="size-3.5 text-charcoal shrink-0"></lucide-icon>
            <span>Passkey</span>
          </button>
        </div>

        <!-- Footer -->
        <div class="text-center">
          <p class="text-body-sm text-mute m-0">
            Don't have an account? 
            <a routerLink="/register" class="text-primary hover:underline cursor-pointer ml-xs">
              Create an account
            </a>
          </p>
        </div>

      </div>
    </app-auth-wrapper>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = signal(false);
  error = signal<string | null>(null);
  activeDemoRole = signal<string | null>(null);

  demoAccounts = [
    { label: 'Admin Executive', role: 'ADMIN', badge: '👑', email: 'admin@dineflow.com', pass: 'admin123' },
    { label: 'Manager', role: 'MANAGER', badge: '👔', email: 'manager@dineflow.com', pass: 'manager123' },
    { label: 'POS Kitchen Chef', role: 'KITCHEN', badge: '🍳', email: 'kitchen@dineflow.com', pass: 'kitchen123' },
    { label: 'Customer', role: 'CUSTOMER', badge: '🥗', email: 'customer@dineflow.com', pass: 'customer123' }
  ];

  readonly Utensils = Utensils;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly ArrowRight = ArrowRight;
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly ShieldCheck = ShieldCheck;
  readonly Sparkles = Sparkles;
  readonly Key = Key;

  constructor(private authService: AuthService, private router: Router) {}

  prefillDemo(demo: any) {
    this.email = demo.email;
    this.password = demo.pass;
    this.activeDemoRole.set(demo.role);
    this.error.set(null);
  }

  handleSocialSignIn(provider: string) {
    alert(`${provider} SSO is enabled in demo mode. Please select one of the Quick Demo Roles above to test role-based access!`);
  }

  forgotPassword() {
    alert('Password reset link sent! In demo mode, you can use any of the seeded credentials in the Quick Demo Roles bar above.');
  }

  onSubmit(): void {
    const email = this.email ? this.email.trim() : '';
    const password = this.password ? this.password.trim() : '';
    if (!email || !password) return;
    
    this.isLoading.set(true);
    this.error.set(null);

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else if (res.user.role === 'ADMIN' || res.user.role === 'MANAGER') {
          this.router.navigate(['/admin/dashboard']);
        } else if (res.user.role === 'STAFF' || res.user.role === 'KITCHEN') {
          this.router.navigate(['/pos/tables']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }
}
