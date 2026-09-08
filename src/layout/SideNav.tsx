"use client";

// Barra de navegación de la app, en TRES zonas:
//   top     → logo o lo más importante (selector de sitio, campanita…)
//   menú    → los items de navegación (hace scroll si no caben)
//   bottom  → lo que sea: en general el usuario (SideNavUser) y sus cosas
//
// Escritorio (≥ md): rail de 232px a la izquierda (layout .principal), que se
// puede CONTRAER a solo iconos (72px) con el botón de abajo; la preferencia se
// recuerda (localStorage). En compacto, top/bottom muestran `topCompact` /
// `bottomCompact` si se dan (SideNavUser y SideNavButton se adaptan solos).
// Móvil (< md): oculta a la izquierda (off-canvas), siempre completa; se abre
// con la hamburguesa que el PageHeader pinta solo cuando hay un SideNav
// montado (sideNavState), y se cierra al navegar, con la X, Escape o el fondo.
//
//   <SideNav
//     top={<Logo/>} topCompact={<LogoChip/>}     // o logo/logoHref (compat)
//     items={[{ href, label, icon }]}
//     activePath={usePathname()}
//     LinkComponent={Link}                       // next/link
//     bottom={<SideNavUser name="Adrià" items={[…]} />}
//   />
import { ElementType, ReactNode, useEffect } from "react";
import { ChevronsLeft, ChevronsRight, ChevronsUpDown, X } from "lucide-react";
import { sideNavState, useSideNavCompact, useSideNavState } from "./sideNavState";
import { Popover, Menu, type MenuItem } from "../overlays/Popover";

// Cualquier componente que acepte href/className/children: "a", next/link…
type LinkLike = ElementType;

export function SideNav({
  top,
  topCompact,
  logo,
  logoHref = "/",
  items,
  activePath,
  LinkComponent,
  bottom,
  bottomCompact,
  collapsible = true,
  mobileAction,
  children,
}: {
  top?: ReactNode; // zona superior libre (no es un enlace)
  topCompact?: ReactNode; // versión para el modo compacto (si no, no se muestra top)
  logo?: ReactNode; // compat: logo enlazado a logoHref (si no hay `top`)
  logoHref?: string;
  items: { href: string; label: string; icon: ReactNode }[];
  activePath: string;
  LinkComponent?: LinkLike;
  bottom?: ReactNode;
  bottomCompact?: ReactNode; // versión compacta (por defecto se reutiliza `bottom`: SideNavUser/SideNavButton se adaptan)
  collapsible?: boolean; // botón de contraer/expandir en escritorio
  mobileAction?: { label: string; icon: ReactNode; onClick: () => void }; // compat: se añade al pie
  children?: ReactNode; // modales u otros elementos que cuelgan del nav
}) {
  const A: LinkLike = LinkComponent ?? "a";
  const { open, collapsed } = useSideNavState();
  const compact = useSideNavCompact();

  useEffect(() => {
    sideNavState.mount();
    return () => sideNavState.unmount();
  }, []);

  // Escape cierra en móvil.
  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") sideNavState.close();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  const topNode = compact
    ? topCompact ?? (logo && !top ? <A href={logoHref} className="flex items-center justify-center py-1" onClick={() => sideNavState.close()}>{logo}</A> : null)
    : top ??
      (logo && (
        <A href={logoHref} className="flex items-center gap-2 px-2.5 py-1 select-none" onClick={() => sideNavState.close()}>
          {logo}
        </A>
      ));

  return (
    <>
      <nav
        className={`sidenav h-full flex flex-col bg-[var(--secondary)] border-r border-[var(--border)] py-4 gap-3 ${compact ? "px-2" : "px-3"}`}
        data-open={open || undefined}
        data-collapsed={collapsed || undefined}
        aria-label="Navegación principal"
      >
        {/* top */}
        {(topNode || !compact) && (
          <div className={`flex items-start gap-2 shrink-0 ${compact ? "justify-center" : ""}`}>
            <div className={`min-w-0 ${compact ? "" : "flex-1"}`}>{topNode}</div>
            <button
              type="button"
              onClick={() => sideNavState.close()}
              aria-label="Cerrar menú"
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:bg-[var(--hover)] shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* menú */}
        <ul className="sidenav-menu flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col gap-1 list-none m-0 p-0">
          {items.map((item) => {
            const active = activePath.startsWith(item.href);
            return (
              <li key={item.href}>
                <A
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={compact ? item.label : undefined}
                  onClick={() => sideNavState.close()}
                  className={`flex items-center gap-2.5 rounded-xl transition min-w-0 ${compact ? "w-10 h-10 mx-auto justify-center" : "px-2.5 py-2"} ${
                    active ? "bg-[var(--hover)] font-semibold" : "hover:bg-[var(--hover)]"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition ${active ? "text-white blue-shadow" : ""}`}
                    style={active ? { background: "var(--app-gradient)" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {!compact && <span className="text-sm truncate">{item.label}</span>}
                </A>
              </li>
            );
          })}
        </ul>

        {/* contraer / expandir (solo escritorio) */}
        {collapsible && (
          <button
            type="button"
            onClick={() => sideNavState.toggleCollapsed()}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
            aria-pressed={collapsed}
            className={`hidden md:flex items-center gap-2.5 rounded-xl text-muted hover:bg-[var(--hover)] hover:text-[var(--foreground)] transition text-[12px] ${
              compact ? "w-10 h-10 mx-auto justify-center" : "px-2.5 py-1.5"
            }`}
          >
            <span className="inline-flex items-center justify-center w-8 h-8 shrink-0">
              {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            </span>
            {!compact && "Contraer"}
          </button>
        )}

        {/* bottom */}
        {(bottom || mobileAction) && (
          <div className="flex flex-col gap-1 shrink-0 pt-3 border-t border-[var(--border)]">
            {compact && bottomCompact !== undefined ? bottomCompact : bottom}
            {mobileAction && (
              <SideNavButton onClick={mobileAction.onClick} icon={mobileAction.icon}>
                {mobileAction.label}
              </SideNavButton>
            )}
          </div>
        )}

        {children}
      </nav>
      {open && <div className="sidenav-backdrop md:hidden" onClick={() => sideNavState.close()} aria-hidden />}
    </>
  );
}

// Botón de texto para el pie del SideNav (tema, "Mis datos"…): icono + etiqueta.
// En compacto muestra solo el icono, con la etiqueta como tooltip.
export function SideNavButton({
  onClick,
  icon,
  children,
  title,
}: {
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
  title?: string; // tooltip en compacto (si children no es texto)
}) {
  const compact = useSideNavCompact();
  const tip = title ?? (typeof children === "string" ? children : undefined);
  return (
    <button
      type="button"
      onClick={onClick}
      title={compact ? tip : undefined}
      aria-label={compact ? tip : undefined}
      className={`flex items-center gap-3 rounded-xl hover:bg-[var(--hover)] text-sm text-left ${compact ? "w-10 h-10 mx-auto justify-center" : "w-full px-2.5 py-2"}`}
    >
      <span className="inline-flex items-center justify-center w-8 h-8 shrink-0">{icon}</span>
      {!compact && children}
    </button>
  );
}

// Acción genérica para las zonas top/bottom: icono + etiqueta (+ badge) que
// hace algo al pulsar o abre un popover con lo que sea (notificaciones,
// avisos, filtros…). Se adapta solo al modo compacto (solo icono + tooltip).
//
//   <SideNavAction icon={<Bell/>} label="Notificaciones" badge={3} popoverWidth={300}>
//     {({ close }) => <ListaDeAvisos onPick={close} />}
//   </SideNavAction>
export function SideNavAction({
  icon,
  label,
  badge,
  onClick,
  children,
  popoverWidth = 280,
  placement = "bottom",
  active,
}: {
  icon: ReactNode;
  label: string;
  badge?: ReactNode; // contador o punto; nada/0 → no se pinta
  onClick?: () => void; // acción directa (si no hay popover)
  children?: ReactNode | ((p: { close: () => void }) => ReactNode); // contenido del popover
  popoverWidth?: number; // ancho del panel en compacto (en completo ocupa el ancho del rail)
  placement?: "top" | "bottom"; // top para la zona inferior
  active?: boolean;
}) {
  const compact = useSideNavCompact();
  const showBadge = badge != null && badge !== 0 && badge !== false && badge !== "";

  const button = (open?: boolean, toggle?: () => void) => (
    <button
      type="button"
      onClick={toggle ?? onClick}
      aria-expanded={toggle ? open : undefined}
      title={compact ? label : undefined}
      aria-label={compact ? label : undefined}
      className={`flex items-center gap-3 rounded-xl text-sm text-left transition ${compact ? "w-10 h-10 justify-center mx-auto" : "w-full px-2.5 py-2"} ${
        open || active ? "bg-[var(--hover)]" : "hover:bg-[var(--hover)]"
      }`}
    >
      <span className="relative inline-flex items-center justify-center w-8 h-8 shrink-0">
        {icon}
        {showBadge && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[var(--negative)] text-white text-[9.5px] font-bold flex items-center justify-center leading-none">
            {badge}
          </span>
        )}
      </span>
      {!compact && <span className="flex-1 truncate">{label}</span>}
    </button>
  );

  if (children == null) return button();

  return (
    <Popover
      placement={placement}
      align={compact ? "start" : "stretch"}
      width={compact ? popoverWidth : undefined}
      className={compact ? "flex justify-center" : "w-full"}
      trigger={({ open, toggle }) => button(open, toggle)}
    >
      {children}
    </Popover>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

// Usuario en el pie del SideNav: avatar + nombre (+ detalle) que abre hacia
// arriba un menú con sus cosas (tema, ajustes, salir…). En compacto, solo el
// avatar; el menú se despliega hacia la derecha.
//   <SideNavUser name="Adrià Pulido" subtitle="adria@correo.com" items={[…]} />
// Con `groups` el menú se divide en bloques con título (p. ej. "Estás en" con
// los sitios y su check, y debajo "Cuenta"):
//   <SideNavUser name="…" groups={[{ title: "Estás en", items: sitios }, { title: "Cuenta", items }]} />
export function SideNavUser({
  name,
  subtitle,
  avatar,
  items = [],
  menuTitle,
  groups,
  children,
}: {
  name: string;
  subtitle?: ReactNode;
  avatar?: string | ReactNode; // URL de imagen o un nodo; sin nada → iniciales
  items?: MenuItem[]; // menú simple (si no hay groups)
  menuTitle?: ReactNode;
  groups?: { title?: ReactNode; items: MenuItem[] }[]; // menú por bloques
  children?: ReactNode; // contenido extra al final del menú (lo que sea)
}) {
  const compact = useSideNavCompact();
  const bloques = groups ?? [{ title: menuTitle, items }];
  const av =
    typeof avatar === "string" ? (
      <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
    ) : avatar ? (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0 overflow-hidden">{avatar}</span>
    ) : (
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-[12px] font-bold shrink-0"
        style={{ background: "var(--app-gradient)" }}
      >
        {initials(name)}
      </span>
    );

  return (
    <Popover
      placement="top"
      align={compact ? "start" : "stretch"}
      width={compact ? 240 : undefined}
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          title={compact ? name : undefined}
          className={`flex items-center gap-2.5 rounded-xl text-left transition ${compact ? "w-10 h-10 mx-auto justify-center" : "w-full px-2.5 py-1.5"} ${
            open ? "bg-[var(--hover)]" : "hover:bg-[var(--hover)]"
          }`}
        >
          {av}
          {!compact && (
            <>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold truncate">{name}</span>
                {subtitle && <span className="block text-[11px] text-muted truncate">{subtitle}</span>}
              </span>
              <ChevronsUpDown size={14} className="text-muted shrink-0" />
            </>
          )}
        </button>
      )}
    >
      {({ close }) => (
        <>
          {compact && (
            <div className="px-3 pt-2.5 pb-1 border-b border-[var(--border)]">
              <span className="block text-sm font-semibold truncate">{name}</span>
              {subtitle && <span className="block text-[11px] text-muted truncate">{subtitle}</span>}
            </div>
          )}
          {bloques.map((g, i) => (
            <div key={i} className={i > 0 ? "border-t border-[var(--border)]" : ""}>
              <Menu title={g.title} items={g.items} onPick={close} />
            </div>
          ))}
          {children}
        </>
      )}
    </Popover>
  );
}
