import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../core/services/menu.service';
import { OrderService } from '../../core/services/order.service';
import { TableService } from '../../core/services/table.service';
import { MenuItem, Category } from '../../core/models/menu.model';
import { Table, TableStatus } from '../../core/models/table.model';
import { OrderType, PaymentMethod } from '../../core/models/order.model';
import { MockCheckoutComponent } from '../payment/mock-checkout.component';
import { LucideAngularModule, Search, Plus, Minus, Trash2, CreditCard, ChevronLeft, ChevronRight, X, ShoppingBag, Utensils, DollarSign, Check, AlertCircle, Sparkles, Layers, Coffee, ArrowRight } from 'lucide-angular';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-new-order',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, MockCheckoutComponent],
  template: `
    <div class="flex h-full gap-6 overflow-hidden w-full">

      <!-- Left Panel: Smart Menu Catalog & Terminal -->
      <div class="flex-1 flex flex-col overflow-hidden bg-card rounded-2xl border border-border shadow-sm">
        
        <!-- Terminal Top Header & Search Bar -->
        <div class="p-6 pb-4 border-b border-border bg-gradient-to-r from-card to-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-primary/10 text-primary">
              <lucide-icon name="utensils" [size]="22"></lucide-icon>
            </div>
            <div>
              <h1 class="text-xl font-black text-foreground m-0 tracking-tight flex items-center gap-2">
                <span>POS Order Terminal</span>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </h1>
              <p class="text-xs text-muted-foreground font-medium m-0 mt-0.5">Select items from the catalog or search by name</p>
            </div>
          </div>

          <!-- Quick Search Bar -->
          <div class="relative w-full sm:w-72">
            <lucide-icon name="search" [size]="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"></lucide-icon>
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)"
              placeholder="Search dishes, drinks, desserts..."
              class="w-full pl-9 pr-9 h-10 rounded-xl border border-border bg-background text-sm text-foreground font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60" />
            <button *ngIf="searchQuery" (click)="clearSearch()" class="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center border-none cursor-pointer">
              <lucide-icon name="x" [size]="12"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- Category Filter Pills Bar -->
        <div class="flex items-center gap-2 px-6 py-3.5 border-b border-border overflow-x-auto hide-scrollbar shrink-0 bg-muted/10">
          <button (click)="selectedCategory.set(null)"
            class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            [ngClass]="!selectedCategory() ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'">
            <span>All Categories</span>
            <span class="px-1.5 py-0.5 rounded-md text-[10px]"
              [ngClass]="!selectedCategory() ? 'bg-white/20' : 'bg-muted'">
              {{ menuItems().length }}
            </span>
          </button>

          <button *ngFor="let cat of categories()"
            (click)="selectedCategory.set(cat.id)"
            class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            [ngClass]="selectedCategory() === cat.id ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'">
            <span>{{ cat.name }}</span>
            <span class="px-1.5 py-0.5 rounded-md text-[10px]"
              [ngClass]="selectedCategory() === cat.id ? 'bg-white/20' : 'bg-muted'">
              {{ getCategoryCount(cat.id) }}
            </span>
          </button>
        </div>

        <!-- Catalog Grid -->
        <div class="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-transparent">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
            <p class="font-bold text-xs uppercase tracking-widest">Loading Catalog Items...</p>
          </div>

          <!-- Empty Catalog -->
          <div *ngIf="!isLoading && filteredItems().length === 0" class="flex flex-col items-center justify-center h-64 text-center p-6 border-2 border-dashed border-border rounded-2xl bg-card">
            <div class="p-4 rounded-full bg-muted text-muted-foreground mb-3">
              <lucide-icon name="shopping-bag" [size]="32"></lucide-icon>
            </div>
            <h3 class="font-black text-foreground text-base m-0">No Dishes Match Your Filter</h3>
            <p class="text-xs text-muted-foreground mt-1 max-w-xs">Try searching for a different keyword or select "All Categories" above.</p>
            <button *ngIf="selectedCategory() || searchQuery" (click)="resetFilters()" class="mt-4 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-colors border-none cursor-pointer">
              Reset Filters
            </button>
          </div>

          <!-- Product Cards Grid -->
          <div *ngIf="!isLoading && filteredItems().length > 0" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <div *ngFor="let item of filteredItems()"
              (click)="addToCart(item)"
              class="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary hover:shadow-xl transition-all duration-300 group flex flex-col justify-between relative"
              [ngClass]="{
                'opacity-50 grayscale pointer-events-none': !item.isAvailable,
                'ring-2 ring-primary/20': getItemCartQty(item.id) > 0
              }">
              
              <!-- Image Banner & Badges -->
              <div class="relative h-36 bg-muted overflow-hidden">
                <img [src]="item.image || '/hero.png'" [alt]="item.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                
                <!-- Price Badge -->
                <div class="absolute top-2.5 left-2.5 bg-background/90 backdrop-blur-md text-foreground text-xs font-black px-2.5 py-1 rounded-lg shadow-sm border border-border/50 flex items-center gap-0.5">
                  <span class="text-primary font-black">\${{ item.price | number:'1.2-2' }}</span>
                </div>

                <!-- Discount Pill -->
                <div *ngIf="item.discount > 0" class="absolute top-2.5 right-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  -{{ calcDiscount(item) }}% OFF
                </div>

                <!-- Out of Stock Overlay -->
                <div *ngIf="!item.isAvailable" class="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span class="bg-destructive text-destructive-foreground text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
                    Out of Stock
                  </span>
                </div>

                <!-- Cart Qty Badge overlay -->
                <div *ngIf="getItemCartQty(item.id) > 0" class="absolute bottom-2.5 right-2.5 size-7 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
                  {{ getItemCartQty(item.id) }}
                </div>
              </div>

              <!-- Item Content Info -->
              <div class="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 class="font-black text-sm text-foreground leading-tight m-0 group-hover:text-primary transition-colors line-clamp-1">{{ item.name }}</h3>
                  <p class="text-[11px] font-bold text-muted-foreground m-0 mt-1 line-clamp-1">
                    {{ item.category?.name || 'Artisanal Dish' }}
                  </p>
                </div>

                <div class="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                    Click to Add
                  </span>
                  <div class="size-6 rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground text-foreground flex items-center justify-center transition-colors">
                    <lucide-icon name="plus" [size]="14"></lucide-icon>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- Right Panel: Smart Order Cart & Terminal Checkout -->
      <div class="w-80 lg:w-96 flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden shrink-0">
        
        <!-- Cart Header -->
        <div class="p-5 border-b border-border bg-gradient-to-b from-muted/30 to-transparent">
          <div class="flex items-center justify-between mb-3.5">
            <div class="flex items-center gap-2">
              <lucide-icon name="shopping-bag" [size]="18" class="text-primary"></lucide-icon>
              <h2 class="font-black text-foreground uppercase tracking-wider text-sm m-0">Current Order Ticket</h2>
            </div>
            <span *ngIf="cart().length > 0" class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black text-xs">
              {{ cartItemsCount() }} Items
            </span>
          </div>

          <!-- Segmented Order Type Control -->
          <div class="grid grid-cols-2 gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50">
            <button (click)="orderType.set('DINE_IN')"
              class="py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
              [ngClass]="orderType() === 'DINE_IN' ? 'bg-background text-foreground shadow-sm ring-1 ring-border font-black' : 'bg-transparent text-muted-foreground hover:text-foreground'">
              <lucide-icon name="utensils" [size]="14"></lucide-icon>
              <span>Dine In</span>
            </button>

            <button (click)="orderType.set('TAKEAWAY')"
              class="py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
              [ngClass]="orderType() === 'TAKEAWAY' ? 'bg-background text-foreground shadow-sm ring-1 ring-border font-black' : 'bg-transparent text-muted-foreground hover:text-foreground'">
              <lucide-icon name="shopping-bag" [size]="14"></lucide-icon>
              <span>Take Away</span>
            </button>
          </div>

          <!-- Selected Table Banner (Only for Dine-In) -->
          <div *ngIf="orderType() === 'DINE_IN'" class="mt-3">
            <div *ngIf="selectedTable()" class="p-2.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="size-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                  {{ selectedTable()?.name?.charAt(0) || 'T' }}
                </div>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-wider text-primary m-0">Assigned Table</p>
                  <p class="text-xs font-black text-foreground m-0 leading-tight">{{ selectedTable()?.name }} ({{ selectedTable()?.section }})</p>
                </div>
              </div>
              <button (click)="openTablePicker()" class="px-2.5 py-1 rounded-lg bg-background text-foreground hover:bg-muted text-[10px] font-black uppercase tracking-wider border border-border cursor-pointer transition-colors">
                Change
              </button>
            </div>

            <button *ngIf="!selectedTable()" (click)="openTablePicker()"
              class="w-full py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-pulse">
              <lucide-icon name="alert-circle" [size]="14"></lucide-icon>
              <span>+ Select Dining Table Required</span>
            </button>
          </div>
        </div>

        <!-- Cart Items Scroll Area -->
        <div class="flex-1 overflow-y-auto p-4 divide-y divide-border/50">
          <div *ngIf="cart().length === 0" class="flex flex-col items-center justify-center h-full py-16 text-center text-muted-foreground">
            <div class="size-14 rounded-full bg-muted/60 flex items-center justify-center mb-3 text-muted-foreground/60">
              <lucide-icon name="shopping-bag" [size]="28"></lucide-icon>
            </div>
            <p class="font-black text-sm text-foreground m-0">Ticket is Empty</p>
            <p class="text-xs text-muted-foreground mt-1 max-w-[180px]">Click any dish from the catalog on the left to add it to this order.</p>
          </div>

          <div *ngFor="let item of cart(); let i = index" class="py-3 first:pt-0 last:pb-0 flex items-center gap-3 group">
            <!-- Thumbnail -->
            <div class="size-12 rounded-xl bg-cover bg-center border border-border shrink-0 shadow-sm"
              [style.backgroundImage]="'url(' + (item.menuItem.image || '/hero.png') + ')'"></div>
            
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-black text-xs text-foreground m-0 truncate leading-tight">{{ item.menuItem.name }}</p>
              <p class="text-xs text-primary font-black m-0 mt-0.5">\${{ item.menuItem.price | number:'1.2-2' }} <span class="text-[10px] font-medium text-muted-foreground">each</span></p>
            </div>

            <!-- Qty Controls -->
            <div class="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 shrink-0">
              <button (click)="updateQty(i, -1)" class="size-6 rounded-lg bg-background text-foreground hover:bg-muted flex items-center justify-center border border-border/50 cursor-pointer text-xs font-black transition-colors">-</button>
              <span class="w-6 text-center text-xs font-black text-foreground">{{ item.quantity }}</span>
              <button (click)="updateQty(i, 1)" class="size-6 rounded-lg bg-background text-foreground hover:bg-muted flex items-center justify-center border border-border/50 cursor-pointer text-xs font-black transition-colors">+</button>
            </div>

            <!-- Remove Button -->
            <button (click)="removeFromCart(i)" title="Remove Item"
              class="size-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer shrink-0">
              <lucide-icon name="trash-2" [size]="14"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- Terminal Checkout Footer -->
        <div class="p-5 border-t border-border bg-gradient-to-t from-muted/30 to-transparent flex flex-col gap-4">
          <!-- Breakdown -->
          <div class="space-y-1.5 text-xs">
            <div class="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span class="font-bold text-foreground">\${{ cartTotal() | number:'1.2-2' }}</span>
            </div>
            <div class="flex items-center justify-between text-muted-foreground">
              <span>Tax &amp; Service (Included)</span>
              <span class="font-bold text-foreground">\${{ (cartTotal() * 0.05) | number:'1.2-2' }}</span>
            </div>
            <div class="pt-2 border-t border-border/60 flex items-center justify-between">
              <span class="text-sm font-black uppercase tracking-wider text-foreground">Total Due</span>
              <span class="text-2xl font-black text-primary">\${{ cartTotal() | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- Checkout Buttons -->
          <div class="grid grid-cols-1 gap-2.5 pt-1">
            <!-- Cash / Counter -->
            <button (click)="placeOrder('CASH')"
              [disabled]="cart().length === 0 || isSubmitting() || (orderType() === 'DINE_IN' && !selectedTable())"
              class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-black transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              <lucide-icon name="dollar-sign" [size]="16"></lucide-icon>
              <span>{{ isSubmitting() ? 'Processing Ticket...' : 'Process Cash / Counter Order' }}</span>
            </button>

            <!-- Card / Stripe -->
            <button (click)="placeOrder('CARD')"
              [disabled]="cart().length === 0 || isSubmitting() || (orderType() === 'DINE_IN' && !selectedTable())"
              class="w-full py-3 bg-foreground text-background hover:opacity-90 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
              <lucide-icon name="credit-card" [size]="15"></lucide-icon>
              <span>Pay Online via Stripe Card</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Table Picker Modal (Rich UI) -->
      <div *ngIf="showTablePicker()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="bg-card w-full max-w-xl rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
          
          <div class="p-6 border-b border-border flex items-center justify-between bg-muted/30">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl bg-primary/10 text-primary">
                <lucide-icon name="layers" [size]="20"></lucide-icon>
              </div>
              <div>
                <h3 class="font-black text-lg text-foreground m-0">Select an Available Table</h3>
                <p class="text-xs text-muted-foreground m-0 mt-0.5">Choose an unoccupied table to assign to this Dine-In order</p>
              </div>
            </div>
            <button (click)="showTablePicker.set(false)" class="size-8 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border-none flex items-center justify-center cursor-pointer">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>

          <div class="p-6 overflow-y-auto">
            <div *ngIf="availableTables().length === 0" class="py-12 text-center text-muted-foreground">
              <p class="font-black text-base text-foreground m-0">No Tables Available</p>
              <p class="text-xs text-muted-foreground mt-1">All dining tables are currently occupied or reserved. Try switching to Take Away or clear a table first.</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button *ngFor="let table of availableTables()"
                (click)="selectTable(table)"
                class="p-4 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group relative">
                
                <div class="size-12 rounded-xl bg-primary/10 text-primary font-black text-base flex items-center justify-center group-hover:scale-110 transition-transform">
                  {{ table.name }}
                </div>
                
                <div class="text-center">
                  <p class="font-black text-xs text-foreground m-0">{{ table.name }}</p>
                  <p class="text-[10px] font-semibold text-muted-foreground m-0 mt-0.5">{{ table.section }} • {{ table.seats }} Seats</p>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Mock Checkout Modal -->
      <app-mock-checkout *ngIf="showCheckout()"
        [amount]="cartTotal()" [orderId]="currentOrderId()"
        (success)="onPaymentSuccess()" (cancel)="showCheckout.set(false)">
      </app-mock-checkout>

    </div>
  `
})
export class NewOrderComponent implements OnInit {
  menuItems = signal<MenuItem[]>([]);
  categories = signal<Category[]>([]);
  tables = signal<Table[]>([]);
  cart = signal<{menuItem: MenuItem, quantity: number}[]>([]);
  orderType = signal<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  selectedCategory = signal<string | null>(null);
  selectedTable = signal<Table | null>(null);
  showTablePicker = signal(false);
  showCheckout = signal(false);
  currentOrderId = signal('');
  isSubmitting = signal(false);
  isLoading = false;
  searchQuery = '';
  private searchSubject = new Subject<string>();

  // Icons
  readonly Search = Search;
  readonly Plus = Plus;
  readonly Minus = Minus;
  readonly Trash2 = Trash2;
  readonly CreditCard = CreditCard;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly X = X;
  readonly ShoppingBag = ShoppingBag;
  readonly Utensils = Utensils;
  readonly DollarSign = DollarSign;
  readonly Check = Check;
  readonly AlertCircle = AlertCircle;
  readonly Sparkles = Sparkles;
  readonly Layers = Layers;
  readonly Coffee = Coffee;
  readonly ArrowRight = ArrowRight;

  constructor(
    private menuService: MenuService,
    private orderService: OrderService,
    private tableService: TableService
  ) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(q => this.loadMenu(q));
  }

  ngOnInit() {
    this.loadMenu();
    this.menuService.getCategories().subscribe({
      next: (c) => this.categories.set(c || [])
    });
    this.tableService.getTables().subscribe({
      next: (t) => this.tables.set(t || [])
    });
  }

  loadMenu(search = '') {
    this.isLoading = true;
    this.menuService.getMenuItems(1, 100, undefined, search || undefined).subscribe({
      next: (res) => {
        this.menuItems.set(res.data || []);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch(q: string) { this.searchSubject.next(q); }

  clearSearch() {
    this.searchQuery = '';
    this.loadMenu();
  }

  resetFilters() {
    this.selectedCategory.set(null);
    this.searchQuery = '';
    this.loadMenu();
  }

  getCategoryCount(catId: string): number {
    return this.menuItems().filter(i => i.categoryId === catId || i.category?.id === catId).length;
  }

  getItemCartQty(itemId: string): number {
    const item = this.cart().find(c => c.menuItem.id === itemId);
    return item ? item.quantity : 0;
  }

  filteredItems(): MenuItem[] {
    const cat = this.selectedCategory();
    let items = this.menuItems();
    if (cat) items = items.filter(i => i.categoryId === cat || i.category?.id === cat);
    return items;
  }

  availableTables(): Table[] {
    return this.tables().filter(t => t.status === TableStatus.AVAILABLE);
  }

  cartItemsCount = computed(() => this.cart().reduce((acc, idx) => acc + idx.quantity, 0));

  addToCart(item: MenuItem) {
    if (!item.isAvailable) return;
    this.cart.update(c => {
      const ex = c.find(x => x.menuItem.id === item.id);
      if (ex) return c.map(x => x.menuItem.id === item.id ? {...x, quantity: x.quantity + 1} : x);
      return [...c, {menuItem: item, quantity: 1}];
    });
  }

  updateQty(i: number, delta: number) {
    this.cart.update(c => {
      const updated = [...c];
      updated[i] = {...updated[i], quantity: updated[i].quantity + delta};
      if (updated[i].quantity <= 0) updated.splice(i, 1);
      return updated;
    });
  }

  removeFromCart(i: number) {
    this.cart.update(c => c.filter((_, idx) => idx !== i));
  }

  cartTotal(): number {
    return this.cart().reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
  }

  calcDiscount(item: MenuItem): number {
    if (!item.discount || !item.price) return 0;
    return Math.round((item.discount / (item.price + item.discount)) * 100);
  }

  openTablePicker() {
    this.tableService.getTables().subscribe(t => this.tables.set(t || []));
    this.showTablePicker.set(true);
  }

  selectTable(table: Table) {
    this.selectedTable.set(table);
    this.showTablePicker.set(false);
  }

  placeOrder(method: 'CASH' | 'CARD') {
    if (!this.cart().length) return;
    if (this.orderType() === 'DINE_IN' && !this.selectedTable()) {
      alert('Please assign a dining table for this Dine-In order.');
      return;
    }
    this.isSubmitting.set(true);
    this.orderService.createOrder({
      orderType: this.orderType() === 'DINE_IN' ? OrderType.DINE_IN : OrderType.TAKEAWAY,
      tableId: this.selectedTable()?.id,
      paymentMethod: method === 'CARD' ? PaymentMethod.CARD : PaymentMethod.CASH,
      items: this.cart().map(c => ({menuItemId: c.menuItem.id, quantity: c.quantity}))
    }).subscribe({
      next: (order) => {
        this.isSubmitting.set(false);
        if (method === 'CARD') {
          this.currentOrderId.set(order.id);
          this.showCheckout.set(true);
        } else {
          this.cart.set([]);
          this.selectedTable.set(null);
          alert('Ticket Created & Sent to Kitchen KDS Successfully!');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err.error?.message || 'Failed to submit order ticket.');
      }
    });
  }

  onPaymentSuccess() {
    this.showCheckout.set(false);
    this.cart.set([]);
    this.selectedTable.set(null);
  }
}
