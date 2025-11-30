import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewState } from 'src/app/models/system.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() activeView: ViewState = 'DASHBOARD';
  @Output() onNavigate = new EventEmitter<ViewState>();

  navItems: { id: ViewState, icon: string }[] = [
    { id: 'DASHBOARD', icon: 'fas fa-network-wired' },
    { id: 'WALLET', icon: 'fas fa-wallet' },
    { id: 'TERMINAL', icon: 'fas fa-terminal' },
    { id: 'SETTINGS', icon: 'fas fa-cog' },
  ];
}
