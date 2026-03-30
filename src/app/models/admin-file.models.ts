export interface AdminFile {
  id: number;
  meetingId: number;
  meetingTitle: string | null;
  fileName: string;
  fileType: string | null;
  fileSizeBytes: number;
  cloudUploadUrl: string;
  cloudPublicId: string | null;
  cloudUploadStatus: string;
  uploadedBy: string | null;
  uploadedByEmail: string | null;
}

export interface AdminFilesPageResponse {
  files: AdminFile[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}
