"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import AddCustomerModal from "@/components/ui/AddCustomerModal";
import {
    Search, RefreshCw, Plus
} from "lucide-react";
import KeyGenerationModal from "@/components/ui/KeyGenerationModal";
import Table from "@/components/ui/Table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QUERY_KEYS from "@/constants/queryKeys";
import { listCustomers, deleteCustomer } from "@/lib/services/customers";

type StatusFilter = "all" | "active" | "inactive" | "paused";
type PlanFilter = "all" | "Starter" | "Business" | "Pro" | "Enterprise";

import { getCustomerColumns } from "@/constants/tableColumns";

export default function CustomersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customerToEdit, setCustomerToEdit] = useState<any>(null);
    const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.LIST_CUSTOMERS, page],
        queryFn: () => listCustomers({ page, limit: 10 }),
    });

    const customersData = data?.data || { items: [], total: 0, current: 1, hasNext: false, hasPrev: false };
    const customers = customersData.items || [];
    const pagination = {
        current: customersData.current,
        total: customersData.total,
        hasNext: customersData.hasNext,
        hasPrev: customersData.hasPrev
    };

    const deleteCustomerMutation = useMutation({
        mutationFn: (id: string) => deleteCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIST_CUSTOMERS] });
        }
    });

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this customer?")) return;
        await deleteCustomerMutation.mutateAsync(id);
    };

    const filtered = customers.filter((c: any) => {
        const q = search.toLowerCase();
        const matchesSearch = !q ||
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.includes(q);
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        const matchesPlan = planFilter === "all" ||
            c.plan_name?.toLowerCase() === planFilter.toLowerCase();
        return matchesSearch && matchesStatus && matchesPlan;
    });

    const handleAddCustomerClick = () => {
        setCustomerToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditCustomerClick = (customer: any) => {
        setCustomerToEdit(customer);
        setIsModalOpen(true);
    };

    const columns = getCustomerColumns(handleEditCustomerClick, handleDelete);

    return (
        <div>
            <Header
                title="Customers"
                subtitle={isLoading ? "Loading..." : `${pagination.total} total subscribers`}
                actions={
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            onClick={() => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIST_CUSTOMERS] })}
                            className="btn btn-secondary btn-sm"
                            disabled={isLoading}
                        >
                            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={handleAddCustomerClick} className="btn btn-primary btn-sm">
                            <Plus size={13} /> Add Customer
                        </button>
                    </div>
                }
            />

            <AddCustomerModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setCustomerToEdit(null);
                }}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIST_CUSTOMERS] });
                }}
                customerToEdit={customerToEdit}
            />

            <KeyGenerationModal
                isOpen={isKeyModalOpen}
                onClose={() => {
                    setIsKeyModalOpen(false);
                    setSelectedCustomer(null);
                }}
                customerId={selectedCustomer?.id || ""}
                customerName={selectedCustomer?.name || ""}
            />

            <div style={{ padding: "1.5rem" }}>
                {/* Filters */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <div className="input-group" style={{ width: 280 }}>
                        <Search size={14} className="input-icon" />
                        <input
                            className="input input-with-icon"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="tabs">
                        {(["all", "active", "inactive", "paused"] as StatusFilter[]).map((s) => (
                            <button key={s} className={`tab ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                    <select
                        className="input"
                        style={{ width: "auto" }}
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value as PlanFilter)}
                    >
                        <option value="all">All Plans</option>
                        {["Starter", "Business", "Pro", "Enterprise"].map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                {/* Reusable Table Component */}
                <Table
                    columns={columns as any}
                    data={filtered}
                    isLoading={isLoading}
                    emptyMessage="No customers found"
                    pagination={pagination}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}
