import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { Role } from './core/models/user.model';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [
  // Customer Routes wrapped in CustomerLayout
  {
    path: '',
    loadComponent: () => import('./core/layout/customer-layout/customer-layout.component').then(m => m.CustomerLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent), pathMatch: 'full' },
      { path: 'reservation', loadComponent: () => import('./features/reservation/customer-reservation.component').then(m => m.CustomerReservationComponent) },
      { path: 'profile/:id', loadComponent: () => import('./features/profile/customer-profile.component').then(m => m.CustomerProfileComponent) }
    ]
  },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [noAuthGuard] },

  // Admin Routes wrapped in AdminLayout
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([Role.ADMIN, Role.MANAGER, Role.STAFF])],
    loadComponent: () => import('./core/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/menu/menu-admin.component').then(m => m.MenuAdminComponent)
      },
      {
        path: 'menu/categories',
        loadComponent: () => import('./features/menu/menu-categories.component').then(m => m.MenuCategoriesComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard([Role.ADMIN])],
        loadComponent: () => import('./features/users/users-admin.component').then(m => m.UsersAdminComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/orders-admin.component').then(m => m.OrdersAdminComponent)
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/reservation/reservations-admin.component').then(m => m.ReservationsAdminComponent)
      },
      {
        path: 'activities-log',
        canActivate: [roleGuard([Role.ADMIN])],
        loadComponent: () => import('./features/activities-log/activities-log.component').then(m => m.ActivitiesLogComponent)
      }
    ]
  },

  // POS Routes wrapped in PosLayout
  {
    path: 'pos',
    canActivate: [authGuard, roleGuard([Role.ADMIN, Role.MANAGER, Role.STAFF, Role.CUSTOMER])],
    loadComponent: () => import('./core/layout/pos-layout/pos-layout.component').then(m => m.PosLayoutComponent),
    children: [
      { path: '', redirectTo: 'tables', pathMatch: 'full' },
      { path: 'tables', loadComponent: () => import('./features/pos/tables.component').then(m => m.TablesComponent) },
      { path: 'new-order', loadComponent: () => import('./features/pos/new-order.component').then(m => m.NewOrderComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
