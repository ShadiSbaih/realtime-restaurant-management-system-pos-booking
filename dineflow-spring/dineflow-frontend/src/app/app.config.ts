import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';

export function initializeAuth(authService: AuthService) {
  return () => authService.initAuth();
}

import { routes } from './app.routes';
import { importProvidersFrom } from '@angular/core';
import {
  LucideAngularModule, Utensils, User, Settings, LogOut, LayoutDashboard, ShoppingCart, Menu,
  Grid2x2, Calendar, Users, XCircle, CreditCard, CheckCircle2, DollarSign, ShoppingBag, Box,
  Sparkles, Edit, Trash2, Trash, Minus, Plus, Loader2, Printer, X, Search, Star, MessageSquare,
  Zap, Table as TableIcon, BarChart3, Eye, EyeOff, ArrowRight, Mail, Lock,
  Edit2, Download, Filter, FileDown, Ban, MoreHorizontal, LayoutGrid, ChevronLeft, ChevronRight,
  Check, Upload, CheckCircle, Clock, MapPin, Settings2, UtensilsCrossed, ChefHat, Coffee
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({
      Utensils, User, Settings, LogOut, LayoutDashboard, ShoppingCart, Menu, Grid2x2, Calendar, Users,
      XCircle, CreditCard, CheckCircle2, DollarSign, ShoppingBag, Box, Sparkles, Edit, Trash2, Trash,
      Minus, Plus, Loader2, Printer, X, Search, Star, MessageSquare, Zap, TableIcon, BarChart3, Eye,
      EyeOff, ArrowRight, Mail, Lock, Edit2, Download, Filter, FileDown, Ban, MoreHorizontal,
      LayoutGrid, ChevronLeft, ChevronRight, Check, Upload, CheckCircle, Clock, MapPin, Settings2,
      UtensilsCrossed, ChefHat, Coffee
    })),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};
