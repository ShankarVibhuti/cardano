export type ViewState = 'DASHBOARD' | 'WALLET' | 'TERMINAL' | 'SETTINGS';

export interface LogEntry {
    id: number;
    timestamp: Date;
    source: 'SENSOR' | 'AI_AGENT' | 'BLOCKCHAIN' | 'SYSTEM';
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'neutral';
}

export interface Transaction {
    hash: string;
    amount: number;
    recipient: string;
    status: 'PENDING' | 'CONFIRMED';
    time: Date;
    purpose: string;
}

export interface SystemConfig {
    tempThreshold: number;
    humidityThreshold: number;
    autoPaymentLimit: number;
    network: 'Preprod' | 'Mainnet';
}