import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from '../models/user.model';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Ensure user is loaded (might need to handle edge case where token exists but user isn't fetched yet)
    // For simplicity, assuming if we get here, user is loaded (AuthGuard runs first).
    // If not loaded, we might need a resolver or handle it here, but Signals make it synchronous if loaded.
    
    if (authService.hasRole(allowedRoles)) {
      return true;
    }

    // Access denied
    return router.createUrlTree(['/access-denied']);
  };
};
