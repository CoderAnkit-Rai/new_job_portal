import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const role = authService.getRole(); 

    if (allowedRoles.includes(role)) {
      return true;
    }

    authService.redirectByRole();
    return false;
  };
};
