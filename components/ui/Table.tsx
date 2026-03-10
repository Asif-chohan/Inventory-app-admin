"use client";

import React from "react";
import { RefreshCw, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    style?: React.CSSProperties;
    cellStyle?: React.CSSProperties;
    render?: (item: T) => React.ReactNode;
}

interface Pagination {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit?: number;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    pagination?: Pagination;
    onPageChange?: (page: number) => void;
    tableStyle?: React.CSSProperties;
}

export default function Table<T extends { id?: string | number }>({
    columns,
    data,
    isLoading = false,
    emptyMessage = "No data found",
    pagination,
    onPageChange,
    tableStyle,
}: TableProps<T>) {
    return (
        <div className="table-container">
            <table
                style={{
                    opacity: isLoading ? 0.6 : 1,
                    transition: "opacity 0.2s",
                    ...tableStyle,
                }}
            >
                <thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} style={col.style}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {!isLoading && data.length > 0 ? (
                        data.map((item, rowIdx) => (
                            <tr key={item.id ?? rowIdx}>
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} style={col.cellStyle}>
                                        {col.render
                                            ? col.render(item)
                                            : typeof col.accessor === "function"
                                                ? col.accessor(item)
                                                : (item[col.accessor] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : isLoading ? (
                        <tr>
                            <td colSpan={columns.length}>
                                <div style={{ textAlign: "center", padding: "3rem" }}>
                                    <RefreshCw
                                        size={24}
                                        className="animate-spin"
                                        style={{ color: "var(--brand-primary)", opacity: 0.5 }}
                                    />
                                </div>
                            </td>
                        </tr>
                    ) : (
                        <tr>
                            <td colSpan={columns.length}>
                                <div className="empty-state">
                                    <Inbox size={32} style={{ marginBottom: "0.5rem" }} />
                                    <div>{emptyMessage}</div>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {pagination && onPageChange && (
                <div
                    style={{
                        padding: "1rem",
                        borderTop: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "var(--bg-card)",
                    }}
                >
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                        Page {pagination.current} / {Math.ceil(pagination.total / (pagination.limit ?? 10)) || 1}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            disabled={!pagination.hasPrev || isLoading}
                            onClick={() => onPageChange(pagination.current - 1)}
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            className="btn btn-secondary btn-sm"
                            disabled={!pagination.hasNext || isLoading}
                            onClick={() => onPageChange(pagination.current + 1)}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
