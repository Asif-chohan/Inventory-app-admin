"use client";

import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-lg p-5! shadow-lg bg-white"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && <p className="text-sm text-muted mt-1">{description}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4!">
          <button className="btn" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button className="btn btn-danger" onClick={() => void onConfirm()} disabled={loading}>
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
