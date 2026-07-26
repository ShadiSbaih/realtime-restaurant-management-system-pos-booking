import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { ItemsComponent } from './components/items/items.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ItemsComponent],
  template: `
    <div class="w-full flex flex-col">
      
      <!-- Signature DineFlow Full-Bleed Flood-Fill Hero Section (No margins, no rounded corners, edge-to-edge) -->
      <section class="relative w-full min-h-[80vh] bg-gradient-to-br from-[#ff5522] via-[#ff4019] to-[#d92a0c] dark:from-[#e64619] dark:via-[#cc3311] dark:to-[#a61c00] transition-all duration-700 shadow-xl flex items-center">
        
        <!-- Authentic Halftone Dotted Pattern Overlay -->
        <div
          class="absolute inset-0 opacity-20 pointer-events-none"
          style="--dot-color:#241006; background-image: radial-gradient(var(--dot-color) 2px, transparent 2px); background-size: 24px 24px; mask-image: linear-gradient(to bottom, transparent, black 60%); -webkit-mask-image: linear-gradient(to bottom, transparent, black 60%);"
        ></div>

        <!-- Hero Content Container (Centered within the full-bleed background) -->
        <div class="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Text Content (7 Columns) -->
          <div class="lg:col-span-7 space-y-8 text-center lg:text-left z-20">
            <!-- High-contrast typography: #241006 coffee obsidian and crisp white -->
            <h1 class="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.9] text-[#241006] uppercase m-0 drop-shadow-sm">
              FUEL <span class="text-white underline decoration-4 underline-offset-8 drop-shadow-md">your day</span><br />
              THE <span class="text-white drop-shadow-md">healthy</span> WAY
            </h1>
            
            <p class="text-base sm:text-xl text-[#241006]/95 max-w-xl mx-auto lg:mx-0 leading-relaxed font-bold">
              Discover our customizable salads, bowls, and artisan creations made from the freshest organic ingredients, sourced directly from local sustainable farms.
            </p>

            <!-- Action Buttons matching original styling -->
            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <a href="/#items" class="bg-[#241006] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest hover:scale-105 hover:shadow-2xl hover:shadow-black/30 transition-all decoration-none flex items-center gap-2">
                <span>Order Food</span>
                <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
              </a>
              
              <a routerLink="/reservation" class="bg-white/95 backdrop-blur-md text-[#241006] border border-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-white transition-all shadow-lg decoration-none">
                Make Reservation
              </a>
            </div>

            <!-- High-Contrast Glassmorphism Stats Badges -->
            <div class="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <div class="flex items-center gap-2.5 bg-[#241006]/15 dark:bg-black/25 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 shadow-sm hover:scale-[1.02] transition-transform">
                <div class="size-6 rounded-full bg-white text-primary flex items-center justify-center shadow-sm shrink-0">
                  <lucide-icon name="check-circle-2" [size]="14" class="font-bold"></lucide-icon>
                </div>
                <span class="text-xs font-black uppercase tracking-wider text-[#241006] dark:text-white drop-shadow-sm">100% Organic Produce</span>
              </div>
              <div class="flex items-center gap-2.5 bg-[#241006]/15 dark:bg-black/25 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 shadow-sm hover:scale-[1.02] transition-transform">
                <div class="size-6 rounded-full bg-white text-primary flex items-center justify-center shadow-sm shrink-0">
                  <lucide-icon name="clock" [size]="14" class="font-bold"></lucide-icon>
                </div>
                <span class="text-xs font-black uppercase tracking-wider text-[#241006] dark:text-white drop-shadow-sm">15-Min Average Prep</span>
              </div>
            </div>
          </div>

          <!-- Hero Image Container (5 Columns, unclipped, floating with dynamic badges) -->
          <div class="lg:col-span-5 flex justify-center items-center relative z-10 py-10 lg:py-4">
            <div class="relative w-full aspect-square flex items-center justify-center">
              
              <!-- Rich Ambient Radial Glow behind dish -->
              <div class="absolute w-[85%] aspect-square rounded-full bg-gradient-to-tr from-amber-200/50 via-white/40 to-orange-300/40 blur-3xl pointer-events-none"></div>
              
              <!-- Floating Dynamic Badge 1: Executive Chef Endorsement (Top Right) -->
              <div class="absolute top-2 right-2 sm:right-6 bg-white/95 dark:bg-[#131b2e]/95 backdrop-blur-xl px-4 py-2.5 rounded-full shadow-2xl border border-white/40 flex items-center gap-2 animate-pulse-soft z-20">
                <div class="flex -space-x-1.5">
                  <div class="size-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">★</div>
                  <div class="size-5 rounded-full bg-primary border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">4.9</div>
                </div>
                <span class="text-xs font-black text-[#241006] dark:text-white uppercase tracking-wider">2k+ Happy Foodies</span>
              </div>

              <!-- Unclipped floating image with enhanced dimensions and deep shadow -->
              <img src="/artisan_hero_platter.png" alt="Healthy Food Tray" class="w-full max-w-[500px] lg:max-w-[600px] h-auto object-contain drop-shadow-[0_35px_45px_rgba(36,16,6,0.5)] animate-float transition-transform hover:scale-105 duration-500 relative z-10" />

              <!-- Floating Dynamic Badge 2: Artisan Quality (Bottom Left) -->
              <div class="absolute bottom-2 left-2 sm:left-6 bg-white/95 dark:bg-[#131b2e]/95 backdrop-blur-xl p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-white/40 flex items-center gap-3 z-20 hover:scale-105 transition-transform">
                <div class="size-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <lucide-icon name="sparkles" class="size-5"></lucide-icon>
                </div>
                <div class="text-left">
                  <p class="text-[10px] font-black uppercase tracking-widest text-primary m-0">Artisan Quality</p>
                  <p class="text-xs font-black text-[#241006] dark:text-white uppercase m-0 mt-0.5 leading-tight">Chef's Signature</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- Items / Menu Section (with standard max-w-7xl wrapper) -->
      <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20" id="items">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-border pb-4">
          <div>
            <span class="text-xs font-black uppercase tracking-widest text-primary mb-1 block">Fresh From Our Kitchen</span>
            <h2 class="font-black text-2xl sm:text-3xl text-foreground m-0">
              Choose Any Meal From Here
            </h2>
          </div>
          <p class="text-xs font-semibold text-muted-foreground m-0 max-w-xs">
            Handcrafted daily by executive chefs using seasonal local harvest.
          </p>
        </div>
        
        <app-items></app-items>
      </div>

      <!-- About Us Section (#about) -->
      <section id="about" class="w-full bg-[#f8f5f2] dark:bg-slate-900/60 py-20 border-t border-b border-border/80 transition-colors">
        <div class="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Story Content (7 Cols) -->
          <div class="lg:col-span-7 space-y-6">
            <span class="text-xs font-black uppercase tracking-widest text-primary block">Our Philosophy & Heritage</span>
            <h2 class="text-3xl sm:text-5xl font-black text-[#241006] dark:text-white tracking-tight uppercase m-0 leading-tight">
              Handcrafted Artisan Dining
            </h2>
            <p class="text-base sm:text-lg text-[#241006]/85 dark:text-white/85 leading-relaxed font-semibold">
              Born from a passion for organic gastronomy and sustainable agriculture, DineFlow bridges the gap between local artisan farms and culinary excellence. Every dish is curated by executive chefs who believe that food should fuel your body while delighting your senses.
            </p>
            <p class="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We partner exclusively with zero-waste, regenerative agriculture farms within a 50-mile radius. From harvest to your plate in under 24 hours, our ingredients retain maximum nutrient density, vibrant color, and pure, authentic flavor.
            </p>
            <div class="pt-4 flex items-center gap-6">
              <a href="/#items" class="bg-[#241006] dark:bg-primary text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 shadow-md transition-all decoration-none inline-flex items-center gap-2">
                <span>Explore Menu</span>
                <lucide-icon name="arrow-right" class="size-4"></lucide-icon>
              </a>
            </div>
          </div>
          <!-- Philosophy Stat Cards (5 Cols) -->
          <div class="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between gap-4 hover:border-primary/50 transition-all">
              <div class="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <lucide-icon name="chef-hat" class="size-6"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-black text-[#241006] dark:text-white uppercase m-0">Executive Chefs</h3>
                <p class="text-xs text-muted-foreground mt-1 m-0">Michelin-trained culinary masters crafting seasonal daily menus.</p>
              </div>
            </div>
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between gap-4 sm:translate-y-6 hover:border-primary/50 transition-all">
              <div class="size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <lucide-icon name="heart" class="size-6"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-black text-[#241006] dark:text-white uppercase m-0">100% Organic</h3>
                <p class="text-xs text-muted-foreground mt-1 m-0">Certified pesticide-free, GMO-free produce harvested daily.</p>
              </div>
            </div>
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between gap-4 hover:border-primary/50 transition-all">
              <div class="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <lucide-icon name="award" class="size-6"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-black text-[#241006] dark:text-white uppercase m-0">Zero Waste</h3>
                <p class="text-xs text-muted-foreground mt-1 m-0">Composting 100% of organic scraps to replenish local farm soil.</p>
              </div>
            </div>
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between gap-4 sm:translate-y-6 hover:border-primary/50 transition-all">
              <div class="size-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <lucide-icon name="utensils-crossed" class="size-6"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-black text-[#241006] dark:text-white uppercase m-0">Artisan Craft</h3>
                <p class="text-xs text-muted-foreground mt-1 m-0">Handmade dressings, organic sourdough, and cold-pressed infusions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Locations Section (#locations) -->
      <section id="locations" class="w-full max-w-7xl mx-auto px-6 sm:px-12 py-20">
        <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span class="text-xs font-black uppercase tracking-widest text-primary block">Find Your Table</span>
          <h2 class="text-3xl sm:text-5xl font-black text-[#241006] dark:text-white tracking-tight uppercase m-0">
            Our Artisan Dining Rooms
          </h2>
          <p class="text-sm sm:text-base text-muted-foreground m-0 font-medium">
            Experience DineFlow's vibrant atmosphere across our flagship locations, featuring open kitchens, botanical garden seating, and live POS table reservation.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Location 1 -->
          <div class="bg-white dark:bg-slate-800 rounded-3xl border border-border/80 p-8 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all flex flex-col justify-between gap-6 group">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="bg-primary/10 text-primary text-[11px] font-black uppercase px-3 py-1 rounded-full tracking-wider">Flagship Sanctuary</span>
                <span class="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span> Open Now
                </span>
              </div>
              <h3 class="text-xl font-black text-[#241006] dark:text-white uppercase m-0 group-hover:text-primary transition-colors">Downtown Metropolis</h3>
              <p class="text-xs font-semibold text-muted-foreground m-0 flex items-start gap-2">
                <lucide-icon name="map-pin" class="size-4 text-primary shrink-0 mt-0.5"></lucide-icon>
                <span>124 Culinary Promenade, Suite 100<br/>Metropolis Arts District</span>
              </p>
              <p class="text-xs font-semibold text-muted-foreground m-0 flex items-center gap-2">
                <lucide-icon name="clock" class="size-4 text-primary shrink-0"></lucide-icon>
                <span>Daily: 8:00 AM – 11:00 PM</span>
              </p>
              <p class="text-xs font-semibold text-muted-foreground m-0 flex items-center gap-2">
                <lucide-icon name="phone" class="size-4 text-primary shrink-0"></lucide-icon>
                <span>+1 (555) 234-5678</span>
              </p>
            </div>
            <a routerLink="/reservation" class="w-full py-3.5 rounded-2xl bg-[#241006]/5 dark:bg-white/5 hover:bg-primary hover:text-white dark:hover:bg-primary text-[#241006] dark:text-white text-xs font-black uppercase tracking-widest text-center transition-all decoration-none block">
              Reserve A Table
            </a>
          </div>

          <!-- Location 2 -->
          <div class="bg-white dark:bg-slate-800 rounded-3xl border border-border/80 p-8 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all flex flex-col justify-between gap-6 group">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-black uppercase px-3 py-1 rounded-full tracking-wider">Ocean View Terrace</span>
                <span class="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span> Open Now
                </span>
              </div>
              <h3 class="text-xl font-black text-[#241006] dark:text-white uppercase m-0 group-hover:text-primary transition-colors">Seaside Promenade</h3>
              <p class="text-xs font-semibold text-muted-foreground m-0 flex items-start gap-2">
                <lucide-icon name="map-pin" class="size-4 text-primary shrink-0 mt-0.5"></lucide-icon>
                <span>88 Harbor Way, Pier 4<br/>Coastline Marina Marina</span>
              </p>
              <p class="text-xs font-semibold text-muted-foreground m-0 flex items-center gap-2">
                <lucide-icon name="clock" class="size-4 text-primary shrink-0"></lucide-icon>
                <span>Daily: 9:00 AM – 10:30 PM</span>
              </p>
              <p class="text-xs font-semibold text-muted-foreground m-0 flex items-center gap-2">
                <lucide-icon name="phone" class="size-4 text-primary shrink-0"></lucide-icon>
                <span>+1 (555) 876-5432</span>
              </p>
            </div>
            <a routerLink="/reservation" class="w-full py-3.5 rounded-2xl bg-[#241006]/5 dark:bg-white/5 hover:bg-primary hover:text-white dark:hover:bg-primary text-[#241006] dark:text-white text-xs font-black uppercase tracking-widest text-center transition-all decoration-none block">
              Reserve A Table
            </a>
          </div>

          <!-- Location 3 -->
          <div class="bg-white dark:bg-slate-800 rounded-3xl border border-border/80 p-8 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all flex flex-col justify-between gap-6 group">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase px-3 py-1 rounded-full tracking-wider">Botanical Garden</span>
                <span class="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <span class="size-2 rounded-full bg-amber-500"></span> Opens 11 AM
                </span>
              </div>
              <h3 class="text-xl font-black text-[#241006] dark:text-white uppercase m-0 group-hover:text-primary transition-colors">Highland Greenhouse</h3>
              <p class="text-xs font-semibold text-muted-foreground m-0 flex items-start gap-2">
                <lucide-icon name="map-pin" class="size-4 text-primary shrink-0 mt-0.5"></lucide-icon>
                <span>450 Botanical Boulevard<br/>Highland Valley Summit</span>
              </p>
              <p class="text-xs font-semibold text-muted-foreground m-0 flex items-center gap-2">
                <lucide-icon name="clock" class="size-4 text-primary shrink-0"></lucide-icon>
                <span>Wed-Sun: 11:00 AM – 9:00 PM</span>
              </p>
              <p class="text-xs font-semibold text-muted-foreground m-0 flex items-center gap-2">
                <lucide-icon name="phone" class="size-4 text-primary shrink-0"></lucide-icon>
                <span>+1 (555) 345-6789</span>
              </p>
            </div>
            <a routerLink="/reservation" class="w-full py-3.5 rounded-2xl bg-[#241006]/5 dark:bg-white/5 hover:bg-primary hover:text-white dark:hover:bg-primary text-[#241006] dark:text-white text-xs font-black uppercase tracking-widest text-center transition-all decoration-none block">
              Reserve A Table
            </a>
          </div>
        </div>
      </section>

      <!-- Resources Section (#resources) -->
      <section id="resources" class="w-full bg-[#f8f5f2] dark:bg-slate-900/60 py-20 border-t border-b border-border/80 transition-colors">
        <div class="max-w-7xl mx-auto px-6 sm:px-12">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span class="text-xs font-black uppercase tracking-widest text-primary block mb-2">Culinary Knowledge</span>
              <h2 class="text-3xl sm:text-5xl font-black text-[#241006] dark:text-white tracking-tight uppercase m-0">
                Guides, Nutrition & Stories
              </h2>
            </div>
            <p class="text-sm sm:text-base text-muted-foreground m-0 max-w-md font-medium">
              Dive into our executive chef notes, organic nutrition guides, and stories from our local regenerative farm partners.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Article 1 -->
            <article class="bg-white dark:bg-slate-800 rounded-3xl border border-border/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
              <div class="p-8 space-y-4">
                <div class="flex items-center gap-2">
                  <span class="bg-primary/15 text-primary text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">Agronomy Guide</span>
                  <span class="text-xs text-muted-foreground font-semibold">5 min read</span>
                </div>
                <h3 class="text-xl font-black text-[#241006] dark:text-white uppercase m-0 group-hover:text-primary transition-colors leading-snug">
                  Why Regenerative Soil Transforms Flavor Density
                </h3>
                <p class="text-xs sm:text-sm text-muted-foreground m-0 leading-relaxed">
                  Discover how mineral-rich living soil without chemical fertilizers creates sweeter greens, punchier herbs, and higher antioxidants in every salad bowl.
                </p>
              </div>
              <div class="px-8 pb-8 pt-0 flex items-center justify-between border-t border-border/40 pt-4 mt-4">
                <span class="text-xs font-black uppercase tracking-wider text-[#241006] dark:text-white">By Chef Marcus</span>
                <span class="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Read Article →</span>
              </div>
            </article>

            <!-- Article 2 -->
            <article class="bg-white dark:bg-slate-800 rounded-3xl border border-border/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
              <div class="p-8 space-y-4">
                <div class="flex items-center gap-2">
                  <span class="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">Masterclass</span>
                  <span class="text-xs text-muted-foreground font-semibold">8 min read</span>
                </div>
                <h3 class="text-xl font-black text-[#241006] dark:text-white uppercase m-0 group-hover:text-primary transition-colors leading-snug">
                  The Art of Pairing Citrus Infusions with Organic Greens
                </h3>
                <p class="text-xs sm:text-sm text-muted-foreground m-0 leading-relaxed">
                  Learn our kitchen's secrets for balancing acidity, cold-pressed olive oils, and toasted nuts to elevate your homemade salads into restaurant-grade creations.
                </p>
              </div>
              <div class="px-8 pb-8 pt-0 flex items-center justify-between border-t border-border/40 pt-4 mt-4">
                <span class="text-xs font-black uppercase tracking-wider text-[#241006] dark:text-white">By Chef Elena</span>
                <span class="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Read Article →</span>
              </div>
            </article>

            <!-- Article 3 -->
            <article class="bg-white dark:bg-slate-800 rounded-3xl border border-border/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
              <div class="p-8 space-y-4">
                <div class="flex items-center gap-2">
                  <span class="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">Sustainability</span>
                  <span class="text-xs text-muted-foreground font-semibold">4 min read</span>
                </div>
                <h3 class="text-xl font-black text-[#241006] dark:text-white uppercase m-0 group-hover:text-primary transition-colors leading-snug">
                  Inside Our Zero-Waste Kitchen & Composting Loop
                </h3>
                <p class="text-xs sm:text-sm text-muted-foreground m-0 leading-relaxed">
                  How DineFlow eliminated single-use plastics and built a closed-loop system where kitchen trims return directly to our farming partners as organic compost.
                </p>
              </div>
              <div class="px-8 pb-8 pt-0 flex items-center justify-between border-t border-border/40 pt-4 mt-4">
                <span class="text-xs font-black uppercase tracking-wider text-[#241006] dark:text-white">By Sustainability Team</span>
                <span class="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Read Article →</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Contact Us Section (#contact) - Rebuilt for Luxury Clean Aesthetics -->
      <section id="contact" class="w-full max-w-7xl mx-auto px-6 sm:px-12 py-20">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <!-- Left Info (5 Cols) -->
          <div class="lg:col-span-5 space-y-8">
            <div class="space-y-3">
              <span class="text-xs font-black uppercase tracking-widest text-primary block">We're Here To Serve You</span>
              <h2 class="text-3xl sm:text-5xl font-black text-[#241006] dark:text-white tracking-tight uppercase m-0 leading-tight">
                Get In Touch
              </h2>
              <p class="text-sm sm:text-base text-muted-foreground m-0 leading-relaxed font-medium">
                Whether you're inquiring about private dining events, corporate catering, sommelier wine pairings, or custom dietary menus, our culinary concierge team is at your service.
              </p>
            </div>

            <div class="space-y-4">
              <div class="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-border/80 shadow-sm flex items-center gap-4 hover:border-primary/50 transition-all">
                <div class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <lucide-icon name="phone" class="size-5"></lucide-icon>
                </div>
                <div>
                  <p class="text-[11px] font-black uppercase tracking-wider text-muted-foreground m-0">Concierge Desk</p>
                  <p class="text-sm font-black text-[#241006] dark:text-white m-0 mt-0.5">+1 (800) 555-DINE</p>
                </div>
              </div>

              <div class="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-border/80 shadow-sm flex items-center gap-4 hover:border-primary/50 transition-all">
                <div class="size-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <lucide-icon name="mail" class="size-5"></lucide-icon>
                </div>
                <div>
                  <p class="text-[11px] font-black uppercase tracking-wider text-muted-foreground m-0">Private Events & Catering</p>
                  <p class="text-sm font-black text-[#241006] dark:text-white m-0 mt-0.5">concierge&#64;dineflow-artisan.com</p>
                </div>
              </div>

              <div class="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-border/80 shadow-sm flex items-center gap-4 hover:border-primary/50 transition-all">
                <div class="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <lucide-icon name="map-pin" class="size-5"></lucide-icon>
                </div>
                <div>
                  <p class="text-[11px] font-black uppercase tracking-wider text-muted-foreground m-0">Flagship Sanctuary</p>
                  <p class="text-sm font-black text-[#241006] dark:text-white m-0 mt-0.5">124 Culinary Promenade, Metropolis</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Form (7 Cols) -->
          <div class="lg:col-span-7 bg-white dark:bg-slate-800/90 p-8 sm:p-12 rounded-[32px] border border-border/80 shadow-xl hover:shadow-2xl transition-all relative">
            <div class="mb-6">
              <h3 class="text-xl font-black text-[#241006] dark:text-white uppercase m-0">Send An Inquiry</h3>
              <p class="text-xs text-muted-foreground mt-1 m-0">Our reservation team typically responds within 2 business hours.</p>
            </div>

            <form (submit)="$event.preventDefault()" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="space-y-2 text-left">
                  <label class="text-xs font-black uppercase tracking-wider text-[#241006] dark:text-white block">Your Name</label>
                  <input type="text" placeholder="e.g. Alexander Wright" class="w-full px-4 py-3.5 rounded-xl bg-[#f8f5f2] dark:bg-slate-900/80 border border-border/80 text-foreground placeholder:text-muted-foreground/60 text-sm font-semibold focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 transition-all" />
                </div>
                <div class="space-y-2 text-left">
                  <label class="text-xs font-black uppercase tracking-wider text-[#241006] dark:text-white block">Email Address</label>
                  <input type="email" placeholder="alexander&#64;example.com" class="w-full px-4 py-3.5 rounded-xl bg-[#f8f5f2] dark:bg-slate-900/80 border border-border/80 text-foreground placeholder:text-muted-foreground/60 text-sm font-semibold focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 transition-all" />
                </div>
              </div>

              <div class="space-y-2 text-left">
                <label class="text-xs font-black uppercase tracking-wider text-[#241006] dark:text-white block">Inquiry Type</label>
                <select class="w-full px-4 py-3.5 rounded-xl bg-[#f8f5f2] dark:bg-slate-900/80 border border-border/80 text-foreground text-sm font-semibold focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer">
                  <option value="general">General Culinary Inquiry</option>
                  <option value="catering">Private Event & Catering</option>
                  <option value="press">Press & Media Relations</option>
                  <option value="feedback">Dining Experience Feedback</option>
                </select>
              </div>

              <div class="space-y-2 text-left">
                <label class="text-xs font-black uppercase tracking-wider text-[#241006] dark:text-white block">Your Message</label>
                <textarea rows="4" placeholder="Tell us about your occasion, party size, or special requests..." class="w-full px-4 py-3.5 rounded-xl bg-[#f8f5f2] dark:bg-slate-900/80 border border-border/80 text-foreground placeholder:text-muted-foreground/60 text-sm font-semibold focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"></textarea>
              </div>

              <button type="submit" class="w-full py-4 rounded-xl bg-[#241006] dark:bg-primary hover:bg-primary dark:hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-black/10 dark:shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2 border-none">
                <lucide-icon name="send" class="size-4"></lucide-icon>
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <!-- Signature DineFlow Luxury Artisan Footer -->
      <footer class="w-full bg-[#241006] text-white pt-16 pb-12 border-t-4 border-primary">
        <div class="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-12">
          <!-- Col 1: Brand & Mission (4 Cols) -->
          <div class="lg:col-span-4 space-y-4">
            <div class="flex items-center gap-2.5">
              <div class="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/30">
                <lucide-icon name="utensils" [size]="20" class="font-bold"></lucide-icon>
              </div>
              <span class="font-black tracking-tighter text-2xl text-white uppercase">DINE<span class="text-primary">FLOW</span></span>
            </div>
            <p class="text-xs sm:text-sm text-white/70 leading-relaxed font-medium max-w-sm m-0">
              Pioneering organic gastronomy and zero-waste regenerative dining since 2024. Handcrafted daily by executive chefs and local sustainable farmers.
            </p>
            <div class="pt-2 flex items-center gap-3">
              <div class="size-9 rounded-full bg-white/10 hover:bg-primary hover:scale-110 transition-all flex items-center justify-center text-white cursor-pointer">
                <span class="text-xs font-bold">IG</span>
              </div>
              <div class="size-9 rounded-full bg-white/10 hover:bg-primary hover:scale-110 transition-all flex items-center justify-center text-white cursor-pointer">
                <span class="text-xs font-bold">FB</span>
              </div>
              <div class="size-9 rounded-full bg-white/10 hover:bg-primary hover:scale-110 transition-all flex items-center justify-center text-white cursor-pointer">
                <span class="text-xs font-bold">X</span>
              </div>
              <div class="size-9 rounded-full bg-white/10 hover:bg-primary hover:scale-110 transition-all flex items-center justify-center text-white cursor-pointer">
                <span class="text-xs font-bold">YT</span>
              </div>
            </div>
          </div>

          <!-- Col 2: Navigation (2 Cols) -->
          <div class="lg:col-span-2 space-y-3">
            <h4 class="text-xs font-black uppercase tracking-widest text-primary m-0">Navigation</h4>
            <ul class="space-y-2.5 m-0 p-0 list-none text-xs sm:text-sm font-semibold text-white/80">
              <li><a href="/#items" class="hover:text-primary transition-colors text-white/80 decoration-none">Menu +</a></li>
              <li><a href="/#about" class="hover:text-primary transition-colors text-white/80 decoration-none">About Us</a></li>
              <li><a href="/#locations" class="hover:text-primary transition-colors text-white/80 decoration-none">Locations</a></li>
              <li><a href="/#resources" class="hover:text-primary transition-colors text-white/80 decoration-none">Resources</a></li>
              <li><a href="/#contact" class="hover:text-primary transition-colors text-white/80 decoration-none">Contact Us</a></li>
            </ul>
          </div>

          <!-- Col 3: Dining Hours (3 Cols) -->
          <div class="lg:col-span-3 space-y-3">
            <h4 class="text-xs font-black uppercase tracking-widest text-primary m-0">Artisan Kitchen Hours</h4>
            <div class="space-y-2 text-xs sm:text-sm text-white/80 font-medium">
              <p class="m-0 flex justify-between border-b border-white/10 pb-1.5">
                <span class="font-bold">Mon – Fri:</span> <span>8:00 AM – 11:00 PM</span>
              </p>
              <p class="m-0 flex justify-between border-b border-white/10 pb-1.5">
                <span class="font-bold">Sat – Sun:</span> <span>9:00 AM – 11:30 PM</span>
              </p>
              <p class="m-0 text-primary text-[11px] font-black pt-1">
                ★ Live POS Table Reservation Available 24/7
              </p>
            </div>
          </div>

          <!-- Col 4: Newsletter Club (3 Cols) -->
          <div class="lg:col-span-3 space-y-3">
            <h4 class="text-xs font-black uppercase tracking-widest text-primary m-0">Culinary Club</h4>
            <p class="text-xs text-white/70 m-0 leading-relaxed font-medium">
              Subscribe to receive seasonal menu reveals, sommelier pairing notes, and private event invitations.
            </p>
            <form (submit)="$event.preventDefault()" class="flex gap-2 pt-1">
              <input type="email" placeholder="Enter your email" class="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs font-medium focus:outline-none focus:border-primary transition-all" />
              <button type="submit" class="px-4 py-2.5 rounded-xl bg-primary hover:bg-[#d92a0c] text-white font-black text-xs uppercase tracking-wider shrink-0 transition-all border-none cursor-pointer">
                Join
              </button>
            </form>
          </div>
        </div>

        <!-- Copyright Bar -->
        <div class="max-w-7xl mx-auto px-6 sm:px-12 pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-white/50">
          <p class="m-0">© 2026 DineFlow Artisan Hospitality Group. All rights reserved.</p>
          <div class="flex flex-wrap items-center gap-6">
            <span class="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span class="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span class="hover:text-white transition-colors cursor-pointer">Accessibility</span>
            <span class="hover:text-white transition-colors cursor-pointer">Farm Partners</span>
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
}
