"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

// Centered dialog. `footer` is the ACTION ZONE: pass it the buttons
// (create/save/cancel) and they're drawn in their own bar separated from the
// content, the same in every dialog. Don't put them in children.
//
//   <Modal … footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button>
//                     <Button onClick={save}>Save</Button></>}>
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide = false,
  scrollBody = false,
}: {
  open: boolean;
  onClose: () => void;
  /** Text, or whatever is needed: a face and a name, a status chip… */
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  /** The dialog fits in the window and only its content scrolls, with the
   *  title (and the footer) staying put. Off by default: the page scrolls
   *  instead, which a dialog with menus inside needs to keep them unclipped.
   *  For a long list to pick from (a catalogue of blocks). */
  scrollBody?: boolean;
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-black/50 p-4 ${scrollBody ? "items-center" : "items-start overflow-y-auto custom-scrollbar"}`}
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`card w-full ${wide ? "max-w-3xl" : "max-w-lg"} blue-shadow flex flex-col ${scrollBody ? "max-h-[calc(100dvh-4rem)] my-4" : "my-8"}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={`flex shrink-0 items-center justify-between p-5 pb-4 ${scrollBody ? "border-b border-[var(--border)]" : ""}`}>
          <h3 className="text-lg font-semibold min-w-0">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[var(--hover)] inline-flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {scrollBody ? (
          // The bar's 14px gutter is always there, so the right padding is
          // what is left of the 20px: the content sits centred all the same.
          <div className="custom-scrollbar min-h-0 flex-1 pb-5 pl-5 pr-1.5 pt-4">{children}</div>
        ) : (
          <div className="px-5 pb-5">{children}</div>
        )}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2 px-5 py-3.5 border-t border-[var(--border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}