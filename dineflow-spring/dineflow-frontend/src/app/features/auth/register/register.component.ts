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
          <h1 class="text-display-md text-ink mb-xs m-0">
            Create account
          </h1>
          <p class="text-body-md text-mute m-0">
            Register your profile to book tables and manage contactless dining orders.
          </p>
        </div>

        <!-- SSO Options -->
        <div class="grid grid-cols-2 gap-sm mb-xl">
          <button type="button"
            class="w-full button-outline flex items-center justify-center gap-xs disabled:opacity-50"
            (click)="handleGoogleSignUp()"
            [disabled]="isLoading()">
            <svg viewBox="0 0 24 24" class="size-3.5 text-[#4285F4] fill-current shrink-0">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.79-4.01-8.79-8.92s3.95-8.92 8.79-8.92c2.75 0 4.6 1.17 5.65 2.18l2.59-2.5c-1.66-1.55-3.82-2.5-8.24-2.5-6.63 0-12 5.37-12 12s5.37 12 12 12c6.92 0 11.52-4.87 11.52-11.72 0-.79-.08-1.39-.18-1.99h-11.34z" />
            </svg>
            <span>Google</span>
          </button>

          <button type="button"
            class="w-full button-outline flex items-center justify-center gap-xs disabled:opacity-50"
            (click)="handlePasskeySignUp()"
            [disabled]="isLoading()">
            <lucide-icon name="key" class="size-3.5 text-charcoal shrink-0"></lucide-icon>
            <span>Passkey</span>
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
            placeholder="alex@dineflow.com"
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
            class="w-full button-primary mt-sm flex items-center justify-center gap-xs"
            [disabled]="!registerForm.form.valid || isLoading()"
          >
            <span *ngIf="isLoading()" class="animate-spin rounded-full h-4 w-4 border-b-2 border-on-primary"></span>
            <span>{{ isLoading() ? 'Creating Account...' : 'Create Account' }}</span>
            <lucide-icon name="arrow-right" class="size-4" *ngIf="!isLoading()"></lucide-icon>
          </button>
        </form>

        <!-- Footer -->
        <div class="text-center mt-xl">
          <p class="text-body-sm text-mute m-0">
            Already have an account? 
            <a routerLink="/login" class="text-primary hover:underline cursor-pointer ml-xs">
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

  handleGoogleSignUp() {
    alert('Google SSO registration is enabled in demo mode. You can also sign in instantly using any of the pre-seeded demo accounts on the Login page!');
  }

  handlePasskeySignUp() {
    alert('Passkey registration initiated. In demo mode, simply complete the form below to register a new customer profile!');
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
