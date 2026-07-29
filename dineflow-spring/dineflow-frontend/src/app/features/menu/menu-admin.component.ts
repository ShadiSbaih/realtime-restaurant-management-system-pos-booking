import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../core/services/menu.service';
import { MenuItem } from '../../core/models/menu.model';
import { FileUploadService } from '../../core/services/file-upload.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { AiService } from '../../core/services/ai.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Sparkles, Edit, Trash2, X, Plus, Search, Upload } from 'lucide-angular';
import { AiStudioModalComponent } from './components/ai-studio-modal/ai-studio-modal.component';

@Component({
  selector: 'app-menu-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterModule, AiStudioModalComponent],
  template: `
    <div class="flex flex-col gap-xl w-full h-full bg-canvas">
      <!-- Header Actions -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-xl">
        <div>
          <h1 class="text-heading-lg text-ink m-0">Menu Management</h1>
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
      <div *ngIf="selectedItem()" class="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-md">
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
      <app-ai-studio-modal
        [isOpen]="showAiStudio()"
        [mode]="aiStudioMode()"
        [isGenerating]="isAiGenerating()"
        [status]="aiStatus()"
        [generatedResult]="aiGeneratedResult()"
        [initialPrompt]="aiPrompt()"
        (close)="closeAiStudio()"
        (generate)="handleAiGenerate($event)"
        (refine)="handleAiRefine($event)"
        (approve)="approveAiDraft()"
        (discard)="discardAiDraft()">
      </app-ai-studio-modal>

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
  aiGeneratedResult = signal<MenuItem | null>(null);
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
    private aiService: AiService,
    private wsService: WebsocketService,
    private fileUploadService: FileUploadService
  ) {
    effect(() => {
      const event = this.wsService.aiActionEvent();
      if (!event) return;

      // Normalize progress event fields
      const status: string = event.status ?? 'RUNNING';
      const progress: number = event.progress ?? 50;
      const message: string = event.message ?? event.action ?? 'Processing...';
      this.aiStatus.set({ status, progress, message, result: event.result ?? null });

      if (status === 'COMPLETED') {
        this.isAiGenerating.set(false);
        this.loadMenu();
        if (event.result) {
          this.aiGeneratedResult.set(event.result as MenuItem);
        }
        // Refresh the selected item in the edit modal if open
        if (this.selectedItem()) {
          const updated = this.menuItems().find(m => m.id === this.selectedItem()?.id);
          if (updated) {
            this.selectedItem.set(updated);
            this.aiGeneratedResult.set(updated);
          }
        }
      } else if (status === 'FAILED') {
        this.isAiGenerating.set(false);
      }
    }, { allowSignalWrites: true });
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

  handleAiGenerate(event: {prompt: string, constraints: string}) {
    this.isAiGenerating.set(true);
    this.aiStatus.set({ status: 'RUNNING', progress: 5, message: 'Initializing AI Copilot...' });
    this.aiService.generateMenuItem(event.prompt, event.constraints).subscribe({
      next: (res) => {
        // Job started — progress arrives via WebSocket
        console.log('AI generation job started:', res.jobId);
      },
      error: (err) => {
        this.isAiGenerating.set(false);
        this.aiStatus.set({ status: 'FAILED', progress: 0, message: err.error?.message || 'Generation request failed.' });
      }
    });
  }

  handleAiRefine(event: {itemId: string, feedback: string}) {
    this.isAiGenerating.set(true);
    this.aiStatus.set({ status: 'RUNNING', progress: 10, message: `Applying refinement: "${event.feedback}"...` });
    this.aiService.startFeedbackAnalysis(event.itemId, event.feedback).subscribe({
      next: (res) => {
        // Job started — progress arrives via WebSocket
        console.log('AI refinement job started:', res.jobId);
      },
      error: (err) => {
        this.isAiGenerating.set(false);
        this.aiStatus.set({ status: 'FAILED', progress: 0, message: err.error?.message || 'Refinement request failed.' });
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
