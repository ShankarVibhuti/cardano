import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnChanges } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, JsonPipe],
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.css']
})
export class DashboardViewComponent implements OnChanges {
  @Input() battery: number = 100;
  @Input() gForce: number = 1;
  @Input() customsCleared: boolean = false;
  @Input() isProcessing: boolean = false;
  @Input() processingStep: string = '';
  @Input() processingStage: number = 0;
  @Input() auditLogs: any[] = [];

  @Output() triggerEvent = new EventEmitter<string>();

  @ViewChild('logContainer') private logContainer!: ElementRef;

  ngOnChanges() {
    setTimeout(() => {
      if (this.logContainer) this.logContainer.nativeElement.scrollTop = this.logContainer.nativeElement.scrollHeight;
    }, 50);
  }
}
