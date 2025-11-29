import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from 'src/app/models/system.models';

@Component({
  selector: 'app-wallet-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet-view.component.html',
  styleUrls: ['./wallet-view.component.css']
})
export class WalletViewComponent {
  @Input() balance: number = 0;
  @Input() transactions: Transaction[] = [];
}
