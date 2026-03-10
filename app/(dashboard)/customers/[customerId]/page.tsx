"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import AddCustomerModal from "@/components/ui/AddCustomerModal";
import KeyGenerationModal from "@/components/ui/KeyGenerationModal";
import ManageProvidersModal from "@/components/ui/ManageProvidersModal";
import { AlertCircle, RefreshCw, ChevronLeft } from "lucide-react";

import CustomerInfoCard from "@/components/customers/CustomerInfoCard";
import UsageStatsCard from "@/components/customers/UsageStatsCard";
import ProviderCredentialsCard from "@/components/customers/ProviderCredentialsCard";
import LicenseKeysCard from "@/components/customers/LicenseKeysCard";
import MessageHistoryCard from "@/components/customers/MessageHistoryCard";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QUERY_KEYS from "@/constants/queryKeys";
import {
    getCustomer,
    getCustomerUsage,
    getCustomerKeys,
    getCustomerProviders,
    getCustomerMessages,
    updateCustomerStatus,
    deleteCustomer,
    revokeCustomerKey
} from "@/lib/services/customers";

export default function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [msgFilter, setMsgFilter] = useState("all");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
    const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });

    // Queries
    const { data: customerData, isLoading: customerLoading, error: customerError } = useQuery({
        queryKey: [QUERY_KEYS.GET_CUSTOMER, customerId],
        queryFn: () => getCustomer(customerId),
        enabled: !!customerId
    });

    const { data: usageData, isLoading: usageLoading } = useQuery({
        queryKey: [QUERY_KEYS.GET_CUSTOMER_USAGE, customerId, selectedMonth],
        queryFn: () => getCustomerUsage(customerId, selectedMonth),
        enabled: !!customerId
    });

    const { data: keysData, isLoading: keysLoading } = useQuery({
        queryKey: [QUERY_KEYS.GET_CUSTOMER_KEYS, customerId],
        queryFn: () => getCustomerKeys(customerId),
        enabled: !!customerId
    });

    const { data: providersData, isLoading: providersLoading } = useQuery({
        queryKey: [QUERY_KEYS.GET_CUSTOMER_PROVIDERS, customerId],
        queryFn: () => getCustomerProviders(customerId),
        enabled: !!customerId
    });

    const { data: messagesDataResponse, isLoading: messagesLoading } = useQuery({
        queryKey: [QUERY_KEYS.GET_CUSTOMER_MESSAGES, customerId, msgFilter],
        queryFn: () => getCustomerMessages(customerId, { page: 1, limit: 5, channel: msgFilter === "all" ? undefined : msgFilter }),
        enabled: !!customerId
    });

    // Mutations
    const updateStatusMutation = useMutation({
        mutationFn: (newStatus: string) => updateCustomerStatus(customerId, newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CUSTOMER, customerId] });
        }
    });

    const deleteCustomerMutation = useMutation({
        mutationFn: () => deleteCustomer(customerId),
        onSuccess: () => {
            router.push("/customers");
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIST_CUSTOMERS] });
        }
    });

    const revokeKeyMutation = useMutation({
        mutationFn: (keyId: string) => revokeCustomerKey(keyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CUSTOMER_KEYS, customerId] });
        }
    });

    const customer = customerData?.data;
    const usage = usageData?.data;
    const keys = keysData?.data || [];
    const providers = providersData?.data;
    const messagesData = messagesDataResponse?.data;

    const handleMonthChange = (direction: 'prev' | 'next') => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1);
        if (direction === 'prev') {
            date.setMonth(date.getMonth() - 1);
        } else {
            date.setMonth(date.getMonth() + 1);
        }
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    };

    const handleUpdateStatus = async (newStatus: string) => {
        await updateStatusMutation.mutateAsync(newStatus);
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;
        await deleteCustomerMutation.mutateAsync();
    };

    const handleRevokeKey = async (keyId: string) => {
        if (!keyId) return;
        if (!confirm("Are you sure you want to revoke this key? This action cannot be undone.")) return;
        await revokeKeyMutation.mutateAsync(keyId);
    };


    if (customerLoading) {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
                <RefreshCw size={32} className="animate-spin" style={{ color: "var(--brand-primary)" }} />
            </div>
        );
    }

    if (customerError || !customer) {
        return (
            <div style={{ padding: "3rem", textAlign: "center", background: "var(--bg-primary)", minHeight: "100vh" }}>
                <AlertCircle size={48} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Customer Not Found</h2>
                <p style={{ color: "var(--text-dim)", marginBottom: "1.5rem" }}>{customerError ? "Could not connect to the server." : "The customer you are looking for does not exist."}</p>
                <Link href="/customers" className="btn btn-primary">
                    <ChevronLeft size={16} /> Back to Customers
                </Link>
            </div>
        );
    }

    return (
        <div>
            <AddCustomerModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CUSTOMER, customerId] });
                    setIsEditModalOpen(false);
                }}
                customerToEdit={customer}
            />

            <KeyGenerationModal
                isOpen={isKeyModalOpen}
                onClose={() => {
                    setIsKeyModalOpen(false);
                    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CUSTOMER_KEYS, customerId] });
                }}
                customerId={customerId}
                customerName={customer.name}
            />

            <ManageProvidersModal
                isOpen={isProvidersModalOpen}
                onClose={() => setIsProvidersModalOpen(false)}
                customerId={customerId}
                customerName={customer.name}
                initialData={providers || undefined}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CUSTOMER_PROVIDERS, customerId] })}
                allowedChannels={customer.channels}
            />

            <Header
                title={customer.name}
                subtitle={customer.email}
                actions={
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link href="/customers" className="btn btn-secondary btn-sm">
                            <ChevronLeft size={13} /> Back
                        </Link>
                    </div>
                }
            />

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                {/* Row 1: Basic Information & Plan */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <CustomerInfoCard
                        customer={customer}
                        onEdit={() => setIsEditModalOpen(true)}
                        onDelete={handleDelete}
                        onStatusUpdate={handleUpdateStatus}
                    />

                    <UsageStatsCard
                        usage={usage}
                        usageLoading={usageLoading}
                        selectedMonth={selectedMonth}
                        onMonthChange={handleMonthChange}
                        channels={customer.channels}
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <ProviderCredentialsCard
                            providers={providers}
                            providersLoading={providersLoading}
                            onConfigure={() => setIsProvidersModalOpen(true)}
                            channels={customer.channels}
                        />

                        <LicenseKeysCard
                            keys={keys}
                            keysLoading={keysLoading}
                            onGenerate={() => setIsKeyModalOpen(true)}
                            onRevoke={handleRevokeKey}
                            canGenerate={!!(providers?.whatsapp || providers?.sms)}
                        />
                    </div>

                    <MessageHistoryCard
                        messages={messagesData?.items || []}
                        messagesLoading={messagesLoading}
                        msgFilter={msgFilter}
                        onFilterChange={setMsgFilter}
                    />
                </div>
            </div>
        </div>
    );
}
