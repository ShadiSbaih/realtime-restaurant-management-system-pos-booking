import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableService } from '../../core/services/table.service';
import { Table, TableStatus, TableShape } from '../../core/models/table.model';
import { WebsocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/auth/auth.service';
import { LucideAngularModule, Plus, Trash2, X } from 'lucide-angular';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col h-full gap-0">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-black tracking-tight text-foreground m-0">Floor Plan Management</h1>
        <button *ngIf="canEdit" (click)="showAddModal.set(true)"
          class="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-bold text-sm transition-colors border-none cursor-pointer shadow-md">
          <lucide-icon name="plus" [size]="16"></lucide-icon>
          Add New Table
        </button>
      </div>

      <!-- Section Tabs -->
      <div class="grid grid-cols-3 border border-border rounded-xl overflow-hidden mb-6 bg-card shadow-sm p-1 gap-1">
        <button *ngFor="let tab of sections"
          (click)="activeSection.set(tab)"
          class="py-3 rounded-lg font-bold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-2"
          [ngClass]="activeSection() === tab ? 'bg-primary text-primary-foreground shadow font-black' : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'">
          <span>{{ tab }}</span>
          <span class="px-2 py-0.5 rounded-full text-xs"
            [ngClass]="activeSection() === tab ? 'bg-white/20' : 'bg-muted/80'">
            {{ getSectionCount(tab) }}
          </span>
        </button>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-6 mb-8 px-1">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <div class="size-3 rounded-full bg-primary"></div> Available
        </div>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <div class="size-3 rounded-full bg-orange-500"></div> Occupied
        </div>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <div class="size-3 rounded-full bg-blue-500"></div> Reserved
        </div>
      </div>

      <!-- Table Grid -->
      <div class="flex-1 overflow-auto">
        <div *ngIf="displayTables().length === 0" class="flex items-center justify-center h-48 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
          No tables in this section.
        </div>
        <div class="flex flex-wrap gap-10 px-4 py-2">
          <div *ngFor="let table of displayTables()"
            class="relative group cursor-pointer flex flex-col items-center gap-2"
            (click)="toggleTableStatus(table)">

            <!-- Delete btn -->
            <button *ngIf="canEdit"
              (click)="deleteTable($event, table)"
              class="absolute -top-3 -right-3 hidden group-hover:flex items-center justify-center size-6 rounded-full bg-destructive text-destructive-foreground shadow-md z-10 border-none cursor-pointer hover:bg-destructive/80 transition-colors">
              <lucide-icon name="trash-2" [size]="11"></lucide-icon>
            </button>

            <!-- Table shape -->
            <div class="flex items-center justify-center font-black text-sm border-2 transition-all duration-200 select-none"
              [ngClass]="{
                'rounded-full size-20': table.shape === 'circle',
                'rounded-xl size-20': table.shape === 'square',
                'rounded-xl w-28 h-20': table.shape === 'rectangle',
                'bg-primary/30 border-primary/60 text-foreground': table.status === 'AVAILABLE',
                'bg-orange-500/30 border-orange-500/60 text-foreground': table.status === 'OCCUPIED',
                'bg-blue-500/30 border-blue-500/60 text-foreground': table.status === 'RESERVED'
              }">
              <div class="text-center">
                <div *ngIf="table.shape === 'circle'" class="text-xs font-black text-primary mb-0.5">VIP</div>
                <div class="font-black text-sm">{{ table.name }}</div>
              </div>
            </div>

            <span class="text-xs text-muted-foreground font-medium">{{ table.name }}</span>
          </div>
        </div>
      </div>

      <!-- Add Table Modal -->
      <div *ngIf="showAddModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card w-full max-w-md rounded-xl border border-border shadow-xl">
          <div class="p-5 border-b border-border flex items-center justify-between">
            <h3 class="font-black text-foreground m-0">Add New Table</h3>
            <button (click)="showAddModal.set(false)" class="text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="p-5 flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-foreground">Table Name</label>
              <input type="text" [(ngModel)]="newTable.name" placeholder="e.g. T1, VIP 100"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-foreground">Seats</label>
              <input type="number" [(ngModel)]="newTable.seats" min="1" max="20"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-foreground">Section</label>
              <select [(ngModel)]="newTable.section"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option *ngFor="let s of sections" [value]="s">{{ s }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-foreground">Shape</label>
              <select [(ngModel)]="newTable.shape"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="square">Square</option>
                <option value="circle">Circle (VIP)</option>
                <option value="rectangle">Rectangle</option>
              </select>
            </div>
            <div class="flex gap-3 pt-2">
              <button (click)="showAddModal.set(false)"
                class="flex-1 py-2.5 rounded-md border border-border text-sm font-bold text-foreground hover:bg-muted transition-colors bg-transparent cursor-pointer">
                Cancel
              </button>
              <button (click)="addTable()" [disabled]="isAdding() || !newTable.name"
                class="flex-1 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors border-none cursor-pointer disabled:opacity-50">
                {{ isAdding() ? 'Adding...' : 'Add Table' }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class TablesComponent implements OnInit {
  sections = ['Main Dining Room', 'Outdoor', 'Terrace'];
  activeSection = signal('Main Dining Room');
  tables = signal<Table[]>([]);
  showAddModal = signal(false);
  isAdding = signal(false);
  canEdit = false;

  newTable = { name: '', seats: 4, section: 'Main Dining Room', shape: 'square' };

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
    this.tableService.getTables().subscribe(data => this.tables.set(data));
  }

  getSectionCount(section: string): number {
    return this.tables().filter(t => t.section === section).length;
  }

  displayTables(): Table[] {
    return this.tables().filter(t => t.section === this.activeSection());
  }

  toggleTableStatus(table: Table) {
    if (!this.canEdit) return;
    const newStatus = table.status === TableStatus.AVAILABLE ? TableStatus.OCCUPIED : TableStatus.AVAILABLE;
    this.tableService.updateTableStatus(table.id, newStatus).subscribe(() => this.loadTables());
  }

  deleteTable(event: Event, table: Table) {
    event.stopPropagation();
    if (table.status !== TableStatus.AVAILABLE) {
      alert('Cannot delete an occupied or reserved table.');
      return;
    }
    if (confirm(`Delete table ${table.name}?`)) {
      this.tableService.deleteTable(table.id).subscribe(() => this.loadTables());
    }
  }

  addTable() {
    if (!this.newTable.name) return;
    this.isAdding.set(true);
    this.tableService.createTable({
      name: this.newTable.name,
      seats: this.newTable.seats,
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
        alert('Failed to add table.');
      }
    });
  }
}
