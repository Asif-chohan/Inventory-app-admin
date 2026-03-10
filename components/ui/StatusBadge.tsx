"use client";

import { CheckCircle, XCircle, PauseCircle } from "lucide-react";

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    if (status === "active") return <span className="badge badge-success"><CheckCircle size={9} /> Active</span>;
    if (status === "inactive") return <span className="badge badge-danger"><XCircle size={9} /> Inactive</span>;
    return <span className="badge badge-warning"><PauseCircle size={9} /> Paused</span>;
}
