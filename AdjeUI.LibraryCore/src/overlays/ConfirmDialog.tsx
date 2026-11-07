"use client";

import { ReactNode, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "../controls/Button";

// Action confirmation (delete, overwrite…) built on Modal + Button. An async
// `onConfirm` is awaited with a busy button: the dialog closes when it
// resolves and stays open if it throws.
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  /** The confirmed action; a returned promise is awaited before closing. */
  onConfirm: (() => void) | (() => Promise<unknown>);
  title?: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button, for destructive actions. */
  danger?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} loading={busy} onClick={() => void confirm()}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <div className="text-[13px] text-muted leading-relaxed">{message}</div>}
    </Modal>
  );
}
