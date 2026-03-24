import { ChangeDetectorRef, Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { AdminFileManagementService } from '../../../services/admin-file-management.service';
import { AdminFile, AdminFilesPageResponse } from '../../../models/admin-file.models';

import { AdminHeaderComponent } from '../admin-header/admin-header.component';

@Component({
  selector: 'app-admin-file-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminHeaderComponent],
  templateUrl: './admin-file-management.component.html',
  styleUrls: ['./admin-file-management.component.scss']
})
export class AdminFileManagementComponent implements OnInit, OnDestroy {
  userInfo: { email: string; fullName: string } | null = null;
  files: AdminFile[] = [];
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Search & Filter
  searchFileName = '';
  selectedFileType = '';
  fileTypes: string[] = [];

  // Modal states
  showDeleteModal = false;
  showDeleteMultipleModal = false;
  selectedFile: AdminFile | null = null;
  selectedFileIds: number[] = [];

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private fileManagementService: AdminFileManagementService,
    private cdr: ChangeDetectorRef
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadFiles();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadFiles(): void {
    this.loading = true;
    this.error = null;

    this.fileManagementService.getFiles(
      this.currentPage,
      this.pageSize,
      this.searchFileName || undefined,
      this.selectedFileType || undefined
    ).subscribe({
      next: (response: AdminFilesPageResponse) => {
        this.files = response.files;
        this.currentPage = response.page;
        this.pageSize = response.size;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;

        // Extract unique file types for filter dropdown
        const types = new Set<string>();
        this.files.forEach(file => {
          if (file.fileType) {
            const mainType = file.fileType.split('/')[0];
            types.add(file.fileType);
          }
        });
        this.fileTypes = Array.from(types);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading files:', err);
        this.error = 'Không thể tải danh sách file';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadFiles();
  }

  onFileTypeChange(): void {
    this.currentPage = 1;
    this.loadFiles();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadFiles();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadFiles();
  }

  formatFileSize(bytes: number): string {
    return this.fileManagementService.formatFileSize(bytes);
  }

  getFileIcon(fileType: string | null): string {
    return this.fileManagementService.getFileIcon(fileType);
  }

  openDeleteModal(file: AdminFile): void {
    this.selectedFile = file;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedFile = null;
  }

  openDeleteMultipleModal(): void {
    if (this.selectedFileIds.length === 0) {
      this.error = 'Vui lòng chọn ít nhất một file để xóa';
      setTimeout(() => this.error = null, 3000);
      return;
    }
    this.showDeleteMultipleModal = true;
  }

  closeDeleteMultipleModal(): void {
    this.showDeleteMultipleModal = false;
  }

  toggleSelectFile(fileId: number): void {
    const index = this.selectedFileIds.indexOf(fileId);
    if (index > -1) {
      this.selectedFileIds.splice(index, 1);
    } else {
      this.selectedFileIds.push(fileId);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedFileIds.length === this.files.length) {
      this.selectedFileIds = [];
    } else {
      this.selectedFileIds = this.files.map(f => f.id);
    }
  }

  onDeleteFile(): void {
    if (!this.selectedFile) return;

    this.fileManagementService.deleteFile(this.selectedFile.id).subscribe({
      next: () => {
        this.successMessage = `Đã xóa file "${this.selectedFile!.fileName}" thành công!`;
        this.closeDeleteModal();
        this.loadFiles();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error deleting file:', err);
        this.error = err.error?.message || 'Không thể xóa file';
      }
    });
  }

  onDeleteMultipleFiles(): void {
    if (this.selectedFileIds.length === 0) return;

    this.fileManagementService.deleteFiles(this.selectedFileIds).subscribe({
      next: () => {
        this.successMessage = `Đã xóa ${this.selectedFileIds.length} file thành công!`;
        this.closeDeleteMultipleModal();
        this.selectedFileIds = [];
        this.loadFiles();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error deleting files:', err);
        this.error = err.error?.message || 'Không thể xóa các file';
      }
    });
  }

  downloadFile(file: AdminFile): void {
    window.open(file.cloudUploadUrl, '_blank');
  }

  
}
