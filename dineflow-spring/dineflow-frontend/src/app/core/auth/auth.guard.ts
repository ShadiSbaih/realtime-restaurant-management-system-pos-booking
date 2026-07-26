import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from '../models/user.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If we have a user, allow route activation
  // APP_INITIALIZER ensures this is loaded before routing begins
  if (authService.currentUser()) {
    return true;
  }

  // Not logged in, redirect to login page with the return url
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.accessToken) {
    const user = authService.currentUser();
    if (user) {
      if (user.role === Role.CUSTOMER) return router.createUrlTree(['/pos']);
      return router.createUrlTree(['/admin/dashboard']);
    }
    // Default fallback if user isn't loaded yet but token exists
    return router.createUrlTree(['/admin/dashboard']);
  }

  return true;
};
