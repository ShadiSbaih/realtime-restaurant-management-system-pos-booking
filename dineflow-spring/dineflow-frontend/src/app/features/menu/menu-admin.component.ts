import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MenuService } from '../../core/services/menu.service';
import { MenuItem } from '../../core/models/menu.model';
import { FileUploadService } from '../../core/services/file-upload.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Sparkles, Edit, Trash2, X, Plus, Search, Upload } from 'lucide-angular';

@Component({
  selector: 'app-menu-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterModule],
  template: `
    <div class="flex flex-col gap-xl w-full h-full bg-canvas">
      <!-- Header Actions -->
      <div class="bg-surface-bone rounded-md border border-hairline p-xl flex justify-between items-center shadow-sm">
        <div>
          <h2 class="text-heading-lg font-bold text-ink m-0 tracking-tight">Menu Management</h2>
          <p class="text-mute mt-xs text-body-sm m-0">Manage your dishes and use AI to optimize your menu.</p>
        </div>
        <div>
          <button class="button-dark flex items-center gap-xs disabled:opacity-50"
                  (click)="openAiStudio('NEW')" [disabled]="isAiGenerating()">
            <lucide-icon name="sparkles" class="size-4"></lucide-icon>
            {{ isAiGenerating() ? 'AI Generating...' : 'Auto-Generate Dish from Trends' }}
          </button>
        </div>
      </div>

      <!-- Sub Nav -->
      <div class="flex items-center gap-xs border-b border-hairline pb-0 -mt-sm">
        <a routerLink="/admin/menu" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="border-b-2 border-primary text-primary"
           class="px-md py-md text-body-sm font-bold text-mute hover:text-ink no-underline transition-colors">
          All Menu Items
        </a>
        <a routerLink="/admin/menu/categories" routerLinkActive="border-b-2 border-primary text-primary"
           class="px-md py-md text-body-sm font-bold text-mute hover:text-ink no-underline transition-colors">
          Categories &amp; Create Item
        </a>
      </div>

      <!-- AI Job Status Panel -->
      <div class="bg-primary/5 border border-primary/20 rounded-md p-xl shadow-sm relative overflow-hidden transition-all" 
           *ngIf="aiStatus()">
        <div class="flex justify-between items-center mb-md">
          <h4 class="font-bold text-ink flex items-center gap-sm m-0 text-body-sm">
            <lucide-icon name="sparkles" class="size-4.5 text-primary"></lucide-icon>
            AI Generation Status
          </h4>
          <span class="px-sm py-xs rounded-full text-caption-tight font-bold uppercase tracking-wider"
                [ngClass]="{
                  'bg-[#e05d0e]/10 text-[#e05d0e]': aiStatus()?.status === 'PENDING' || aiStatus()?.status === 'PROCESSING',
                  'bg-primary/10 text-primary': aiStatus()?.status === 'COMPLETED',
                  'bg-[#e02424]/10 text-[#e02424]': aiStatus()?.status === 'FAILED'
                }">
            {{ aiStatus()?.status }}
          </span>
        </div>
        
        <div class="w-full h-1.5 bg-canvas rounded-full overflow-hidden mb-sm border border-hairline">
          <div class="h-full bg-primary transition-all duration-300" [style.width]="(aiStatus()?.progress || 0) + '%'"></div>
        </div>
        <p class="text-caption text-mute m-0">{{ aiStatus()?.message || 'Processing...' }}</p>
        
        <div class="mt-md pt-md border-t border-hairline" *ngIf="aiStatus()?.result">
          <h5 class="text-caption font-bold text-primary m-0 mb-xs">Generated Suggestion:</h5>
          <p class="text-body-sm text-ink m-0 mb-md">{{ aiStatus()?.result }}</p>
          <button class="button-outline"
                  (click)="dismissAiStatus()">Dismiss</button>
        </div>
      </div>

      <!-- Menu List -->
      <div class="bg-surface-bone rounded-md border border-hairline shadow-sm flex-1 overflow-hidden flex flex-col">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-body-sm whitespace-nowrap">
            <thead class="bg-canvas text-mute border-b border-hairline">
              <tr>
                <th class="px-xl py-md font-bold text-caption uppercase tracking-wider">Image</th>
                <th class="px-xl py-md font-bold text-caption uppercase tracking-wider">Name</th>
                <th class="px-xl py-md font-bold text-caption uppercase tracking-wider">Category</th>
                <th class="px-xl py-md font-bold text-caption uppercase tracking-wider">Price</th>
                <th class="px-xl py-md font-bold text-caption uppercase tracking-wider">Status</th>
                <th class="px-xl py-md font-bold text-caption uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              <tr *ngFor="let item of menuItems()" class="hover:bg-canvas transition-colors">
                <td class="px-xl py-md">
                  <div class="size-10 rounded-md bg-cover bg-center border border-hairline" 
                       [style.backgroundImage]="'url(' + (item.image || 'assets/placeholder.png') + ')'"></div>
                </td>
                <td class="px-xl py-md font-bold text-ink">{{ item.name }}</td>
                <td class="px-xl py-md text-charcoal">{{ item.category?.name || 'Uncategorized' }}</td>
                <td class="px-xl py-md text-primary font-bold">\${{ item.price | number:'1.2-2' }}</td>
                <td class="px-xl py-md">
                  <span class="inline-flex items-center px-sm py-0.5 rounded-full text-caption-tight font-bold uppercase tracking-wider"
                        [ngClass]="{'bg-primary/10 text-primary': item.isAvailable, 'bg-[#e02424]/10 text-[#e02424]': !item.isAvailable}">
                    {{ item.isAvailable ? 'Available' : 'Out of Stock' }}
                  </span>
                </td>
                <td class="px-xl py-md text-right">
                  <button class="button-ghost p-xs text-mute hover:text-ink mr-xs" title="Edit" (click)="editItem(item)">
                    <lucide-icon [img]="Edit" class="size-4"></lucide-icon>
                  </button>
                  <button class="button-ghost p-xs text-mute hover:text-[#e02424]" title="Delete" (click)="deleteItem(item.id)">
                    <lucide-icon name="trash-2" class="size-4"></lucide-icon>
                  </button>
                </td>
              </tr>
              <tr *ngIf="menuItems().length === 0">
                <td colspan="6" class="px-xl py-xxl text-center text-mute">
                  No menu items found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Item Modal -->
      <div *ngIf="selectedItem()" class="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-md">
        <div class="bg-canvas w-full max-w-2xl rounded-md border border-hairline shadow-md overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-xl border-b border-hairline flex justify-between items-center bg-surface-bone">
            <h3 class="text-heading-sm font-bold text-ink m-0">Edit Menu Item</h3>
            <button class="text-mute hover:text-ink transition-colors border-none bg-transparent cursor-pointer p-0" (click)="closeEditModal()">
              <lucide-icon [img]="X" class="size-5"></lucide-icon>
            </button>
          </div>
          
          <div class="p-xl overflow-y-auto flex-1 flex flex-col gap-xl">
            <div class="flex items-start gap-md">
               <div class="size-20 rounded-md bg-cover bg-center border border-hairline shrink-0" 
                    [style.backgroundImage]="'url(' + (selectedItem()?.image || 'assets/placeholder.png') + ')'"></div>
               <div class="flex-1">
                  <h4 class="text-heading-md font-bold text-ink m-0">{{ selectedItem()?.name }}</h4>
                  <p class="text-caption text-mute mt-xs m-0">{{ selectedItem()?.category?.name || 'Uncategorized' }}</p>
                  
                  <div class="mt-sm flex items-center gap-sm">
                     <input type="file" #fileInput class="hidden" (change)="onFileSelected($event, selectedItem()!)" accept="image/jpeg, image/png, image/webp" />
                     <button class="text-caption-tight flex items-center gap-xs button-outline py-xs px-sm disabled:opacity-50"
                             (click)="fileInput.click()" [disabled]="isUploading()">
                        <lucide-icon name="upload" class="size-3.5"></lucide-icon>
                        {{ isUploading() ? 'Uploading...' : 'Upload Image' }}
                     </button>
                  </div>
               </div>
            </div>

            <!-- Edit Form -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div class="flex flex-col gap-xs">
                <label class="text-caption font-bold text-ink">Name</label>
                <input type="text" [ngModel]="editForm().name" (ngModelChange)="updateForm('name', $event)"
                       class="h-[40px] w-full rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors" />
              </div>
              <div class="flex flex-col gap-xs">
                <label class="text-caption font-bold text-ink">Price ($)</label>
                <input type="number" step="0.01" min="0" [ngModel]="editForm().price" (ngModelChange)="updateForm('price', +$event)"
                       class="h-[40px] w-full rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors" />
              </div>
              <div class="flex flex-col gap-xs">
                <label class="text-caption font-bold text-ink">Discount ($)</label>
                <input type="number" step="0.01" min="0" [ngModel]="editForm().discount" (ngModelChange)="updateForm('discount', +$event)"
                       class="h-[40px] w-full rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors" />
              </div>
              <div class="flex flex-col gap-xs justify-center">
                <label class="text-caption font-bold text-ink">Availability</label>
                <label class="flex items-center gap-sm cursor-pointer">
                  <input type="checkbox" [ngModel]="editForm().isAvailable" (ngModelChange)="updateForm('isAvailable', $event)"
                         class="size-4 rounded border-hairline text-primary focus:ring-primary cursor-pointer" />
                  <span class="text-body-sm text-ink">Available for ordering</span>
                </label>
              </div>
              <div class="flex flex-col gap-xs sm:col-span-2">
                <label class="text-caption font-bold text-ink">Recipe / Description</label>
                <textarea rows="3" [ngModel]="editForm().recipe" (ngModelChange)="updateForm('recipe', $event)"
                          class="w-full rounded-md border border-hairline bg-canvas px-sm py-sm text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors resize-none"></textarea>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end pt-md border-t border-hairline">
              <button (click)="saveItem()" [disabled]="isSaving() || isUploading()"
                      class="button-dark flex items-center gap-xs disabled:opacity-50">
                {{ isSaving() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>

            <!-- AI Features Section -->
            <div class="bg-surface-bone border border-hairline rounded-md p-xl">
               <div class="flex justify-between items-center mb-md">
                  <div>
                    <h5 class="font-bold text-primary m-0 flex items-center gap-sm text-body-sm">
                      <lucide-icon [img]="Sparkles" class="size-4"></lucide-icon> Smart Menu
                    </h5>
                    <p class="text-caption text-mute mt-xs m-0">Analyze feedback and generate improvements or spin-offs.</p>
                  </div>
                  <button class="button-outline disabled:opacity-50"
                          (click)="openAiStudio('REFINE', selectedItem() || undefined)" [disabled]="isAiGenerating()">
                     Run Analysis
                  </button>
               </div>
               
               <div *ngIf="selectedItem()?.recipe" class="mt-md pt-md border-t border-hairline">
                 <h6 class="font-bold text-body-sm text-ink mb-xs m-0">Chef's Recipe (AI Generated)</h6>
                 <div class="bg-canvas border border-hairline rounded-md p-md text-caption text-charcoal whitespace-pre-wrap font-mono overflow-x-auto max-h-64 overflow-y-auto">
                   {{ selectedItem()?.recipe }}
                 </div>
               </div>

               <div *ngIf="selectedItem()?.aiSuggestion" class="mt-md pt-md border-t border-hairline">
                 <h6 class="font-bold text-body-sm text-ink mb-xs m-0">AI Suggestion</h6>
                 <div class="bg-canvas border border-hairline rounded-md p-md text-caption text-charcoal whitespace-pre-wrap font-mono overflow-x-auto max-h-64 overflow-y-auto">
                   {{ selectedItem()?.aiSuggestion }}
                 </div>
               </div>
            </div>
            
          </div>
        </div>
      </div>

      <!-- Interactive AI Culinary Studio Modal -->
      <div *ngIf="showAiStudio()" class="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-md animate-in fade-in duration-200">
        <div class="bg-canvas w-full max-w-3xl rounded-md border border-hairline shadow-md flex flex-col max-h-[92vh] overflow-hidden">
          
          <!-- Studio Header -->
          <div class="p-xl bg-surface-bone border-b border-hairline flex items-center justify-between">
            <div class="flex items-center gap-md">
              <div class="size-10 rounded-md bg-canvas border border-hairline flex items-center justify-center text-primary shadow-sm">
                <lucide-icon name="sparkles" class="size-5"></lucide-icon>
              </div>
              <div>
                <h3 class="font-bold text-heading-sm text-ink m-0 flex items-center gap-sm">
                  DineFlow AI Culinary Studio
                  <span class="text-caption-tight font-bold uppercase tracking-widest bg-ink text-canvas px-sm py-0.5 rounded-full">Nova Copilot</span>
                </h3>
                <p class="text-caption text-mute m-0 mt-xs">
                  {{ aiStudioMode() === 'NEW' ? 'Draft new menu concepts with dietary constraints and food cost optimization.' : 'Refine existing chef recipe and flavor profiles with real-time feedback.' }}
                </p>
              </div>
            </div>
            <button (click)="closeAiStudio()" class="size-8 rounded-full text-mute hover:text-ink hover:bg-surface-bone flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors">
              <lucide-icon name="x" class="size-4.5"></lucide-icon>
            </button>
          </div>

          <!-- Studio Body -->
          <div class="p-xl overflow-y-auto flex-1 flex flex-col gap-xl bg-canvas">
            
            <!-- STAGE 1: INPUT & CONSTRAINTS (When not generating & no result) -->
            <div *ngIf="!isAiGenerating() && !aiGeneratedResult()" class="flex flex-col gap-xl animate-in fade-in duration-200">
              <div>
                <label class="text-caption font-bold uppercase tracking-widest text-primary block mb-sm flex items-center gap-xs">
                  <lucide-icon name="flame" class="size-3.5"></lucide-icon> 1. Executive Chef Concept Prompt
                </label>
                <textarea rows="3" [(ngModel)]="aiPrompt"
                  placeholder="e.g. Create a refreshing Mediterranean seafood pasta with saffron, cherry tomatoes, and toasted pine nuts under $24..."
                  class="w-full rounded-md border border-hairline bg-surface-bone p-md text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors resize-none"></textarea>
              </div>

              <div>
                <label class="text-caption font-bold uppercase tracking-widest text-mute block mb-sm flex items-center gap-xs">
                  <lucide-icon name="sliders-horizontal" class="size-3.5"></lucide-icon> 2. Dietary & Business Constraints
                </label>
                <div class="flex flex-wrap gap-sm">
                  <button *ngFor="let pill of availableConstraints" (click)="toggleConstraint(pill)"
                    type="button"
                    class="px-md py-sm rounded-md text-caption-tight font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-xs"
                    [ngClass]="{
                      'bg-ink text-canvas border-ink shadow-sm': isConstraintSelected(pill),
                      'bg-surface-bone text-mute border-hairline hover:border-[#333] hover:text-ink': !isConstraintSelected(pill)
                    }">
                    <lucide-icon *ngIf="isConstraintSelected(pill)" name="check" class="size-3.5"></lucide-icon>
                    {{ pill }}
                  </button>
                </div>
              </div>
            </div>

            <!-- STAGE 2: LIVE EXECUTION STREAM (When generating) -->
            <div *ngIf="isAiGenerating()" class="py-xxl flex flex-col items-center justify-center text-center gap-xl animate-in fade-in duration-200">
              <div class="relative flex items-center justify-center">
                <div class="size-20 rounded-full border-4 border-hairline border-t-primary animate-spin"></div>
                <lucide-icon name="sparkles" class="size-7 text-primary absolute animate-pulse"></lucide-icon>
              </div>
              <div class="max-w-md w-full">
                <h4 class="font-bold text-heading-sm text-ink m-0 mb-xs flex items-center justify-center gap-sm">
                  <span>{{ aiStatus()?.action || 'Crafting Culinary Concept...' }}</span>
                </h4>
                <p class="text-caption text-mute m-0 mb-xl">Gemini 1.5 Pro is analyzing flavor matrices, local inventory, and target cost margins.</p>
                <div class="w-full h-1.5 bg-canvas rounded-full overflow-hidden border border-hairline">
                  <div class="h-full bg-primary rounded-full transition-all duration-500 shadow-sm" [style.width]="(aiStatus()?.progress || 25) + '%'"></div>
                </div>
                <div class="flex justify-between items-center text-caption-tight font-bold text-mute mt-sm uppercase tracking-wider">
                  <span>Status: {{ aiStatus()?.status || 'IN_PROGRESS' }}</span>
                  <span>{{ aiStatus()?.progress || 25 }}%</span>
                </div>
              </div>
            </div>

            <!-- STAGE 3: INTERACTIVE REVIEW & REAL-TIME REFINEMENT (When completed) -->
            <div *ngIf="!isAiGenerating() && aiGeneratedResult()" class="flex flex-col gap-xl animate-in fade-in duration-300">
              
              <!-- Result Banner -->
              <div class="bg-surface-bone border border-hairline rounded-md p-xl shadow-sm relative overflow-hidden">
                <div class="flex items-start justify-between gap-md border-b border-hairline pb-md mb-md">
                  <div>
                    <span class="text-caption-tight font-bold uppercase tracking-widest bg-primary/10 text-primary px-sm py-0.5 rounded-md mb-sm inline-block">
                      ✨ AI Draft Generated
                    </span>
                    <h3 class="font-bold text-heading-md text-ink m-0">{{ aiGeneratedResult()?.name }}</h3>
                    <p class="text-caption font-bold text-mute m-0 mt-xs">Category: {{ aiGeneratedResult()?.category?.name || 'Main Course' }}</p>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="text-caption-tight font-bold text-mute block uppercase">Recommended POS Price</span>
                    <span class="font-bold text-heading-lg text-primary">\${{ aiGeneratedResult()?.price | number:'1.2-2' }}</span>
                  </div>
                </div>

                <div class="text-caption font-medium text-ink whitespace-pre-wrap font-mono bg-canvas p-md rounded-md border border-hairline max-h-56 overflow-y-auto leading-relaxed">
                  {{ aiGeneratedResult()?.recipe || aiGeneratedResult()?.aiSuggestion || 'No detailed recipe notes provided.' }}
                </div>
              </div>

              <!-- Real-Time Feedback Refinement Bar -->
              <div class="bg-surface-bone border border-hairline rounded-md p-xl flex flex-col gap-md">
                <label class="text-caption-tight font-bold uppercase tracking-widest text-primary flex items-center justify-between">
                  <span class="flex items-center gap-xs"><lucide-icon name="send" class="size-3.5"></lucide-icon> Human-in-the-Loop Real-Time Refinement</span>
                  <span class="text-mute font-medium normal-case">Iterate directly with Chef AI</span>
                </label>
                
                <!-- Quick Feedback Modifiers -->
                <div class="flex flex-wrap gap-sm">
                  <button type="button" (click)="setQuickRefinement('Reduce recommended price by 15% to make it an affordable daily special.')"
                    class="px-sm py-xs rounded-md text-caption-tight font-bold bg-canvas hover:bg-ink hover:text-canvas text-charcoal border border-hairline transition-colors cursor-pointer">
                    🪙 Reduce Price (-15%)
                  </button>
                  <button type="button" (click)="setQuickRefinement('Increase spice level with fresh chili peppers or smoked paprika.')"
                    class="px-sm py-xs rounded-md text-caption-tight font-bold bg-canvas hover:bg-ink hover:text-canvas text-charcoal border border-hairline transition-colors cursor-pointer">
                    🌶️ Make Spicier
                  </button>
                  <button type="button" (click)="setQuickRefinement('Convert to 100% plant-based vegan dish with artisan dairy-free substitutes.')"
                    class="px-sm py-xs rounded-md text-caption-tight font-bold bg-canvas hover:bg-ink hover:text-canvas text-charcoal border border-hairline transition-colors cursor-pointer">
                    🌿 Make Plant-Based
                  </button>
                  <button type="button" (click)="setQuickRefinement('Rewrite description and plating instructions in an upscale fine-dining Michelin tone.')"
                    class="px-sm py-xs rounded-md text-caption-tight font-bold bg-canvas hover:bg-ink hover:text-canvas text-charcoal border border-hairline transition-colors cursor-pointer">
                    ✨ Elevate Fine Dining Tone
                  </button>
                </div>

                <div class="flex gap-sm mt-xs">
                  <input type="text" [(ngModel)]="aiRefinementInput"
                    placeholder="Type instructions to refine dish (e.g. Make sauce creamier)..."
                    class="flex-1 h-[40px] rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors" />
                  <button type="button" (click)="triggerAiRefine()" [disabled]="!aiRefinementInput() || isAiGenerating()"
                    class="button-dark h-[40px] px-md disabled:opacity-50 flex items-center gap-xs shrink-0">
                    <lucide-icon name="refresh-cw" class="size-4" [ngClass]="{'animate-spin': isAiGenerating()}"></lucide-icon>
                    Refine with AI
                  </button>
                </div>
              </div>

            </div>

          </div>

          <!-- Studio Footer -->
          <div class="p-xl bg-surface-bone border-t border-hairline flex justify-between items-center">
            <button *ngIf="!aiGeneratedResult()" (click)="closeAiStudio()"
              class="button-outline">
              Cancel
            </button>
            <button *ngIf="aiGeneratedResult()" (click)="discardAiDraft()"
              class="px-md py-sm border border-[#e02424]/30 text-[#e02424] hover:bg-[#e02424]/10 rounded-md text-body-sm font-bold bg-transparent cursor-pointer transition-colors flex items-center gap-xs">
              <lucide-icon name="trash-2" class="size-4"></lucide-icon> Discard Draft
            </button>

            <div class="flex gap-md">
              <button *ngIf="!aiGeneratedResult() && !isAiGenerating()" (click)="startAiGeneration()"
                class="button-dark flex items-center gap-xs">
                <lucide-icon name="sparkles" class="size-4"></lucide-icon> Generate Concept
              </button>
              <button *ngIf="aiGeneratedResult() && !isAiGenerating()" (click)="approveAiDraft()"
                class="px-md py-sm bg-primary text-canvas hover:bg-primary/90 rounded-md text-body-sm font-bold border-none cursor-pointer transition-colors flex items-center gap-xs">
                <lucide-icon name="check" class="size-4.5"></lucide-icon> Approve & Publish to POS
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: []
})
export class MenuAdminComponent implements OnInit {
  menuItems = signal<MenuItem[]>([]);
  
  isAiGenerating = signal(false);
  aiStatus = signal<any>(null);
  showAiStudio = signal(false);
  aiStudioMode = signal<'NEW' | 'REFINE'>('NEW');
  aiPrompt = signal('');
  aiConstraints = signal<string[]>([]);
  aiRefinementInput = signal('');
  aiGeneratedResult = signal<MenuItem | null>(null);
  availableConstraints = ['🌱 Plant-Based / Vegan', '🌾 Gluten-Free', '💰 High Profit Margin (<25% Cost)', '🌶️ Chef Signature Spicy', '⚡ 15-Min Prep Time', '🍷 Wine Pairing Recommended'];
  selectedItem = signal<MenuItem | null>(null);
  isUploading = signal(false);
  editForm = signal<{name: string, price: number, isAvailable: boolean, discount: number, recipe: string}>({
    name: '', price: 0, isAvailable: true, discount: 0, recipe: ''
  });
  isSaving = signal(false);

  readonly Sparkles = Sparkles;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly X = X;
  readonly Upload = Upload;
  readonly Plus = Plus;
  readonly Search = Search;

  constructor(
    private menuService: MenuService,
    private http: HttpClient,
    private wsService: WebsocketService,
    private fileUploadService: FileUploadService
  ) {
    effect(() => {
      const event = this.wsService.aiActionEvent();
      if (event) {
        this.aiStatus.set(event);
        if (event.status === 'COMPLETED' || event.status === 'FAILED') {
          this.isAiGenerating.set(false);
          if (event.status === 'COMPLETED') {
            this.loadMenu();
            if (event.result) {
              this.aiGeneratedResult.set(event.result);
            }
            if (this.selectedItem()) {
               const updated = this.menuItems().find(m => m.id === this.selectedItem()?.id);
               if (updated) {
                 this.selectedItem.set(updated);
                 this.aiGeneratedResult.set(updated);
               }
            }
          }
        }
      }
    });
  }

  ngOnInit() {
    this.loadMenu();
  }

  loadMenu() {
    this.menuService.getMenuItems(1, 100).subscribe(res => {
      this.menuItems.set(res.data);
    });
  }

  onFileSelected(event: Event, item: MenuItem) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.isUploading.set(true);
      this.fileUploadService.uploadImage(file).subscribe({
        next: (res) => {
          this.menuService.updateMenuItem(item.id, { image: res.url }).subscribe(() => {
             this.loadMenu();
             this.isUploading.set(false);
             // Update local selected item
             this.selectedItem.set({ ...item, image: res.url });
          });
        },
        error: () => {
          this.isUploading.set(false);
          alert('Failed to upload image.');
        }
      });
    }
  }

  deleteItem(id: string) {
    if(confirm('Are you sure you want to delete this item?')) {
      this.menuService.deleteMenuItem(id).subscribe(() => this.loadMenu());
    }
  }

  editItem(item: MenuItem) {
    this.selectedItem.set(item);
    this.editForm.set({
      name: item.name,
      price: item.price,
      isAvailable: item.isAvailable,
      discount: item.discount || 0,
      recipe: item.recipe || ''
    });
  }

  updateForm(field: string, value: any) {
    this.editForm.update(f => ({ ...f, [field]: value }));
  }

  saveItem() {
    const item = this.selectedItem();
    if (!item) return;
    this.isSaving.set(true);
    const form = this.editForm();
    this.menuService.updateMenuItem(item.id, {
      name: form.name,
      price: form.price,
      isAvailable: form.isAvailable,
      discount: form.discount,
      recipe: form.recipe
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.loadMenu();
        this.closeEditModal();
      },
      error: () => {
        this.isSaving.set(false);
        alert('Failed to save changes.');
      }
    });
  }

  closeEditModal() {
    this.selectedItem.set(null);
  }

  openAiStudio(mode: 'NEW' | 'REFINE', item?: MenuItem) {
    this.aiStudioMode.set(mode);
    this.aiPrompt.set(mode === 'REFINE' && item ? `Elevate and improve ${item.name} based on customer feedback and sales performance.` : '');
    this.aiConstraints.set([]);
    this.aiRefinementInput.set('');
    this.aiGeneratedResult.set(item || null);
    this.showAiStudio.set(true);
  }

  closeAiStudio() {
    this.showAiStudio.set(false);
    this.aiStatus.set(null);
  }

  dismissAiStatus() {
    this.closeAiStudio();
  }

  toggleConstraint(pill: string) {
    const list = this.aiConstraints();
    if (list.includes(pill)) {
      this.aiConstraints.set(list.filter(c => c !== pill));
    } else {
      this.aiConstraints.set([...list, pill]);
    }
  }

  isConstraintSelected(pill: string): boolean {
    return this.aiConstraints().includes(pill);
  }

  setQuickRefinement(text: string) {
    this.aiRefinementInput.set(text);
  }

  startAiGeneration() {
    this.isAiGenerating.set(true);
    this.aiStatus.set({status: 'PENDING', progress: 5, action: 'Initializing DineFlow AI Copilot...'});
    this.http.post(`${environment.apiUrl}/ai/generate-item`, {
      prompt: this.aiPrompt(),
      constraints: this.aiConstraints().join(', ')
    }).subscribe({
      next: () => {},
      error: () => {
        this.isAiGenerating.set(false);
        this.aiStatus.set({status: 'FAILED', progress: 0, action: 'Generation request failed.'});
      }
    });
  }

  triggerAiRefine() {
    const item = this.aiGeneratedResult() || this.selectedItem();
    if (!item) return;
    this.isAiGenerating.set(true);
    this.aiStatus.set({status: 'PENDING', progress: 10, action: `Refining dish with feedback: "${this.aiRefinementInput()}"...`});
    this.http.post(`${environment.apiUrl}/ai/smart-menu`, {
      itemId: item.id,
      feedback: this.aiRefinementInput()
    }).subscribe({
      next: () => {
        this.aiRefinementInput.set('');
      },
      error: () => {
        this.isAiGenerating.set(false);
        alert('Refinement request failed');
      }
    });
  }

  approveAiDraft() {
    const item = this.aiGeneratedResult();
    if (!item) return;
    this.isSaving.set(true);
    this.menuService.updateMenuItem(item.id, { isAvailable: true }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeAiStudio();
        this.selectedItem.set(null);
        this.loadMenu();
      },
      error: () => {
        this.isSaving.set(false);
        alert('Failed to publish item to menu');
      }
    });
  }

  discardAiDraft() {
    const item = this.aiGeneratedResult();
    if (!item) return;
    if (confirm(`Discard draft "${item.name}"?`)) {
      this.menuService.deleteMenuItem(item.id).subscribe(() => {
        this.closeAiStudio();
        this.loadMenu();
      });
    }
  }

  generateAiItem() {
    this.openAiStudio('NEW');
  }

  triggerSmartMenu() {
    this.openAiStudio('REFINE', this.selectedItem() || undefined);
  }
}
