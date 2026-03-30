import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { TaskListComponent } from '../task/task-list/task-list.component';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.models';
import { ToastService } from '../../services/toast.service';

interface TaskGroup {
  meetingId: number;
  meetingTitle: string;
  tasks: Task[];
}

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, TaskListComponent],
  templateUrl: './tasks-page.component.html',
  styleUrls: ['./tasks-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksPageComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly toastService = inject(ToastService);

  readonly tasks = signal<Task[]>([]);
  readonly isLoading = signal(false);
  readonly filterStatus = signal<TaskStatus | 'ALL'>('ALL');
  readonly groupByMeeting = signal(true);

  // Computed: Group tasks by meeting
  readonly tasksByMeeting = computed<TaskGroup[]>(() => {
    const tasksArray = this.filteredTasks();
    const grouped = new Map<number, { meetingTitle: string; tasks: Task[] }>();

    for (const task of tasksArray) {
      if (!grouped.has(task.meetingId)) {
        grouped.set(task.meetingId, {
          meetingTitle: task.meetingTitle || `Meeting #${task.meetingId}`,
          tasks: []
        });
      }
      grouped.get(task.meetingId)!.tasks.push(task);
    }

    return Array.from(grouped.entries()).map(([meetingId, data]) => ({
      meetingId,
      meetingTitle: data.meetingTitle,
      tasks: data.tasks
    }));
  });

  // Computed: Filter tasks by status
  readonly filteredTasks = computed(() => {
    const status = this.filterStatus();
    if (status === 'ALL') return this.tasks();
    return this.tasks().filter(t => t.status === status);
  });

  // Task counts
  readonly todoCount = computed(() => this.tasks().filter(t => t.status === 'TODO').length);
  readonly inProgressCount = computed(() => this.tasks().filter(t => t.status === 'IN_PROGRESS').length);
  readonly completedCount = computed(() => this.tasks().filter(t => t.status === 'COMPLETED').length);

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading.set(true);
    this.taskService.loadMyTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.toastService.error('Khong the tai danh sach cong viec');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(status: TaskStatus | 'ALL') {
    this.filterStatus.set(status);
  }

  toggleGroupByMeeting() {
    this.groupByMeeting.update(v => !v);
  }

  refreshTasks() {
    this.loadTasks();
  }
}
