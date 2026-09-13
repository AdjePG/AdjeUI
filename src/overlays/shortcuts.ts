"use client";

import { useEffect, useRef, useState } from "react";

// Combinaciones de teclas (13 sep 2026). Viven aquí porque nacieron para los
// items de Menu, pero NO son cosa del Popover: el popover solo existe mientras
// está abierto, y un atajo tiene que funcionar con el menú cerrado. Por eso el
// Menu solo PINTA el atajo, y quien posee las acciones las ENGANCHA con
// useShortcuts — normalmente la misma pantalla que construye los items.
//
//   const items = [{ label: "Duplicar", shortcut: "mod+d", onClick: duplicar }];
//   useShortcuts(items);            // funciona esté el menú abierto o no
//   <Popover …><Menu items={items} /></Popover>
//
// Sintaxis: partes separadas por "+", en cualquier orden.
//   mod    → ⌘ en Mac, Ctrl en el resto (es el que quieres el 90 % de las veces)
//   ctrl · shift · alt
//   la tecla: una letra, un dígito o un nombre (enter, delete, escape, arrowup…)

export type Combo = {
  key: string;
  mod: boolean;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
};

export function parseShortcut(atajo: string): Combo {
  const combo: Combo = { key: "", mod: false, ctrl: false, shift: false, alt: false };
  for (const parte of atajo.toLowerCase().split("+")) {
    const p = parte.trim();
    if (!p) continue;
    if (p === "mod" || p === "cmd" || p === "meta" || p === "command") combo.mod = true;
    else if (p === "ctrl" || p === "control") combo.ctrl = true;
    else if (p === "shift") combo.shift = true;
    else if (p === "alt" || p === "option" || p === "opt") combo.alt = true;
    else combo.key = p;
  }
  return combo;
}

export function esMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Detección de Mac segura para SSR: en el primer render siempre dice "no", y
// se corrige al montar. Sin esto, el HTML del servidor y el del cliente no
// coinciden y React protesta.
export function useEsMac(): boolean {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(esMac()), []);
  return mac;
}

const NOMBRES_MAC: Record<string, string> = {
  mod: "⌘",
  ctrl: "⌃",
  shift: "⇧",
  alt: "⌥",
  enter: "↵",
  delete: "⌫",
  backspace: "⌫",
  escape: "Esc",
  esc: "Esc",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
};

const NOMBRES: Record<string, string> = {
  mod: "Ctrl",
  ctrl: "Ctrl",
  shift: "Shift",
  alt: "Alt",
  enter: "Enter",
  delete: "Supr",
  backspace: "Retroceso",
  escape: "Esc",
  esc: "Esc",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
};

// "mod+shift+d" → "⌘⇧D" en Mac, "Ctrl+Shift+D" en el resto.
export function formatShortcut(atajo: string, mac = esMac()): string {
  const tabla = mac ? NOMBRES_MAC : NOMBRES;
  const partes = atajo
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => tabla[p] ?? (p.length === 1 ? p.toUpperCase() : p[0].toUpperCase() + p.slice(1)));
  return partes.join(mac ? "" : "+");
}

function coincide(e: KeyboardEvent, c: Combo, mac: boolean): boolean {
  if (!c.key) return false;
  const tecla = e.key.toLowerCase();
  if (tecla !== c.key && !(c.key.length === 1 && e.code.toLowerCase() === `key${c.key}`)) return false;
  // "mod" es ⌘ en Mac y Ctrl fuera; si además se pidió ctrl explícito, se exige.
  const modOk = c.mod ? (mac ? e.metaKey : e.ctrlKey) : mac ? !e.metaKey : true;
  const ctrlOk = c.ctrl ? e.ctrlKey : c.mod && !mac ? true : !e.ctrlKey;
  return modOk && ctrlOk && e.shiftKey === c.shift && e.altKey === c.alt;
}

// ¿El foco está en un sitio donde escribir? Ahí los atajos sin modificador
// estorban (escribir "d" no puede borrar nada).
function escribiendo(destino: EventTarget | null): boolean {
  const el = destino as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

export type AccionConAtajo = {
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  // Para poder pasarle tal cual la lista de items de un Menu, separadores
  // incluidos: se ignoran (no tienen atajo que enganchar).
  separator?: boolean;
};

// Engancha los atajos de una lista de acciones mientras el componente esté
// montado. Los items sin `shortcut` se ignoran, así que puedes pasarle
// directamente los MenuItem de un menú, separadores incluidos.
//
// La lista suele construirse en cada render (menuLeccion(activa), por
// ejemplo), así que el oyente NO se vuelve a enganchar por eso: solo cuando
// cambian los atajos. Las acciones se leen de una ref, siempre las últimas.
export function useShortcuts(acciones: readonly AccionConAtajo[], opciones?: { enabled?: boolean }) {
  const activo = opciones?.enabled ?? true;
  const firma = acciones.map((a) => a.shortcut ?? "").join("|");
  const ref = useRef(acciones);
  ref.current = acciones;

  useEffect(() => {
    if (!activo || !firma.replace(/\|/g, "")) return;
    const mac = esMac();

    function onKey(e: KeyboardEvent) {
      for (const accion of ref.current) {
        if (!accion.shortcut) continue;
        const combo = parseShortcut(accion.shortcut);
        const sinModificador = !combo.mod && !combo.ctrl && !combo.alt;
        if (sinModificador && escribiendo(e.target)) continue;
        if (!coincide(e, combo, mac)) continue;
        if (accion.disabled) return;
        e.preventDefault();
        accion.onClick?.();
        return;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activo, firma]);
}
