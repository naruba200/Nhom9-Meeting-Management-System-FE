import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
      <!-- Previous Button -->
      <button
        (click)="onPageChange(currentPage - 1)"
        [disabled]="currentPage === 1"
        class="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Trước
      </button>

      <!-- First Page -->
      <button
        (click)="onPageChange(1)"
        [class]="'px-4 py-2 text-sm font-medium rounded-lg border transition-colors ' +
                 (currentPage === 1
                   ? 'bg-indigo-600 border-indigo-600 text-white'
                   : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')"
      >
        1
      </button>

      <!-- Ellipsis (hidden if current page is 1 or 2) -->
      <span
        *ngIf="currentPage > 2"
        class="px-2 text-gray-500"
      >
        ...
      </span>

      <!-- Current Page Input -->
      <div *ngIf="currentPage > 1 && currentPage < totalPages" class="flex items-center">
        <input
          type="number"
          [ngModel]="currentPage"
          (ngModelChange)="onInputPageChange($event)"
          (blur)="onInputBlur()"
          min="1"
          [max]="totalPages"
          class="w-16 px-3 py-2 text-sm font-medium text-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span class="ml-2 text-sm text-gray-600">/ {{ totalPages }}</span>
      </div>

      <!-- Ellipsis (hidden if current page is last or second to last) -->
      <span
        *ngIf="currentPage < totalPages - 1"
        class="px-2 text-gray-500"
      >
        ...
      </span>

      <!-- Last Page -->
      <button
        (click)="onPageChange(totalPages)"
        [class]="'px-4 py-2 text-sm font-medium rounded-lg border transition-colors ' +
                 (currentPage === totalPages
                   ? 'bg-indigo-600 border-indigo-600 text-white'
                   : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')"
      >
        {{ totalPages }}
      </button>

      <!-- Next Button -->
      <button
        (click)="onPageChange(currentPage + 1)"
        [disabled]="currentPage === totalPages"
        class="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Sau
      </button>
    </div>

    <!-- Page Size Selector -->
    <div class="flex items-center justify-center gap-2 mt-4">
      <label class="text-sm text-gray-600">Hiển thị:</label>
      <select
        [(ngModel)]="pageSizeInternal"
        (ngModelChange)="onPageSizeChange()"
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none cursor-pointer"
      >
        <option [ngValue]="5">5</option>
        <option [ngValue]="10">10</option>
        <option [ngValue]="20">20</option>
        <option [ngValue]="50">50</option>
      </select>
      <span class="text-sm text-gray-600">mỗi trang</span>
    </div>
  `,
  styles: []
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pageSizeInternal = 10;
  inputPageValue: number | null = null;

  ngOnInit(): void {
    this.pageSizeInternal = this.pageSize;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageSize'] && !changes['pageSize'].firstChange) {
      this.pageSizeInternal = this.pageSize;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  onInputPageChange(value: number): void {
    this.inputPageValue = value;
  }

  onInputBlur(): void {
    if (this.inputPageValue !== null) {
      let newPage = Math.floor(this.inputPageValue);
      if (newPage < 1) newPage = 1;
      if (newPage > this.totalPages) newPage = this.totalPages;
      this.onPageChange(newPage);
      this.inputPageValue = null;
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(): void {
    this.pageSizeChange.emit(this.pageSizeInternal);
    this.pageChange.emit(1); // Reset về trang 1 khi đổi page size
  }
}
