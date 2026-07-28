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
    <div class="w-full flex flex-col bg-canvas text-ink">
      
      <!-- Replicate Hero Band (Full Bleed) -->
      <section class="hero-band w-full flex items-center justify-center py-[160px] relative overflow-hidden text-on-dark rounded-none">
        
        <div class="relative z-10 w-full max-w-[1440px] mx-auto px-lg lg:px-xl flex flex-col items-center text-center">
          
          <h1 class="text-display-xxl m-0 mb-xl max-w-4xl">
            Imagine what you can build.
          </h1>
          
          <p class="text-subtitle text-on-dark-mute max-w-2xl mx-auto mb-xl">
            Run open-source models with an API. From text-to-image to language models, scale to millions of requests without managing infrastructure.
          </p>

          <div class="flex items-center justify-center gap-md">
            <a href="/#items" class="button-dark bg-canvas text-ink hover:bg-surface-bone decoration-none">
              Explore models
            </a>
            <a routerLink="/login" class="button-dark bg-[#24292e] text-on-dark decoration-none flex items-center gap-sm">
              <lucide-icon name="github" class="size-4"></lucide-icon>
              Sign in with GitHub
            </a>
          </div>

        </div>
      </section>

      <!-- Items / Menu Section (Cream Canvas) -->
      <div class="w-full max-w-[1280px] mx-auto px-lg sm:px-xl py-section" id="items">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-xl pb-md border-b border-hairline">
          <div>
            <span class="text-caption-tight text-primary mb-sm block">Run AI</span>
            <h2 class="text-display-xl m-0">
              Scale on Replicate
            </h2>
          </div>
          <p class="text-body-lg text-mute m-0 max-w-sm">
            Run open-source machine learning models with a cloud API.
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
              Use our API to run models in the cloud. No infrastructure to manage. Just simple HTTP requests from your favorite language.
            </p>
            <p class="text-body-md text-on-dark-mute">
              We handle the heavy lifting of GPU provisioning, container orchestration, and auto-scaling so you can focus on building your product.
            </p>
            <div class="pt-md">
              <a href="/#docs" class="button-primary decoration-none">
                Read the docs
              </a>
            </div>
          </div>
          <!-- Code Block (Replicating code well) -->
          <div class="bg-surface-deep p-xl rounded-md border border-hairline">
            <div class="flex gap-sm mb-md border-b border-[#333] pb-sm">
              <span class="text-code-sm text-on-dark border-b-2 border-primary pb-sm mb-[-9px]">Python</span>
              <span class="text-code-sm text-on-dark-mute pb-sm mb-[-9px]">Node.js</span>
              <span class="text-code-sm text-on-dark-mute pb-sm mb-[-9px]">cURL</span>
            </div>
            <pre class="text-code-md text-on-dark-mute m-0"><code>import replicate

output = replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    input={"prompt": "A warm cream canvas with a single orange stamp"}
)
print(output)</code></pre>
          </div>
        </div>
      </section>

      <!-- Locations Section (Surface Bone inset) -->
      <section id="locations" class="w-full bg-surface-bone py-section border-t border-b border-hairline">
        <div class="text-center max-w-2xl mx-auto mb-xxxl space-y-md">
          <h2 class="text-display-xl m-0">
            Open Source
          </h2>
          <p class="text-body-lg text-mute m-0">
            Discover thousands of community-built models.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-xl max-w-[1280px] mx-auto px-lg">
          
          <div class="collection-tile hover:bg-canvas transition-colors">
            <div class="space-y-md">
              <div class="size-12 rounded-full bg-surface-card border border-hairline flex items-center justify-center">
                <lucide-icon name="image" class="size-5 text-ink"></lucide-icon>
              </div>
              <h3 class="text-heading-md m-0">Image Generation</h3>
              <p class="text-body-sm text-mute m-0">
                SDXL, Midjourney-style models, and controlnets for precise generation.
              </p>
            </div>
          </div>

          <div class="collection-tile hover:bg-canvas transition-colors">
            <div class="space-y-md">
              <div class="size-12 rounded-full bg-surface-card border border-hairline flex items-center justify-center">
                <lucide-icon name="message-square" class="size-5 text-ink"></lucide-icon>
              </div>
              <h3 class="text-heading-md m-0">Language Models</h3>
              <p class="text-body-sm text-mute m-0">
                Llama 3, Mixtral, and custom fine-tunes for any text task.
              </p>
            </div>
          </div>

          <div class="collection-tile hover:bg-canvas transition-colors">
            <div class="space-y-md">
              <div class="size-12 rounded-full bg-surface-card border border-hairline flex items-center justify-center">
                <lucide-icon name="video" class="size-5 text-ink"></lucide-icon>
              </div>
              <h3 class="text-heading-md m-0">Video & Audio</h3>
              <p class="text-body-sm text-mute m-0">
                SVD, AnimateDiff, Suno, and Bark for rich media synthesis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Us Section (Pricing style 3-up) -->
      <section id="contact" class="w-full max-w-[1280px] mx-auto px-lg py-section">
        <div class="text-center mb-xxxl">
          <h2 class="text-display-xl m-0 mb-sm">
            Simple Pricing
          </h2>
          <p class="text-body-lg text-mute m-0">
            Pay only for what you use. No upfront commitments.
          </p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-lg max-w-5xl mx-auto">
          <!-- Tier 1 -->
          <div class="bg-surface-card text-ink rounded-lg p-xxxl border border-hairline">
            <h3 class="text-display-lg m-0 mb-sm">Free</h3>
            <p class="text-display-md m-0 mb-md">$0</p>
            <p class="text-body-md text-mute mb-xl">Get started with limited usage for development and testing.</p>
            <a href="/login" class="button-outline w-full decoration-none">Sign up</a>
          </div>

          <!-- Tier 2 (Featured) -->
          <div class="bg-surface-dark text-on-dark rounded-lg p-xxxl border border-[#333]">
            <h3 class="text-display-lg m-0 mb-sm">Pro</h3>
            <p class="text-display-md m-0 mb-md">Pay as you go</p>
            <p class="text-body-md text-on-dark-mute mb-xl">Scale to millions of requests with per-second billing.</p>
            <a href="/login" class="button-primary w-full decoration-none">Add a payment method</a>
          </div>

          <!-- Tier 3 -->
          <div class="bg-surface-card text-ink rounded-lg p-xxxl border border-hairline">
            <h3 class="text-display-lg m-0 mb-sm">Enterprise</h3>
            <p class="text-display-md m-0 mb-md">Custom</p>
            <p class="text-body-md text-mute mb-xl">Dedicated GPUs, VPC peering, and custom SLAs.</p>
            <a href="/contact" class="button-outline w-full decoration-none">Contact sales</a>
          </div>
        </div>
      </section>

      <!-- Signature Replicate Footer -->
      <footer class="w-full bg-surface-deep text-on-dark py-section rounded-none border-t border-[#333]">
        <div class="max-w-[1280px] mx-auto px-lg grid grid-cols-1 md:grid-cols-4 gap-xl">
          
          <div class="space-y-md">
            <div class="flex items-center gap-xs">
              <lucide-icon name="triangle" class="size-6 text-on-dark fill-on-dark"></lucide-icon>
              <span class="text-heading-sm m-0">Replicate</span>
            </div>
            <p class="text-body-sm text-on-dark-mute max-w-xs m-0">
              Run open-source machine learning models with a cloud API.
            </p>
          </div>

          <div class="space-y-sm">
            <p class="text-caption-tight text-on-dark-mute uppercase tracking-widest m-0 mb-md">Explore</p>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Models</a>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Collections</a>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Pricing</a>
          </div>

          <div class="space-y-sm">
            <p class="text-caption-tight text-on-dark-mute uppercase tracking-widest m-0 mb-md">Build</p>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Docs</a>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Blog</a>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Changelog</a>
          </div>

          <div class="space-y-sm">
            <p class="text-caption-tight text-on-dark-mute uppercase tracking-widest m-0 mb-md">Company</p>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">About</a>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Careers</a>
            <a href="#" class="block text-body-sm text-on-dark hover:text-primary transition-colors decoration-none">Terms</a>
          </div>
        </div>

        <div class="max-w-[1280px] mx-auto px-lg mt-xl pt-xl border-t border-[#333] flex justify-between items-center text-caption text-on-dark-mute">
          <span>© 2026 Replicate, Inc.</span>
          <div class="flex gap-md">
            <a href="#" class="text-on-dark-mute hover:text-on-dark transition-colors"><lucide-icon name="github" class="size-4"></lucide-icon></a>
            <a href="#" class="text-on-dark-mute hover:text-on-dark transition-colors"><lucide-icon name="twitter" class="size-4"></lucide-icon></a>
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
