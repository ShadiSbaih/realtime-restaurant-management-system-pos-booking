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

@Component({
  selector: 'app-menu-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex gap-6 h-full">

      <!-- Left: Menu Items -->
      <div class="flex-1 flex flex-col gap-4 overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <lucide-icon name="layout-grid" [size]="20" class="text-muted-foreground"></lucide-icon>
            <h1 class="text-xl font-black text-foreground m-0">Menu Items</h1>
          </div>
          <button (click)="triggerAiGenerate()" [disabled]="isAiLoading()"
            class="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-bold text-sm border-none cursor-pointer disabled:opacity-50 transition-colors shadow-md">
            <lucide-icon name="sparkles" [size]="14"></lucide-icon>
            {{ isAiLoading() ? 'Generating...' : 'Generate New Item with AI' }}
          </button>
        </div>

        <!-- AI Status -->
        <div *ngIf="aiStatus()" class="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold text-primary flex items-center gap-1.5">
              <lucide-icon name="sparkles" [size]="14"></lucide-icon> AI Generation
            </span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full"
              [class.bg-orange-500/10]="aiStatus()?.status !== 'COMPLETED'"
              [class.text-orange-600]="aiStatus()?.status !== 'COMPLETED'"
              [class.bg-green-500/10]="aiStatus()?.status === 'COMPLETED'"
              [class.text-green-600]="aiStatus()?.status === 'COMPLETED'">
              {{ aiStatus()?.status }}
            </span>
          </div>
          <div class="w-full h-1.5 bg-background rounded-full mb-2">
            <div class="h-full bg-primary rounded-full transition-all" [style.width]="(aiStatus()?.progress || 0) + '%'"></div>
          </div>
          <p class="text-xs text-muted-foreground m-0">{{ aiStatus()?.message }}</p>
        </div>

        <!-- Search -->
        <div class="relative">
          <lucide-icon name="search" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"></lucide-icon>
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
            placeholder="Search Item..."
            class="w-full pl-9 h-10 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
          <span *ngIf="unavailableCount > 0" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">
            {{ unavailableCount }} items unavailable
          </span>
        </div>

        <!-- Category Pills -->
        <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <button (click)="selectedCategory.set(null)"
            class="px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap cursor-pointer"
            [class.bg-primary]="!selectedCategory()" [class.text-primary-foreground]="!selectedCategory()" [class.border-primary]="!selectedCategory()"
            [class.border-border]="selectedCategory()" [class.text-muted-foreground]="selectedCategory()" [class.bg-transparent]="selectedCategory()">All</button>
          <button *ngFor="let cat of categories()" (click)="selectedCategory.set(cat.id)"
            class="px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap cursor-pointer"
            [class.bg-primary]="selectedCategory() === cat.id" [class.text-primary-foreground]="selectedCategory() === cat.id" [class.border-primary]="selectedCategory() === cat.id"
            [class.border-border]="selectedCategory() !== cat.id" [class.text-muted-foreground]="selectedCategory() !== cat.id" [class.bg-transparent]="selectedCategory() !== cat.id">
            {{ cat.name }}
          </button>
        </div>

        <!-- Items Grid -->
        <div class="flex-1 overflow-y-auto">
          <div *ngIf="isLoading" class="flex items-center justify-center h-40"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
            <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Name</label>
            <div class="flex gap-2">
              <input type="text" [(ngModel)]="newCategoryName" placeholder="category"
                class="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button (click)="addCategory()" [disabled]="!newCategoryName || isAddingCat()"
                class="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-bold border-none cursor-pointer hover:bg-primary/90 disabled:opacity-50">
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

      <!-- Edit Modal (reuses the full menu admin edit modal logic) -->
      <div *ngIf="selectedItem()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card w-full max-w-2xl rounded-xl border border-border shadow-xl flex flex-col max-h-[90vh]">
          <div class="p-5 border-b border-border flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h3 class="font-black text-foreground m-0">Edit: {{ selectedItem()?.name }}</h3>
              <button (click)="triggerSmartMenu()" [disabled]="isAiLoading()"
                class="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold border border-primary/20 cursor-pointer transition-colors disabled:opacity-50">
                <lucide-icon name="sparkles" [size]="12"></lucide-icon> Smart Menu
              </button>
            </div>
            <button (click)="selectedItem.set(null)" class="text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
            <!-- Image + upload -->
            <div class="flex items-center gap-4">
              <img [src]="selectedItem()?.image || '/hero.png'" class="size-20 rounded-xl object-cover border border-border" />
              <div>
                <input type="file" #fileInput class="hidden" accept="image/jpeg,image/png,image/webp" (change)="onFileSelected($event)" />
                <button (click)="fileInput.click()" [disabled]="isUploading()"
                  class="flex items-center gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer transition-colors disabled:opacity-50">
                  <lucide-icon name="upload" [size]="12"></lucide-icon>
                  {{ isUploading() ? 'Uploading...' : 'Upload Image' }}
                </button>
              </div>
            </div>
            <!-- Form -->
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Full Name</label>
                <input type="text" [ngModel]="editForm().name" (ngModelChange)="editForm.update(f => ({...f, name: $event}))"
                  class="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
              </div>
              <div>
                <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Category</label>
                <select [ngModel]="editForm().categoryId" (ngModelChange)="editForm.update(f => ({...f, categoryId: $event}))"
                  class="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option value="">Select Category</option>
                  <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="flex items-center gap-3 pt-5">
                <input type="checkbox" id="avail" [ngModel]="editForm().isAvailable" (ngModelChange)="editForm.update(f => ({...f, isAvailable: $event}))" class="size-4 rounded cursor-pointer" />
                <label for="avail" class="text-sm font-semibold text-foreground cursor-pointer">Is this menu item available?</label>
              </div>
              <div>
                <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Price</label>
                <input type="number" step="0.01" [ngModel]="editForm().price" (ngModelChange)="editForm.update(f => ({...f, price: +$event}))"
                  class="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Discount</label>
                <input type="number" step="0.01" [ngModel]="editForm().discount" (ngModelChange)="editForm.update(f => ({...f, discount: +$event}))"
                  class="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div class="col-span-2">
                <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Description / Recipe</label>
                <textarea rows="4" [ngModel]="editForm().recipe" (ngModelChange)="editForm.update(f => ({...f, recipe: $event}))"
                  class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"></textarea>
              </div>
            </div>
          </div>
          <div class="p-5 border-t border-border flex justify-between items-center">
            <button (click)="selectedItem.set(null)" class="px-5 py-2.5 border border-border rounded-lg text-sm font-bold text-foreground hover:bg-muted bg-transparent cursor-pointer">
              Discard
            </button>
            <div class="flex gap-2">
              <button (click)="triggerSmartMenu()" [disabled]="isAiLoading()"
                class="px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold border border-primary/20 cursor-pointer disabled:opacity-50">
                Smart Menu
              </button>
              <button (click)="saveItem()" [disabled]="isSaving()"
                class="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-bold border-none cursor-pointer disabled:opacity-50">
                {{ isSaving() ? 'Saving...' : 'Add' }}
              </button>
            </div>
          </div>
        </div>
      </div>

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
  editForm = signal<{name: string, price: number, isAvailable: boolean, discount: number, recipe: string, categoryId: string}>({
    name: '', price: 0, isAvailable: true, discount: 0, recipe: '', categoryId: ''
  });
  isSaving = signal(false);
  isUploading = signal(false);
  isAiLoading = signal(false);
  aiStatus = signal<any>(null);

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
          if (event.status === 'COMPLETED') this.loadItems();
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

  openEdit(item: MenuItem) {
    this.selectedItem.set(item);
    this.editForm.set({ name: item.name, price: item.price, isAvailable: item.isAvailable, discount: item.discount || 0, recipe: item.recipe || '', categoryId: item.categoryId || '' });
  }

  onFileSelected(event: Event) {
    const item = this.selectedItem();
    if (!item) return;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.isUploading.set(true);
    this.fileUploadService.uploadImage(file).subscribe({
      next: (res) => { this.menuService.updateMenuItem(item.id, {image: res.url}).subscribe(() => { this.loadItems(); this.isUploading.set(false); }); },
      error: () => { this.isUploading.set(false); alert('Upload failed'); }
    });
  }

  saveItem() {
    const item = this.selectedItem();
    if (!item) return;
    this.isSaving.set(true);
    const f = this.editForm();
    this.menuService.updateMenuItem(item.id, {name: f.name, price: f.price, isAvailable: f.isAvailable, discount: f.discount, recipe: f.recipe}).subscribe({
      next: () => { this.isSaving.set(false); this.loadItems(); this.selectedItem.set(null); },
      error: () => { this.isSaving.set(false); alert('Failed to save'); }
    });
  }

  deleteItem(id: string) {
    if (confirm('Delete this item?')) this.menuService.deleteMenuItem(id).subscribe(() => this.loadItems());
  }

  triggerAiGenerate() {
    this.isAiLoading.set(true);
    this.aiStatus.set({status: 'PENDING', progress: 0, message: 'Starting AI generation...'});
    this.http.post(`${environment.apiUrl}/ai/generate-item`, {}).subscribe({
      next: () => {},
      error: () => { this.isAiLoading.set(false); this.aiStatus.set(null); alert('AI generation failed'); }
    });
  }

  triggerSmartMenu() {
    const item = this.selectedItem();
    if (!item) return;
    this.isAiLoading.set(true);
    this.http.post(`${environment.apiUrl}/ai/smart-menu`, {itemId: item.id}).subscribe({
      next: () => {},
      error: () => { this.isAiLoading.set(false); alert('Smart menu failed'); }
    });
  }
}
