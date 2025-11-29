import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { LogEntry, SystemConfig, Transaction } from 'src/app/models/system.models';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.css']
})
export class DashboardViewComponent {
  @Input() temperature: number = 0;
  @Input() humidity: number = 0;
  @Input() logs: LogEntry[] = [];
  @Input() transactions: Transaction[] = [];
  @Input() isProcessing: boolean = false;
  @Input() config!: SystemConfig;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngOnChanges() {
    setTimeout(() => {
      if (this.scrollContainer) this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }, 50);
  }

  getTempColorClass() {
    if (this.temperature < this.config.tempThreshold) return 'text-green-400 border-green-500/30 bg-green-500/10 shadow-[0_0_8px_rgba(74,222,128,0.1)]';
    if (this.temperature < (this.config.tempThreshold + 2)) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-red-500 border-red-500/30 bg-red-500/10 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]';
  }

  getTempBarClass() {
    if (this.temperature < this.config.tempThreshold) return 'bg-green-500';
    if (this.temperature < (this.config.tempThreshold + 2)) return 'bg-yellow-500';
    return 'bg-red-500 animate-pulse';
  }

  getStatusText() {
    if (this.temperature < this.config.tempThreshold) return 'SAFE';
    if (this.temperature < (this.config.tempThreshold + 2)) return 'WARNING';
    return 'CRITICAL';
  }
}
