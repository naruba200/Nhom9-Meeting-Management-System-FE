import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminFile, AdminFilesPageResponse } from '../models/admin-file.models';

@Injectable({
  providedIn: 'root'
})
export class AdminFileManagementService {
  private apiUrl = `${environment.apiUrl}/api/admin/files`;

  constructor(private http: HttpClient) {}

  /**
   * Get all files with pagination, search, and filter
   */
  getFiles(
    page?: number,
    size?: number,
    fileName?: string,
    fileType?: string
  ): Observable<AdminFilesPageResponse> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (size) params = params.set('size', size.toString());
    if (fileName) params = params.set('fileName', fileName);
    if (fileType) params = params.set('fileType', fileType);

    return this.http.get<AdminFilesPageResponse>(this.apiUrl, { params });
  }

  /**
   * Get file by ID
   */
  getFileById(id: number): Observable<AdminFile> {
    return this.http.get<AdminFile>(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete a single file
   */
  deleteFile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete multiple files
   */
  deleteFiles(ids: number[]): Observable<void> {
    let params = new HttpParams();
    ids.forEach(id => {
      params = params.append('ids', id.toString());
    });
    return this.http.delete<void>(this.apiUrl, { params });
  }

  /**
   * Format file size to human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file icon based on file type
   */
  getFileIcon(fileType: string | null): string {
    if (!fileType) return 'fa-file';

    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fa-file-excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fa-file-powerpoint';
    if (fileType.includes('image')) return 'fa-file-image';
    if (fileType.includes('video')) return 'fa-file-video';
    if (fileType.includes('audio')) return 'fa-file-audio';
    if (fileType.includes('zip') || fileType.includes('compressed')) return 'fa-file-zipper';
    if (fileType.includes('text')) return 'fa-file-lines';

    return 'fa-file';
  }
}
