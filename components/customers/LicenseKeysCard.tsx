"use client";

import { Key, RefreshCw } from "lucide-react";
import Table from "@/components/ui/Table";
import { LicenseKey } from "@/lib/types";

interface LicenseKeysCardProps {
    keys: LicenseKey[];
    keysLoading: boolean;
    onGenerate: () => void;
    onRevoke: (keyId: string) => void;
    canGenerate: boolean;
}

import { getLicenseKeyColumns } from "@/constants/tableColumns";

export default function LicenseKeysCard({ keys, keysLoading, onGenerate, onRevoke, canGenerate }: LicenseKeysCardProps) {
    const columns = getLicenseKeyColumns(onRevoke);

    return (
        <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <Key size={16} color="var(--brand-primary)" /> Active License Keys
                    {keysLoading && <RefreshCw size={12} className="animate-spin" style={{ color: "var(--text-dim)" }} />}
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={onGenerate}
                    disabled={!canGenerate}
                    title={!canGenerate ? "Setup providers first" : ""}
                >
                    <Key size={12} /> Generate Key
                </button>
            </div>
            <Table
                columns={columns as any}
                data={keys}
                isLoading={keysLoading}
                emptyMessage="No keys issued yet."
                tableStyle={{ border: "none" }}
            />
        </div>
    );
}
