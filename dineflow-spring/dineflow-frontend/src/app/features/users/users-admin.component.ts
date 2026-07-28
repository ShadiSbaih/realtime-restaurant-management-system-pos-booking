import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User, Role } from '../../core/models/user.model';
import { LucideAngularModule, Users, UserCheck, Shield, Ban, Download, User as UserIcon, MoreHorizontal, Trash2, Mail, Filter, FileDown } from 'lucide-angular';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-xl w-full h-full bg-canvas">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-heading-lg font-bold tracking-tight text-ink m-0">User Management</h1>
          <p class="text-body-sm text-mute mt-xs m-0">Manage staff and customer accounts.</p>
        </div>
        <div class="flex items-center gap-sm">
          <button class="button-outline flex items-center gap-sm">
            <lucide-icon name="download" class="size-4"></lucide-icon> + Bulk Import
          </button>
          <button class="button-dark flex items-center gap-sm">
            <lucide-icon name="mail" class="size-4"></lucide-icon> BROADCAST EMAIL
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-md">
        <div class="bg-surface-bone border border-hairline rounded-md p-xl flex flex-col gap-sm shadow-sm hover:border-[#333] transition-colors">
          <p class="text-caption font-bold uppercase tracking-wider text-mute m-0">Total Users</p>
          <div class="flex items-end justify-between">
            <h3 class="text-heading-lg font-bold text-ink m-0">{{ totalUsers() }}</h3>
            <span class="text-caption-tight font-bold px-sm py-0.5 rounded-sm bg-primary/10 text-primary">+12%</span>
          </div>
        </div>
        <div class="bg-surface-bone border border-hairline rounded-md p-xl flex flex-col gap-sm shadow-sm hover:border-[#333] transition-colors">
          <p class="text-caption font-bold uppercase tracking-wider text-mute m-0">Active Staff</p>
          <div class="flex items-end justify-between">
            <h3 class="text-heading-lg font-bold text-ink m-0">{{ activeStaff() }}</h3>
            <span class="text-caption-tight font-bold px-sm py-0.5 rounded-sm bg-primary/10 text-primary">+3%</span>
          </div>
        </div>
        <div class="bg-surface-bone border border-hairline rounded-md p-xl flex flex-col gap-sm shadow-sm hover:border-[#333] transition-colors">
          <p class="text-caption font-bold uppercase tracking-wider text-mute m-0">Super Admins</p>
          <div class="flex items-end justify-between">
            <h3 class="text-heading-lg font-bold text-ink m-0">{{ adminCount() }}</h3>
            <span class="text-caption-tight font-bold px-sm py-0.5 rounded-sm bg-canvas text-mute border border-hairline">Stable</span>
          </div>
        </div>
        <div class="bg-surface-bone border border-hairline rounded-md p-xl flex flex-col gap-sm shadow-sm hover:border-[#333] transition-colors">
          <p class="text-caption font-bold uppercase tracking-wider text-mute m-0">Banned Users</p>
          <div class="flex items-end justify-between">
            <h3 class="text-heading-lg font-bold text-ink m-0">{{ bannedCount() }}</h3>
            <span class="text-caption-tight font-bold px-sm py-0.5 rounded-sm bg-[#e02424]/10 text-[#e02424]">-2%</span>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="bg-surface-bone border border-hairline rounded-md p-md flex flex-col sm:flex-row gap-md items-center shadow-sm">
        <div class="relative flex-1 w-full">
          <lucide-icon name="users" class="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-mute pointer-events-none"></lucide-icon>
          <input type="text" placeholder="Search users..."
            [(ngModel)]="searchQuery"
            class="w-full pl-[36px] h-[40px] rounded-md border border-hairline bg-canvas text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors" />
        </div>
        <!-- Role pills -->
        <div class="flex items-center gap-xs flex-wrap custom-scrollbar">
          <button *ngFor="let r of roleFilters" (click)="selectedRole = r.value"
            class="px-md py-sm rounded-md text-caption-tight font-bold uppercase tracking-wider border transition-colors cursor-pointer"
            [class.bg-ink]="selectedRole === r.value"
            [class.text-canvas]="selectedRole === r.value"
            [class.border-ink]="selectedRole === r.value"
            [class.bg-canvas]="selectedRole !== r.value"
            [class.text-mute]="selectedRole !== r.value"
            [class.border-hairline]="selectedRole !== r.value">
            {{ r.label }}
          </button>
        </div>
        <div class="flex items-center gap-sm">
          <button class="flex items-center gap-xs px-md py-sm border border-hairline rounded-md text-caption font-bold text-mute hover:text-ink hover:bg-surface-dark bg-canvas cursor-pointer transition-colors">
            <lucide-icon name="filter" class="size-3.5"></lucide-icon> Filter
          </button>
          <button class="flex items-center gap-xs px-md py-sm border border-hairline rounded-md text-caption font-bold text-mute hover:text-ink hover:bg-surface-dark bg-canvas cursor-pointer transition-colors">
            <lucide-icon name="file-down" class="size-3.5"></lucide-icon> Export
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-surface-bone rounded-md border border-hairline shadow-sm flex-1 overflow-hidden flex flex-col">
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-body-sm text-left">
            <thead class="bg-canvas border-b border-hairline">
              <tr>
                <th class="px-xl py-md text-caption font-bold text-mute uppercase tracking-wider">User</th>
                <th class="px-xl py-md text-caption font-bold text-mute uppercase tracking-wider">Role</th>
                <th class="px-xl py-md text-caption font-bold text-mute uppercase tracking-wider">Status</th>
                <th class="px-xl py-md text-caption font-bold text-mute uppercase tracking-wider">Permissions</th>
                <th class="px-xl py-md text-caption font-bold text-mute uppercase tracking-wider">Send Mail</th>
                <th class="px-xl py-md text-caption font-bold text-mute uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              <tr *ngIf="isLoading()">
                <td colspan="6" class="px-xl py-xxxl text-center text-mute text-body-sm">Loading users...</td>
              </tr>
              <tr *ngIf="!isLoading() && filteredUsers().length === 0">
                <td colspan="6" class="px-xl py-xxxl text-center text-mute text-body-sm">No users found.</td>
              </tr>
              <tr *ngFor="let user of filteredUsers()" class="hover:bg-canvas transition-colors">
                <td class="px-xl py-md">
                  <div class="flex items-center gap-md">
                    <div class="size-10 rounded-md bg-canvas flex items-center justify-center overflow-hidden shrink-0 border border-hairline">
                      <img *ngIf="user.avatar" [src]="user.avatar" class="size-full object-cover" />
                      <span *ngIf="!user.avatar" class="text-primary font-bold text-body-sm uppercase">{{ user.name.charAt(0) || 'U' }}</span>
                    </div>
                    <div>
                      <p class="font-bold text-ink m-0 text-body-sm leading-tight">{{ user.name }}</p>
                      <p class="text-caption text-mute m-0">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-xl py-md">
                  <select [ngModel]="user.role" (ngModelChange)="changeRole(user, $event)"
                    class="px-sm py-xs rounded-sm text-[10px] font-bold uppercase tracking-wider border border-hairline cursor-pointer focus:outline-none focus:border-[#333] transition-colors"
                    [ngClass]="getRoleBadge(user.role)">
                    <option *ngFor="let r of availableRoles" [value]="r" class="bg-canvas text-ink font-bold">{{ r }}</option>
                  </select>
                </td>
                <td class="px-xl py-md">
                  <span class="px-sm py-xs rounded-sm text-[10px] font-bold uppercase tracking-wider"
                    [ngClass]="{
                      'bg-primary/10 text-primary': !user.banned,
                      'bg-[#e02424]/10 text-[#e02424]': user.banned
                    }">
                    {{ user.banned ? 'Banned' : 'Active' }}
                  </span>
                </td>
                <td class="px-xl py-md text-caption text-charcoal font-medium">{{ getPermissions(user.role) }}</td>
                <td class="px-xl py-md">
                  <button class="flex items-center gap-xs border border-hairline rounded-md px-md py-sm text-caption-tight font-bold text-mute hover:text-ink hover:bg-surface-dark bg-canvas cursor-pointer transition-colors">
                    <lucide-icon name="mail" class="size-3.5"></lucide-icon> SEND EMAIL
                  </button>
                </td>
                <td class="px-xl py-md text-right">
                  <div class="flex items-center justify-end gap-xs">
                    <button (click)="toggleBan(user)" [title]="user.banned ? 'Unban' : 'Ban'"
                      class="size-8 rounded-md text-mute hover:text-[#e05d0e] hover:bg-[#e05d0e]/10 flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors">
                      <lucide-icon name="ban" class="size-3.5"></lucide-icon>
                    </button>
                    <button (click)="deleteUser(user.id)" title="Delete"
                      class="size-8 rounded-md text-mute hover:text-[#e02424] hover:bg-[#e02424]/10 flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors">
                      <lucide-icon name="trash-2" class="size-3.5"></lucide-icon>
                    </button>
                    <button class="size-8 rounded-md text-mute hover:text-ink hover:bg-surface-dark flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors">
                      <lucide-icon name="more-horizontal" class="size-3.5"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UsersAdminComponent implements OnInit {
  users = signal<User[]>([]);
  isLoading = signal(true);

  roleFilters = [
    { label: 'All', value: 'ALL' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Manager', value: 'MANAGER' },
    { label: 'Staff', value: 'STAFF' },
    { label: 'Kitchen', value: 'KITCHEN' },
    { label: 'Customer', value: 'CUSTOMER' },
  ];

  _searchQuery = signal('');
  get searchQuery() { return this._searchQuery(); }
  set searchQuery(v: string) { this._searchQuery.set(v); }

  _selectedRole = signal<string>('ALL');
  get selectedRole() { return this._selectedRole(); }
  set selectedRole(v: string) { this._selectedRole.set(v); }

  constructor(private userService: UserService) {}

  ngOnInit() { this.fetchUsers(); }

  fetchUsers() {
    this.isLoading.set(true);
    this.userService.getUsers(1, 100).subscribe({
      next: (res) => { this.users.set(res.data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  filteredUsers = computed(() => {
    let f = this.users();
    const q = this._searchQuery().toLowerCase();
    const r = this._selectedRole();
    if (q) f = f.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    if (r !== 'ALL') f = f.filter(u => u.role === r);
    return f;
  });

  totalUsers = computed(() => this.users().length);
  activeStaff = computed(() => this.users().filter(u => u.role !== Role.CUSTOMER && !u.banned).length);
  adminCount = computed(() => this.users().filter(u => u.role === Role.ADMIN).length);
  bannedCount = computed(() => this.users().filter(u => u.banned).length);

  availableRoles = [Role.ADMIN, Role.MANAGER, Role.STAFF, Role.KITCHEN, Role.CUSTOMER];

  changeRole(user: User, newRole: string) {
    if (user.role === newRole) return;
    if (confirm(`Change ${user.name}'s role to ${newRole}?`)) {
      this.userService.updateRole(user.id, newRole as Role).subscribe({
        next: () => this.fetchUsers(),
        error: () => {
          alert('Failed to update role. Ensure you have ADMIN privileges.');
          this.fetchUsers();
        }
      });
    } else {
      this.fetchUsers();
    }
  }

  toggleBan(user: User) {
    if (user.banned) {
      this.userService.unbanUser(user.id).subscribe(() => this.fetchUsers());
    } else {
      const reason = prompt('Reason for ban?', 'Admin action');
      if (reason !== null) this.userService.banUser(user.id, reason).subscribe(() => this.fetchUsers());
    }
  }

  deleteUser(id: string) {
    if (confirm('Delete this user permanently?')) {
      this.userService.deleteUser(id).subscribe(() => this.fetchUsers());
    }
  }

  getRoleBadge(role: Role): string {
    switch (role) {
      case Role.ADMIN:    return 'bg-[#7c3aed]/10 text-[#7c3aed]';
      case Role.MANAGER:  return 'bg-[#1e429f]/10 text-[#1e429f]';
      case Role.STAFF:    return 'bg-primary/10 text-primary';
      case Role.KITCHEN:  return 'bg-[#e05d0e]/10 text-[#e05d0e]';
      default:            return 'bg-canvas text-charcoal';
    }
  }
  }

  getPermissions(role: Role): string {
    switch (role) {
      case Role.ADMIN:    return 'Full Access';
      case Role.MANAGER:  return 'Manage Menu & Staff';
      case Role.KITCHEN:  return 'View Orders, KDS';
      case Role.STAFF:    return 'Create Orders';
      default:            return 'View Menu';
    }
  }
}
