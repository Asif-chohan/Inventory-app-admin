export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    plan_name: string;
    monthly_limit: number;
    channels: string[];
    created_at: string;
}

export interface UsageData {
    month: string;
    limit: number;
    used: number;
    byChannel: Record<string, number>;
    byStatus: {
        queued: number;
        sent: number;
        failed: number;
    };
}

export interface LicenseKey {
    id: string;
    keyId?: string;
    name: string;
    key_prefix?: string;
    keyPrefix?: string;
    revoked: boolean;
    last_used_at: string | null;
    created_at: string;
}

export interface Message {
    id: string;
    customer_id: string;
    channel: string;
    recipient: string;
    payload: any;
    status: string;
    error_message?: string;
    created_at: string;
}

export interface MessagesResponse {
    items: Message[];
    page: number;
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
}
