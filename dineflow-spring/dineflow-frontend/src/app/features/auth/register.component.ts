import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LucideAngularModule, Utensils } from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div class="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="text-center mb-8 flex flex-col items-center">
          <div class="rounded-lg bg-primary/20 p-3 text-primary mb-4 flex items-center justify-center w-12 h-12">
            <lucide-icon name="utensils" [size]="24"></lucide-icon>
          </div>
          <h2 class="text-2xl font-bold text-foreground m-0 mb-1">Create an account</h2>
          <p class="text-sm text-muted-foreground m-0">Join DineFlow today</p>
        </div>

        <div *ngIf="error()" class="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-3 mb-6 text-center">
          {{ error() }}
        </div>

        <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none text-foreground">Name</label>
            <input type="text" [(ngModel)]="name" name="name" required
                   class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                   placeholder="John Doe">
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none text-foreground">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required
                   class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                   placeholder="john@example.com">
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium leading-none text-foreground">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required
                   class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                   placeholder="••••••••">
          </div>

          <button type="submit" [disabled]="isLoading()"
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4 w-full shadow-sm">
            {{ isLoading() ? 'Creating account...' : 'Sign Up' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? 
          <a routerLink="/login" class="text-primary hover:underline font-medium">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  readonly Utensils = Utensils;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.isLoading.set(true);
    this.error.set(null);

    this.authService.register({ name: this.name, email: this.email, password: this.password, role: 'CUSTOMER' }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']); // Customers go to main page
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Registration failed');
      }
    });
  }
}
