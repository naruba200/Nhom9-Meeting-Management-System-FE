import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../../services/task.service';
import { Task, TaskStatus, CreateTaskRequest, UpdateTaskRequest } from '../../../models/task.models';
import { Participant } from '../../../models/meeting.models';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Inputs - meetingId is now optional, externalTasks for page mode
  readonly meetingId = input<number | null>(null);
  readonly externalTasks = input<Task[] | null>(null);
  readonly showMeetingInfo = input<boolean>(false);
  readonly participants = input<Participant[]>([]);

  readonly tasks = signal<Task[]>([]);
  readonly isLoading = signal(false);
  readonly showModal = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly deleteConfirmText = signal('');
  readonly deleteConfirmError = signal('');
  readonly editingTaskId = signal<number | null>(null);
  readonly selectedDeleteTaskId = signal<number | null>(null);
  readonly currentUserEmail = signal('');

  readonly taskForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(2000)]],
    assigneeEmail: ['', [Validators.required]],
    subtaskTitles: [[] as string[]]
  });

  readonly todoTasks = computed(() => this.tasks().filter(t => t.status === 'TODO'));
  readonly inProgressTasks = computed(() => this.tasks().filter(t => t.status === 'IN_PROGRESS'));
  readonly completedTasks = computed(() => this.tasks().filter(t => t.status === 'COMPLETED'));

  readonly acceptedParticipants = computed(() => this.participants().filter(p => p.status === 'accepted'));

  constructor() {
    this.currentUserEmail.set(this.authService.getUserInfo()?.email || '');
  }

  ngOnInit() {
    const external = this.externalTasks();
    if (external !== null) {
      // Use externally provided tasks (page mode)
      this.tasks.set(external);
    } else if (this.meetingId() !== null) {
      // Load tasks for specific meeting
      this.loadTasks();
    }
  }

  // Called when externalTasks input changes (for page mode refresh)
  refreshWithTasks(newTasks: Task[]) {
    this.tasks.set(newTasks);
  }

  private loadTasks() {
    const meetingId = this.meetingId();
    if (meetingId === null) return;

    this.isLoading.set(true);
    this.taskService.loadTasksByMeeting(meetingId).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.toastService.error('Failed to load tasks');
        this.isLoading.set(false);
      }
    });
  }

  openCreateTaskModal() {
    this.editingTaskId.set(null);
    this.taskForm.reset({ subtaskTitles: [] });
    this.showModal.set(true);
  }

  openEditTaskModal(task: Task) {
    this.editingTaskId.set(task.id || null);
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      assigneeEmail: task.assigneeEmail,
      subtaskTitles: task.subtasks.map(s => s.title)
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.taskForm.reset({ subtaskTitles: [] });
  }

  submitTask() {
    if (this.taskForm.invalid) {
      return;
    }

    const formValue = this.taskForm.value;
    const isEditMode = this.editingTaskId();

    if (isEditMode) {
      const updateRequest: UpdateTaskRequest = formValue;
      this.taskService.updateTask(isEditMode, updateRequest).subscribe({
        next: () => {
          this.toastService.success('Task updated successfully');
          this.closeModal();
          this.loadTasks();
        },
        error: (error) => {
          this.toastService.error('Failed to update task');
          console.error(error);
        }
      });
    } else {
      const meetingId = this.meetingId();
      if (meetingId === null) {
        this.toastService.error('Cannot create task without a meeting');
        return;
      }
      const createRequest: CreateTaskRequest = formValue;
      this.taskService.createTask(meetingId, createRequest).subscribe({
        next: () => {
          this.toastService.success('Task created successfully');
          this.closeModal();
          this.loadTasks();
        },
        error: (error) => {
          this.toastService.error('Failed to create task');
          console.error(error);
        }
      });
    }
  }

  openDeleteConfirm(task: Task) {
    this.selectedDeleteTaskId.set(task.id || null);
    this.deleteConfirmText.set('');
    this.deleteConfirmError.set('');
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.deleteConfirmText.set('');
    this.deleteConfirmError.set('');
    this.selectedDeleteTaskId.set(null);
  }

  confirmDelete() {
    if (this.deleteConfirmText().toLowerCase() !== 'delete') {
      this.deleteConfirmError.set('Please type "delete" to confirm');
      return;
    }

    const taskId = this.selectedDeleteTaskId();
    if (!taskId) return;

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.toastService.success('Task deleted successfully');
        this.closeDeleteConfirm();
        this.loadTasks();
      },
      error: (error) => {
        this.toastService.error('Failed to delete task');
        console.error(error);
      }
    });
  }

  updateTaskStatus(task: Task, newStatus: TaskStatus) {
    this.taskService.updateTaskStatus(task.id!, newStatus).subscribe({
      next: () => {
        this.toastService.success('Task status updated');
        this.loadTasks();
      },
      error: (error) => {
        this.toastService.error('Failed to update task status');
        console.error(error);
      }
    });
  }

  updateSubtaskStatus(taskId: number, subtaskIndex: number, newStatus: TaskStatus) {
    const task = this.tasks().find(t => t.id === taskId);
    if (!task || !task.subtasks[subtaskIndex]) return;

    const subtaskId = task.subtasks[subtaskIndex].id;
    if (!subtaskId) return;

    this.taskService.updateSubtaskStatus(subtaskId, newStatus).subscribe({
      next: () => {
        this.toastService.success('Subtask status updated');
        this.loadTasks();
      },
      error: (error) => {
        this.toastService.error('Failed to update subtask status');
        console.error(error);
      }
    });
  }

  canCreateTask(): boolean {
    // Can only create task when viewing a specific meeting (not in page mode)
    return !!this.currentUserEmail() && this.meetingId() !== null && this.externalTasks() === null;
  }

  canManageTasks(task: Task): boolean {
    const userEmail = this.currentUserEmail();
    return task.createdByEmail === userEmail;
  }

  canUpdateStatus(task: Task): boolean {
    const userEmail = this.currentUserEmail();
    return task.createdByEmail === userEmail || task.assigneeEmail === userEmail;
  }

  addSubtaskField() {
    const subtasks = this.taskForm.get('subtaskTitles')?.value || [];
    this.taskForm.patchValue({ subtaskTitles: [...subtasks, ''] });
  }

  getSubtaskTitle(index: number): string {
    const subtasks = this.taskForm.get('subtaskTitles')?.value || [];
    return subtasks[index] ?? '';
  }

  updateSubtaskTitle(index: number, value: string) {
    const subtasks = [...(this.taskForm.get('subtaskTitles')?.value || [])];
    subtasks[index] = value;
    this.taskForm.patchValue({ subtaskTitles: subtasks });
  }

  removeSubtaskField(index: number) {
    const subtasks = this.taskForm.get('subtaskTitles')?.value || [];
    subtasks.splice(index, 1);
    this.taskForm.patchValue({ subtaskTitles: [...subtasks] });
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case 'TODO':
        return '#EF4444';
      case 'IN_PROGRESS':
        return '#F59E0B';
      case 'COMPLETED':
        return '#10B981';
      default:
        return '#6B7280';
    }
  }

  getStatusText(status: TaskStatus): string {
    switch (status) {
      case 'TODO':
        return 'Chưa làm';
      case 'IN_PROGRESS':
        return 'Đang làm';
      case 'COMPLETED':
        return 'Hoàn thành';
      default:
        return status;
    }
  }
}
