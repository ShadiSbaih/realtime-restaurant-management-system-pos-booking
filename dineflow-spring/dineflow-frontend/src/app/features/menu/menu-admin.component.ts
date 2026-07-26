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
    <div class="flex flex-col gap-6 w-full h-full">
      <!-- Header Actions -->
      <div class="bg-card rounded-xl border border-border p-6 flex justify-between items-center shadow-sm">
        <div>
          <h2 class="text-2xl font-bold text-foreground m-0 tracking-tight">Menu Management</h2>
          <p class="text-muted-foreground mt-1 text-sm">Manage your dishes and use AI to optimize your menu.</p>
        </div>
        <div>
          <button class="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md rounded-md px-4 py-2 font-medium flex items-center gap-2 disabled:opacity-50"
                  (click)="generateAiItem()" [disabled]="isAiGenerating()">
            <lucide-icon name="sparkles" [size]="16"></lucide-icon>
            {{ isAiGenerating() ? 'AI Generating...' : 'Auto-Generate Dish from Trends' }}
          </button>
        </div>
      </div>

      <!-- Sub Nav -->
      <div class="flex items-center gap-1 border-b border-border pb-0 -mt-2">
        <a routerLink="/admin/menu" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="border-b-2 border-primary text-primary"
           class="px-4 py-3 text-sm font-bold text-muted-foreground hover:text-foreground no-underline transition-colors">
          All Menu Items
        </a>
        <a routerLink="/admin/menu/categories" routerLinkActive="border-b-2 border-primary text-primary"
           class="px-4 py-3 text-sm font-bold text-muted-foreground hover:text-foreground no-underline transition-colors">
          Categories &amp; Create Item
        </a>
      </div>

      <!-- AI Job Status Panel -->
      <div class="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm relative overflow-hidden transition-all" 
           *ngIf="aiStatus()">
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-semibold text-foreground flex items-center gap-2 m-0">
            <lucide-icon name="sparkles" [size]="18" class="text-primary"></lucide-icon>
            AI Generation Status
          </h4>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                [ngClass]="{
                  'bg-orange-500/10 text-orange-600': aiStatus()?.status === 'PENDING' || aiStatus()?.status === 'PROCESSING',
                  'bg-green-500/10 text-green-600': aiStatus()?.status === 'COMPLETED',
                  'bg-red-500/10 text-red-600': aiStatus()?.status === 'FAILED'
                }">
            {{ aiStatus()?.status }}
          </span>
        </div>
        
        <div class="w-full h-2 bg-background/50 rounded-full overflow-hidden mb-3">
          <div class="h-full bg-primary transition-all duration-300" [style.width]="(aiStatus()?.progress || 0) + '%'"></div>
        </div>
        <p class="text-sm text-muted-foreground m-0">{{ aiStatus()?.message || 'Processing...' }}</p>
        
        <div class="mt-4 pt-4 border-t border-border/50" *ngIf="aiStatus()?.result">
          <h5 class="text-sm font-semibold text-primary m-0 mb-2">Generated Suggestion:</h5>
          <p class="text-sm text-foreground m-0 mb-4">{{ aiStatus()?.result }}</p>
          <button class="bg-background border border-border text-foreground hover:bg-muted px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                  (click)="dismissAiStatus()">Dismiss</button>
        </div>
      </div>

      <!-- Menu List -->
      <div class="bg-card rounded-xl border border-border shadow-sm flex-1 overflow-hidden flex flex-col">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-muted/50 text-muted-foreground">
              <tr>
                <th class="px-6 py-3 font-medium">Image</th>
                <th class="px-6 py-3 font-medium">Name</th>
                <th class="px-6 py-3 font-medium">Category</th>
                <th class="px-6 py-3 font-medium">Price</th>
                <th class="px-6 py-3 font-medium">Status</th>
                <th class="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let item of menuItems()" class="hover:bg-muted/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="size-10 rounded-md bg-cover bg-center border border-border" 
                       [style.backgroundImage]="'url(' + (item.image || 'assets/placeholder.png') + ')'"></div>
                </td>
                <td class="px-6 py-4 font-medium text-foreground">{{ item.name }}</td>
                <td class="px-6 py-4">{{ item.category?.name || 'Uncategorized' }}</td>
                <td class="px-6 py-4 text-primary font-bold">\${{ item.price | number:'1.2-2' }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{'bg-green-500/10 text-green-600': item.isAvailable, 'bg-red-500/10 text-red-600': !item.isAvailable}">
                    {{ item.isAvailable ? 'Available' : 'Out of Stock' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="text-muted-foreground hover:text-foreground transition-colors p-2" title="Edit" (click)="editItem(item)">
                    <lucide-icon [img]="Edit" [size]="16"></lucide-icon>
                  </button>
                  <button class="text-muted-foreground hover:text-destructive transition-colors p-2" title="Delete" (click)="deleteItem(item.id)">
                    <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                  </button>
                </td>
              </tr>
              <tr *ngIf="menuItems().length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-muted-foreground">
                  No menu items found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Item Modal -->
      <div *ngIf="selectedItem()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card w-full max-w-2xl rounded-xl border border-border shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-6 border-b border-border flex justify-between items-center bg-muted/30">
            <h3 class="text-xl font-bold text-foreground m-0">Edit Menu Item</h3>
            <button class="text-muted-foreground hover:text-foreground transition-colors" (click)="closeEditModal()">
              <lucide-icon [img]="X" [size]="20"></lucide-icon>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
            <div class="flex items-start gap-4">
               <div class="size-20 rounded-md bg-cover bg-center border border-border shrink-0" 
                    [style.backgroundImage]="'url(' + (selectedItem()?.image || 'assets/placeholder.png') + ')'"></div>
               <div class="flex-1">
                  <h4 class="text-lg font-bold text-foreground m-0">{{ selectedItem()?.name }}</h4>
                  <p class="text-sm text-muted-foreground mt-1">{{ selectedItem()?.category?.name || 'Uncategorized' }}</p>
                  
                  <div class="mt-2 flex items-center gap-2">
                     <input type="file" #fileInput class="hidden" (change)="onFileSelected($event, selectedItem()!)" accept="image/jpeg, image/png, image/webp" />
                     <button class="text-xs flex items-center gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2 py-1 rounded transition-colors disabled:opacity-50"
                             (click)="fileInput.click()" [disabled]="isUploading()">
                        <lucide-icon name="upload" [size]="14"></lucide-icon>
                        {{ isUploading() ? 'Uploading...' : 'Upload Image' }}
                     </button>
                  </div>
               </div>
            </div>

            <!-- Edit Form -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-foreground">Name</label>
                <input type="text" [ngModel]="editForm().name" (ngModelChange)="editForm.update(f => ({...f, name: $event}))"
                       class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-foreground">Price ($)</label>
                <input type="number" step="0.01" min="0" [ngModel]="editForm().price" (ngModelChange)="editForm.update(f => ({...f, price: +$event}))"
                       class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-foreground">Discount ($)</label>
                <input type="number" step="0.01" min="0" [ngModel]="editForm().discount" (ngModelChange)="editForm.update(f => ({...f, discount: +$event}))"
                       class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all" />
              </div>
              <div class="flex flex-col gap-1.5 justify-center">
                <label class="text-sm font-medium text-foreground">Availability</label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [ngModel]="editForm().isAvailable" (ngModelChange)="editForm.update(f => ({...f, isAvailable: $event}))"
                         class="size-4 rounded border-input text-primary focus:ring-primary cursor-pointer" />
                  <span class="text-sm text-foreground">Available for ordering</span>
                </label>
              </div>
              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label class="text-sm font-medium text-foreground">Recipe / Description</label>
                <textarea rows="3" [ngModel]="editForm().recipe" (ngModelChange)="editForm.update(f => ({...f, recipe: $event}))"
                          class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all resize-none"></textarea>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end">
              <button (click)="saveItem()" [disabled]="isSaving() || isUploading()"
                      class="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
                {{ isSaving() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>

            <!-- AI Features Section -->
            <div class="bg-primary/5 border border-primary/20 rounded-xl p-5">
               <div class="flex justify-between items-center mb-4">
                  <div>
                    <h5 class="font-bold text-primary m-0 flex items-center gap-2">
                      <lucide-icon [img]="Sparkles" [size]="16"></lucide-icon> Smart Menu
                    </h5>
                    <p class="text-xs text-muted-foreground mt-1">Analyze feedback and generate improvements or spin-offs.</p>
                  </div>
                  <button class="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                          (click)="triggerSmartMenu()" [disabled]="isAiGenerating()">
                     Run Analysis
                  </button>
               </div>
               
               <div *ngIf="selectedItem()?.recipe" class="mt-4 pt-4 border-t border-primary/10">
                 <h6 class="font-semibold text-sm text-foreground mb-2">Chef's Recipe (AI Generated)</h6>
                 <div class="bg-card border border-border rounded-md p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-x-auto max-h-64 overflow-y-auto">
                   {{ selectedItem()?.recipe }}
                 </div>
               </div>

               <div *ngIf="selectedItem()?.aiSuggestion" class="mt-4 pt-4 border-t border-primary/10">
                 <h6 class="font-semibold text-sm text-foreground mb-2">AI Suggestion</h6>
                 <div class="bg-card border border-border rounded-md p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-x-auto max-h-64 overflow-y-auto">
                   {{ selectedItem()?.aiSuggestion }}
                 </div>
               </div>
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
            // If we have an item selected, reload it to get the new AI fields
            if (this.selectedItem()) {
               const updated = this.menuItems().find(m => m.id === this.selectedItem()?.id);
               if (updated) this.selectedItem.set(updated);
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

  generateAiItem() {
    this.isAiGenerating.set(true);
    this.aiStatus.set({ status: 'PENDING', progress: 0, message: 'Initializing AI request...' });
    
    this.http.post(`${environment.apiUrl}/ai/generate-item`, {}).subscribe({
      next: (job: any) => {
        console.log('AI Job created:', job.id);
      },
      error: () => {
        this.isAiGenerating.set(false);
        this.aiStatus.set(null);
        alert('Failed to start AI generation.');
      }
    });
  }

  dismissAiStatus() {
    this.aiStatus.set(null);
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

  triggerSmartMenu() {
    const item = this.selectedItem();
    if (!item) return;

    this.isAiGenerating.set(true);
    this.aiStatus.set({ status: 'PENDING', progress: 0, message: 'Initializing Smart Menu Analysis...' });
    
    this.http.post(`${environment.apiUrl}/ai/smart-menu`, { itemId: item.id }).subscribe({
      next: (job: any) => {
        console.log('Smart Menu job created:', job?.id);
      },
      error: () => {
        this.isAiGenerating.set(false);
        this.aiStatus.set(null);
        alert('Failed to start Smart Menu analysis.');
      }
    });
  }
}
