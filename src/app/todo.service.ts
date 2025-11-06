import { Injectable } from '@angular/core';

export interface Task {
  id: number;
  title: string;
  done: boolean;
}

const KEY = 'todo.tasks.v1';

@Injectable({ providedIn: 'root' })
export class TodoService {
  load(): Task[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) as Task[] : [];
    } catch {
      return [];
    }
  }
  save(tasks: Task[]) {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  }
}
