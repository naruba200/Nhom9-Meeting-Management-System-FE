import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CreateTaskRequest, Task, TaskResponse, TaskStatus, UpdateTaskRequest } from '../models/task.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = `${environment.apiUrl}/api/tasks`;
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  loadTasksByMeeting(meetingId: number): Observable<Task[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/meeting/${meetingId}`).pipe(
      tap((tasks) => this.tasksSubject.next(tasks))
    );
  }

  loadMyTasks(): Observable<Task[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/my-tasks`);
  }

  getTaskById(taskId: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiUrl}/${taskId}`);
  }

  createTask(meetingId: number, request: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.apiUrl}/meeting/${meetingId}`, request).pipe(
      tap((newTask) => {
        this.tasksSubject.next([newTask, ...this.tasksSubject.getValue()]);
      })
    );
  }

  updateTask(taskId: number, request: UpdateTaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiUrl}/${taskId}`, request).pipe(
      tap((updatedTask) => {
        this.tasksSubject.next(
          this.tasksSubject.getValue().map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          )
        );
      })
    );
  }

  updateTaskStatus(taskId: number, status: TaskStatus): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${taskId}/status`, null, {
      params: { status }
    }).pipe(
      tap(() => {
        const tasks = this.tasksSubject.getValue();
        const taskToUpdate = tasks.find((t) => t.id === taskId);
        if (taskToUpdate) {
          taskToUpdate.status = status;
          if (status === 'COMPLETED') {
            taskToUpdate.completedAt = new Date().toISOString();
          } else {
            taskToUpdate.completedAt = null;
          }
          this.tasksSubject.next([...tasks]);
        }
      })
    );
  }

  updateSubtaskStatus(subtaskId: number, status: TaskStatus): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/subtask/${subtaskId}/status`, null, {
      params: { status }
    });
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}`).pipe(
      tap(() => {
        this.tasksSubject.next(
          this.tasksSubject.getValue().filter((task) => task.id !== taskId)
        );
      })
    );
  }
}
