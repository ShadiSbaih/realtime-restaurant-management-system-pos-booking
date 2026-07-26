import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex min-h-screen w-full bg-nova-paper dark:bg-slate-950 font-sans text-foreground transition-colors duration-500">
      <main class="w-full h-full p-3">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class CustomerLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  user = this.authService.currentUser;
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
