export type ViewState = 'DASHBOARD' | 'WALLET' | 'TERMINAL' | 'SETTINGS';

export interface LogEntry {
    id?: number; // Optional to allow auto-generation or flexible usage
    timestamp: Date;
    source: 'SENSOR' | 'GUARDIAN_AGENT' | 'WALLET_AGENT' | 'BLOCKCHAIN' | 'SYSTEM' | 'AI_AGENT' | 'CUSTOMS' | 'ENERGY' | 'INSURANCE'; // Added missing sources
    category?: 'ENERGY' | 'CUSTOMS' | 'INSURANCE' | 'GENERAL'; // Optional
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'neutral';
    json?: any; // For audit logs
}

export interface Transaction {
    hash: string;
    amount: number;
    recipient: string;
    status: 'PENDING' | 'CONFIRMED';
    time: Date;
    purpose: string;
    type: 'PAYMENT' | 'CLAIM_PAYOUT';
}

export interface SystemConfig {
    tempThreshold?: number; // Keep existing config props if needed
    humidityThreshold?: number;
    autoPaymentLimit?: number;

    useHardwareSigner: boolean;
    autoNegotiateEnergy: boolean;
    parametricInsurance: boolean;
    network: 'Preprod' | 'Mainnet';
}