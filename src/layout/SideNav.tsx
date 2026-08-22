"use client";

// Barra de navegación de la app: rail lateral en escritorio, barra inferior
// en móvil (funciona con el layout .principal de theme.css). Los dos apps
// usaban esta misma estructura duplicada; aquí solo cambian logo, items y
// las acciones del pie.
//
//   <SideNav
//     logo={<…/>} logoHref="/resumen"
//     items={[{ href, label, icon }]}
//     activePath={usePathname()}
//     LinkComponent={Link}                       // next/link
//     bottom={<><SideNavButton …/>…</>}          // solo escritorio
//     mobileAction={{ label: "Ajustes", icon: <Settings/>, onClick }}
//   />
import { ElementType, ReactNode } from "react";

// Cualquier componente que acepte href/className/children: "a", next/link…
type LinkLike = ElementType;

const TAB_CLS =
  "flex md:flex-row flex-col items-center md:gap-2.5 gap-1 rounded-xl md:px-2.5 px-2 py-1.5 md:py-2 transition min-w-0";

export function SideNav({
  logo,
  logoHref = "/",
  items,
  activePath,
  LinkComponent,
  bottom,
  mobileAction,
  children,
}: {
  logo: ReactNode;
  logoHref?: string;
  items: { href: string; label: string; icon: ReactNode }[];
  activePath: string;
  LinkComponent?: LinkLike;
  bottom?: ReactNode; // acciones del pie (solo escritorio)
  mobileAction?: { label: string; icon: ReactNode; onClick: () => void }; // pestaña extra solo móvil
  children?: ReactNode; // modales u otros elementos que cuelgan del nav
}) {
  const A: LinkLike = LinkComponent ?? "a";

  return (
    <nav className="h-full flex md:flex-col items-center md:items-stretch justify-around md:justify-start bg-[var(--secondary)] border-t md:border-t-0 md:border-r border-[var(--border)] px-2 md:px-3 py-1.5 md:py-5 gap-1 md:gap-1">
      {/* Logo (solo escritorio) */}
      <A href={logoHref} className="hidden md:flex items-center gap-2 px-2 mb-6 select-none">
        {logo}
      </A>

      {/* Items (en móvil son las pestañas de la barra inferior) */}
      <ul className="contents md:flex md:flex-col md:gap-1 md:w-full list-none m-0 p-0">
        {items.map((item) => {
          const active = activePath.startsWith(item.href);
          return (
            <li key={item.href} className="md:w-full flex-1 md:flex-none">
              <A
                href={item.href}
                className={`${TAB_CLS} w-full ${active ? "md:bg-[var(--hover)] font-semibold" : "hover:bg-[var(--hover)]"}`}
              >
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition ${active ? "text-white blue-shadow" : ""}`}
                  style={active ? { background: "var(--app-gradient)" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="text-[11px] md:text-sm truncate max-w-full">{item.label}</span>
              </A>
            </li>
          );
        })}
        {mobileAction && (
          <li className="md:hidden flex-1">
            <button onClick={mobileAction.onClick} className={`${TAB_CLS} w-full hover:bg-[var(--hover)]`} title={mobileAction.label}>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0">{mobileAction.icon}</span>
              <span className="text-[11px] md:text-sm truncate max-w-full">{mobileAction.label}</span>
            </button>
          </li>
        )}
      </ul>

      {/* Pie (solo escritorio) */}
      {bottom && (
        <div className="hidden md:flex flex-col gap-1 mt-auto pt-4 border-t border-[var(--border)]">{bottom}</div>
      )}

      {children}
    </nav>
  );
}

// Botón del pie del SideNav (tema, "Mis datos"…): icono + etiqueta.
export function SideNavButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[var(--hover)] text-sm">
      <span className="inline-flex items-center justify-center w-8 h-8">{icon}</span>
      {children}
    </button>
  );
}
