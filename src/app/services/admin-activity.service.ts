import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ActivityLog, ActivityLogResponse, ActivityLogFilterRequest } from '../models/admin-activity.models';

@Injectable({
  providedIn: 'root'
})
export class AdminActivityService {
  private apiUrl = `${environment.apiUrl}/api/admin/activities`;
  private activitiesSubject = new BehaviorSubject<ActivityLog[]>([]);
  public activities$ = this.activitiesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getActivityLogs(filter: ActivityLogFilterRequest): Observable<ActivityLogResponse> {
    console.log('[AdminActivityService] Fetching activity logs with filter:', filter);
    
    let params = new HttpParams();
    
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size !== undefined) params = params.set('size', filter.size.toString());
    if (filter.actionType) params = params.set('actionType', filter.actionType);
    if (filter.entityType) params = params.set('entityType', filter.entityType);
    if (filter.userEmail) params = params.set('userEmail', filter.userEmail);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.direction) params = params.set('direction', filter.direction);

    return this.http.get<ActivityLogResponse>(this.apiUrl, { params }).pipe(
      tap((response) => {
        console.log('[AdminActivityService] Activity logs fetched successfully:', response.content.length, 'records');
        this.activitiesSubject.next(response.content);
      })
    );
  }

  getActivityLogsByUser(userId: number, filter?: Partial<ActivityLogFilterRequest>): Observable<ActivityLogResponse> {
    console.log(`[AdminActivityService] Fetching activity logs for user ${userId}`);
    
    let params = new HttpParams()
      .set('userId', userId.toString());
    
    if (filter?.page !== undefined) params = params.set('page', filter.page!.toString());
    if (filter?.size !== undefined) params = params.set('size', filter.size!.toString());
    if (filter?.startDate) params = params.set('startDate', filter.startDate);
    if (filter?.endDate) params = params.set('endDate', filter.endDate);

    return this.http.get<ActivityLogResponse>(this.apiUrl, { params }).pipe(
      tap((response) => {
        console.log('[AdminActivityService] User activity logs fetched:', response.content.length, 'records');
      })
    );
  }

  getActivityLogsByDateRange(startDate: string, endDate: string): Observable<ActivityLogResponse> {
    console.log('[AdminActivityService] Fetching activity logs for date range:', startDate, '-', endDate);
    
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('size', '500');

    return this.http.get<ActivityLogResponse>(this.apiUrl, { params }).pipe(
      tap((response) => {
        console.log('[AdminActivityService] Date range activity logs fetched:', response.content.length, 'records');
      })
    );
  }

  exportActivityLogs(filter: ActivityLogFilterRequest): Observable<Blob> {
    console.log('[AdminActivityService] Exporting activity logs');
    
    let params = new HttpParams();
    
    if (filter.actionType) params = params.set('actionType', filter.actionType);
    if (filter.entityType) params = params.set('entityType', filter.entityType);
    if (filter.userEmail) params = params.set('userEmail', filter.userEmail);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
}
