"use client";

import React, { useEffect, useState } from "react";
import { X, Key as KeyIcon, Mail, User, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLicenseKey } from "@/lib/services/licenseKeys";
import QUERY_KEYS from "@/constants/queryKeys";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (created?: any) => void;
}

export default function AddLicenseKeyModal({ isOpen, onClose, onSuccess }: Props) {
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [form, setForm] = useState({ key: "", customer_name: "", customer_email: "", plan: "", notes: "" });
  const [error, setError] = useState("");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: any) => createLicenseKey(payload),
    mutationKey: [QUERY_KEYS.CREATE_LICENSE_KEY],
    onSuccess: (res) => {
      if (res?.success ?? true) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIST_LICENSE_KEYS] });
        onSuccess?.(res?.data || res);
        onClose();
        setForm({ key: "", customer_name: "", customer_email: "", plan: "", notes: "" });
        setAutoGenerate(true);
      } else {
        setError(res?.message || "Failed to create license key");
      }
    },
    onError: (err: any) => {
      setError("Could not connect to the server.");
      console.error("Create License Key Error:", err);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setError("");
      setForm({ key: "", customer_name: "", customer_email: "", plan: "", notes: "" });
      setAutoGenerate(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload: any = {};
    if (!autoGenerate && form.key) payload.key = form.key;
    if (!autoGenerate && form.customer_name) payload.customer_name = form.customer_name;
    if (!autoGenerate && form.customer_email) payload.customer_email = form.customer_email;
    if (!autoGenerate && form.plan) payload.plan = form.plan;
    if (!autoGenerate && form.notes) payload.notes = form.notes;
    // If autoGenerate is true, send empty body to let backend auto-generate
    mutation.mutate(payload);
  };

  const loading = mutation.isPending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Add License Key</h3>
            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>Create a new license key (auto-generate or provide details)</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1rem 1.5rem" }}>
          {error && (
            <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 6, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#f87171" }}><AlertCircle size={14} />{error}</div>
            </div>
          )}

          <label className="form-label">Auto Generate</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <input type="checkbox" checked={autoGenerate} onChange={(e) => setAutoGenerate(e.target.checked)} className="checkbox" />
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>When enabled, the server will generate a key automatically.</div>
          </div>

          {!autoGenerate && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div style={{ gridColumn: "span 2" }}>
                <label className="form-label">Key</label>
                <div className="input-group">
                  <KeyIcon size={14} className="input-icon" />
                  <input className="input input-with-icon" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="SPOS-..." />
                </div>
              </div>
              <div>
                <label className="form-label">Customer Name</label>
                <div className="input-group">
                  <User size={14} className="input-icon" />
                  <input className="input input-with-icon" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label">Customer Email</label>
                <div className="input-group">
                  <Mail size={14} className="input-icon" />
                  <input className="input input-with-icon" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label">Plan</label>
                <div className="input-group">
                  <FileText size={14} className="input-icon" />
                  <input className="input input-with-icon" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} />
                </div>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label className="form-label">Notes</label>
                <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span style={{ width: 12, height: 12, borderRadius: 99, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", display: "inline-block" }} /> : <CheckCircle size={14} />} {autoGenerate ? "Generate" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
