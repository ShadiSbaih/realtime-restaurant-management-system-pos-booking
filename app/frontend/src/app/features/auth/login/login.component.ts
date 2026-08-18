import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule, Utensils, Eye, EyeOff, ArrowRight, Mail, Lock, ShieldCheck, Sparkles, Key, Crown, Briefcase, ChefHat, User } from 'lucide-angular';
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
          <h1 class="text-display-lg font-extrabold tracking-tight text-ink mb-sm m-0">
            Welcome to Savora
          </h1>
          <p class="text-body-lg text-mute m-0 font-medium">
            Enter your credentials to access your restaurant POS and dashboard.
          </p>
        </div>

        <!-- Segmented Control Demo Access -->
        <div class="mb-xl">
          <div class="flex items-center justify-between text-caption-tight text-mute mb-sm">
            <span class="flex items-center gap-xs text-ink font-semibold uppercase tracking-widest">
              <span>Quick Demo Roles</span>
            </span>
            <span>Auto-fill</span>
          </div>
          
          <div class="flex flex-col sm:flex-row items-stretch w-full bg-surface-bone border border-hairline rounded-lg p-0.5 relative z-0">
            <button *ngFor="let demo of demoAccounts; let last = last" type="button"
              (click)="prefillDemo(demo)"
              class="flex-1 py-2 px-1 sm:px-2 text-caption-tight transition-all duration-300 cursor-pointer flex items-center justify-center gap-xs text-center border-none relative rounded-md outline-none focus:outline-none"
              [ngClass]="activeDemoRole() === demo.role ? 'bg-canvas text-ink font-bold shadow-sm' : 'bg-transparent text-charcoal hover:bg-black/5 hover:text-ink'">
              
              <lucide-icon [name]="demo.icon" class="size-4 shrink-0" [ngClass]="activeDemoRole() === demo.role ? 'text-primary' : 'text-mute'"></lucide-icon>
              <span class="truncate">{{ demo.label }}</span>
              
              <!-- Vertical separator for inactive items -->
              <div *ngIf="!last && activeDemoRole() !== demo.role" class="hidden sm:block absolute right-0 top-1/4 bottom-1/4 w-px bg-[#d1d5db]"></div>
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-sm">
          <app-custom-input
            name="email"
            [(ngModel)]="email"
            label="Email Address"
            placeholder="name@savora.com"
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
              <a href="javascript:void(0)" (click)="forgotPassword()" class="text-caption-tight font-bold text-ink hover:text-primary transition-colors hover:underline">Forgot password?</a>
            </div>
          </div>

          <div *ngIf="error()" class="p-sm rounded-md bg-primary/10 border border-primary/20 text-primary text-body-sm flex items-center gap-xs mb-md">
            <lucide-icon name="shield-check" class="size-4 shrink-0"></lucide-icon>
            <span>{{ error() }}</span>
          </div>

          <button
            type="submit"
            class="w-full py-md px-lg rounded-full bg-primary text-canvas font-bold text-body-md flex items-center justify-center gap-sm hover:opacity-90 transition-all shadow-md hover:shadow-lg mt-xl border-none cursor-pointer"
            [disabled]="!loginForm.form.valid || isLoading()"
          >
            <span *ngIf="isLoading()" class="animate-spin rounded-full h-4 w-4 border-b-2 border-canvas"></span>
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
        <div class="grid grid-cols-2 gap-md mb-xl">
          <button type="button"
            class="w-full py-sm px-md rounded-xl bg-canvas border border-hairline text-ink font-semibold flex items-center justify-center gap-sm hover:bg-surface-bone hover:border-[#ccc] transition-all shadow-xs cursor-pointer"
            (click)="handleSocialSignIn('Google')"
            [disabled]="isLoading()">
            <svg viewBox="0 0 24 24" class="size-4 text-[#4285F4] fill-current shrink-0">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.79-4.01-8.79-8.92s3.95-8.92 8.79-8.92c2.75 0 4.6 1.17 5.65 2.18l2.59-2.5c-1.66-1.55-3.82-2.5-8.24-2.5-6.63 0-12 5.37-12 12s5.37 12 12 12c6.92 0 11.52-4.87 11.52-11.72 0-.79-.08-1.39-.18-1.99h-11.34z" />
            </svg>
            <span>Google</span>
          </button>

          <button type="button"
            class="w-full py-sm px-md rounded-xl bg-canvas border border-hairline text-ink font-semibold flex items-center justify-center gap-sm hover:bg-surface-bone hover:border-[#ccc] transition-all shadow-xs cursor-pointer"
            (click)="handleSocialSignIn('Apple')"
            [disabled]="isLoading()">
            <svg viewBox="0 0 384 512" class="size-4 text-ink fill-current shrink-0">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            <span>Apple</span>
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
    { label: 'Admin', role: 'ADMIN', icon: 'crown', email: 'admin@savora.com', pass: 'admin123' },
    { label: 'Manager', role: 'MANAGER', icon: 'briefcase', email: 'manager@savora.com', pass: 'manager123' },
    { label: 'Kitchen', role: 'KITCHEN', icon: 'chef-hat', email: 'kitchen@savora.com', pass: 'kitchen123' },
    { label: 'Customer', role: 'CUSTOMER', icon: 'user', email: 'customer@savora.com', pass: 'customer123' }
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
  readonly Crown = Crown;
  readonly Briefcase = Briefcase;
  readonly ChefHat = ChefHat;
  readonly User = User;

  constructor(private authService: AuthService, private router: Router) { }

  prefillDemo(demo: any) {
    this.email = demo.email;
    this.password = demo.pass;
    this.activeDemoRole.set(demo.role);
    this.error.set(null);
  }

  handleSocialSignIn(provider: string) {
    if (provider === 'Apple') {
      alert("Apple SSO is not implemented yet in demo mode.");
    } else {
      alert(`${provider} SSO is enabled in demo mode. Please select one of the Quick Demo Roles above to test role-based access!`);
    }
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
