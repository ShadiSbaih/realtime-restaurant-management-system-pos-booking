import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule, Utensils, Eye, EyeOff, ArrowRight, Mail, Lock, User, ShieldCheck, Sparkles, Key } from 'lucide-angular';
import { AuthWrapperComponent } from '../components/auth-wrapper/auth-wrapper.component';
import { CustomInputComponent } from '../components/custom-input/custom-input.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, AuthWrapperComponent, CustomInputComponent],
  template: `
    <app-auth-wrapper>
      <div class="flex flex-col w-full">
        
        <!-- Headline -->
        <div class="mb-xl">
          <h1 class="text-display-lg font-extrabold tracking-tight text-ink mb-sm m-0">
            Create account
          </h1>
          <p class="text-body-lg text-mute m-0 font-medium">
            Register your profile to book tables and manage contactless dining orders.
          </p>
        </div>

        <!-- SSO Options -->
        <div class="grid grid-cols-2 gap-md mb-xl">
          <button type="button"
            class="w-full py-sm px-md rounded-xl bg-canvas border border-hairline text-ink font-semibold flex items-center justify-center gap-sm hover:bg-surface-bone hover:border-[#ccc] transition-all shadow-xs cursor-pointer"
            (click)="handleSocialSignUp('Google')"
            [disabled]="isLoading()">
            <svg viewBox="0 0 24 24" class="size-4 text-[#4285F4] fill-current shrink-0">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.79-4.01-8.79-8.92s3.95-8.92 8.79-8.92c2.75 0 4.6 1.17 5.65 2.18l2.59-2.5c-1.66-1.55-3.82-2.5-8.24-2.5-6.63 0-12 5.37-12 12s5.37 12 12 12c6.92 0 11.52-4.87 11.52-11.72 0-.79-.08-1.39-.18-1.99h-11.34z" />
            </svg>
            <span>Google</span>
          </button>

          <button type="button"
            class="w-full py-sm px-md rounded-xl bg-canvas border border-hairline text-ink font-semibold flex items-center justify-center gap-sm hover:bg-surface-bone hover:border-[#ccc] transition-all shadow-xs cursor-pointer"
            (click)="handleSocialSignUp('Apple')"
            [disabled]="isLoading()">
            <svg viewBox="0 0 384 512" class="size-4 text-ink fill-current shrink-0">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <!-- Subtle Divider -->
        <div class="relative mb-xl">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-hairline"></div>
          </div>
          <div class="relative flex justify-center text-caption-tight text-mute uppercase tracking-widest">
            <span class="px-sm bg-canvas">
              Or register with email
            </span>
          </div>
        </div>

        <!-- Registration Form -->
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="space-y-sm">
          <app-custom-input
            name="name"
            [(ngModel)]="name"
            label="Full Name"
            placeholder="Alex Rivera"
            type="text"
            startIcon="user"
            [disabled]="isLoading()"
            required
          ></app-custom-input>

          <app-custom-input
            name="email"
            [(ngModel)]="email"
            label="Email Address"
            placeholder="alex@savora.com"
            type="email"
            startIcon="mail"
            [disabled]="isLoading()"
            required
          ></app-custom-input>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
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

            <app-custom-input
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              label="Confirm Password"
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
          </div>

          <div *ngIf="error()" class="p-sm rounded-md bg-primary/10 border border-primary/20 text-primary text-body-sm flex items-center gap-xs mb-md">
            <lucide-icon name="shield-check" class="size-4 shrink-0"></lucide-icon>
            <span>{{ error() }}</span>
          </div>

          <button
            type="submit"
            class="w-full py-md px-lg rounded-full bg-primary text-canvas font-bold text-body-md flex items-center justify-center gap-sm hover:opacity-90 transition-all shadow-md hover:shadow-lg mt-xl border-none cursor-pointer"
            [disabled]="!registerForm.form.valid || isLoading()"
          >
            <span *ngIf="isLoading()" class="animate-spin rounded-full h-4 w-4 border-b-2 border-canvas"></span>
            <span>{{ isLoading() ? 'Creating Account...' : 'Create Account' }}</span>
            <lucide-icon name="arrow-right" class="size-4" *ngIf="!isLoading()"></lucide-icon>
          </button>
        </form>

        <!-- Footer -->
        <div class="text-center mt-xl">
          <p class="text-body-sm text-mute m-0">
            Already have an account? 
            <a routerLink="/login" class="font-bold text-ink hover:text-primary transition-colors hover:underline ml-xs">
              Sign in here
            </a>
          </p>
        </div>

      </div>
    </app-auth-wrapper>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = signal(false);
  error = signal<string | null>(null);

  readonly Utensils = Utensils;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly ArrowRight = ArrowRight;
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly User = User;
  readonly ShieldCheck = ShieldCheck;
  readonly Sparkles = Sparkles;
  readonly Key = Key;

  constructor(private authService: AuthService, private router: Router) {}

  handleSocialSignUp(provider: string) {
    if (provider === 'Apple') {
      alert("Apple SSO is not implemented yet in demo mode.");
    } else {
      alert(`${provider} SSO registration is enabled in demo mode. You can also sign in instantly using any of the pre-seeded demo accounts on the Login page!`);
    }
  }

  onSubmit(): void {
    if (!this.name || !this.email || !this.password) return;
    
    if (this.password !== this.confirmPassword) {
      this.error.set("Passwords do not match.");
      return;
    }
    
    this.isLoading.set(true);
    this.error.set(null);

    this.authService.register({ name: this.name.trim(), email: this.email.trim(), password: this.password.trim() }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Registration failed. Please check your details and try again.');
      }
    });
  }
}
