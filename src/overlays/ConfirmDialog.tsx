"use client";

import { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "../controls/Button";

// Confirmación de acciones (borrar, sobrescribir…) construida sobre Modal +
// Button, para no repetir el mismo diálogo a mano en cada app.
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <div className="text-[13px] text-muted leading-relaxed">{message}</div>}
    </Modal>
  );
}
