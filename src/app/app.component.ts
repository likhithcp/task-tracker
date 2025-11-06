import { Component } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Task } from './todo.service';

type Filter = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // THEME
  isDark = true;
  toggleTheme() { this.isDark = !this.isDark; }

  // TASKS
  tasks: Task[] = [];
  newTask = '';

  // UI STATE
  filter: Filter = 'all';
  editingId: number | null = null;
  editingTitle = '';

  constructor(private store: TodoService) {
    this.tasks = this.store.load();
  }

  private commit() {
    this.store.save(this.tasks);
  }

  addTask() {
    const t = this.newTask.trim();
    if (!t) return;
    const task: Task = { id: Date.now(), title: t, done: false };
    this.tasks = [task, ...this.tasks];
    this.newTask = '';
    this.commit();
  }

  toggleDone(task: Task) {
    task.done = !task.done;
    this.commit();
  }

  removeTask(i: number) {
    this.tasks.splice(i, 1);
    this.tasks = [...this.tasks];
    this.commit();
  }

  clearCompleted() {
    this.tasks = this.tasks.filter(t => !t.done);
    this.commit();
  }

  // FILTERS
  setFilter(f: Filter) { this.filter = f; }
  get filtered(): Task[] {
    if (this.filter === 'active') return this.tasks.filter(t => !t.done);
    if (this.filter === 'completed') return this.tasks.filter(t => t.done);
    return this.tasks;
  }
  get remainingCount(): number { return this.tasks.filter(t => !t.done).length; }

  // EDITING
  startEdit(task: Task) {
    this.editingId = task.id;
    this.editingTitle = task.title;
  }
  confirmEdit(task: Task) {
    const v = this.editingTitle.trim();
    if (v) task.title = v;
    this.editingId = null;
    this.editingTitle = '';
    this.commit();
  }
  cancelEdit() {
    this.editingId = null;
    this.editingTitle = '';
  }
}
