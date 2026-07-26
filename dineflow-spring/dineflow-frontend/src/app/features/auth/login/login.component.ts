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
        <div class="mb-6">
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-1.5">
            Sign in to portal
          </h1>
          <p class="text-xs font-semibold text-muted-foreground m-0 leading-relaxed">
            Enter your credentials to access your restaurant POS and dashboard.
          </p>
        </div>

        <!-- Sleek Demo Access Pill Bar -->
        <div class="mb-6 p-3 rounded-xl bg-muted/60 border border-border flex flex-col gap-2">
          <div class="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
            <span class="flex items-center gap-1 text-foreground">
              <lucide-icon name="sparkles" [size]="13" class="text-primary animate-pulse"></lucide-icon>
              <span>Quick Demo Roles:</span>
            </span>
            <span>Click to auto-fill</span>
          </div>
          
          <div class="grid grid-cols-2 gap-1.5">
            <button *ngFor="let demo of demoAccounts" type="button"
              (click)="prefillDemo(demo)"
              class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 text-left"
              [ngClass]="activeDemoRole() === demo.role ? 'bg-foreground text-background border-foreground shadow-sm font-black' : 'bg-background text-muted-foreground border-border/80 hover:text-foreground hover:border-border'">
              <span>{{ demo.badge }}</span>
              <span class="truncate">{{ demo.label }}</span>
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-1">
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
                class="text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                [disabled]="isLoading()"
              >
                <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="16"></lucide-icon>
              </button>
            </app-custom-input>
            <div class="flex justify-end -mt-2 mb-3">
              <a href="javascript:void(0)" (click)="forgotPassword()" class="text-xs font-bold text-primary hover:underline">Forgot password?</a>
            </div>
          </div>

          <div *ngIf="error()" class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2 mb-3">
            <lucide-icon name="shield-check" [size]="16" class="shrink-0"></lucide-icon>
            <span>{{ error() }}</span>
          </div>

          <button
            type="submit"
            class="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black text-sm transition-all mt-2 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
            [disabled]="!loginForm.form.valid || isLoading()"
          >
            <span *ngIf="isLoading()" class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
            <span>{{ isLoading() ? 'Signing in...' : 'Sign In' }}</span>
            <lucide-icon name="arrow-right" [size]="16" *ngIf="!isLoading()"></lucide-icon>
          </button>
        </form>

        <!-- Subtle Divider -->
        <div class="relative my-5">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border/80"></div>
          </div>
          <div class="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
            <span class="px-3 bg-background text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <!-- SSO Options -->
        <div class="grid grid-cols-2 gap-2.5 mb-6">
          <button type="button"
            class="w-full h-10 rounded-xl border border-border bg-background hover:bg-muted/60 transition-all flex items-center justify-center gap-2 text-xs font-bold text-foreground cursor-pointer disabled:opacity-50"
            (click)="handleSocialSignIn('Google')"
            [disabled]="isLoading()">
            <svg viewBox="0 0 24 24" class="size-3.5 text-[#4285F4] fill-current shrink-0">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.79-4.01-8.79-8.92s3.95-8.92 8.79-8.92c2.75 0 4.6 1.17 5.65 2.18l2.59-2.5c-1.66-1.55-3.82-2.5-8.24-2.5-6.63 0-12 5.37-12 12s5.37 12 12 12c6.92 0 11.52-4.87 11.52-11.72 0-.79-.08-1.39-.18-1.99h-11.34z" />
            </svg>
            <span>Google</span>
          </button>

          <button type="button"
            class="w-full h-10 rounded-xl border border-border bg-background hover:bg-muted/60 transition-all flex items-center justify-center gap-2 text-xs font-bold text-foreground cursor-pointer disabled:opacity-50"
            (click)="handleSocialSignIn('Passkey')"
            [disabled]="isLoading()">
            <lucide-icon name="key" [size]="14" class="text-foreground shrink-0"></lucide-icon>
            <span>Passkey</span>
          </button>
        </div>

        <!-- Footer -->
        <div class="text-center">
          <p class="text-xs font-medium text-muted-foreground m-0">
            Don't have an account? 
            <a routerLink="/register" class="text-primary font-bold hover:underline cursor-pointer ml-1">
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
