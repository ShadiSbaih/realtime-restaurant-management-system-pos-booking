import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
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
  Grid2x2, Calendar, Users, CircleX as XCircle, CreditCard, CircleCheck as CheckCircle2, DollarSign, ShoppingBag, Box,
  Sparkles, SquarePen as Edit, Trash as Trash2, Trash, Minus, Plus, LoaderCircle as Loader2, Printer, X, Search, Star, MessageSquare,
  Zap, Table as TableIcon, ChartBar as BarChart3, Eye, EyeOff, ArrowRight, Mail, Lock,
  Pen as Edit2, Download, ListFilter as Filter, FileDown, Ban, Ellipsis as MoreHorizontal, LayoutGrid, ChevronLeft, ChevronRight,
  Check, Upload, CircleCheckBig as CheckCircle, Clock, MapPin, Settings2, UtensilsCrossed, ChefHat, Coffee,
  ShieldCheck, Key, ArrowLeft, UserCheck, RefreshCw, Send, SlidersHorizontal, Flame, Award, Wine, Phone, Heart, Sun, Moon, Crown, Briefcase,
  Layers, AlertCircle
} from 'lucide-angular';

import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({
      Utensils, User, Settings, LogOut, LayoutDashboard, ShoppingCart, Menu, Grid2x2, Calendar, Users,
      XCircle, CreditCard, CheckCircle2, DollarSign, ShoppingBag, Box, Sparkles, Edit, Trash2, Trash,
      Minus, Plus, Loader2, Printer, X, Search, Star, MessageSquare, Zap, TableIcon, BarChart3, Eye,
      EyeOff, ArrowRight, Mail, Lock, Edit2, Download, Filter, FileDown, Ban, MoreHorizontal,
      LayoutGrid, ChevronLeft, ChevronRight, Check, Upload, CheckCircle, Clock, MapPin, Settings2,
      UtensilsCrossed, ChefHat, Coffee, ShieldCheck, Key, ArrowLeft, UserCheck, RefreshCw, Send, SlidersHorizontal, Flame, Award, Wine, Phone, Heart, Sun, Moon, Crown, Briefcase,
      Layers, AlertCircle
    })),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};
