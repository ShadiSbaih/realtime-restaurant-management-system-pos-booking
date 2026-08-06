import { ChangeDetectionStrategy, Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableService } from '../../core/services/table.service';
import { Table, TableStatus, TableShape } from '../../core/models/table.model';
import { WebsocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/auth/auth.service';
import { LucideAngularModule, Plus, Trash2, X, Users, CheckCircle2, Clock, AlertCircle, Coffee, Sparkles, RefreshCw, Layers, Settings, Filter, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col h-full gap-xl w-full bg-canvas">

      <!-- Header & Live Occupancy Banner -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-xl">
        <div class="flex items-center gap-md">
          <div>
            <h1 class="text-heading-lg text-ink m-0">Floor Plan &amp; Table Management</h1>
            <p class="text-body-sm text-mute m-0 mt-xs">Real-time dining room seating arrangement &amp; table status control</p>
          </div>
        </div>

        <!-- Header Action Controls -->
        <div class="flex items-center gap-sm w-full lg:w-auto justify-end flex-wrap">
          <button (click)="loadTables()" [disabled]="isLoading()"
            class="button-outline flex items-center gap-xs p-md">
            <lucide-icon name="refresh-cw" class="size-4" [class.animate-spin]="isLoading()"></lucide-icon>
            <span>Refresh Floor</span>
          </button>
          
          <button *ngIf="canEdit" (click)="openAddModal()"
            class="button-dark flex items-center gap-xs p-md">
            <lucide-icon name="plus" class="size-4"></lucide-icon>
            <span>Add New Table</span>
          </button>
        </div>
      </div>

      <!-- Live Analytics Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
        <!-- Total Tables -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-[#333] transition-colors">
          <div>
            <p class="text-caption-tight uppercase text-mute m-0">Total Tables</p>
            <h3 class="text-display-sm text-ink m-0 mt-xs">{{ totalTablesCount() }}</h3>
            <p class="text-caption text-charcoal m-0 mt-xs flex items-center gap-xs">
              <lucide-icon name="users" class="size-3"></lucide-icon> {{ totalSeatsCount() }} Total Seating Capacity
            </p>
          </div>
          <div class="p-sm rounded-md bg-canvas text-charcoal group-hover:scale-110 transition-transform">
            <lucide-icon name="layers" class="size-5"></lucide-icon>
          </div>
        </div>

        <!-- Available -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg shadow-sm flex items-center justify-between relative overflow-hidden group transition-colors">
          <div>
            <p class="text-caption-tight uppercase text-primary m-0">Available</p>
            <h3 class="text-display-sm text-primary m-0 mt-xs">{{ availableTablesCount() }}</h3>
            <p class="text-caption text-mute m-0 mt-xs">
              {{ getPercentage(availableTablesCount(), totalTablesCount()) }}% of room ready
            </p>
          </div>
          <div class="p-sm rounded-md bg-primary/10 text-primary group-hover:scale-110 transition-transform">
            <lucide-icon name="check-circle-2" class="size-5"></lucide-icon>
          </div>
        </div>

        <!-- Occupied -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg shadow-sm flex items-center justify-between relative overflow-hidden group transition-colors">
          <div>
            <p class="text-caption-tight uppercase text-[#e05d0e] m-0">Occupied</p>
            <h3 class="text-display-sm text-[#e05d0e] m-0 mt-xs">{{ occupiedTablesCount() }}</h3>
            <p class="text-caption text-mute m-0 mt-xs">
              {{ getPercentage(occupiedTablesCount(), totalTablesCount()) }}% currently seated
            </p>
          </div>
          <div class="p-sm rounded-md bg-[#e05d0e]/10 text-[#e05d0e] group-hover:scale-110 transition-transform">
            <lucide-icon name="coffee" class="size-5"></lucide-icon>
          </div>
        </div>

        <!-- Reserved -->
        <div class="bg-surface-bone border border-hairline rounded-md p-lg shadow-sm flex items-center justify-between relative overflow-hidden group transition-colors">
          <div>
            <p class="text-caption-tight uppercase text-[#1e429f] m-0">Reserved</p>
            <h3 class="text-display-sm text-[#1e429f] m-0 mt-xs">{{ reservedTablesCount() }}</h3>
            <p class="text-caption text-mute m-0 mt-xs">
              Upcoming bookings
            </p>
          </div>
          <div class="p-sm rounded-md bg-[#1e429f]/10 text-[#1e429f] group-hover:scale-110 transition-transform">
            <lucide-icon name="clock" class="size-5"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Navigation & Status Filters Bar -->
      <div class="bg-surface-bone border border-hairline rounded-md p-md shadow-sm flex flex-col md:flex-row justify-between items-center gap-md">
        
        <!-- Dining Section Tabs -->
        <div class="flex items-center gap-sm w-full md:w-auto overflow-x-auto pb-sm md:pb-0 custom-scrollbar">
          <button *ngFor="let tab of sections()"
            (click)="activeSection.set(tab)"
            class="px-md py-sm rounded-md text-caption font-bold transition-all border cursor-pointer whitespace-nowrap flex items-center gap-xs shrink-0"
            [ngClass]="activeSection() === tab ? 'bg-ink text-canvas border-ink shadow-sm' : 'bg-canvas text-mute border-hairline hover:bg-surface-dark hover:text-canvas'">
            <span>{{ tab }}</span>
            <span class="px-xs py-0.5 rounded-full text-caption-tight"
              [ngClass]="activeSection() === tab ? 'bg-surface-dark text-canvas' : 'bg-surface-bone text-ink'">
              {{ getSectionCount(tab) }}
            </span>
          </button>
        </div>

        <!-- Status Filter Pills -->
        <div class="flex items-center gap-xs w-full md:w-auto justify-start md:justify-end border-t md:border-t-0 pt-md md:pt-0 border-hairline">
          <span class="text-caption-tight font-bold text-mute mr-xs flex items-center gap-xs shrink-0">
            <lucide-icon name="filter" class="size-3"></lucide-icon> Filter Status:
          </span>
          <button *ngFor="let filter of statusFilters"
            (click)="statusFilter.set(filter.value)"
            class="px-sm py-xs rounded-md text-caption-tight font-bold uppercase transition-all cursor-pointer border whitespace-nowrap"
            [ngClass]="statusFilter() === filter.value ? 'bg-ink text-canvas border-ink shadow-sm' : 'bg-transparent text-mute border-hairline hover:bg-surface-bone'">
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && displayTables().length === 0" class="flex flex-col items-center justify-center py-xxxl text-center border border-hairline rounded-md bg-surface-bone shadow-sm">
        <div class="bg-canvas p-lg rounded-full mb-md text-mute border border-hairline">
          <lucide-icon name="layers" class="size-10"></lucide-icon>
        </div>
        <h3 class="text-heading-md text-ink mb-xs m-0">No Tables Found in Section</h3>
        <p class="text-body-sm text-mute max-w-sm mb-xl m-0">There are no tables in "{{ activeSection() }}" matching your current status filter.</p>
        <div class="flex gap-sm">
          <button *ngIf="statusFilter() !== 'ALL'" (click)="statusFilter.set('ALL')"
            class="button-outline">
            Show All Statuses
          </button>
          <button *ngIf="canEdit" (click)="openAddModal()"
            class="button-dark">
            + Add Table Here
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex flex-col items-center justify-center py-xxxl text-mute">
        <div class="animate-spin rounded-full size-10 border-b-2 border-primary mb-md"></div>
        <p class="font-bold text-body-sm m-0">Synchronizing Floor Plan &amp; Tables...</p>
      </div>

      <!-- Interactive Table Grid -->
      <div *ngIf="!isLoading() && displayTables().length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md">
        <div *ngFor="let table of displayTables(); trackBy: trackByTableId"
          class="bg-surface-bone rounded-md border border-hairline shadow-sm hover:border-ink transition-all duration-300 p-xl flex flex-col justify-between relative group">

          <!-- Top Header -->
          <div class="flex items-center justify-between mb-xl">
            <div class="flex items-center gap-sm">
              <span class="size-2.5 rounded-full"
                [ngClass]="{ 'bg-primary': table.status === 'AVAILABLE', 'bg-[#e05d0e]': table.status === 'OCCUPIED', 'bg-[#1e429f]': table.status === 'RESERVED' }"></span>
              <span class="text-caption font-bold uppercase tracking-wider text-ink">
                {{ table.status }}
              </span>
            </div>

            <!-- Delete Button (Admin Only, Available tables) -->
            <button *ngIf="canEdit && table.status === 'AVAILABLE'"
              (click)="deleteTable($event, table)"
              title="Delete Table"
              class="size-7 rounded-md text-mute hover:bg-[#e02424]/10 hover:text-[#e02424] transition-all flex items-center justify-center border-none cursor-pointer bg-transparent">
              <lucide-icon name="trash-2" class="size-3.5"></lucide-icon>
            </button>
          </div>

          <!-- Main Info -->
          <div class="flex flex-col gap-xs flex-1">
             <h3 class="text-heading-sm font-bold text-ink m-0 leading-tight">{{ table.name }}</h3>
             <p class="text-caption font-medium text-mute m-0 capitalize">{{ table.shape }} • {{ table.seats }} Seats</p>
          </div>

          <!-- Footer Status Tabs -->
          <div *ngIf="canEdit" class="mt-xl pt-md border-t border-hairline flex items-center gap-xs">
            <button (click)="quickSetStatus(table, 'AVAILABLE')"
              class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors border cursor-pointer"
              [ngClass]="table.status === 'AVAILABLE' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-canvas text-mute border-hairline hover:bg-black/5 dark:hover:bg-white/10'">
              Avail
            </button>
            <button (click)="quickSetStatus(table, 'OCCUPIED')"
              class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors border cursor-pointer"
              [ngClass]="table.status === 'OCCUPIED' ? 'bg-[#e05d0e] text-white border-[#e05d0e] shadow-sm' : 'bg-canvas text-mute border-hairline hover:bg-black/5 dark:hover:bg-white/10'">
              Occupy
            </button>
            <button (click)="quickSetStatus(table, 'RESERVED')"
              class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors border cursor-pointer"
              [ngClass]="table.status === 'RESERVED' ? 'bg-[#1e429f] text-white border-[#1e429f] shadow-sm' : 'bg-canvas text-mute border-hairline hover:bg-black/5 dark:hover:bg-white/10'">
              Rsrv
            </button>
          </div>
          
          <div *ngIf="!canEdit" class="mt-xl pt-md border-t border-hairline flex items-center justify-between">
            <span class="text-caption-tight font-bold uppercase tracking-wider text-mute">
              {{ table.seats }} Seats Capacity
            </span>
          </div>

        </div>
      </div>

      <!-- Add New Table Modal -->
      <div *ngIf="showAddModal()" class="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-md animate-in fade-in duration-200">
        <div class="bg-canvas w-full max-w-lg rounded-md border border-hairline shadow-md overflow-hidden flex flex-col">
          
          <!-- Modal Header -->
          <div class="p-lg border-b border-hairline flex items-center justify-between bg-surface-bone">
            <div class="flex items-center gap-md">
             
              <div>
                <h3 class="font-bold text-heading-sm text-ink m-0">Add New Dining Table</h3>
                <p class="text-caption text-mute m-0 mt-xs">Configure seating capacity, section &amp; table layout shape</p>
              </div>
            </div>
            <button (click)="closeAddModal()" class="size-8 rounded-full bg-canvas text-mute hover:text-ink border border-hairline flex items-center justify-center cursor-pointer">
              <lucide-icon name="x" class="size-4"></lucide-icon>
            </button>
          </div>

          <div class="p-lg flex flex-col gap-xl">
            <!-- Table Preview Box -->
            <div class="p-md rounded-md bg-surface-bone border border-hairline flex items-center justify-center gap-xl">
              <div class="text-center">
                <p class="text-caption-tight uppercase text-mute mb-sm m-0">Live Table Preview</p>
                <div class="flex items-center justify-center font-bold bg-canvas border border-hairline text-ink shadow-sm mx-auto transition-all duration-300"
                  [ngClass]="{ 'rounded-full size-20': newTable.shape === 'circle', 'rounded-md size-20': newTable.shape === 'square', 'rounded-md w-28 h-20': newTable.shape === 'rectangle' }">
                  <div class="text-center">
                    <div *ngIf="newTable.shape === 'circle'" class="text-caption-tight text-ink mb-xs">VIP</div>
                    <div class="font-bold text-body-sm">{{ newTable.name || 'T-01' }}</div>
                  </div>
                </div>
              </div>
              <div class="text-left text-body-sm space-y-xs text-charcoal">
                <p class="m-0"><strong class="text-ink">Section:</strong> {{ newTable.section }}</p>
                <p class="m-0"><strong class="text-ink">Capacity:</strong> {{ newTable.seats }} Guests</p>
                <p class="m-0 capitalize"><strong class="text-ink">Shape:</strong> {{ newTable.shape }} Table</p>
              </div>
            </div>

            <!-- Form Inputs -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <!-- Table Name -->
              <div class="flex flex-col gap-xs">
                <label class="text-caption font-bold text-ink">Table Identifier / Name</label>
                <input type="text" [(ngModel)]="newTable.name" placeholder="e.g. Table 12, VIP Lounge 1"
                  class="h-[40px] w-full rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors" />
              </div>

              <!-- Seats Count -->
              <div class="flex flex-col gap-xs">
                <label class="text-caption font-bold text-ink">Seating Capacity</label>
                <input type="number" [(ngModel)]="newTable.seats" min="1" max="30"
                  class="h-[40px] w-full rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors" />
              </div>

              <!-- Dining Section -->
              <div class="flex flex-col gap-xs">
                <label class="text-caption font-bold text-ink">Dining Section</label>
                <select [(ngModel)]="newTable.section"
                  class="h-[40px] w-full rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors cursor-pointer">
                  <option *ngFor="let s of sections()" [value]="s">{{ s }}</option>
                </select>
              </div>

              <!-- Table Shape -->
              <div class="flex flex-col gap-xs">
                <label class="text-caption font-bold text-ink">Table Shape</label>
                <select [(ngModel)]="newTable.shape"
                  class="h-[40px] w-full rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors cursor-pointer">
                  <option value="square">Square (2-4 Seats)</option>
                  <option value="circle">Round (VIP / Banquet)</option>
                  <option value="rectangle">Rectangle (Large Group)</option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-sm pt-md border-t border-hairline">
              <button (click)="closeAddModal()"
                class="flex-1 button-outline">
                Cancel
              </button>
              <button (click)="addTable()" [disabled]="isAdding() || !newTable.name"
                class="flex-1 button-dark disabled:opacity-50">
                {{ isAdding() ? 'Creating...' : 'Create Table' }}
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablesComponent implements OnInit {
  sections = computed(() => {
    const defaults = ['Main Dining Room', 'Outdoor', 'Terrace'];
    const dynamic = this.tables().map(t => t.section).filter(Boolean);
    return Array.from(new Set([...defaults, ...dynamic]));
  });
  activeSection = signal('Main Dining Room');
  statusFilter = signal<'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'>('ALL');
  tables = signal<Table[]>([]);
  showAddModal = signal(false);
  isAdding = signal(false);
  isLoading = signal(false);
  canEdit = false;

  statusFilters: { label: string; value: 'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' }[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Available Only', value: 'AVAILABLE' },
    { label: 'Occupied Only', value: 'OCCUPIED' },
    { label: 'Reserved Only', value: 'RESERVED' }
  ];

  newTable = { name: '', seats: 4, section: 'Main Dining Room', shape: 'square' };

  // Icons
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly X = X;
  readonly Users = Users;
  readonly CheckCircle2 = CheckCircle2;
  readonly Clock = Clock;
  readonly AlertCircle = AlertCircle;
  readonly Coffee = Coffee;
  readonly Sparkles = Sparkles;
  readonly RefreshCw = RefreshCw;
  readonly Layers = Layers;
  readonly Settings = Settings;
  readonly Filter = Filter;
  readonly ArrowRight = ArrowRight;

  constructor(
    private tableService: TableService,
    private wsService: WebsocketService,
    private authService: AuthService
  ) {
    this.canEdit = this.authService.hasRole(['ADMIN', 'MANAGER'] as any);
    effect(() => {
      if (this.wsService.tableUpdateEvent()) this.loadTables();
    });
  }

  ngOnInit() { this.loadTables(); }

  loadTables() {
    this.isLoading.set(true);
    this.tableService.getTables().subscribe({
      next: (data) => {
        this.tables.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  totalTablesCount = computed(() => this.tables().length);
  totalSeatsCount = computed(() => this.tables().reduce((acc, t) => acc + (t.seats || 0), 0));
  availableTablesCount = computed(() => this.tables().filter(t => t.status === TableStatus.AVAILABLE).length);
  occupiedTablesCount = computed(() => this.tables().filter(t => t.status === TableStatus.OCCUPIED).length);
  reservedTablesCount = computed(() => this.tables().filter(t => t.status === TableStatus.RESERVED).length);

  getSectionCount(section: string): number {
    return this.sectionCounts().get(section) || 0;
  }

  getPercentage(part: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  }

  displayTables = computed(() => {
    const sf = this.statusFilter();
    let list = this.tables().filter(t => t.section === this.activeSection());
    if (sf !== 'ALL') {
      list = list.filter(t => t.status === sf);
    }
    return list;
  });

  sectionCounts = computed(() => {
    const map = new Map<string, number>();
    this.sections().forEach(section => {
      map.set(section, this.tables().filter(t => t.section === section).length);
    });
    return map;
  });

  toggleTableStatus(table: Table) {
    if (!this.canEdit) return;
    let nextStatus = TableStatus.AVAILABLE;
    if (table.status === TableStatus.AVAILABLE) nextStatus = TableStatus.OCCUPIED;
    else if (table.status === TableStatus.OCCUPIED) nextStatus = TableStatus.RESERVED;
    else nextStatus = TableStatus.AVAILABLE;

    this.tableService.updateTableStatus(table.id, nextStatus).subscribe(() => this.loadTables());
  }

  quickSetStatus(table: Table, statusStr: string) {
    if (!this.canEdit) return;
    const nextStatus = statusStr as TableStatus;
    this.tableService.updateTableStatus(table.id, nextStatus).subscribe(() => this.loadTables());
  }

  deleteTable(event: Event, table: Table) {
    event.stopPropagation();
    if (table.status !== TableStatus.AVAILABLE) {
      alert('Cannot delete an occupied or reserved table. Please clear it first.');
      return;
    }
    if (confirm(`Are you sure you want to permanently delete table "${table.name}"?`)) {
      this.tableService.deleteTable(table.id).subscribe(() => this.loadTables());
    }
  }

  openAddModal() {
    this.newTable = { name: '', seats: 4, section: this.activeSection() || 'Main Dining Room', shape: 'square' };
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  addTable() {
    if (!this.newTable.name) return;
    this.isAdding.set(true);
    this.tableService.createTable({
      name: this.newTable.name.trim(),
      seats: Number(this.newTable.seats) || 4,
      section: this.newTable.section,
      shape: this.newTable.shape as TableShape
    }).subscribe({
      next: () => {
        this.isAdding.set(false);
        this.showAddModal.set(false);
        this.newTable = { name: '', seats: 4, section: 'Main Dining Room', shape: 'square' };
        this.loadTables();
      },
      error: () => {
        this.isAdding.set(false);
        alert('Failed to add dining table. Please try again.');
      }
    });
  }

  trackByTableId(_: number, table: Table): string {
    return table.id;
  }
}
