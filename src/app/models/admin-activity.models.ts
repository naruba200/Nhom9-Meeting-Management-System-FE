export interface ActivityLog {
  id: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  action: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW' | 'DOWNLOAD' | 'EXPORT' | 'OTHER';
  entityType: string;
  entityId?: number;
  description: string;
  ipAddress: string;
  userAgent: string;
  statusCode: number;
  timestamp: string;
  details?: Record<string, any>;
}

export interface ActivityLogResponse {
  content: ActivityLog[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ActivityLogFilterRequest {
  page?: number;
  size?: number;
  actionType?: string;
  entityType?: string;
  userEmail?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'timestamp';
  direction?: 'ASC' | 'DESC';
}
