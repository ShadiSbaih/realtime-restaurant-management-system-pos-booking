import { Component, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../../core/services/table.service';
import { Table, TableStatus, TableShape } from '../../core/models/table.model';
import { MenuService } from '../../core/services/menu.service';
import { MenuItem, Category } from '../../core/models/menu.model';
import { OrderService } from '../../core/services/order.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { OrderType, PaymentMethod } from '../../core/models/order.model';
import { FormsModule } from '@angular/forms';
import { MockCheckoutComponent } from '../payment/mock-checkout.component';
import { LucideAngularModule, Trash, Grid2x2 } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, MockCheckoutComponent, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col bg-canvas">
      <!-- Top Header -->
      <header class="border-b border-hairline sticky w-full top-0 z-10 bg-canvas/80 backdrop-blur-sm">
        <div class="px-lg py-md flex items-center justify-between">
          <div class="flex gap-xs">
            <h1 class="text-heading-lg text-ink m-0">
              Floor Plan Management
            </h1>
          </div>
        </div>
      </header>
      
      <!-- Main Content Area -->
      <div class="flex flex-col h-[calc(100vh-80px)] overflow-hidden p-lg">
        
        <!-- Floor Plan Card -->
        <div class="flex-1 bg-surface-bone border border-hairline rounded-md shadow-sm p-xl flex flex-col relative overflow-hidden">
          
          <!-- POS Layout split: Left (Tables) / Right (Menu + Cart if selected) -->
          <div class="flex h-full gap-xl">
            
            <!-- Tables Section -->
            <div class="flex-1 flex flex-col border-r border-hairline pr-xl">
              <!-- Tabs -->
              <div class="w-full mb-xl border-b border-hairline flex gap-xl">
                <button *ngFor="let tab of tabs" 
                        (click)="activeSection.set(tab)"
                        class="pb-md text-button-sm relative transition-colors hover:text-ink cursor-pointer bg-transparent border-none p-0"
                        [class.text-ink]="activeSection() === tab"
                        [class.text-mute]="activeSection() !== tab">
                  {{ tab }}
                  <div *ngIf="activeSection() === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-ink rounded-t-full"></div>
                </button>
              </div>
              
              <!-- Legend -->
              <div class="flex gap-md items-center mb-lg text-caption text-mute">
                <div class="flex items-center gap-xs"><div class="bg-primary rounded-full size-3"></div> Available</div>
                <div class="flex items-center gap-xs"><div class="bg-[#e05d0e] rounded-full size-3"></div> Occupied</div>
                <div class="flex items-center gap-xs"><div class="bg-[#1e429f] rounded-full size-3"></div> Reserved</div>
              </div>
              
              <!-- Grid Area -->
              <div class="flex-1 overflow-auto flex justify-center items-start pt-md">
                <div class="flex flex-wrap gap-xl justify-center max-w-[800px]">
                  <div *ngIf="displayTables().length === 0" class="text-mute text-body-sm">No tables available in this section.</div>
                  
                  <div *ngFor="let table of displayTables()"
                       (click)="selectTable(table)"
                       class="relative p-xs rounded-md hover:border-primary group cursor-pointer transition-all duration-200"
                       [class.opacity-50]="isLoading()">
                    
                    <!-- Delete Button for Admin/Manager -->
                    <button *ngIf="canEdit"
                            (click)="deleteTable($event, table)"
                            class="absolute -top-3 -right-2 hidden group-hover:flex items-center justify-center rounded-full size-6 shadow-sm z-20 bg-primary text-canvas hover:bg-primary/90 border-none cursor-pointer"
                            [disabled]="table.status !== 'AVAILABLE'">
                      <lucide-icon name="trash" class="size-3"></lucide-icon>
                    </button>
                    
                    <!-- Table Shape -->
                    <div class="flex items-center justify-center flex-col transition-all duration-300 shadow-sm border border-hairline"
                         [ngClass]="{
                           'rounded-md aspect-square size-24': table.shape === 'square',
                           'rounded-full aspect-square size-24': table.shape === 'circle',
                           'rounded-md aspect-[1.5] w-32 h-20': table.shape === 'rectangle',
                           'bg-canvas': table.status === 'AVAILABLE' && !isReserved(table),
                           'bg-[#fdf6b2]/30 border-[#fdf6b2]/50 text-[#8e4b10]': table.status === 'OCCUPIED',
                           'bg-[#e1effe]/30 border-[#e1effe]/50 text-[#1e429f]': table.status === 'RESERVED' || isReserved(table),
                           'ring-2 ring-primary ring-offset-2 ring-offset-canvas': selectedTable()?.id === table.id
                         }">
                      <span class="font-bold text-ink text-heading-sm m-0">{{ table.name }}</span>
                      <span class="text-caption text-charcoal m-0">{{ table.seats }} Seats</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Menu & Cart Section (Right Side) -->
            <div class="w-[380px] flex flex-col h-full bg-canvas rounded-md border border-hairline overflow-hidden">
              <div *ngIf="!selectedTable()" class="flex-1 flex flex-col items-center justify-center text-mute p-xl text-center">
                <lucide-icon [img]="Grid2x2" class="size-12 mb-md opacity-50"></lucide-icon>
                <h3 class="text-heading-md text-ink m-0 mb-xs">No Table Selected</h3>
                <p class="text-body-sm m-0">Select an available table from the floor plan to start an order.</p>
              </div>
              
              <ng-container *ngIf="selectedTable()">
                <div class="p-md border-b border-hairline bg-surface-bone flex justify-between items-center shrink-0">
                  <div>
                    <h3 class="font-bold text-heading-sm m-0 text-ink">Order for {{ selectedTable()?.name }}</h3>
                    <span class="text-caption text-mute">New Order</span>
                  </div>
                  <button class="button-ghost text-caption-tight text-primary p-0 h-auto" (click)="selectedTable.set(null)">Change</button>
                </div>
                
                <!-- Menu Categories (Horizontal Scroll) -->
                <div class="flex gap-xs p-md overflow-x-auto border-b border-hairline custom-scrollbar shrink-0">
                   <button class="px-sm py-xs rounded-full text-caption-tight font-medium whitespace-nowrap transition-colors border-none cursor-pointer"
                           [class.bg-ink]="!selectedCategory()"
                           [class.text-canvas]="!selectedCategory()"
                           [class.bg-surface-bone]="selectedCategory()"
                           [class.text-charcoal]="selectedCategory()"
                           [class.hover:bg-surface-dark]="selectedCategory()"
                           [class.hover:text-canvas]="selectedCategory()"
                           (click)="selectedCategory.set(null)">All</button>
                   <button *ngFor="let cat of categories()"
                           class="px-sm py-xs rounded-full text-caption-tight font-medium whitespace-nowrap transition-colors border-none cursor-pointer"
                           [class.bg-ink]="selectedCategory() === cat.id"
                           [class.text-canvas]="selectedCategory() === cat.id"
                           [class.bg-surface-bone]="selectedCategory() !== cat.id"
                           [class.text-charcoal]="selectedCategory() !== cat.id"
                           [class.hover:bg-surface-dark]="selectedCategory() !== cat.id"
                           [class.hover:text-canvas]="selectedCategory() !== cat.id"
                           (click)="selectedCategory.set(cat.id)">{{ cat.name }}</button>
                </div>
                
                <!-- Menu Items Grid -->
                <div class="flex-1 overflow-y-auto custom-scrollbar p-md grid grid-cols-2 gap-sm content-start bg-canvas">
                  <div *ngFor="let item of filteredMenu()" 
                       (click)="addToCart(item)"
                       class="bg-surface-bone border border-hairline rounded-md overflow-hidden cursor-pointer hover:border-[#333] transition-colors group flex flex-col">
                    <div class="h-24 bg-surface-dark w-full bg-cover bg-center" [style.backgroundImage]="'url(' + (item.image || 'assets/placeholder.png') + ')'"></div>
                    <div class="p-sm flex-1 flex flex-col justify-between">
                      <span class="text-body-sm font-bold text-ink leading-tight mb-xs">{{ item.name }}</span>
                      <span class="text-primary font-bold text-body-sm">\${{ item.price | number:'1.2-2' }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Cart Footer -->
                <div class="border-t border-hairline bg-surface-bone p-md shrink-0">
                  <div class="flex flex-col gap-xs mb-md max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                    <div *ngIf="cart().length === 0" class="text-center text-mute text-body-sm py-sm">Cart is empty</div>
                    <div *ngFor="let item of cart(); let i = index" class="flex justify-between items-center text-body-sm">
                      <div class="flex flex-col">
                        <span class="font-bold text-ink truncate w-[140px]">{{ item.menuItem.name }}</span>
                        <span class="text-mute">\${{ item.menuItem.price }}</span>
                      </div>
                      <div class="flex items-center gap-xs bg-canvas rounded-md p-0.5 border border-hairline">
                        <button class="size-6 flex items-center justify-center rounded text-charcoal hover:bg-surface-bone border-none cursor-pointer bg-transparent" (click)="updateQuantity(i, -1)">-</button>
                        <span class="w-4 text-center font-bold text-ink">{{ item.quantity }}</span>
                        <button class="size-6 flex items-center justify-center rounded text-charcoal hover:bg-surface-bone border-none cursor-pointer bg-transparent" (click)="updateQuantity(i, 1)">+</button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center mb-md font-bold text-heading-sm text-ink">
                    <span>Total:</span>
                    <span>\${{ cartTotal() | number:'1.2-2' }}</span>
                  </div>
                  
                  <div class="flex gap-sm">
                    <button class="flex-1 button-outline py-sm"
                            [disabled]="cart().length === 0 || isLoading()"
                            (click)="submitOrder('CASH')">
                      Pay Cash
                    </button>
                    <button class="flex-1 button-dark py-sm"
                            [disabled]="cart().length === 0 || isLoading()"
                            (click)="submitOrder('CARD')">
                      Pay Card
                    </button>
                  </div>
                </div>
                
              </ng-container>
            </div>
            
          </div>
        </div>
      </div>
      
      <!-- Mock Checkout Overlay -->
      <app-mock-checkout *ngIf="showCheckout()" 
                         [amount]="cartTotal()" 
                         [orderId]="currentOrderId()"
                         (success)="onPaymentSuccess()"
                         (cancel)="onPaymentCancel()">
      </app-mock-checkout>
    </div>
  `,
  styles: []
})
export class PosComponent implements OnInit {
  tabs = ['Main Dining Room', 'Outdoor', 'Terrace'];
  activeSection = signal<string>('Main Dining Room');
  
  tables = signal<Table[]>([]);
  menuItems = signal<MenuItem[]>([]);
  categories = signal<Category[]>([]);
  
  selectedTable = signal<Table | null>(null);
  selectedCategory = signal<string | null>(null);
  
  cart = signal<{menuItem: MenuItem, quantity: number}[]>([]);
  isLoading = signal(false);
  
  showCheckout = signal(false);
  currentOrderId = signal<string>('');
  
  readonly Trash = Trash;
  readonly Grid2x2 = Grid2x2;
  canEdit = false;

  constructor(
    private tableService: TableService,
    private menuService: MenuService,
    private orderService: OrderService,
    private wsService: WebsocketService,
    private authService: AuthService
  ) {
    this.canEdit = this.authService.hasRole(['ADMIN', 'MANAGER'] as any);
    
    // Real-time table updates
    effect(() => {
      const update = this.wsService.tableUpdateEvent();
      if (update) {
        this.loadTables();
      }
    });
  }

  ngOnInit() {
    this.loadTables();
    this.loadCategories();
    this.loadMenu();
  }

  loadTables() {
    this.tableService.getTables().subscribe(data => this.tables.set(data));
  }

  loadCategories() {
    this.menuService.getCategories().subscribe(data => this.categories.set(data));
  }

  loadMenu() {
    this.menuService.getMenuItems(1, 100).subscribe(res => {
      this.menuItems.set(res.data);
    });
  }
  
  isReserved(table: Table): boolean {
    return table.reservations !== undefined && table.reservations.length > 0;
  }
  
  displayTables(): Table[] {
    return this.tables().filter(t => t.section === this.activeSection());
  }

  filteredMenu(): MenuItem[] {
    const catId = this.selectedCategory();
    if (!catId) return this.menuItems();
    return this.menuItems().filter(item => item.categoryId === catId || (item.category && item.category.id === catId));
  }

  selectTable(table: Table) {
    if (table.status !== TableStatus.AVAILABLE && this.selectedTable()?.id !== table.id) {
      alert('This table is not available!');
      return;
    }
    this.selectedTable.set(table);
  }

  deleteTable(event: Event, table: Table) {
    event.stopPropagation();
    if (table.status !== TableStatus.AVAILABLE) {
      alert('Cannot delete an occupied or reserved table.');
      return;
    }
    if (confirm(`Are you sure you want to delete table ${table.name}?`)) {
      this.tableService.deleteTable(table.id).subscribe(() => this.loadTables());
    }
  }

  addToCart(item: MenuItem) {
    if (!item.isAvailable) return;
    
    this.cart.update(current => {
      const existing = current.find(c => c.menuItem.id === item.id);
      if (existing) {
        return current.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...current, { menuItem: item, quantity: 1 }];
    });
  }

  updateQuantity(index: number, delta: number) {
    this.cart.update(current => {
      const updated = [...current];
      updated[index].quantity += delta;
      if (updated[index].quantity <= 0) {
        updated.splice(index, 1);
      }
      return updated;
    });
  }

  cartTotal(): number {
    return this.cart().reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  }

  submitOrder(method: 'CASH' | 'CARD') {
    if (this.cart().length === 0) return;
    
    const isDineIn = this.selectedTable() !== null;
    
    const request = {
      orderType: isDineIn ? OrderType.DINE_IN : OrderType.TAKEAWAY,
      tableId: this.selectedTable()?.id,
      paymentMethod: method === 'CARD' ? PaymentMethod.CARD : PaymentMethod.CASH,
      items: this.cart().map(c => ({
        menuItemId: c.menuItem.id,
        quantity: c.quantity
      }))
    };

    this.isLoading.set(true);
    this.orderService.createOrder(request).subscribe({
      next: (order) => {
        this.isLoading.set(false);
        if (method === 'CARD') {
          this.currentOrderId.set(order.id);
          this.showCheckout.set(true);
        } else {
          this.cart.set([]);
          this.selectedTable.set(null);
          // Update table status locally for immediate feedback (websocket will sync it too)
          this.loadTables(); 
          alert('Cash Order placed successfully!');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.error?.message || 'Error placing order');
      }
    });
  }
  
  onPaymentSuccess() {
    this.showCheckout.set(false);
    this.cart.set([]);
    this.selectedTable.set(null);
    this.loadTables();
  }
  
  onPaymentCancel() {
    this.showCheckout.set(false);
  }
}
