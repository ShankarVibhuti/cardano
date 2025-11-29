import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogEntry } from 'src/app/models/system.models';

@Component({
  selector: 'app-terminal-view',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './terminal-view.component.html',
  styleUrls: ['./terminal-view.component.css']
})
export class TerminalViewComponent {
  @Input() logs: LogEntry[] = [];
}
