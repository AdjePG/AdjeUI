"use client";

import { ReactNode, useRef } from "react";
import { X } from "lucide-react";
import { IconButton } from "../controls/IconButton";
import { useEscape } from "../internal/layers";

// Centered dialog; full screen on a phone. `footer` is the ACTION ZONE: pass
// it the buttons (create/save/cancel) and they're drawn in their own bar, the
// same in every dialog. Don't put them in children.
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
  /** Escape, a click on the backdrop and the X call it. */
  onClose: () => void;
  /** Text, or whatever is needed: a face and a name, a status chip… */
  title: ReactNode;
  children: ReactNode;
  /** The dialog's buttons (ghost Cancel + primary action). */
  footer?: ReactNode;
  /** @deprecated Use `size="lg"`. */
  wide?: boolean;
  /** Width: "md" (default), "lg" or "xl" (a page to read inside, such as a document preview). */
  size?: "md" | "lg" | "xl";
  /** The dialog fits in the window and only its content scrolls, with the
   *  title and footer staying put. Off by default: the page scrolls instead,
   *  which keeps menus inside the dialog unclipped. For long lists to pick from. */
  scrollBody?: boolean;
  /** Fits in the window like scrollBody, but the body has no padding and
   *  does not scroll: the content lays itself out (a fixed search over a scrolling list). */
  bare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEscape(onClose, open, [ref]);
  if (!open) return null;
  const fit = scrollBody || bare;
  const width = { md: "max-w-lg", lg: "max-w-3xl", xl: "max-w-6xl" }[size ?? (wide ? "lg" : "md")];
  return (
    <div
      ref={ref}
      className={`fixed inset-0 z-50 flex justify-center bg-black/50 p-4 max-sm:p-0 ${fit ? "items-center" : "items-start overflow-y-auto custom-scrollbar scroll-no-gutter"}`}
      // A press on the backdrop's own scrollbar (right of its content box) is
      // not a click outside.
      onMouseDown={(e) => {
        const el = e.currentTarget;
        if (e.target === el && e.clientX < el.getBoundingClientRect().left + el.clientWidth) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`card w-full ${width} blue-shadow flex flex-col max-sm:max-w-none max-sm:rounded-none max-sm:border-0 ${
          fit ? "max-h-[calc(100dvh-4rem)] my-4 max-sm:my-0 max-sm:h-dvh max-sm:max-h-none" : "my-8 max-sm:my-0 max-sm:min-h-dvh"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] p-5 pb-4">
          <h3 className="text-lg font-semibold min-w-0">{title}</h3>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
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
