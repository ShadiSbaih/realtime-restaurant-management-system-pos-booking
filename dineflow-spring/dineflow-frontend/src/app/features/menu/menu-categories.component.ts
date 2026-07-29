import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MenuService } from '../../core/services/menu.service';
import { MenuItem, Category } from '../../core/models/menu.model';
import { FileUploadService } from '../../core/services/file-upload.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { environment } from '../../../environments/environment';
import { LucideAngularModule, Sparkles, Edit2, Trash2, Plus, X, Check, Search, ChevronLeft, ChevronRight, Upload } from 'lucide-angular';
import { AiStudioModalComponent } from './components/ai-studio-modal/ai-studio-modal.component';

@Component({
  selector: 'app-menu-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AiStudioModalComponent],
  template: `
    <div class="flex gap-6 h-full">

      <!-- Left: Menu Items -->
      <div class="flex-1 flex flex-col gap-4 overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-heading-lg text-ink m-0">Menu Categories &amp; Creation</h1>
            <p class="text-body-sm text-mute mt-xs m-0">Manage your menu categories and draft new dishes.</p>
          </div>
          <div class="flex items-center gap-2">
            <button (click)="openCreateManual()"
              class="flex items-center gap-2 bg-white text-ink border border-hairline hover:bg-surface-bone px-4 py-2 rounded-lg font-bold text-sm cursor-pointer transition-colors shadow-sm">
              <lucide-icon name="plus" [size]="14"></lucide-icon>
              Create Manually
            </button>
            <button (click)="openAiStudio('NEW')" [disabled]="isAiLoading()"
              class="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-bold text-sm border-none cursor-pointer disabled:opacity-50 transition-colors shadow-md">
              <lucide-icon name="sparkles" [size]="14"></lucide-icon>
              {{ isAiLoading() ? 'Generating...' : 'Generate New Item with AI' }}
            </button>
          </div>
        </div>

        <!-- AI Status -->
        <div *ngIf="aiStatus()" class="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold text-primary flex items-center gap-1.5">
              <lucide-icon name="sparkles" [size]="14"></lucide-icon> AI Generation
            </span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full"
              [ngClass]="{
                'bg-orange-500/10 text-orange-600': aiStatus()?.status !== 'COMPLETED',
                'bg-green-500/10 text-green-600': aiStatus()?.status === 'COMPLETED'
              }">
              {{ aiStatus()?.status }}
            </span>
          </div>
          <div class="w-full h-1.5 bg-background rounded-full mb-2">
            <div class="h-full bg-primary rounded-full transition-all" [style.width]="(aiStatus()?.progress || 0) + '%'"></div>
          </div>
          <p class="text-xs text-muted-foreground m-0">{{ aiStatus()?.message }}</p>
        </div>

        <!-- Search -->
        <div class="relative flex items-center">
          <div class="absolute left-3 flex items-center justify-center pointer-events-none text-muted-foreground">
            <lucide-icon name="search" [size]="16"></lucide-icon>
          </div>
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
            placeholder="Search Menu Items..."
            class="w-full pl-10 pr-3 h-10 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground transition-colors shadow-sm" />
          <span *ngIf="unavailableCount > 0" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">
            {{ unavailableCount }} items unavailable
          </span>
        </div>

        <!-- Category Pills -->
        <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <button (click)="selectedCategory.set(null); onSearch()"
            class="px-4 py-1.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap cursor-pointer"
            [ngClass]="!selectedCategory() ? 'bg-ink text-canvas border-ink shadow-sm' : 'bg-canvas text-mute border-hairline hover:bg-surface-bone'">
            All
          </button>
          <button *ngFor="let cat of categories()" (click)="selectedCategory.set(cat.id); onSearch()"
            class="px-4 py-1.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap cursor-pointer"
            [ngClass]="selectedCategory() === cat.id ? 'bg-ink text-canvas border-ink shadow-sm' : 'bg-canvas text-mute border-hairline hover:bg-surface-bone'">
            {{ cat.name }}
          </button>
        </div>

        <!-- Items Grid -->
        <div class="flex-1 overflow-y-auto relative min-h-[300px]">
          <!-- Blocking Loading Overlay -->
          <div *ngIf="isLoading" class="absolute inset-0 z-10 bg-background flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-200">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-muted border-t-primary mb-3"></div>
            <p class="text-sm font-bold text-foreground animate-pulse m-0">Fetching Data...</p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            <div *ngFor="let item of filteredItems()"
              class="bg-card border border-border rounded-xl overflow-hidden group relative cursor-pointer hover:border-primary/50 transition-all"
              (click)="openEdit(item)">
              <div class="relative h-40 bg-muted">
                <img [src]="item.image || '/hero.png'" [alt]="item.name" class="w-full h-full object-cover" />
                <div class="absolute top-2 left-2 bg-black/70 text-white text-xs font-black px-2 py-1 rounded-lg">
                  \${{ item.price | number:'1.2-2' }}
                </div>
                <div *ngIf="item.discount > 0" class="absolute top-2 right-2 bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                  -{{ calcDiscount(item) }}%
                </div>
                <!-- Action overlay -->
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button (click)="openEdit(item); $event.stopPropagation()" class="size-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center border-none cursor-pointer">
                    <lucide-icon name="edit-2" [size]="14"></lucide-icon>
                  </button>
                  <button (click)="deleteItem(item.id); $event.stopPropagation()" class="size-9 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center border-none cursor-pointer">
                    <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>
              <div class="p-3">
                <h3 class="font-black text-sm uppercase text-foreground m-0 leading-tight">{{ item.name }}</h3>
                <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground m-0 mt-0.5">Fresh Ingredients</p>
                <div *ngIf="item.discount > 0" class="mt-1 flex items-center gap-2">
                  <span class="text-xs text-muted-foreground line-through">\${{ item.price + item.discount | number:'1.2-2' }}</span>
                </div>
              </div>
              <div *ngIf="!item.isAvailable" class="absolute inset-0 bg-background/60 rounded-xl pointer-events-none"></div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between pt-2 border-t border-border shrink-0">
          <button [disabled]="currentPage() === 1" (click)="changePage(-1)"
            class="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-40 bg-transparent cursor-pointer text-foreground">
            <lucide-icon name="chevron-left" [size]="14"></lucide-icon> Previous
          </button>
          <span class="text-sm text-muted-foreground">Page {{ currentPage() }} of {{ totalPages() }}</span>
          <button [disabled]="currentPage() >= totalPages()" (click)="changePage(1)"
            class="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-40 bg-transparent cursor-pointer text-foreground">
            Next <lucide-icon name="chevron-right" [size]="14"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Right: Category Manager -->
      <div class="w-72 shrink-0 flex flex-col gap-4">
        <div class="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <h2 class="font-black text-primary m-0 text-lg">Category</h2>
          <div>
            <div class="flex gap-2">
              <input type="text" [(ngModel)]="newCategoryName" placeholder="category"
                class="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
              <button (click)="addCategory()" [disabled]="!newCategoryName || isAddingCat()"
                class="h-9 px-3 bg-primary text-white hover:bg-primary/90 rounded-md text-sm font-bold border-none cursor-pointer disabled:opacity-50 shrink-0 shadow-sm transition-colors">
                {{ editingCategoryId() ? 'Update' : 'Add' }}
              </button>
            </div>
          </div>
          <div>
            <h3 class="font-black text-foreground text-sm m-0 mb-3">Existing Categories</h3>
            <div class="flex flex-col gap-2 max-h-80 overflow-y-auto">
              <div *ngFor="let cat of categories()"
                class="flex items-center justify-between px-3 py-2 bg-background border border-border rounded-lg">
                <span *ngIf="editingCategoryId() !== cat.id" class="text-sm font-semibold text-foreground">{{ cat.name }}</span>
                <input *ngIf="editingCategoryId() === cat.id" type="text" [(ngModel)]="newCategoryName"
                  class="flex-1 text-sm bg-transparent border-none outline-none text-foreground font-semibold" />
                <div class="flex items-center gap-1 shrink-0">
                  <button *ngIf="editingCategoryId() !== cat.id" (click)="startEditCategory(cat)"
                    class="size-7 flex items-center justify-center text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer rounded-md hover:bg-muted transition-colors">
                    <lucide-icon name="edit-2" [size]="13"></lucide-icon>
                  </button>
                  <button *ngIf="editingCategoryId() === cat.id" (click)="saveEditCategory()"
                    class="size-7 flex items-center justify-center text-green-500 bg-transparent border-none cursor-pointer rounded-md hover:bg-muted transition-colors">
                    <lucide-icon name="check" [size]="13"></lucide-icon>
                  </button>
                  <button (click)="deleteCategory(cat.id)"
                    class="size-7 flex items-center justify-center text-muted-foreground hover:text-destructive bg-transparent border-none cursor-pointer rounded-md hover:bg-muted transition-colors">
                    <lucide-icon name="trash-2" [size]="13"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit / Create Modal -->
      <div *ngIf="selectedItem() || isCreatingManual()" class="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-md">
        <div class="bg-canvas w-full max-w-2xl rounded-md border border-hairline shadow-md flex flex-col max-h-[90vh]">
          <div class="p-xl border-b border-hairline flex items-center justify-between bg-surface-bone rounded-t-md">
            <div class="flex items-center gap-md">
              <h3 class="font-black text-foreground m-0">{{ isCreatingManual() ? 'Create New Item' : 'Edit: ' + selectedItem()?.name }}</h3>
              <button *ngIf="!isCreatingManual()" (click)="openAiStudio('REFINE', selectedItem() || undefined)" [disabled]="isAiLoading()"
                class="button-outline flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50">
                <lucide-icon name="sparkles" [size]="12"></lucide-icon> Smart Menu
              </button>
            </div>
            <button (click)="closeEditModal()" class="text-mute hover:text-ink border-none bg-transparent cursor-pointer">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="p-xl overflow-y-auto flex-1 flex flex-col gap-xl">
            <!-- Image + upload -->
            <div class="flex items-center gap-md">
              <img [src]="(isCreatingManual() ? editForm().image : selectedItem()?.image) || '/hero.png'" class="size-20 rounded-md object-cover border border-hairline" />
              <div>
                <input type="file" #fileInput class="hidden" accept="image/jpeg,image/png,image/webp" (change)="onFileSelected($event)" />
                <button (click)="fileInput.click()" [disabled]="isUploading()"
                  class="button-outline flex items-center gap-xs px-md py-xs rounded-md text-caption font-bold border-none cursor-pointer transition-colors disabled:opacity-50">
                  <lucide-icon name="upload" [size]="12"></lucide-icon>
                  {{ isUploading() ? 'Uploading...' : 'Upload Image' }}
                </button>
              </div>
            </div>
            <!-- Form -->
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="text-caption font-bold uppercase tracking-widest text-mute block mb-xs">Full Name</label>
                <input type="text" [ngModel]="editForm().name" (ngModelChange)="updateForm('name', $event)"
                  class="w-full h-10 rounded-md border border-hairline bg-surface-bone px-sm text-body-sm text-ink focus:outline-none focus:border-[#333]" />
              </div>
              <div>
                <label class="text-caption font-bold uppercase tracking-widest text-mute block mb-xs">Category</label>
                <select [ngModel]="editForm().categoryId" (ngModelChange)="updateForm('categoryId', $event)"
                  class="w-full h-10 rounded-md border border-hairline bg-surface-bone px-sm text-body-sm text-ink focus:outline-none focus:border-[#333]">
                  <option value="">Select Category</option>
                  <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="flex items-center gap-sm pt-xl">
                <input type="checkbox" id="avail" [ngModel]="editForm().isAvailable" (ngModelChange)="updateForm('isAvailable', $event)" class="size-4 rounded cursor-pointer" />
                <label for="avail" class="text-body-sm font-bold text-ink cursor-pointer">Is this menu item available?</label>
              </div>
              <div>
                <label class="text-caption font-bold uppercase tracking-widest text-mute block mb-xs">Price</label>
                <input type="number" step="0.01" [ngModel]="editForm().price" (ngModelChange)="updateForm('price', +$event)"
                  class="w-full h-10 rounded-md border border-hairline bg-surface-bone px-sm text-body-sm text-ink focus:outline-none focus:border-[#333]" />
              </div>
              <div>
                <label class="text-caption font-bold uppercase tracking-widest text-mute block mb-xs">Discount</label>
                <input type="number" step="0.01" [ngModel]="editForm().discount" (ngModelChange)="updateForm('discount', +$event)"
                  class="w-full h-10 rounded-md border border-hairline bg-surface-bone px-sm text-body-sm text-ink focus:outline-none focus:border-[#333]" />
              </div>
              <div class="col-span-2">
                <label class="text-caption font-bold uppercase tracking-widest text-mute block mb-xs">Description / Recipe</label>
                <textarea rows="4" [ngModel]="editForm().recipe" (ngModelChange)="updateForm('recipe', $event)"
                  class="w-full rounded-md border border-hairline bg-surface-bone px-sm py-sm text-body-sm text-ink focus:outline-none focus:border-[#333] resize-none"></textarea>
              </div>
            </div>
          </div>
          <div class="p-xl border-t border-hairline flex justify-between items-center bg-surface-bone rounded-b-md">
            <button (click)="closeEditModal()" class="button-outline px-xl py-sm rounded-md text-body-sm font-bold cursor-pointer">
              Discard
            </button>
            <div class="flex gap-2">
              <button *ngIf="!isCreatingManual()" (click)="openAiStudio('REFINE', selectedItem() || undefined)" [disabled]="isAiLoading()"
                class="button-outline flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50">
                <lucide-icon name="sparkles" [size]="14"></lucide-icon> Smart Menu
              </button>
              <button (click)="saveItem()" [disabled]="isSaving()"
                class="px-5 py-2.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-bold border-none cursor-pointer disabled:opacity-50 transition-colors">
                {{ isSaving() ? 'Saving...' : (isCreatingManual() ? 'Create Item' : 'Save Changes') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive AI Culinary Studio Modal -->
      <app-ai-studio-modal
        [isOpen]="showAiStudio()"
        [mode]="aiStudioMode()"
        [isGenerating]="isAiLoading()"
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
export class MenuCategoriesComponent implements OnInit {
  menuItems = signal<MenuItem[]>([]);
  categories = signal<Category[]>([]);
  selectedCategory = signal<string | null>(null);
  currentPage = signal(1);
  totalPages = signal(1);
  isLoading = false;
  searchQuery = '';
  unavailableCount = 0;

  newCategoryName = '';
  isAddingCat = signal(false);
  editingCategoryId = signal<string | null>(null);

  selectedItem = signal<MenuItem | null>(null);
  isCreatingManual = signal(false);
  editForm = signal<{name: string, price: number, isAvailable: boolean, discount: number, recipe: string, categoryId: string, image?: string}>({
    name: '', price: 0, isAvailable: true, discount: 0, recipe: '', categoryId: ''
  });
  isSaving = signal(false);
  isUploading = signal(false);
  isAiLoading = signal(false);
  aiStatus = signal<any>(null);
  showAiStudio = signal(false);
  aiStudioMode = signal<'NEW' | 'REFINE'>('NEW');
  aiPrompt = signal('');
  aiGeneratedResult = signal<MenuItem | null>(null);

  constructor(
    private menuService: MenuService,
    private fileUploadService: FileUploadService,
    private wsService: WebsocketService,
    private http: HttpClient
  ) {
    effect(() => {
      const event = this.wsService.aiActionEvent();
      if (event) {
        this.aiStatus.set(event);
        if (event.status === 'COMPLETED' || event.status === 'FAILED') {
          this.isAiLoading.set(false);
          if (event.status === 'COMPLETED') {
            this.loadItems();
            if (event.result) {
              this.aiGeneratedResult.set(event.result);
            }
          }
        }
      }
    });
  }

  ngOnInit() {
    this.loadItems();
    this.menuService.getCategories().subscribe(c => this.categories.set(c));
  }

  loadItems() {
    this.isLoading = true;
    this.menuService.getMenuItems(this.currentPage(), 20, this.selectedCategory() || undefined, this.searchQuery || undefined).subscribe(res => {
      this.menuItems.set(res.data);
      this.totalPages.set(res.totalPages);
      this.unavailableCount = res.data.filter(i => !i.isAvailable).length;
      this.isLoading = false;
    });
  }

  filteredItems(): MenuItem[] { return this.menuItems(); }

  onSearch() { this.currentPage.set(1); this.loadItems(); }

  changePage(d: number) {
    const np = this.currentPage() + d;
    if (np >= 1 && np <= this.totalPages()) { this.currentPage.set(np); this.loadItems(); }
  }

  calcDiscount(item: MenuItem): number {
    return Math.round((item.discount / (item.price + item.discount)) * 100);
  }

  addCategory() {
    if (!this.newCategoryName) return;
    if (this.editingCategoryId()) { this.saveEditCategory(); return; }
    this.isAddingCat.set(true);
    this.menuService.createCategory(this.newCategoryName).subscribe({
      next: () => { this.newCategoryName = ''; this.isAddingCat.set(false); this.menuService.getCategories().subscribe(c => this.categories.set(c)); },
      error: () => this.isAddingCat.set(false)
    });
  }

  startEditCategory(cat: Category) {
    this.editingCategoryId.set(cat.id);
    this.newCategoryName = cat.name;
  }

  saveEditCategory() {
    const id = this.editingCategoryId();
    if (!id || !this.newCategoryName) return;
    this.menuService.updateCategory(id, this.newCategoryName).subscribe({
      next: () => { this.editingCategoryId.set(null); this.newCategoryName = ''; this.menuService.getCategories().subscribe(c => this.categories.set(c)); },
      error: () => {}
    });
  }

  deleteCategory(id: string) {
    if (confirm('Delete this category?')) {
      this.menuService.deleteCategory(id).subscribe(() => this.menuService.getCategories().subscribe(c => this.categories.set(c)));
    }
  }

  openCreateManual() {
    this.isCreatingManual.set(true);
    this.selectedItem.set(null);
    this.editForm.set({ name: '', price: 0, isAvailable: true, discount: 0, recipe: '', categoryId: '' });
  }

  openEdit(item: MenuItem) {
    this.isCreatingManual.set(false);
    this.selectedItem.set(item);
    this.editForm.set({ name: item.name, price: item.price, isAvailable: item.isAvailable, discount: item.discount || 0, recipe: item.recipe || '', categoryId: item.categoryId || '', image: item.image });
  }

  closeEditModal() {
    this.selectedItem.set(null);
    this.isCreatingManual.set(false);
  }

  updateForm(field: string, value: any) {
    this.editForm.update(f => ({ ...f, [field]: value }));
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.isUploading.set(true);
    this.fileUploadService.uploadImage(file).subscribe({
      next: (res) => { 
        input.value = ''; // Reset input
        if (this.isCreatingManual()) {
           this.editForm.update(f => ({ ...f, image: res.url }));
           this.isUploading.set(false);
        } else {
           const item = this.selectedItem();
           if (item) {
              this.menuService.updateMenuItem(item.id, {image: res.url}).subscribe(() => { this.loadItems(); this.isUploading.set(false); });
           }
        }
      },
      error: (err) => { 
        input.value = ''; // Reset input
        this.isUploading.set(false); 
        alert('Upload failed: ' + (err.error?.message || err.message)); 
      }
    });
  }

  saveItem() {
    this.isSaving.set(true);
    const f = this.editForm();
    if (this.isCreatingManual()) {
      if (!f.categoryId) {
        alert("Please select a category.");
        this.isSaving.set(false);
        return;
      }
      this.menuService.createMenuItemManually({
        name: f.name, price: f.price, isAvailable: f.isAvailable, 
        discount: f.discount, recipe: f.recipe, categoryId: f.categoryId, image: f.image
      }).subscribe({
        next: () => { this.isSaving.set(false); this.loadItems(); this.closeEditModal(); },
        error: (err) => { 
          this.isSaving.set(false); 
          alert('Failed to create item: ' + (err.error?.message || err.message)); 
        }
      });
    } else {
      const item = this.selectedItem();
      if (!item) return;
      this.menuService.updateMenuItem(item.id, {
        name: f.name, price: f.price, isAvailable: f.isAvailable, discount: f.discount, recipe: f.recipe, categoryId: f.categoryId
      }).subscribe({
        next: () => { this.isSaving.set(false); this.loadItems(); this.closeEditModal(); },
        error: () => { this.isSaving.set(false); alert('Failed to update item'); }
      });
    }
  }

  deleteItem(id: string) {
    if (confirm('Delete this item?')) this.menuService.deleteMenuItem(id).subscribe(() => this.loadItems());
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

  handleAiGenerate(event: {prompt: string, constraints: string}) {
    this.isAiLoading.set(true);
    this.aiStatus.set({status: 'PENDING', progress: 5, action: 'Initializing savora AI Copilot...'});
    this.http.post(`${environment.apiUrl}/ai/generate-item`, {
      prompt: event.prompt,
      constraints: event.constraints
    }).subscribe({
      next: () => {},
      error: () => {
        this.isAiLoading.set(false);
        this.aiStatus.set({status: 'FAILED', progress: 0, action: 'Generation request failed.'});
      }
    });
  }

  handleAiRefine(event: {itemId: string, feedback: string}) {
    this.isAiLoading.set(true);
    this.aiStatus.set({status: 'PENDING', progress: 10, action: `Refining dish with feedback: "${event.feedback}"...`});
    this.http.post(`${environment.apiUrl}/ai/smart-menu`, {
      itemId: event.itemId,
      feedback: event.feedback
    }).subscribe({
      next: () => {},
      error: () => {
        this.isAiLoading.set(false);
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
        this.loadItems();
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
        this.loadItems();
      });
    }
  }

  triggerAiGenerate() {
    this.openAiStudio('NEW');
  }

  triggerSmartMenu() {
    this.openAiStudio('REFINE', this.selectedItem() || undefined);
  }
}
