import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { 
  LucideAngularModule,
  Smartphone,
  Monitor,
  ChefHat,
  TrendingUp,
  Utensils,
  MessageSquare,
  Twitter,
  Instagram,
  Sparkles,
  Flame
} from 'lucide-angular';
import { ItemsComponent } from './components/items/items.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ItemsComponent],
  template: `
    <div class="w-full flex flex-col bg-canvas text-ink">
      
      <!-- Savora Hero Band (Full Bleed) -->
      <section class="hero-band w-full flex items-center justify-center py-[160px] relative overflow-hidden bg-surface-dark text-on-dark rounded-none">
        
        <div class="relative z-10 w-full max-w-[1440px] mx-auto px-lg lg:px-xl flex flex-col items-center text-center">
          
          <h1 class="text-display-xxl m-0 mb-xl max-w-4xl">
            Streamline your <span class="text-primary">restaurant</span> operations.
          </h1>
          
          <p class="text-subtitle text-on-dark-mute max-w-2xl mx-auto mb-xl">
            Savora is the complete POS and real-time management system for modern restaurants. From kitchen display to reservations, handle everything in one seamless workflow.
          </p>

          <div class="flex items-center justify-center gap-md">
            <a routerLink="/" fragment="items" class="button-primary decoration-none">
              Explore Menu
            </a>
            <a routerLink="/login" class="button-dark bg-[#24292e] text-on-dark decoration-none flex items-center gap-sm border border-[#444]">
              Sign in to Dashboard
            </a>
          </div>

        </div>
      </section>

      <!-- Items / Menu Section (Cream Canvas) -->
      <div class="w-full max-w-[1280px] mx-auto px-lg sm:px-xl py-section" id="items">
        <div class="flex flex-col items-center text-center max-w-3xl mx-auto mb-[64px] space-y-md">
          
          <h2 class="text-5xl md:text-6xl font-extrabold tracking-tight m-0 text-ink">
            Discover Our Menu
          </h2>
          <p class="text-lg md:text-xl text-mute m-0 max-w-2xl mx-auto leading-relaxed mt-4">
            Explore our thoughtfully curated selection of premium dishes, dynamically updated to reflect the freshest ingredients available today.
          </p>
        </div>
        
        <app-items></app-items>
      </div>

      <!-- About Us Section (Dark Code-Story Band) -->
      <section id="about" class="w-full bg-surface-dark text-on-dark py-section">
        <div class="max-w-[1280px] mx-auto px-lg sm:px-xl grid grid-cols-1 lg:grid-cols-2 gap-[48px] items-center">
          <!-- Story Content -->
          <div class="space-y-lg">
            <h2 class="text-display-xl m-0">
              How it works
            </h2>
            <p class="text-body-lg text-on-dark-mute">
              Savora integrates every aspect of your restaurant. From the moment a customer views the menu or books a table, to the kitchen processing the order, everything flows seamlessly.
            </p>
            <p class="text-body-md text-on-dark-mute">
              Our cloud-based POS and Kitchen Display System (KDS) eliminate bottlenecks, reduce wait times, and provide real-time AI insights to help you make smarter business decisions.
            </p>
            <div class="pt-md">
              <a routerLink="/" fragment="experience" class="button-primary decoration-none">
                Discover the Vibe
              </a>
            </div>
          </div>
          <!-- Feature Block -->
          <div class="bg-surface-deep p-xl rounded-md border border-[#333] shadow-lg">
            <div class="flex flex-col gap-md">
              <div class="flex items-start gap-md">
                <div class="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <lucide-icon [img]="Smartphone" class="size-5 text-primary"></lucide-icon>
                </div>
                <div>
                  <h4 class="text-heading-sm m-0 mb-xs">Customer App</h4>
                  <p class="text-body-sm text-on-dark-mute m-0">Digital menus, reservations, and real-time order tracking.</p>
                </div>
              </div>
              <div class="flex items-start gap-md">
                <div class="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <lucide-icon [img]="Monitor" class="size-5 text-primary"></lucide-icon>
                </div>
                <div>
                  <h4 class="text-heading-sm m-0 mb-xs">POS & Staff Dashboard</h4>
                  <p class="text-body-sm text-on-dark-mute m-0">Quick order entry, table management, and payment processing.</p>
                </div>
              </div>
              <div class="flex items-start gap-md">
                <div class="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <lucide-icon [img]="ChefHat" class="size-5 text-primary"></lucide-icon>
                </div>
                <div>
                  <h4 class="text-heading-sm m-0 mb-xs">Kitchen Display System</h4>
                  <p class="text-body-sm text-on-dark-mute m-0">Live order tickets, prep times, and automated routing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section (Surface Bone inset) -->
      <section id="features" class="w-full bg-surface-bone py-section border-t border-b border-hairline">
        <div class="text-center max-w-2xl mx-auto mb-xxxl space-y-md">
          <h2 class="text-display-xl m-0">
            Powered by AI
          </h2>
          <p class="text-body-lg text-mute m-0">
            Savora leverages advanced AI to optimize your restaurant.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-xl max-w-[1280px] mx-auto px-lg">
          
          <div class="collection-tile hover:bg-canvas transition-colors">
            <div class="space-y-md">
              <div class="size-12 rounded-full bg-surface-card border border-hairline flex items-center justify-center">
                <lucide-icon [img]="TrendingUp" class="size-5 text-ink"></lucide-icon>
              </div>
              <h3 class="text-heading-md m-0">Demand Forecasting</h3>
              <p class="text-body-sm text-mute m-0">
                Predict rush hours and optimize staff scheduling with intelligent demand forecasts.
              </p>
            </div>
          </div>

          <div class="collection-tile hover:bg-canvas transition-colors">
            <div class="space-y-md">
              <div class="size-12 rounded-full bg-surface-card border border-hairline flex items-center justify-center">
                <lucide-icon [img]="Utensils" class="size-5 text-ink"></lucide-icon>
              </div>
              <h3 class="text-heading-md m-0">Smart Menu</h3>
              <p class="text-body-sm text-mute m-0">
                AI analyzes customer feedback and sales data to suggest recipe improvements and new dishes.
              </p>
            </div>
          </div>

          <div class="collection-tile hover:bg-canvas transition-colors">
            <div class="space-y-md">
              <div class="size-12 rounded-full bg-surface-card border border-hairline flex items-center justify-center">
                <lucide-icon [img]="MessageSquare" class="size-5 text-ink"></lucide-icon>
              </div>
              <h3 class="text-heading-md m-0">Executive Briefings</h3>
              <p class="text-body-sm text-mute m-0">
                Get real-time natural language summaries of your restaurant's daily performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Awwwards-style Experience / Specials Section -->
      <section id="experience" class="w-full bg-surface-dark text-on-dark py-[120px] relative overflow-hidden border-b border-[#333]">
        <!-- Background Accents -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div class="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px]"></div>
          <div class="absolute bottom-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[100px]"></div>
        </div>

        <div class="relative z-10 max-w-[1280px] mx-auto px-lg">
          <div class="mb-[80px] max-w-3xl mx-auto text-center flex flex-col items-center">
         
            <h2 class="text-6xl md:text-7xl font-extrabold tracking-tight m-0 mb-md leading-[1.1]">
              A symphony of <br/><span class="text-on-dark-mute">taste & design.</span>
            </h2>
            <p class="text-xl text-on-dark-mute m-0 leading-relaxed max-w-xl">
              We believe dining is more than just food. It’s an immersive journey crafted through impeccable aesthetics, intelligent service, and culinary mastery.
            </p>
          </div>

          <!-- Bento Grid -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-md h-auto md:h-[600px]">
            
            <!-- Large Featured Block (Left) -->
            <div class="md:col-span-7 relative rounded-2xl overflow-hidden group cursor-pointer">
              <img src="/atmosphere.png" alt="Restaurant Atmosphere" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div class="absolute bottom-0 left-0 p-xl w-full transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                <h3 class="text-4xl font-bold m-0 mb-xs text-white drop-shadow-sm">Atmosphere</h3>
                <p class="text-body-lg text-white/90 m-0 max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 drop-shadow-md">Designed to provoke conversation and inspire the senses, our dining room is an architectural marvel.</p>
              </div>
            </div>

            <!-- Right Column Grid -->
            <div class="md:col-span-5 grid grid-rows-2 gap-md h-[600px] md:h-auto">
              
              <!-- Top Right -->
              <div class="relative rounded-2xl overflow-hidden group cursor-pointer">
                <img src="/culinary.png" alt="Culinary Art" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div class="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div class="absolute bottom-0 left-0 p-lg w-full transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                  <h3 class="text-2xl font-bold m-0 mb-xs text-white drop-shadow-sm">Culinary Art</h3>
                  <p class="text-body-md text-white/90 m-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 drop-shadow-md">Award-winning chefs pushing the boundaries of modern gastronomy.</p>
                </div>
              </div>

              <!-- Bottom Right -->
              <div class="relative rounded-2xl overflow-hidden group cursor-pointer">
                <img src="/wine.png" alt="Curated Pairings" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div class="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div class="absolute bottom-0 left-0 p-lg w-full transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                  <h3 class="text-2xl font-bold m-0 mb-xs text-white drop-shadow-sm">Curated Pairings</h3>
                  <p class="text-body-md text-white/90 m-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 drop-shadow-md">A world-class cellar featuring extremely rare and vintage selections.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <!-- Signature Savora Footer -->
      <footer class="w-full bg-surface-deep text-on-dark py-section rounded-none border-t border-[#333]">
        <div class="max-w-[1280px] mx-auto px-lg grid grid-cols-1 md:grid-cols-4 gap-xl">
          
          <div class="space-y-md">
            <div class="flex items-center gap-xs">
              <img src="/logo.png" alt="Savora Logo" class="h-12 md:h-14 w-auto object-contain drop-shadow-sm" />
              <span class="font-extrabold text-2xl tracking-tight text-on-dark">Savora</span>
            </div>
            <p class="text-body-sm text-on-dark-mute max-w-xs m-0">
              The next-generation POS and restaurant management system.
            </p>
          </div>

          <div class="space-y-sm">
            <p class="text-caption-tight text-on-dark-mute uppercase tracking-widest m-0 mb-md">Product</p>
            <a routerLink="/" fragment="features" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Features</a>
            <a routerLink="/" fragment="experience" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Experience</a>
            <a routerLink="/" fragment="about" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">How it Works</a>
          </div>

          <div class="space-y-sm">
            <p class="text-caption-tight text-on-dark-mute uppercase tracking-widest m-0 mb-md">Resources</p>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Documentation</a>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Blog</a>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Support</a>
          </div>

          <div class="space-y-sm">
            <p class="text-caption-tight text-on-dark-mute uppercase tracking-widest m-0 mb-md">Company</p>
            <a routerLink="/" fragment="about" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">About Us</a>
            <a href="mailto:careers@dineflow.com" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Careers</a>
            <a href="mailto:sales@dineflow.com" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Contact</a>
          </div>
        </div>

        <div class="max-w-[1280px] mx-auto px-lg mt-xl pt-xl border-t border-[#333] flex justify-between items-center text-caption text-on-dark-mute">
          <span>© 2026 Savora, Inc.</span>
          <div class="flex gap-md">
            <a href="#" class="text-on-dark-mute hover:text-on-dark transition-colors"><lucide-icon [img]="Twitter" class="size-4"></lucide-icon></a>
            <a href="#" class="text-on-dark-mute hover:text-on-dark transition-colors"><lucide-icon [img]="Instagram" class="size-4"></lucide-icon></a>
          </div>
        </div>
      </footer>

    </div>
  `,
  styles: []
})
export class HomeComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  user = this.authService.currentUser;

  readonly Smartphone = Smartphone;
  readonly Monitor = Monitor;
  readonly ChefHat = ChefHat;
  readonly TrendingUp = TrendingUp;
  readonly Utensils = Utensils;
  readonly MessageSquare = MessageSquare;
  readonly Twitter = Twitter;
  readonly Instagram = Instagram;
  readonly Sparkles = Sparkles;
  readonly Flame = Flame;
}
