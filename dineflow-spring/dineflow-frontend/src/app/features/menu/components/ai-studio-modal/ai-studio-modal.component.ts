import { Component, Input, Output, EventEmitter, signal, effect, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Sparkles, X, Flame, SlidersHorizontal, Check, Send, RefreshCw, Trash2 } from 'lucide-angular';
import { MenuItem } from '../../../../core/models/menu.model';

@Component({
  selector: 'app-ai-studio-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Interactive AI Culinary Studio Modal -->
    <div *ngIf="isOpen" class="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-md animate-in fade-in duration-200">
      <div class="bg-canvas w-full max-w-3xl rounded-md border border-hairline shadow-md flex flex-col max-h-[92vh] overflow-hidden">
        
        <!-- Studio Header -->
        <div class="p-xl bg-surface-bone border-b border-hairline flex items-center justify-between">
          <div class="flex items-center gap-md">
            <div>
              <h3 class="font-bold text-heading-sm text-ink m-0 flex items-center gap-sm">
                {{ mode === 'NEW' ? 'Generate Concept' : 'Refine Recipe' }}
              </h3>
              <p class="text-caption text-mute m-0 mt-xs">
                {{ mode === 'NEW' ? 'Draft new menu concepts with dietary constraints.' : 'Refine existing chef recipe with real-time feedback.' }}
              </p>
            </div>
          </div>
          <button (click)="close.emit()" class="size-8 rounded-full text-mute hover:text-ink hover:bg-surface-bone flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors">
            <lucide-icon name="x" class="size-4.5"></lucide-icon>
          </button>
        </div>

        <!-- Studio Body -->
        <div class="p-xl overflow-y-auto flex-1 flex flex-col gap-xl bg-canvas">
          
          <!-- STAGE 1: INPUT & CONSTRAINTS (When not generating & no result) -->
          <div *ngIf="!isGenerating && !generatedResult" class="flex flex-col gap-xl animate-in fade-in duration-200">
            
            <div *ngIf="status?.status === 'FAILED'" class="bg-[#e02424]/10 border border-[#e02424]/20 p-md rounded-md flex items-start gap-sm">
              <lucide-icon name="x" class="size-4.5 text-[#e02424] mt-0.5 shrink-0"></lucide-icon>
              <div>
                <p class="text-caption-tight font-bold text-[#e02424] uppercase tracking-wider m-0">Generation Failed</p>
                <p class="text-body-sm text-ink m-0 mt-xs">{{ status.action }}</p>
                <p class="text-caption text-mute m-0 mt-xs" *ngIf="status.action?.includes('400') || status.action?.includes('API key')">Please verify your GEMINI_API_KEY environment variable is set and the backend is restarted.</p>
              </div>
            </div>

            <div>
              <label class="text-caption font-bold uppercase tracking-widest text-mute block mb-sm">
                Prompt
              </label>
              <textarea rows="3" [(ngModel)]="aiPrompt"
                placeholder="e.g. Create a refreshing Mediterranean seafood pasta under $24..."
                class="w-full rounded-md border border-hairline bg-surface-bone p-md text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors resize-none"></textarea>
            </div>

            <div>
              <label class="text-caption font-bold uppercase tracking-widest text-mute block mb-sm">
                Constraints
              </label>
              <div class="flex flex-wrap gap-sm">
                <button *ngFor="let pill of availableConstraints" (click)="toggleConstraint(pill)"
                  type="button"
                  class="px-md py-sm rounded-md text-caption-tight font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-xs"
                  [ngClass]="{
                    'bg-ink text-canvas border-ink shadow-sm': isConstraintSelected(pill),
                    'bg-surface-bone text-mute border-hairline hover:border-[#333] hover:text-ink': !isConstraintSelected(pill)
                  }">
                  {{ pill }}
                </button>
              </div>
            </div>
          </div>

          <!-- STAGE 2: LIVE EXECUTION STREAM (When generating) -->
          <div *ngIf="isGenerating" class="py-xxl flex flex-col items-center justify-center text-center gap-xl animate-in fade-in duration-200">
            <div class="max-w-md w-full">
              <h4 class="font-bold text-heading-sm text-ink m-0 mb-xl flex items-center justify-center gap-sm">
                <span>{{ status?.action || 'Generating Concept...' }}</span>
              </h4>
              <div class="w-full h-1.5 bg-canvas rounded-full overflow-hidden border border-hairline">
                <div class="h-full bg-ink rounded-full transition-all duration-500 shadow-sm" [style.width]="(status?.progress || 25) + '%'"></div>
              </div>
              <div class="flex justify-between items-center text-caption-tight font-bold text-mute mt-sm uppercase tracking-wider">
                <span>Status: {{ status?.status || 'IN_PROGRESS' }}</span>
                <span>{{ status?.progress || 25 }}%</span>
              </div>
            </div>
          </div>

          <!-- STAGE 3: INTERACTIVE REVIEW & REAL-TIME REFINEMENT (When completed) -->
          <div *ngIf="!isGenerating && generatedResult" class="flex flex-col gap-xl animate-in fade-in duration-300">
            
            <!-- Result Banner -->
            <div class="bg-surface-bone border border-hairline rounded-md p-xl shadow-sm relative overflow-hidden">
              <div class="flex items-start justify-between gap-md border-b border-hairline pb-md mb-md">
                <div>
                  <h3 class="font-bold text-heading-md text-ink m-0">{{ generatedResult.name }}</h3>
                  <p class="text-caption font-bold text-mute m-0 mt-xs">Category: {{ generatedResult.category?.name || 'Main Course' }}</p>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-caption-tight font-bold text-mute block uppercase">Recommended Price</span>
                  <span class="font-bold text-heading-lg text-ink">\${{ generatedResult.price | number:'1.2-2' }}</span>
                </div>
              </div>

              <div class="text-caption font-medium text-ink whitespace-pre-wrap font-mono bg-canvas p-md rounded-md border border-hairline max-h-56 overflow-y-auto leading-relaxed">
                {{ generatedResult.recipe || generatedResult.aiSuggestion || 'No detailed recipe notes provided.' }}
              </div>
            </div>

            <!-- Real-Time Feedback Refinement Bar -->
            <div class="bg-surface-bone border border-hairline rounded-md p-xl flex flex-col gap-md">
              <label class="text-caption-tight font-bold uppercase tracking-widest text-ink flex items-center justify-between">
                <span>Refinement</span>
              </label>
              
              <!-- Quick Feedback Modifiers -->
              <div class="flex flex-wrap gap-sm">
                <button type="button" (click)="setQuickRefinement('Reduce recommended price by 15%.')"
                  class="px-sm py-xs rounded-md text-caption-tight font-bold bg-canvas hover:bg-ink hover:text-canvas text-charcoal border border-hairline transition-colors cursor-pointer">
                  Reduce Price
                </button>
                <button type="button" (click)="setQuickRefinement('Increase spice level.')"
                  class="px-sm py-xs rounded-md text-caption-tight font-bold bg-canvas hover:bg-ink hover:text-canvas text-charcoal border border-hairline transition-colors cursor-pointer">
                  Make Spicier
                </button>
                <button type="button" (click)="setQuickRefinement('Convert to plant-based.')"
                  class="px-sm py-xs rounded-md text-caption-tight font-bold bg-canvas hover:bg-ink hover:text-canvas text-charcoal border border-hairline transition-colors cursor-pointer">
                  Make Plant-Based
                </button>
                <button type="button" (click)="setQuickRefinement('Elevate plating instructions.')"
                  class="px-sm py-xs rounded-md text-caption-tight font-bold bg-canvas hover:bg-ink hover:text-canvas text-charcoal border border-hairline transition-colors cursor-pointer">
                  Elevate Plating
                </button>
              </div>

              <div class="flex gap-sm mt-xs">
                <input type="text" [(ngModel)]="aiRefinementInput"
                  placeholder="Type instructions to refine dish..."
                  class="flex-1 h-[40px] rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors" />
                <button type="button" (click)="onRefine()" [disabled]="!aiRefinementInput || isGenerating"
                  class="button-dark h-[40px] px-md disabled:opacity-50 flex items-center gap-xs shrink-0">
                  Refine
                </button>
              </div>
            </div>

          </div>

        </div>

        <!-- Studio Footer -->
        <div class="p-xl bg-surface-bone border-t border-hairline flex justify-end items-center gap-md">
          <button *ngIf="!generatedResult" (click)="close.emit()"
            class="button-outline">
            Cancel
          </button>
          <button *ngIf="generatedResult" (click)="onDiscard()"
            class="px-md py-sm border border-[#e02424]/30 text-[#e02424] hover:bg-[#e02424]/10 rounded-md text-body-sm font-bold bg-transparent cursor-pointer transition-colors flex items-center gap-xs">
            Discard Draft
          </button>

          <button *ngIf="!generatedResult && !isGenerating" (click)="onGenerate()"
            class="button-dark">
            Generate Concept
          </button>
          <button *ngIf="generatedResult && !isGenerating" (click)="onApprove()"
            class="button-dark">
            Approve & Publish
          </button>
        </div>

      </div>
    </div>
  `
})
export class AiStudioModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() mode: 'NEW' | 'REFINE' = 'NEW';
  @Input() isGenerating = false;
  @Input() status: any = null;
  @Input() generatedResult: MenuItem | null = null;
  @Input() initialPrompt = '';

  @Output() close = new EventEmitter<void>();
  @Output() generate = new EventEmitter<{prompt: string, constraints: string}>();
  @Output() refine = new EventEmitter<{itemId: string, feedback: string}>();
  @Output() approve = new EventEmitter<MenuItem>();
  @Output() discard = new EventEmitter<MenuItem>();

  aiPrompt = '';
  aiConstraints: string[] = [];
  aiRefinementInput = '';
  availableConstraints = ['Plant-Based / Vegan', 'Gluten-Free', 'High Profit Margin', 'Chef Signature Spicy', '15-Min Prep Time', 'Wine Pairing Recommended'];

  readonly Sparkles = Sparkles;
  readonly X = X;
  readonly Flame = Flame;
  readonly SlidersHorizontal = SlidersHorizontal;
  readonly Check = Check;
  readonly Send = Send;
  readonly RefreshCw = RefreshCw;
  readonly Trash2 = Trash2;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.aiPrompt = this.initialPrompt;
      this.aiConstraints = [];
      this.aiRefinementInput = '';
    }
  }

  toggleConstraint(pill: string) {
    if (this.aiConstraints.includes(pill)) {
      this.aiConstraints = this.aiConstraints.filter(c => c !== pill);
    } else {
      this.aiConstraints = [...this.aiConstraints, pill];
    }
  }

  isConstraintSelected(pill: string): boolean {
    return this.aiConstraints.includes(pill);
  }

  setQuickRefinement(text: string) {
    this.aiRefinementInput = text;
  }

  onGenerate() {
    this.generate.emit({
      prompt: this.aiPrompt,
      constraints: this.aiConstraints.join(', ')
    });
  }

  onRefine() {
    if (this.generatedResult) {
      this.refine.emit({
        itemId: this.generatedResult.id,
        feedback: this.aiRefinementInput
      });
      this.aiRefinementInput = '';
    }
  }

  onApprove() {
    if (this.generatedResult) {
      this.approve.emit(this.generatedResult);
    }
  }

  onDiscard() {
    if (this.generatedResult) {
      this.discard.emit(this.generatedResult);
    }
  }
}
