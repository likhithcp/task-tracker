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

  // --- YouTube background player ---
  // Prefill with the song link you provided so it's ready in the UI
  videoUrl = 'https://youtu.be/ueAnOVLvdSk?si=23Y7mJlyVoLz3TYf';
  videoId: string | null = null;
  player: any = null;
  ytApiReady: Promise<void> | null = null;
  private _ytApiResolve: (() => void) | null = null;
  isPlaying = false;

  private ensureYtApi(): Promise<void> {
    if (this.ytApiReady) return this.ytApiReady;
    this.ytApiReady = new Promise<void>((resolve) => {
      this._ytApiResolve = resolve;
      // If YT already present, resolve immediately
      if ((window as any).YT && (window as any).YT.Player) {
        resolve();
        return;
      }
      // Attach global callback used by YouTube IFrame API
      (window as any).onYouTubeIframeAPIReady = () => {
        resolve();
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(s);
    });
    return this.ytApiReady;
  }

  private extractVideoId(url: string): string | null {
    if (!url) return null;
    // common YouTube URL patterns
    const idMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?#]|$)/);
    if (idMatch && idMatch[1]) return idMatch[1];
    // youtu.be short link
    const short = url.match(/youtu\.be\/([0-9A-Za-z_-]{11})/);
    if (short && short[1]) return short[1];
    return null;
  }

  async loadVideo() {
    const id = this.extractVideoId(this.videoUrl.trim());
    if (!id) {
      alert('Could not extract YouTube video ID. Please paste a full YouTube link.');
      return;
    }
    this.videoId = id;
    await this.ensureYtApi();

    // create or load video
    if (!this.player) {
      this.player = new (window as any).YT.Player('yt-player', {
        height: '0', // hidden visually (audio-only background)
        width: '0',
        videoId: this.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: (e: any) => {
            // PLAYING=1, PAUSED=2, ENDED=0
            this.isPlaying = e.data === 1;
          }
        }
      });
    } else {
      try { this.player.loadVideoById(this.videoId); } catch (e) { /* ignore */ }
    }
  }

  play() {
    if (!this.player) return;
    try { this.player.playVideo(); } catch (e) { }
  }

  pause() {
    if (!this.player) return;
    try { this.player.pauseVideo(); } catch (e) { }
  }
}
