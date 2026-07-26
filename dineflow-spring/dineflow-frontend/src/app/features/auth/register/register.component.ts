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
        <div class="mb-6">
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-1.5">
            Create account
          </h1>
          <p class="text-xs font-semibold text-muted-foreground m-0 leading-relaxed">
            Register your profile to book tables and manage contactless dining orders.
          </p>
        </div>

        <!-- SSO Options -->
        <div class="grid grid-cols-2 gap-2.5 mb-5">
          <button type="button"
            class="w-full h-10 rounded-xl border border-border bg-background hover:bg-muted/60 transition-all flex items-center justify-center gap-2 text-xs font-bold text-foreground cursor-pointer disabled:opacity-50"
            (click)="handleGoogleSignUp()"
            [disabled]="isLoading()">
            <svg viewBox="0 0 24 24" class="size-3.5 text-[#4285F4] fill-current shrink-0">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.79-4.01-8.79-8.92s3.95-8.92 8.79-8.92c2.75 0 4.6 1.17 5.65 2.18l2.59-2.5c-1.66-1.55-3.82-2.5-8.24-2.5-6.63 0-12 5.37-12 12s5.37 12 12 12c6.92 0 11.52-4.87 11.52-11.72 0-.79-.08-1.39-.18-1.99h-11.34z" />
            </svg>
            <span>Google</span>
          </button>

          <button type="button"
            class="w-full h-10 rounded-xl border border-border bg-background hover:bg-muted/60 transition-all flex items-center justify-center gap-2 text-xs font-bold text-foreground cursor-pointer disabled:opacity-50"
            (click)="handlePasskeySignUp()"
            [disabled]="isLoading()">
            <lucide-icon name="key" [size]="14" class="text-foreground shrink-0"></lucide-icon>
            <span>Passkey</span>
          </button>
        </div>

        <!-- Subtle Divider -->
        <div class="relative mb-5">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border/80"></div>
          </div>
          <div class="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
            <span class="px-3 bg-background text-muted-foreground">
              Or register with email
            </span>
          </div>
        </div>

        <!-- Registration Form -->
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="space-y-1">
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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                class="text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                [disabled]="isLoading()"
              >
                <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="16"></lucide-icon>
              </button>
            </app-custom-input>
          </div>

          <div *ngIf="error()" class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2 mb-3">
            <lucide-icon name="shield-check" [size]="16" class="shrink-0"></lucide-icon>
            <span>{{ error() }}</span>
          </div>

          <button
            type="submit"
            class="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black text-sm transition-all mt-2 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
            [disabled]="!registerForm.form.valid || isLoading()"
          >
            <span *ngIf="isLoading()" class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
            <span>{{ isLoading() ? 'Creating Account...' : 'Create Account' }}</span>
            <lucide-icon name="arrow-right" [size]="16" *ngIf="!isLoading()"></lucide-icon>
          </button>
        </form>

        <!-- Footer -->
        <div class="text-center mt-6">
          <p class="text-xs font-medium text-muted-foreground m-0">
            Already have an account? 
            <a routerLink="/login" class="text-primary font-bold hover:underline cursor-pointer ml-1">
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
