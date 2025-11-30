import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemConfig } from 'src/app/models/system.models';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-view.component.html',
  styleUrls: ['./settings-view.component.css']
})
export class SettingsViewComponent {
  @Input() config!: SystemConfig;
  @Output() onConfigChange = new EventEmitter<SystemConfig>();

  emitChange() {
    this.onConfigChange.emit(this.config);
  }
}
