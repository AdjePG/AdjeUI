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
  size,
  scrollBody = false,
  bare = false,
}: {
  open: boolean;
  onClose: () => void;
  /** Text, or whatever is needed: a face and a name, a status chip… */
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  /** Width: "md" (the default), "lg" (= wide) or "xl" — a page to read
   *  inside, such as a document's preview (17 Oct 2026). */
  size?: "md" | "lg" | "xl";
  /** The dialog fits in the window and only its content scrolls, with the
   *  title (and the footer) staying put. Off by default: the page scrolls
   *  instead, which a dialog with menus inside needs to keep them unclipped.
   *  For a long list to pick from (a catalogue of blocks). */
  scrollBody?: boolean;
  /** Fits in the window like scrollBody, but the body has no padding and
   *  does not scroll: the content lays itself out — a search that stays on
   *  top and a list that scrolls under it (14 Oct 2026). */
  bare?: boolean;
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);
  if (!open) return null;
  const fit = scrollBody || bare;
  const width = { md: "max-w-lg", lg: "max-w-3xl", xl: "max-w-6xl" }[size ?? (wide ? "lg" : "md")];
  // On a phone every dialog takes the whole screen (14 Oct 2026): no
  // margins, no corners, the footer at the bottom.
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-black/50 p-4 max-sm:p-0 ${fit ? "items-center" : "items-start overflow-y-auto custom-scrollbar"}`}
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`card w-full ${width} blue-shadow flex flex-col max-sm:max-w-none max-sm:rounded-none max-sm:border-0 ${
          fit ? "max-h-[calc(100dvh-4rem)] my-4 max-sm:my-0 max-sm:h-dvh max-sm:max-h-none" : "my-8 max-sm:my-0 max-sm:min-h-dvh"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Always a line under the title (13 Oct 2026), as the Drawer has —
            it was only there when the body scrolled, so two dialogs side by
            side looked like two different components. */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] p-5 pb-4">
          <h3 className="text-lg font-semibold min-w-0">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[var(--hover)] inline-flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {bare ? (
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        ) : scrollBody ? (
          // The bar's 14px gutter is always there, so the right padding is
          // what is left of the 20px: the content sits centred all the same.
          <div className="custom-scrollbar min-h-0 flex-1 pb-5 pl-5 pr-1.5 pt-4">{children}</div>
        ) : (
          <div className="px-5 pb-5 pt-4 max-sm:flex-1">{children}</div>
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