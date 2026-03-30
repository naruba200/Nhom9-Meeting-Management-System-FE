import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  private show(message: string, type: Toast['type'], duration: number = 5000): void {
    const id = this.nextId++;
    const toast: Toast = { id, message, type, duration };

    this.toasts.update((current) => [...current, toast]);

    setTimeout(() => this.remove(id), duration);
  }

  success(message: string, duration: number = 5000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 5000): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 5000): void {
    this.show(message, 'info', duration);
  }

  remove(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
