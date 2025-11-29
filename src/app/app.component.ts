import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewState, SystemConfig, LogEntry, Transaction } from './models/system.models';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { DashboardViewComponent } from './components/dashboard-view/dashboard-view.component';
import { WalletViewComponent } from './components/wallet-view/wallet-view.component';
import { TerminalViewComponent } from './components/terminal-view/terminal-view.component';
import { SettingsViewComponent } from './components/settings-view/settings-view.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  // Navigation State
  currentView: ViewState = 'DASHBOARD';

  // Business State
  temperature: number = 4.2;
  humidity: number = 65;
  walletBalance: number = 1250.00;
  isProcessing: boolean = false;

  // Persistent Data Logs
  logs: LogEntry[] = [];
  transactions: Transaction[] = [];

  // Configuration (For Settings Page)
  config: SystemConfig = {
    tempThreshold: 8.0,
    humidityThreshold: 70,
    autoPaymentLimit: 50,
    network: 'Preprod'
  };

  private intervalId: any;
  private logIdCounter = 0;

  ngOnInit() {
    this.addLog('SYSTEM', 'Platform booted. Masumi Node Connected.', 'info');
    this.addLog('SYSTEM', 'IoT Sensor Stream: ACTIVE', 'success');

    // Ambient Sensor Simulation
    this.intervalId = setInterval(() => {
      if (!this.isProcessing) {
        const noise = (Math.random() - 0.5) * 0.2;
        this.temperature = +(this.temperature + noise).toFixed(2);
        this.humidity = +(this.humidity + (Math.random() - 0.5)).toFixed(1);
      }
    }, 2000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  getViewTitle() {
    switch (this.currentView) {
      case 'DASHBOARD': return 'Live Operations Center';
      case 'WALLET': return 'DeFi Treasury & Settlement';
      case 'TERMINAL': return 'System Logs & Diagnostics';
      case 'SETTINGS': return 'System Configuration';
      default: return 'Dashboard';
    }
  }

  onNavigate(view: ViewState) {
    this.currentView = view;
  }

  updateConfig(newConfig: SystemConfig) {
    this.config = newConfig;
    this.addLog('SYSTEM', `Configuration Updated: Threshold set to ${newConfig.tempThreshold}°C`, 'warning');
  }

  // Helper for SettingsView which emits onConfigChange
  onConfigChange(newConfig: SystemConfig) {
    this.updateConfig(newConfig);
  }

  addLog(source: 'SENSOR' | 'AI_AGENT' | 'BLOCKCHAIN' | 'SYSTEM', message: string, type: 'info' | 'success' | 'warning' | 'error' | 'neutral') {
    this.logs = [
      ...this.logs,
      { id: this.logIdCounter++, timestamp: new Date(), source, message, type }
    ];
  }

  simulateCriticalEvent() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const targetTemp = 12.5;
    const threshold = this.config.tempThreshold;

    // 1. SPIKE TEMPERATURE
    let spikeInterval = setInterval(() => {
      // Stop condition for spike
      if (this.temperature >= targetTemp) {
        clearInterval(spikeInterval);
        this.evaluateSituation(this.temperature, threshold);
        return;
      }
      this.temperature = +(this.temperature + 0.8).toFixed(1);
    }, 200);
  }

  evaluateSituation(currentTemp: number, threshold: number) {
    // 2. CHECK AGAINST USER SETTINGS
    if (currentTemp > threshold) {
      // --- DANGER PATH ---
      this.addLog('SENSOR', `ALERT: ${currentTemp}°C exceeds threshold (${threshold}°C)`, 'error');

      setTimeout(() => {
        this.addLog('AI_AGENT', 'Masumi Agent woke up. Analyzing policy...', 'warning');

        setTimeout(() => {
          this.addLog('AI_AGENT', 'Policy Check: Cargo is PERISHABLE. Budget Available.', 'info');
          this.addLog('AI_AGENT', 'DECISION: EXECUTE PAYMENT', 'success');

          this.executeTransaction();
        }, 1500);
      }, 1000);

    } else {
      // --- SAFE PATH (If user raised threshold) ---
      this.addLog('SENSOR', `Spike detected (${currentTemp}°C) but within new safe limit (${threshold}°C).`, 'info');
      this.addLog('AI_AGENT', 'No action required. Monitoring continues.', 'neutral');
      this.coolDown();
    }
  }

  executeTransaction() {
    setTimeout(() => {
      const amount = 15.00;
      const txHash = '8a7d...' + Math.random().toString(16).substr(2, 8);

      const newTx: Transaction = {
        hash: txHash,
        amount: amount,
        recipient: 'addr_test...cooling_node',
        status: 'PENDING',
        time: new Date(),
        purpose: 'Emergency Cooling Trigger'
      };

      this.transactions = [newTx, ...this.transactions];
      this.addLog('BLOCKCHAIN', `Broadcasting Tx: ${txHash}`, 'info');

      setTimeout(() => {
        this.transactions = this.transactions.map(t => t.hash === txHash ? { ...t, status: 'CONFIRMED' } : t);
        this.walletBalance -= amount;
        this.addLog('BLOCKCHAIN', 'Settlement Confirmed (Block 49281)', 'success');
        this.addLog('SYSTEM', 'Cooling Activated by IoT Node.', 'success');
        this.coolDown();
      }, 2000);

    }, 1000);
  }

  coolDown() {
    let coolInterval = setInterval(() => {
      if (this.temperature <= 4.5) {
        clearInterval(coolInterval);
        this.isProcessing = false;
        this.addLog('AI_AGENT', 'Environment stabilized. Sleep mode.', 'neutral');
        this.temperature = 4.2;
        return;
      }
      this.temperature = +(this.temperature - 0.5).toFixed(1);
    }, 300);
  }
}
