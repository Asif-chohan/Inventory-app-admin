// Mock data for the WhatsApp Admin Panel
// Exact API response shape from responce.md:
// GET /api/admin/customers → items: [{ id, name, email, phone, status, plan_name, monthly_limit, channels, created_at }]
// NO usage field on customers — usage comes from GET /api/admin/customers/:id/usage separately

export const mockCustomers = [
    {
        id: "cust_01",
        name: "Ahmed Khan",
        email: "ahmed@bakery.pk",
        phone: "+923001234567",
        plan_name: "Business",
        monthly_limit: 1000,
        channels: ["whatsapp"] as string[],
        status: "active" as const,
        created_at: "2026-03-01T08:00:00.000000+00:00",
    },
    {
        id: "cust_02",
        name: "Zara Malik",
        email: "zara@zarastore.pk",
        phone: "+923451234567",
        plan_name: "Starter",
        monthly_limit: 200,
        channels: ["whatsapp"] as string[],
        status: "active" as const,
        created_at: "2026-02-15T10:00:00.000000+00:00",
    },
    {
        id: "cust_03",
        name: "Bilal Chaudhry",
        email: "bilal@citymart.pk",
        phone: "+923211234567",
        plan_name: "Pro",
        monthly_limit: 5000,
        channels: ["whatsapp", "sms"] as string[],
        status: "active" as const,
        created_at: "2026-01-20T09:00:00.000000+00:00",
    },
    {
        id: "cust_04",
        name: "Sana Hussain",
        email: "sana@sweetshop.pk",
        phone: "+923331234567",
        plan_name: "Starter",
        monthly_limit: 200,
        channels: ["whatsapp"] as string[],
        status: "paused" as const,
        created_at: "2026-02-01T11:00:00.000000+00:00",
    },
    {
        id: "cust_05",
        name: "Omar Farooq",
        email: "omar@grocers.pk",
        phone: "+923091234567",
        plan_name: "Business",
        monthly_limit: 1000,
        channels: ["whatsapp", "sms"] as string[],
        status: "inactive" as const,
        created_at: "2026-01-10T08:00:00.000000+00:00",
    },
];

// Usage API response shape: GET /api/admin/customers/:id/usage?month=YYYY-MM
// Response: { success, data: { month, limit, used, byChannel, byStatus: { queued, sent, failed } } }
export const mockUsageData: Record<string, {
    month: string;
    limit: number;
    used: number;
    byChannel: Record<string, number>;
    byStatus: { queued: number; sent: number; failed: number };
}> = {
    cust_01: { month: "2026-03", limit: 1000, used: 450, byChannel: { whatsapp: 450 }, byStatus: { queued: 5, sent: 440, failed: 5 } },
    cust_02: { month: "2026-03", limit: 200, used: 195, byChannel: { whatsapp: 195 }, byStatus: { queued: 0, sent: 195, failed: 0 } },
    cust_03: { month: "2026-03", limit: 5000, used: 1500, byChannel: { whatsapp: 1200, sms: 300 }, byStatus: { queued: 0, sent: 1490, failed: 10 } },
    cust_04: { month: "2026-03", limit: 200, used: 45, byChannel: { whatsapp: 45 }, byStatus: { queued: 0, sent: 45, failed: 0 } },
    cust_05: { month: "2026-03", limit: 1000, used: 0, byChannel: {}, byStatus: { queued: 0, sent: 0, failed: 0 } },
};


export const mockRequests = [
    {
        id: "req_01",
        createdAt: "2026-03-04T07:00:00Z",
        status: "pending" as const,
        customerName: "Hamza Tariq",
        email: "hamza@electronics.pk",
        phone: "+923151234567",
    },
    {
        id: "req_02",
        createdAt: "2026-03-03T14:30:00Z",
        status: "pending" as const,
        customerName: "Ayesha Rahman",
        email: "ayesha@boutique.pk",
        phone: "+923261234567",
    },
    {
        id: "req_03",
        createdAt: "2026-03-02T09:00:00Z",
        status: "approved" as const,
        customerName: "Junaid Ali",
        email: "junaid@traders.pk",
        phone: "+923411234567",
        city: "Islamabad",
        country: "Pakistan",
        backendCustomerId: "cust_01",
        licenseKey: "JT-2026-XXXX-YYYY",
        planName: "Business",
        approvedAt: "2026-03-02T11:00:00Z",
    },
    {
        id: "req_04",
        createdAt: "2026-03-01T16:00:00Z",
        status: "rejected" as const,
        customerName: "Naveed Shah",
        businessName: "Naveed Store",
        email: "naveed@store.pk",
        phone: "+923501234567",
        city: "Peshawar",
        country: "Pakistan",
    },
];

export const mockMessages = [
    { id: "msg_01", customerId: "cust_01", customerName: "Ahmed Khan", channel: "whatsapp", type: "daily_sales_summary", recipient: "+923001234567", status: "sent", createdAt: "2026-03-04T09:00:00Z" },
    { id: "msg_02", customerId: "cust_02", customerName: "Zara Malik", channel: "whatsapp", type: "refund_alert", recipient: "+923451234567", status: "sent", createdAt: "2026-03-04T08:30:00Z" },
    { id: "msg_03", customerId: "cust_03", customerName: "City Mart", channel: "whatsapp", type: "high_value_alert", recipient: "+923211234567", status: "failed", createdAt: "2026-03-04T08:00:00Z" },
    { id: "msg_04", customerId: "cust_01", customerName: "Ahmed Khan", channel: "whatsapp", type: "weekly_sales_summary", recipient: "+923001234567", status: "sent", createdAt: "2026-03-03T21:00:00Z" },
    { id: "msg_05", customerId: "cust_03", customerName: "City Mart", channel: "sms", type: "daily_sales_summary", recipient: "+923211234567", status: "sent", createdAt: "2026-03-03T20:00:00Z" },
    { id: "msg_06", customerId: "cust_02", customerName: "Zara Malik", channel: "whatsapp", type: "discount_alert", recipient: "+923451234567", status: "sent", createdAt: "2026-03-03T18:00:00Z" },
    { id: "msg_07", customerId: "cust_01", customerName: "Ahmed Khan", channel: "whatsapp", type: "daily_sales_summary", recipient: "+923001234567", status: "sent", createdAt: "2026-03-03T09:00:00Z" },
    { id: "msg_08", customerId: "cust_03", customerName: "City Mart", channel: "whatsapp", type: "test_message", recipient: "+923211234567", status: "sent", createdAt: "2026-03-02T14:00:00Z" },
    { id: "msg_09", customerId: "cust_02", customerName: "Zara Malik", channel: "whatsapp", type: "daily_sales_summary", recipient: "+923451234567", status: "sent", createdAt: "2026-03-02T09:00:00Z" },
    { id: "msg_10", customerId: "cust_01", customerName: "Ahmed Khan", channel: "whatsapp", type: "high_value_alert", recipient: "+923001234567", status: "queued", createdAt: "2026-03-02T08:30:00Z" },
];

export const mockPlans = [
    {
        id: "plan_starter",
        name: "Starter",
        emoji: "🌱",
        description: "Perfect for small shops",
        priceMonthly: 500,
        priceYearly: 5000,
        monthlyLimit: 200,
        channels: ["whatsapp"],
        isActive: true,
        activeUsers: 3,
    },
    {
        id: "plan_business",
        name: "Business",
        emoji: "💼",
        description: "For medium businesses",
        priceMonthly: 1200,
        priceYearly: 12000,
        monthlyLimit: 1000,
        channels: ["whatsapp", "sms"],
        isActive: true,
        activeUsers: 8,
    },
    {
        id: "plan_pro",
        name: "Pro",
        emoji: "🚀",
        description: "High-volume operations",
        priceMonthly: 2500,
        priceYearly: 25000,
        monthlyLimit: 5000,
        channels: ["whatsapp", "sms"],
        isActive: true,
        activeUsers: 2,
    },
    {
        id: "plan_enterprise",
        name: "Enterprise",
        emoji: "🏢",
        description: "Unlimited for large businesses",
        priceMonthly: 0,
        priceYearly: 0,
        monthlyLimit: -1,
        channels: ["whatsapp", "sms"],
        isActive: true,
        activeUsers: 1,
    },
];

export const mockDailyMessages = Array.from({ length: 30 }, (_, i) => {
    const date = new Date("2026-03-04");
    date.setDate(date.getDate() - (29 - i));
    return {
        date: date.toISOString().split("T")[0],
        whatsapp: Math.floor(Math.random() * 80) + 20,
        sms: Math.floor(Math.random() * 20),
    };
});

export const mockNotifTypes = [
    { name: "Daily Summary", value: 340, color: "#25D366" },
    { name: "Weekly Summary", value: 120, color: "#3b82f6" },
    { name: "Refund Alerts", value: 85, color: "#ef4444" },
    { name: "High-Value", value: 60, color: "#f59e0b" },
    { name: "Discount", value: 40, color: "#8b5cf6" },
];
