"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Phone, Shield, BarChart3, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomer, updateCustomer } from "@/lib/services/customers";
import QUERY_KEYS from "@/constants/queryKeys";

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCustomer?: any) => void;
    customerToEdit?: any;
    defaultValues?: {
        name?: string;
        email?: string;
        phone?: string;
        status?: string;
        plan_name?: string;
        monthly_limit?: number;
        channels?: string[];
    };
}

export default function AddCustomerModal({
  isOpen,
  onClose,
  onSuccess,
  customerToEdit,
  defaultValues,
}: AddCustomerModalProps) {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    plan_name: "Starter",
    monthly_limit: 50,
    channels: ["whatsapp"] as string[],
  });

  const queryClient = useQueryClient();
  const isEditing = !!customerToEdit;

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isEditing
        ? updateCustomer(customerToEdit.id, payload)
        : createCustomer(payload),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.LIST_CUSTOMERS],
        });
        if (isEditing) {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_CUSTOMER, customerToEdit.id],
          });
        }
        onSuccess(result.data);
        onClose();
        if (!isEditing) {
          setFormData({
            name: "",
            email: "",
            phone: "",
            status: "active",
            plan_name: "Starter",
            monthly_limit: 50,
            channels: ["whatsapp"],
          });
        }
      } else {
        setError(
          result.message ||
            `Failed to ${isEditing ? "update" : "create"} customer`,
        );
      }
    },
    onError: (err: any) => {
      setError("Could not connect to the server.");
      console.error(`${isEditing ? "Update" : "Create"} Customer Error:`, err);
    },
  });

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        name: customerToEdit.name || "",
        email: customerToEdit.email || "",
        phone: customerToEdit.phone || "",
        status: customerToEdit.status || "active",
        plan_name: customerToEdit.plan_name || "Starter",
        monthly_limit: customerToEdit.monthly_limit || 0,
        channels: customerToEdit.channels || ["whatsapp"],
      });
    }
  }, [customerToEdit]);

  useEffect(() => {
    if (defaultValues) {
      setFormData((prev: any) => ({
        ...prev,
        ...defaultValues,
      }));
    }
  }, [defaultValues]);

  // Handle updates when modal opens with a customer
  useEffect(() => {
    if (isOpen && customerToEdit) {
      setFormData({
        name: customerToEdit.name || "",
        email: customerToEdit.email || "",
        phone: customerToEdit.phone || "",
        status: customerToEdit.status || "active",
        plan_name: customerToEdit.plan_name || "Starter",
        monthly_limit: customerToEdit.monthly_limit || 0,
        channels: customerToEdit.channels || ["whatsapp"],
      });
    }
  }, [isOpen, customerToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      plan: {
        name: formData.plan_name,
        monthlyLimit: formData.monthly_limit,
        channels: formData.channels,
      },
    };

    mutation.mutate(payload);
  };

  const loading = mutation.isPending;

  const toggleChannel = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 500, padding: 0, overflow: "hidden" }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-card)",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {isEditing ? "Update Customer" : "Add New Customer"}
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
              {isEditing
                ? "Modify subscriber details"
                : "Create a new subscriber account"}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "var(--radius-sm)",
                marginBottom: "1.5rem",
                fontSize: 13,
                color: "#f87171",
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ gridColumn: "span 2" }}>
              <label className="form-label">Full Name</label>
              <div className="input-group">
                <User size={14} className="input-icon" />
                <input
                  type="text"
                  className="input input-with-icon"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <Mail size={14} className="input-icon" />
                <input
                  type="email"
                  className="input input-with-icon"
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <div className="input-group">
                <Phone size={14} className="input-icon" />
                <input
                  type="tel"
                  className="input input-with-icon"
                  placeholder="+1234567890"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="form-label">Plan</label>
              <div className="input-group">
                <Shield size={14} className="input-icon" />
                <select
                  className="input input-with-icon"
                  value={formData.plan_name}
                  onChange={(e) =>
                    setFormData({ ...formData, plan_name: e.target.value })
                  }
                >
                  <option value="Starter">Starter</option>
                  <option value="Business">Business</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Status</label>
              <div className="input-group">
                <Shield size={14} className="input-icon" />
                <select
                  className="input input-with-icon"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Monthly Limit</label>
              <div className="input-group">
                <BarChart3 size={14} className="input-icon" />
                <input
                  type="number"
                  className="input input-with-icon"
                  placeholder="50"
                  required
                  value={formData.monthly_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthly_limit: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label className="form-label">Active Channels</label>
              <div
                style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={formData.channels.includes("whatsapp")}
                    onChange={() => toggleChannel("whatsapp")}
                  />
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    WhatsApp
                  </span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={formData.channels.includes("sms")}
                    onChange={() => toggleChannel("sms")}
                  />
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    SMS
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="animate-spin"
                    style={{
                      width: 12,
                      height: 12,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                    }}
                  />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  {isEditing ? "Update Customer" : "Create Customer"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
