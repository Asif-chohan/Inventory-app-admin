"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useEffect, useCallback } from "react";
import AddCustomerModal from "@/components/ui/AddCustomerModal";
import {
    Search, Eye, Edit, Trash2, Key,
    CheckCircle, XCircle, PauseCircle,
    ChevronLeft, ChevronRight, RefreshCw, Plus
} from "lucide-react";
import KeyGenerationModal from "@/components/ui/KeyGenerationModal";

type StatusFilter = "all" | "active" | "inactive" | "paused";
type PlanFilter = "all" | "Starter" | "Business" | "Pro" | "Enterprise";

export default function CustomersPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customerToEdit, setCustomerToEdit] = useState<any>(null);
    const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
    });

    const fetchCustomers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await fetch(`${apiBase}/admin/customers?page=${page}&limit=10`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                }
            });
            const result = await response.json();
            if (result.success) {
                setCustomers(result.data.items);
                setPagination({
                    current: result.data.current,
                    total: result.data.total,
                    hasNext: result.data.hasNext,
                    hasPrev: result.data.hasPrev
                });
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this customer?")) return;

        try {
            const response = await fetch(`${apiBase}/admin/customers/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                }
            });
            const result = await response.json();
            if (result.success) {
                fetchCustomers(pagination.current);
            }
        } catch (error) {
            console.error("Delete Error:", error);
        }
    };

    const filtered = customers.filter((c) => {
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

    const handleAddCustomerSuccess = () => {
        fetchCustomers(1);
    };

    const handleAddCustomerClick = () => {
        setCustomerToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditCustomerClick = (customer: any) => {
        setCustomerToEdit(customer);
        setIsModalOpen(true);
    };

    const handleKeyClick = (customer: any) => {
        setSelectedCustomer(customer);
        setIsKeyModalOpen(true);
    };

    const statusIcon = (status: string) => {
        if (status === "active") return <span className="badge badge-success"><CheckCircle size={9} /> Active</span>;
        if (status === "inactive") return <span className="badge badge-danger"><XCircle size={9} /> Inactive</span>;
        return <span className="badge badge-warning"><PauseCircle size={9} /> Paused</span>;
    };

    return (
        <div>
            <Header
                title="Customers"
                subtitle={loading ? "Loading..." : `${pagination.total} total subscribers`}
                actions={
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            onClick={() => fetchCustomers(pagination.current)}
                            className="btn btn-secondary btn-sm"
                            disabled={loading}
                        >
                            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
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
                    fetchCustomers(pagination.current);
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

                {/* Table */}
                <div className="table-container">
                    <table style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Phone</th>
                                <th>Plan</th>
                                <th>Channels</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c) => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: "50%",
                                                background: "linear-gradient(135deg, var(--brand-primary), var(--brand-dark))",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
                                            }}>
                                                {c.name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{c.phone}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.plan_name}</div>
                                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                                            {c.monthly_limit === -1 ? "Unlimited" : `${c.monthly_limit.toLocaleString()} msgs`}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                            {c.channels.includes("whatsapp") && (
                                                <span className="badge badge-success" style={{ fontSize: 10 }}>WA</span>
                                            )}
                                            {c.channels.includes("sms") && (
                                                <span className="badge badge-info" style={{ fontSize: 10 }}>SMS</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{statusIcon(c.status)}</td>
                                    <td style={{ fontSize: 12, color: "var(--text-dim)" }}>
                                        {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: 4 }}>
                                            <Link href={`/customers/${c.id}`} className="btn-icon" title="View Details">
                                                <Eye size={14} />
                                            </Link>
                                            <button
                                                className="btn-icon"
                                                title="Edit Customer"
                                                onClick={() => handleEditCustomerClick(c)}
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="btn-icon"
                                                title="Delete Customer"
                                                style={{ color: "var(--danger)" }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filtered.length === 0 && (
                                <tr key="empty">
                                    <td colSpan={7}>
                                        <div className="empty-state">No customers found</div>
                                    </td>
                                </tr>
                            )}
                            {loading && filtered.length === 0 && (
                                <tr key="loading">
                                    <td colSpan={7}>
                                        <div style={{ textAlign: "center", padding: "3rem" }}>
                                            <RefreshCw size={24} className="animate-spin" style={{ color: "var(--brand-primary)", opacity: 0.5 }} />
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {!loading && customers.length > 0 && (
                        <div style={{
                            padding: "1rem",
                            borderTop: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "var(--bg-card)"
                        }}>
                            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                                Page {pagination.current} / {Math.ceil(pagination.total / 10)}
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={!pagination.hasPrev}
                                    onClick={() => fetchCustomers(pagination.current - 1)}
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={!pagination.hasNext}
                                    onClick={() => fetchCustomers(pagination.current + 1)}
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
