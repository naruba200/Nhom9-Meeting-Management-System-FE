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

      <!-- Page Numbers -->
      <ng-container *ngFor="let page of visiblePages">
        <button
          *ngIf="page !== 'ellipsis'"
          (click)="onPageChange(+page)"
          [class]="'px-4 py-2 text-sm font-medium rounded-lg border transition-colors ' +
                   (currentPage === +page 
                     ? 'bg-indigo-600 border-indigo-600 text-white' 
                     : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')"
        >
          {{ page }}
        </button>
        <span
          *ngIf="page === 'ellipsis'"
          class="px-2 text-gray-500"
        >
          ...
        </span>
      </ng-container>

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

  get visiblePages(): (string | number)[] {
    const pages: (string | number)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      // Nếu tổng số trang <= 7, hiển thị tất cả
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu và trang cuối
      pages.push(1);

      if (current <= 4) {
        // Khi ở gần đầu
        pages.push(2, 3, 4, 5, 'ellipsis', total);
      } else if (current >= total - 3) {
        // Khi ở gần cuối
        pages.push('ellipsis', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        // Khi ở giữa
        pages.push('ellipsis', current - 1, current, current + 1, 'ellipsis', total);
      }
    }

    return pages;
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
