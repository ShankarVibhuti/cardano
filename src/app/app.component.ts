import { Component, OnInit, OnDestroy } from '@angular/core';

// --- Interfaces ---
interface AuditLog {
  id: string;
  timestamp: string;
  type: 'ENERGY' | 'CUSTOMS' | 'INSURANCE' | 'SYSTEM';
  decision: 'APPROVED' | 'DENIED' | 'PENDING';
  details: string;
  cost?: string;
  amount?: number; // For calculations
  txHash?: string;
  complianceChecked: boolean;
}

interface ContainerState {
  temperature: number;
  battery: number;
  shock: number; // G-Force
  location: string;
  isLocked: boolean;
  customsVerified: boolean;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

interface AgentSettings {
  tempThreshold: number;
  paymentLimit: number;
  autoApproveEnergy: boolean;
}

@Component({
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-[#0b0c15] text-slate-200 font-sans selection:bg-cyan-500 selection:text-white flex flex-col font-['Inter']">
      
      <!-- HEADER -->
      <header class="bg-[#121420] border-b border-slate-800 h-20 flex items-center justify-between px-8 shadow-xl z-50 sticky top-0 backdrop-blur-md bg-opacity-90">
        <div class="flex items-center gap-4">
          <!-- Logo -->
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center border border-slate-700 cursor-pointer" (click)="currentPage = 'dashboard'">
            <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          </div>
          <div>
            <h1 class="font-bold text-xl tracking-wide text-white leading-tight">SmartContainer<span class="text-cyan-400">.ai</span></h1>
            <div class="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase tracking-widest">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live on Cardano Preprod
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <button (click)="currentPage = 'dashboard'" 
            class="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
            [ngClass]="currentPage === 'dashboard' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'">
            Dashboard
          </button>
          <button (click)="currentPage = 'statements'" 
            class="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
            [ngClass]="currentPage === 'statements' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'">
            Statements
          </button>
          <button (click)="currentPage = 'logs'" 
            class="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
            [ngClass]="currentPage === 'logs' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'">
            Logs
          </button>
          <button (click)="currentPage = 'settings'" 
            class="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
            [ngClass]="currentPage === 'settings' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'">
            Settings
          </button>
        </nav>

        <!-- Wallet & Simulation -->
        <div class="flex items-center gap-4">
          <button (click)="toggleSimulation()" 
            class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border"
            [ngClass]="isSimulating ? 'bg-amber-500/10 border-amber-500 text-amber-400 hover:bg-amber-500/20' : 'bg-cyan-500/10 border-cyan-500 text-cyan-400 hover:bg-cyan-500/20'">
            <span class="w-2 h-2 rounded-full bg-current" [class.animate-ping]="isSimulating"></span>
            {{ isSimulating ? 'Stop Sim' : 'Start Sim' }}
          </button>

          <!-- Lace Wallet -->
          <button class="bg-[#3D3D3D] hover:bg-[#4a4a4a] text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg border border-slate-600 transition-all duration-300 flex items-center gap-2 group">
            <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF512F] to-[#DD2476] flex items-center justify-center text-[10px] font-bold">L</div>
            <span class="group-hover:text-cyan-200 transition-colors" *ngIf="!walletConnected">Connect Lace Wallet</span>
            <span class="font-mono text-cyan-400" *ngIf="walletConnected">₳ {{ walletBalance | number:'1.2-2' }}</span>
          </button>
        </div>
      </header>

      <!-- MAIN CONTENT -->
      <main class="flex-1 overflow-y-auto p-6 scroll-smooth">
        
        <!-- ======================= -->
        <!-- PAGE 1: DASHBOARD       -->
        <!-- ======================= -->
        <div *ngIf="currentPage === 'dashboard'" class="flex flex-col gap-6 animate-fadeIn">
          
          <!-- Top Row: Metrics -->
          <div class="grid grid-cols-12 gap-6 h-[500px]">
            
            <!-- COL 1: TWIN & FEED -->
            <div class="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full">
              <!-- Digital Twin Status -->
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm shadow-xl relative overflow-hidden group flex-shrink-0">
                <h2 class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Digital Twin
                </h2>
                <div class="flex flex-col gap-4">
                  <!-- Temp -->
                  <div>
                    <div class="flex justify-between mb-1">
                      <span class="text-sm text-slate-400">Temp (Limit: {{settings.tempThreshold}}°C)</span>
                      <span class="font-mono font-bold" [ngClass]="getTempColor()">{{ containerState.temperature }}°C</span>
                    </div>
                    <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full transition-all duration-1000 ease-out" 
                           [ngClass]="getTempBarColor()"
                           [style.width]="getTempPercentage() + '%'"></div>
                    </div>
                  </div>
                  <!-- Battery -->
                  <div>
                    <div class="flex justify-between mb-1">
                      <span class="text-sm text-slate-400">Battery Level</span>
                      <span class="font-mono font-bold" [ngClass]="containerState.battery < 20 ? 'text-red-400' : 'text-green-400'">{{ containerState.battery }}%</span>
                    </div>
                    <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full bg-green-500 transition-all duration-1000" 
                           [class.bg-red-500]="containerState.battery < 20"
                           [style.width]="containerState.battery + '%'"></div>
                    </div>
                  </div>
                  
                  <!-- New: Shock Sensor -->
                  <div>
                    <div class="flex justify-between mb-1">
                      <span class="text-sm text-slate-400">Shock Sensor (G)</span>
                      <span class="font-mono font-bold" [ngClass]="containerState.shock > 40 ? 'text-red-400' : 'text-blue-400'">{{ containerState.shock }}G</span>
                    </div>
                    <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500 transition-all duration-500" 
                           [class.bg-red-500]="containerState.shock > 40"
                           [style.width]="(containerState.shock / 60 * 100) + '%'"></div>
                    </div>
                  </div>

                  <!-- New: Customs Status -->
                  <div class="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                    <span class="text-xs text-slate-400">Customs Clearance</span>
                    <div class="flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full" 
                            [ngClass]="containerState.customsVerified ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-yellow-500 animate-pulse'"></span>
                      <span class="text-[10px] font-mono" [ngClass]="containerState.customsVerified ? 'text-green-400' : 'text-yellow-500'">
                        {{ containerState.customsVerified ? 'VERIFIED' : 'PENDING' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Live Feed -->
              <div class="bg-black/40 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col overflow-hidden min-h-0">
                <div class="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                  <h3 class="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    RASPBERRY PI FEED
                  </h3>
                  <span class="text-[10px] font-mono text-slate-500">ID: dev_pi_01</span>
                </div>
                <div class="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] text-green-400/80 pr-2">
                  <div *ngFor="let msg of sensorMessages" class="animate-slideIn">
                    <span class="text-slate-500">[{{ msg.time | date:'HH:mm:ss' }}]</span> {{ msg.text }}
                  </div>
                </div>
              </div>
            </div>

            <!-- COL 2: THE BRAIN -->
            <div class="col-span-12 lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl h-full">
              <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
              <div class="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <h2 class="text-cyan-400 font-mono text-sm tracking-wider flex items-center gap-2">
                  <span class="animate-spin text-lg" *ngIf="isThinking">☼</span> 
                  <span *ngIf="!isThinking">⚡</span>
                  AGENTIC REASONING
                </h2>
                <div class="text-[10px] bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded border border-cyan-900/50">MIP-003 COMPLIANT</div>
              </div>
              <div class="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm pr-2" #scrollContainer>
                <div *ngFor="let log of agentLogs" class="animate-fadeIn">
                  <div class="flex gap-3 mb-2 opacity-60">
                    <span class="text-slate-500">[{{ log.timestamp | date:'HH:mm:ss' }}]</span>
                    <span class="text-slate-300">INPUT > {{ log.details }}</span>
                  </div>
                  <div class="bg-slate-800/80 border-l-2 p-3 rounded-r-lg mb-4 shadow-lg backdrop-blur-md transition-colors"
                       [ngClass]="{
                         'border-cyan-500': log.type === 'ENERGY',
                         'border-purple-500': log.type === 'CUSTOMS',
                         'border-amber-500': log.type === 'INSURANCE'
                       }">
                    <div class="flex justify-between items-start mb-2">
                      <span class="font-bold text-xs uppercase tracking-wider" 
                            [ngClass]="{
                              'text-cyan-400': log.type === 'ENERGY',
                              'text-purple-400': log.type === 'CUSTOMS',
                              'text-amber-400': log.type === 'INSURANCE'
                            }">{{ log.type }} PROTOCOL</span>
                      <span *ngIf="log.cost" class="text-xs bg-slate-900 px-2 py-0.5 rounded text-yellow-400">Val: {{ log.cost }}</span>
                    </div>
                    <div class="text-slate-300 leading-relaxed text-xs">
                      <span class="text-purple-400">ANALYSIS:</span> Comparing against policy settings...
                      <br>
                      <span class="text-purple-400">DECISION:</span> 
                      <span [ngClass]="log.decision === 'APPROVED' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'">
                        {{ log.decision }}
                      </span>
                    </div>
                  </div>
                </div>
                <div *ngIf="isThinking" class="flex gap-2 items-center text-slate-500 animate-pulse pl-2 py-4">
                  <span class="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                  <span class="w-1.5 h-1.5 bg-cyan-500 rounded-full delay-75"></span>
                  <span class="w-1.5 h-1.5 bg-cyan-500 rounded-full delay-150"></span>
                  <span class="text-xs">Negotiating with External Actor...</span>
                </div>
              </div>
            </div>

            <!-- COL 3: LATEST SETTLEMENT -->
            <div class="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
              <div class="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-1 shadow-xl flex-1">
                <div class="bg-slate-900/80 rounded-lg p-6 h-full flex flex-col justify-center">
                  <h2 class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Last On-Chain Event</h2>
                  <div *ngIf="lastTransaction; else noTx">
                    <div class="flex items-center justify-between mb-6">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xl font-serif">₳</div>
                        <div>
                          <div class="text-white font-bold text-xl">{{ lastTransaction.cost }}</div>
                          <div class="text-xs text-slate-500">{{ lastTransaction.timestamp | date:'mediumTime' }}</div>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-xs text-green-400 font-bold uppercase bg-green-400/10 px-3 py-1 rounded-full border border-green-900">Confirmed</div>
                      </div>
                    </div>
                    <div class="space-y-3 text-xs bg-black/20 p-4 rounded-lg">
                      <div class="flex justify-between">
                        <span class="text-slate-500">Payee</span>
                        <span class="text-slate-300 font-mono">addr1...8x92</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-500">Service</span>
                        <span class="text-slate-300">{{ lastTransaction.type }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-500">Tx Hash</span>
                        <span class="text-cyan-600 font-mono cursor-pointer hover:underline truncate w-32">{{ lastTransaction.txHash }}</span>
                      </div>
                    </div>
                  </div>
                  <ng-template #noTx>
                    <div class="flex flex-col items-center justify-center text-slate-500 gap-3 opacity-50">
                      <span class="text-sm">No transactions yet...</span>
                    </div>
                  </ng-template>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Row: Process Flow Visualization (Adaptive) -->
          <div class="w-full bg-slate-900/50 border-t border-slate-800 pt-8 pb-4">
             <div class="text-center mb-8">
                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <span class="w-2 h-2 rounded-full" [ngClass]="currentScenario === 'NONE' ? 'bg-slate-600' : 'bg-green-500 animate-pulse'"></span>
                  Live Process Execution: {{ currentScenario }}
                </h3>
             </div>
             <div class="max-w-5xl mx-auto relative px-10">
                <!-- Line -->
                <div class="absolute top-1/2 left-20 right-20 h-0.5 bg-slate-800 -z-10">
                  <div class="h-full bg-cyan-500 transition-all duration-500 ease-linear" [style.width]="pipelineProgress + '%'"></div>
                </div>
                
                <div class="grid grid-cols-5 gap-8 text-center">
                   <!-- 1 Machine -->
                   <div class="relative group">
                      <div class="w-16 h-16 mx-auto rounded-full bg-slate-800 border-2 flex items-center justify-center transition-all duration-300 z-10 relative"
                           [ngClass]="activeStep >= 1 ? (activeStep===1 ? 'border-amber-500 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'border-cyan-500 text-cyan-500') : 'border-slate-700 text-slate-600'">
                         <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                      </div>
                      <div class="mt-3 text-xs font-bold text-slate-400">Machine</div>
                      <div *ngIf="activeStep === 1" class="absolute top-full left-0 right-0 mt-2 text-[10px] text-amber-400 bg-amber-900/50 px-1 rounded animate-fadeIn">{{ getMachineLabel() }}</div>
                   </div>

                   <!-- 2 AI Agent -->
                   <div class="relative group">
                      <div class="w-16 h-16 mx-auto rounded-full bg-slate-800 border-2 flex items-center justify-center transition-all duration-300 z-10 relative"
                           [ngClass]="activeStep >= 2 ? (activeStep===2 ? 'border-purple-500 scale-110 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'border-cyan-500 text-cyan-500') : 'border-slate-700 text-slate-600'">
                         <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      </div>
                      <div class="mt-3 text-xs font-bold text-slate-400">AI Agent</div>
                   </div>

                   <!-- 3 Masumi -->
                   <div class="relative group">
                      <div class="w-16 h-16 mx-auto rounded-full bg-slate-800 border-2 flex items-center justify-center transition-all duration-300 z-10 relative"
                           [ngClass]="activeStep >= 3 ? (activeStep===3 ? 'border-blue-500 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'border-cyan-500 text-cyan-500') : 'border-slate-700 text-slate-600'">
                         <span class="font-bold text-lg">M</span>
                      </div>
                      <div class="mt-3 text-xs font-bold text-slate-400">Masumi</div>
                   </div>

                   <!-- 4 Cardano -->
                   <div class="relative group">
                      <div class="w-16 h-16 mx-auto rounded-full bg-slate-800 border-2 flex items-center justify-center transition-all duration-300 z-10 relative"
                           [ngClass]="activeStep >= 4 ? (activeStep===4 ? 'border-cyan-500 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-cyan-500 text-cyan-500') : 'border-slate-700 text-slate-600'">
                         <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                      </div>
                      <div class="mt-3 text-xs font-bold text-slate-400">Blockchain</div>
                   </div>

                   <!-- 5 Action -->
                   <div class="relative group">
                      <div class="w-16 h-16 mx-auto rounded-full bg-slate-800 border-2 flex items-center justify-center transition-all duration-300 z-10 relative"
                           [ngClass]="activeStep >= 5 ? (activeStep===5 ? 'border-green-500 scale-110 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'border-green-500 text-green-500') : 'border-slate-700 text-slate-600'">
                         <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div class="mt-3 text-xs font-bold text-slate-400">Action</div>
                      <div *ngIf="activeStep === 5" class="absolute top-full left-0 right-0 mt-2 text-[10px] text-green-400 bg-green-900/50 px-1 rounded animate-fadeIn">{{ getActionLabel() }}</div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <!-- ======================= -->
        <!-- PAGE 2: SETTINGS        -->
        <!-- ======================= -->
        <div *ngIf="currentPage === 'settings'" class="max-w-2xl mx-auto animate-fadeIn mt-10">
          <div class="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <h2 class="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Agent Policy Configuration</h2>
            
            <!-- Temp Threshold -->
            <div class="mb-8">
              <label class="flex justify-between mb-2">
                <span class="text-sm font-bold text-slate-300">Critical Temperature Threshold</span>
                <span class="text-cyan-400 font-mono font-bold">{{ settings.tempThreshold }}°C</span>
              </label>
              <input type="range" min="0" max="20" step="0.5" 
                     [ngModel]="settings.tempThreshold" 
                     (ngModelChange)="updateSetting('tempThreshold', $event)"
                     class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
              <p class="text-xs text-slate-500 mt-2">Agent will trigger payment negotiation if sensor reports temp above this limit.</p>
            </div>

            <!-- Payment Limit -->
            <div class="mb-8">
              <label class="flex justify-between mb-2">
                <span class="text-sm font-bold text-slate-300">Max Auto-Payment Limit</span>
                <span class="text-cyan-400 font-mono font-bold">₳ {{ settings.paymentLimit }}</span>
              </label>
              <input type="range" min="5" max="200" step="5"
                     [ngModel]="settings.paymentLimit" 
                     (ngModelChange)="updateSetting('paymentLimit', $event)"
                     class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
              <p class="text-xs text-slate-500 mt-2">Maximum amount the agent is authorized to spend without human override.</p>
            </div>

            <div class="flex justify-end">
              <button class="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors" (click)="currentPage = 'dashboard'">
                Save & Apply to Node
              </button>
            </div>
          </div>
        </div>

        <!-- ======================= -->
        <!-- PAGE 3: STATEMENTS      -->
        <!-- ======================= -->
        <div *ngIf="currentPage === 'statements'" class="max-w-5xl mx-auto animate-fadeIn mt-10">
          <div class="bg-white text-slate-900 rounded-xl overflow-hidden shadow-2xl">
            <div class="bg-slate-50 border-b border-slate-200 p-6">
              <h2 class="text-xl font-bold text-slate-800">Financial Statements</h2>
              <p class="text-sm text-slate-500">Ledger of all autonomous micro-payments executed by Node D-902.</p>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-slate-100 text-slate-600 uppercase font-mono text-xs">
                  <tr>
                    <th class="px-6 py-3">Date</th>
                    <th class="px-6 py-3">Description</th>
                    <th class="px-6 py-3">Category</th>
                    <th class="px-6 py-3 text-right">Amount (ADA)</th>
                    <th class="px-6 py-3 text-center">Status</th>
                    <th class="px-6 py-3">TX Hash</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr *ngFor="let tx of approvedTransactions" class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 font-mono text-slate-500">{{ tx.timestamp | date:'short' }}</td>
                    <td class="px-6 py-4 font-medium text-slate-800">{{ tx.details }}</td>
                    <td class="px-6 py-4"><span class="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">{{ tx.type }}</span></td>
                    <td class="px-6 py-4 text-right font-mono font-bold text-red-600">- {{ getAmount(tx.cost) }}</td>
                    <td class="px-6 py-4 text-center">
                      <span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200">CONFIRMED</span>
                    </td>
                    <td class="px-6 py-4 font-mono text-xs text-blue-600 truncate max-w-[100px] cursor-pointer hover:underline">{{ tx.txHash }}</td>
                  </tr>
                  <!-- Empty State -->
                  <tr *ngIf="approvedTransactions.length === 0">
                    <td colspan="6" class="px-6 py-12 text-center text-slate-400 italic">No financial transactions recorded yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="bg-slate-50 p-4 text-right border-t border-slate-200">
              <span class="text-sm text-slate-600 mr-2">Total Spend:</span>
              <span class="text-lg font-bold font-mono">₳ {{ totalSpend | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- ======================= -->
        <!-- PAGE 4: LOGS            -->
        <!-- ======================= -->
        <div *ngIf="currentPage === 'logs'" class="max-w-6xl mx-auto animate-fadeIn mt-10">
          <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div class="bg-slate-950 border-b border-slate-800 p-6 flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-white flex items-center gap-2">
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  System Audit Logs
                </h2>
                <p class="text-sm text-slate-500 mt-1">Full compliance trail for EU AI Act / eIDAS 2.0 regulations.</p>
              </div>
              <button class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded text-sm font-medium transition-colors border border-slate-700">
                Export JSON
              </button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-slate-900 text-slate-500 uppercase font-mono text-xs border-b border-slate-800">
                  <tr>
                    <th class="px-6 py-4">Timestamp</th>
                    <th class="px-6 py-4">Event Type</th>
                    <th class="px-6 py-4">AI Decision</th>
                    <th class="px-6 py-4">Rationale / Context</th>
                    <th class="px-6 py-4">Regulatory Check</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800 bg-slate-900/50">
                  <tr *ngFor="let log of agentLogs.slice().reverse()" class="hover:bg-slate-800/50 transition-colors">
                    <td class="px-6 py-4 font-mono text-slate-500">{{ log.timestamp | date:'medium' }}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 rounded text-xs font-bold border"
                        [ngClass]="{
                          'border-yellow-900 text-yellow-500 bg-yellow-900/20': log.type === 'ENERGY',
                          'border-purple-900 text-purple-500 bg-purple-900/20': log.type === 'CUSTOMS',
                          'border-blue-900 text-blue-500 bg-blue-900/20': log.type === 'INSURANCE',
                          'border-slate-700 text-slate-500 bg-slate-800': log.type === 'SYSTEM'
                        }">
                        {{ log.type }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="font-bold" [ngClass]="{
                        'text-green-400': log.decision === 'APPROVED',
                        'text-red-400': log.decision === 'DENIED',
                        'text-slate-400': log.decision === 'PENDING'
                      }">{{ log.decision }}</span>
                    </td>
                    <td class="px-6 py-4 text-slate-400">{{ log.details }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2 text-green-500 text-xs font-mono" *ngIf="log.complianceChecked">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        COMPLIANT
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    
    .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .animate-slideIn { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  // Navigation State
  currentPage: 'dashboard' | 'statements' | 'logs' | 'settings' = 'dashboard';

  // Logic State
  containerState: ContainerState = {
    temperature: 4.0,
    battery: 85,
    shock: 0,
    location: 'Port of Rotterdam',
    isLocked: true,
    customsVerified: false,
    status: 'OPTIMAL'
  };

  settings: AgentSettings = {
    tempThreshold: 5.0,
    paymentLimit: 50,
    autoApproveEnergy: true
  };

  walletBalance: number = 150.00;
  walletConnected: boolean = false;
  agentLogs: AuditLog[] = [];
  sensorMessages: { time: Date, text: string }[] = [];

  isSimulating: boolean = false;
  isThinking: boolean = false;
  activeStep: number = 0;
  currentScenario = 'NONE'; // Tracks active scenario text for UI

  // Computed (converted to getters)
  get lastTransaction() {
    return this.agentLogs.slice().reverse().find(l => l.decision === 'APPROVED' && l.cost);
  }

  get approvedTransactions() {
    return this.agentLogs.filter(l => l.decision === 'APPROVED' && l.cost);
  }

  get totalSpend() {
    return this.approvedTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }

  get pipelineProgress() {
    const step = this.activeStep;
    if (step === 0) return 0;
    return (step - 1) * 25;
  }

  private intervalId: any;

  ngOnInit() {
    this.addLog({
      id: 'sys_init',
      timestamp: new Date().toISOString(),
      type: 'SYSTEM',
      decision: 'APPROVED',
      details: 'System Initialized. Masumi Node Online.',
      complianceChecked: true
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  toggleSimulation() {
    this.walletConnected = true;
    this.isSimulating = !this.isSimulating;
    if (this.isSimulating) {
      this.startScenarioLoop();
    } else {
      clearInterval(this.intervalId);
      this.isThinking = false;
      this.activeStep = 0;
      this.currentScenario = 'NONE';
    }
  }

  updateSetting<K extends keyof AgentSettings>(key: K, value: AgentSettings[K]) {
    this.settings = { ...this.settings, [key]: value };
  }

  getAmount(costStr: string | undefined): number {
    if (!costStr) return 0;
    const num = parseFloat(costStr.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  // --- THE DEMO MAGIC LOOP ---
  startScenarioLoop() {
    let tick = 0;
    let scenarioIndex = 0;

    this.intervalId = setInterval(() => {
      tick++;
      this.updateEnvironment();

      // Trigger next event every 8 seconds (approx)
      if (tick % 8 === 0) {
        // Cycle through scenarios: Energy -> Customs -> Insurance
        const scenarios = ['ENERGY', 'CUSTOMS', 'INSURANCE'];
        this.runScenario(scenarios[scenarioIndex]);
        scenarioIndex = (scenarioIndex + 1) % scenarios.length;
      }
    }, 1000);
  }

  updateEnvironment() {
    this.containerState = {
      ...this.containerState,
      temperature: +(this.containerState.temperature + (Math.random() * 0.4 - 0.2)).toFixed(1),
      battery: Math.max(0, parseFloat((this.containerState.battery - 0.05).toFixed(2))),
      shock: Math.max(0, parseFloat((this.containerState.shock * 0.9).toFixed(1))) // Decay shock
    };
  }

  // --- SCENARIO DISPATCHER ---
  runScenario(type: string) {
    if (type === 'ENERGY') this.runEnergyScenario();
    if (type === 'CUSTOMS') this.runCustomsScenario();
    if (type === 'INSURANCE') this.runInsuranceScenario();
  }

  // SCENARIO 1: ENERGY
  async runEnergyScenario() {
    this.currentScenario = 'ENERGY OPTIMIZATION';
    this.activeStep = 0;
    const threshold = this.settings.tempThreshold;
    const cost = 15;

    // 1. MACHINE
    this.activeStep = 1;
    const criticalTemp = threshold + 4.2;
    this.containerState = { ...this.containerState, temperature: criticalTemp, status: 'CRITICAL' };
    this.addSensorMsg(`⚠️ ALERT: Temp ${criticalTemp.toFixed(1)}°C > Limit ${threshold}°C`);
    await this.delay(1500);

    // 2. AI
    this.activeStep = 2;
    this.isThinking = true;
    await this.delay(1500);
    this.isThinking = false;

    // 3. MASUMI
    this.activeStep = 3;
    this.addLog({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'ENERGY',
      decision: 'APPROVED',
      details: 'Risk assessed. Buying Green Energy from Port.',
      cost: `₳ ${cost.toFixed(2)}`,
      amount: cost,
      complianceChecked: false
    });
    await this.delay(1000);

    // 4. CHAIN
    this.activeStep = 4;
    this.walletBalance -= cost;
    this.markTxConfirmed();
    await this.delay(1000);

    // 5. ACTION
    this.activeStep = 5;
    this.addSensorMsg("✅ ACTION: Cooling Engaged. Temp dropping.");
    this.containerState = { ...this.containerState, temperature: threshold - 1.0, status: 'OPTIMAL' };
    await this.delay(2000);
    this.activeStep = 0;
  }

  // SCENARIO 2: CUSTOMS
  async runCustomsScenario() {
    this.currentScenario = 'IDENTITY VERIFICATION';
    this.activeStep = 0;

    // 1. MACHINE (Geofence)
    this.activeStep = 1;
    this.containerState = { ...this.containerState, customsVerified: false };
    this.addSensorMsg("🛂 EVENT: Customs Geofence Entry.");
    await this.delay(1500);

    // 2. AI
    this.activeStep = 2;
    this.isThinking = true;
    await this.delay(1500);
    this.isThinking = false;

    // 3. MASUMI
    this.activeStep = 3;
    this.addLog({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'CUSTOMS',
      decision: 'APPROVED',
      details: 'Auth Request Valid. Broadcasting DID Credentials.',
      complianceChecked: false
    });
    await this.delay(1000);

    // 4. CHAIN (Verification)
    this.activeStep = 4;
    this.markTxConfirmed();
    await this.delay(1000);

    // 5. ACTION
    this.activeStep = 5;
    this.containerState = { ...this.containerState, customsVerified: true };
    this.addSensorMsg("✅ ACTION: Green Lane Access Granted.");
    await this.delay(2000);
    this.activeStep = 0;
  }

  // SCENARIO 3: INSURANCE
  async runInsuranceScenario() {
    this.currentScenario = 'PARAMETRIC INSURANCE';
    this.activeStep = 0;

    // 1. MACHINE (Shock)
    this.activeStep = 1;
    this.containerState = { ...this.containerState, shock: 55.4, status: 'WARNING' };
    this.addSensorMsg("💥 CRITICAL: Impact 55.4G Detected!");
    await this.delay(1500);

    // 2. AI
    this.activeStep = 2;
    this.isThinking = true;
    await this.delay(1500);
    this.isThinking = false;

    // 3. MASUMI
    this.activeStep = 3;
    this.addLog({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'INSURANCE',
      decision: 'APPROVED',
      details: 'Threshold > 40G. Triggering Smart Contract Claim.',
      cost: 'CLAIM +5000',
      complianceChecked: false
    });
    await this.delay(1000);

    // 4. CHAIN
    this.activeStep = 4;
    // Payout!
    this.walletBalance += 5000;
    this.markTxConfirmed();
    await this.delay(1000);

    // 5. ACTION
    this.activeStep = 5;
    this.addSensorMsg("💰 ACTION: Payout Received (5000 ADA).");
    this.containerState = { ...this.containerState, status: 'OPTIMAL' }; // Reset status
    await this.delay(2000);
    this.activeStep = 0;
  }

  // --- HELPERS ---
  markTxConfirmed() {
    const last = this.agentLogs[this.agentLogs.length - 1];
    this.agentLogs = [...this.agentLogs.slice(0, -1), { ...last, txHash: this.generateFakeHash(), complianceChecked: true }];
  }

  getMachineLabel() {
    if (this.currentScenario.includes('ENERGY')) return 'Heat Alert';
    if (this.currentScenario.includes('IDENTITY')) return 'Geofence';
    if (this.currentScenario.includes('INSURANCE')) return 'Shock Alert';
    return 'Sensor Data';
  }

  getActionLabel() {
    if (this.currentScenario.includes('ENERGY')) return 'Cooling Active';
    if (this.currentScenario.includes('IDENTITY')) return 'Verified';
    if (this.currentScenario.includes('INSURANCE')) return 'Payout Rcvd';
    return 'Executed';
  }

  addLog(log: AuditLog) {
    this.agentLogs = [...this.agentLogs, log];
  }

  addSensorMsg(text: string) {
    this.sensorMessages = [{ time: new Date(), text }, ...this.sensorMessages.slice(0, 9)];
  }

  generateFakeHash() {
    return 'addr1' + Math.random().toString(36).substring(2, 15) + '...';
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getTempColor() {
    const t = this.containerState.temperature;
    if (t > this.settings.tempThreshold) return 'text-red-400';
    if (t > this.settings.tempThreshold - 2) return 'text-yellow-400';
    return 'text-cyan-400';
  }

  getTempBarColor() {
    const t = this.containerState.temperature;
    if (t > this.settings.tempThreshold) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]';
    if (t > this.settings.tempThreshold - 2) return 'bg-yellow-500';
    return 'bg-cyan-500';
  }

  getTempPercentage() {
    const min = -5, max = 20;
    let val = this.containerState.temperature;
    return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
  }
}
