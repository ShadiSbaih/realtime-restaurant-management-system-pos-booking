import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule, Utensils, Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-angular';
import { AuthWrapperComponent } from '../components/auth-wrapper/auth-wrapper.component';
import { CustomInputComponent } from '../components/custom-input/custom-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, AuthWrapperComponent, CustomInputComponent],
  template: `
    <app-auth-wrapper>
      <div class="flex-1 p-8 md:p-16 flex flex-col justify-between">
        <div>
          <!-- Header -->
          <div class="flex items-center gap-3 mb-12 group">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-primary-focus flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              <lucide-icon name="utensils" class="text-white w-6 h-6"></lucide-icon>
            </div>
            <span class="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
              DineFlow
            </span>
          </div>
          <h1 class="text-4xl font-black text-slate-900 dark:text-white mb-4 leading-[1.1] tracking-tight">
            Welcome back to <br />
            <span class="text-primary">your kitchen.</span>
          </h1>
          <p class="text-slate-400 dark:text-slate-500 text-sm mb-10 max-w-sm leading-relaxed font-medium">
            Sign in to manage your reservations, floor plan, and real-time
            analytics.
          </p>

          <!-- Socials Dummy Button -->
          <div class="flex justify-center items-center gap-4 mb-8">
            <button
              class="w-full h-14 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shadow-sm hover:-translate-y-1 bg-slate-100 dark:bg-slate-700 cursor-pointer disabled:opacity-50"
              (click)="handleGoogleSignIn()"
              [disabled]="isLoading()"
            >
              <svg viewBox="0 0 24 24" class="w-6 h-6 text-[#4285F4] fill-current">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.79-4.01-8.79-8.92s3.95-8.92 8.79-8.92c2.75 0 4.6 1.17 5.65 2.18l2.59-2.5c-1.66-1.55-3.82-2.5-8.24-2.5-6.63 0-12 5.37-12 12s5.37 12 12 12c6.92 0 11.52-4.87 11.52-11.72 0-.79-.08-1.39-.18-1.99h-11.34z" />
              </svg>
            </button>
          </div>

          <div class="relative mb-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <div class="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span class="px-4 bg-white dark:bg-slate-900 text-slate-400">
                Or use credentials
              </span>
            </div>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <app-custom-input
              name="email"
              [(ngModel)]="email"
              label="Email Address"
              placeholder="name@restaurant.com"
              type="email"
              startIcon="mail"
              [disabled]="isLoading()"
            ></app-custom-input>

            <app-custom-input
              name="password"
              [(ngModel)]="password"
              label="Password"
              placeholder="••••••••"
              [type]="showPassword ? 'text' : 'password'"
              startIcon="lock"
              [disabled]="isLoading()"
              [endIconTemplate]="true"
            >
              <button
                end-icon
                type="button"
                (click)="showPassword = !showPassword"
                class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center mt-1"
                [disabled]="isLoading()"
              >
                <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" class="size-[18px]"></lucide-icon>
              </button>
            </app-custom-input>

            <div *ngIf="error()" class="text-red-500 text-sm mb-4 text-center font-medium">{{ error() }}</div>

            <button
              type="submit"
              class="w-full py-4 bg-gradient-to-tr from-primary to-primary-focus text-white rounded-xl font-black text-sm hover:shadow-2xl hover:shadow-primary/30 transition-all mt-4 flex items-center justify-center gap-2 hover:-translate-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              [disabled]="!loginForm.form.valid || isLoading()"
            >
              {{ isLoading() ? 'Signing In...' : 'Sign In to Dashboard' }}
              <lucide-icon name="arrow-right" class="size-[18px]" *ngIf="!isLoading()"></lucide-icon>
            </button>
          </form>
        </div>

        <p class="text-center text-xs font-bold text-slate-400 mt-8">
          Don't have an account? 
          <a routerLink="/register" class="text-primary font-black hover:underline cursor-pointer">
            Create an account
          </a>
        </p>
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

  readonly Utensils = Utensils;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly ArrowRight = ArrowRight;
  readonly Mail = Mail;
  readonly Lock = Lock;

  constructor(private authService: AuthService, private router: Router) {}

  handleGoogleSignIn() {
    alert('Google Sign-In coming soon!');
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
        } else if (res.user.role === 'CUSTOMER') {
          this.router.navigate(['/pos']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }
}
