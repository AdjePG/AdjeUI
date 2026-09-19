"use client";

// The app's navigation bar, in THREE zones:
//   top     → logo or whatever matters most (site picker, notification bell…)
//   menu    → the navigation items (scrolls if they don't fit)
//   bottom  → anything: usually the user (SideNavUser) and their stuff
//
// Desktop (≥ md): 232px rail on the left (.app-shell layout), which can be
// COLLAPSED to icons only (73px) with the button at the bottom; the preference
// is remembered (localStorage). Measurements: 48px rows (px-2 py-2, 32px icon)
// when expanded and 48×48 squares when compact, with the same rail padding
// (12px): the icon doesn't move when collapsing. Rows always span the full
// width (they follow the rail animation) and labels fade out with opacity. When compact, top/bottom show `topCompact` /
// `bottomCompact` if given (SideNavUser and SideNavButton adapt on their own).
// Mobile (< md): hidden on the left (off-canvas), always full; opened with the
// hamburger that the PageHeader draws only when there's a SideNav mounted
// (sideNavState), and closed on navigation, with the X, Escape or the backdrop.
//
//   <SideNav
//     top={<SideNavBrand icon={<IconChip…/>} href="/">Aulora</SideNavBrand>}
//     items={[{ href, label, icon }]}
//     activePath={usePathname()}
//     LinkComponent={Link}                       // next/link
//     bottom={<SideNavUser name="Adrià" items={[…]} />}
//   />
import { ElementType, ReactNode, useEffect } from "react";
import { ChevronsLeft, ChevronsRight, ChevronsUpDown, X } from "lucide-react";
import { sideNavState, useSideNavCompact, useSideNavState } from "./sideNavState";
import { Popover } from "../overlays/Popover";
import { Menu, type MenuItem } from "../overlays/Menu";

// Any component that accepts href/className/children: "a", next/link…
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
  top?: ReactNode; // free top zone (not a link)
  topCompact?: ReactNode; // version for compact mode (otherwise `top` is shown: use SideNavBrand or useSideNavCompact)
  logo?: ReactNode; // compat: logo linked to logoHref (if there's no `top`)
  logoHref?: string;
  items: { href: string; label: string; icon: ReactNode }[];
  activePath: string;
  LinkComponent?: LinkLike;
  bottom?: ReactNode;
  bottomCompact?: ReactNode; // compact version (by default `bottom` is reused: SideNavUser/SideNavButton adapt)
  collapsible?: boolean; // collapse/expand button on desktop
  mobileAction?: { label: string; icon: ReactNode; onClick: () => void }; // compat: appended to the footer
  children?: ReactNode; // modals or other elements hanging off the nav
}) {
  const A: LinkLike = LinkComponent ?? "a";
  const { open, collapsed } = useSideNavState();
  const compact = useSideNavCompact();

  useEffect(() => {
    sideNavState.mount();
    return () => sideNavState.unmount();
  }, []);

  // Escape closes on mobile.
  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") sideNavState.close();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  const logoNode = logo && (
    <A href={logoHref} className="flex items-center gap-2 px-2 py-2 select-none min-w-0 overflow-hidden" onClick={() => sideNavState.close()}>
      {logo}
    </A>
  );
  const topNode = compact ? topCompact ?? top ?? logoNode : top ?? logoNode;
  // Content only "jumps" when swapping top/topCompact: that's where it fades.
  const topKey = topCompact !== undefined ? (compact ? "c" : "f") : "top";

  return (
    <>
      <nav
        className="sidenav h-full flex flex-col bg-[var(--secondary)] border-r border-[var(--border)] px-3 py-4 gap-3"
        data-open={open || undefined}
        data-collapsed={collapsed || undefined}
        aria-label="Main navigation"
      >
        {/* top */}
        {(topNode || !compact) && (
          <div key={topKey} className={`flex items-start gap-2 shrink-0 ${topCompact !== undefined ? "drawer-fade" : ""}`}>
            <div className="min-w-0 flex-1">{topNode}</div>
            <button
              type="button"
              onClick={() => sideNavState.close()}
              aria-label="Close menu"
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:bg-[var(--hover)] shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* menu */}
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
                  className={`flex items-center gap-2.5 rounded-xl transition min-w-0 overflow-hidden px-2 py-2 ${
                    active ? "bg-[var(--hover)] font-semibold" : "hover:bg-[var(--hover)]"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition ${active ? "text-white blue-shadow" : ""}`}
                    style={active ? { background: "var(--app-gradient)" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-sm truncate transition-opacity duration-150 ${compact ? "opacity-0" : "opacity-100"}`} aria-hidden={compact || undefined}>
                    {item.label}
                  </span>
                </A>
              </li>
            );
          })}
        </ul>

        {/* collapse / expand (desktop only) */}
        {collapsible && (
          <button
            type="button"
            onClick={() => sideNavState.toggleCollapsed()}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            title={collapsed ? "Expand menu" : "Collapse menu"}
            aria-pressed={collapsed}
            className="hidden md:flex items-center gap-2.5 rounded-xl text-muted hover:bg-[var(--hover)] hover:text-[var(--foreground)] transition text-[12px] min-w-0 overflow-hidden px-2 py-2"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 shrink-0">
              {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            </span>
            <span className={`truncate transition-opacity duration-150 ${compact ? "opacity-0" : "opacity-100"}`}>Collapse</span>
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

// App brand for the top zone: icon (usually an IconChip) + name, linked to
// the home page. Same 48px row as the items; when compact the icon stays in
// place and the name fades out.
//   <SideNavBrand icon={<IconChip size="lg"><Sparkles size={16} /></IconChip>} href="/panel" LinkComponent={Link}>
//     Aulora
//   </SideNavBrand>
export function SideNavBrand({
  icon,
  children,
  href = "/",
  LinkComponent,
  title,
}: {
  icon: ReactNode;
  children: ReactNode;
  href?: string;
  LinkComponent?: LinkLike;
  title?: string; // tooltip when compact (if children isn't text)
}) {
  const A: LinkLike = LinkComponent ?? "a";
  const compact = useSideNavCompact();
  const tip = title ?? (typeof children === "string" ? children : undefined);
  return (
    <A
      href={href}
      title={compact ? tip : undefined}
      onClick={() => sideNavState.close()}
      className="flex items-center gap-2.5 rounded-xl px-2 py-2 min-w-0 overflow-hidden select-none transition hover:bg-[var(--hover)]"
    >
      <span className="inline-flex items-center justify-center w-8 h-8 shrink-0">{icon}</span>
      <span
        className={`flex-1 min-w-0 flex items-center gap-2 font-bold text-lg truncate transition-opacity duration-150 ${compact ? "opacity-0" : "opacity-100"}`}
        aria-hidden={compact || undefined}
      >
        {children}
      </span>
    </A>
  );
}

// Text button for the SideNav footer (theme, "My data"…): icon + label.
// When compact it shows only the icon, with the label as a tooltip.
export function SideNavButton({
  onClick,
  icon,
  children,
  title,
}: {
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
  title?: string; // tooltip when compact (if children isn't text)
}) {
  const compact = useSideNavCompact();
  const tip = title ?? (typeof children === "string" ? children : undefined);
  return (
    <button
      type="button"
      onClick={onClick}
      title={compact ? tip : undefined}
      aria-label={compact ? tip : undefined}
      className="flex items-center gap-2.5 rounded-xl hover:bg-[var(--hover)] text-sm text-left w-full min-w-0 overflow-hidden px-2 py-2"
    >
      <span className="inline-flex items-center justify-center w-8 h-8 shrink-0">{icon}</span>
      <span className={`flex-1 min-w-0 truncate transition-opacity duration-150 ${compact ? "opacity-0" : "opacity-100"}`}>{children}</span>
    </button>
  );
}

// Generic action for the top/bottom zones: icon + label (+ badge) that does
// something on click or opens a popover with anything (notifications,
// alerts, filters…). Adapts on its own to compact mode (icon only + tooltip).
//
//   <SideNavAction icon={<Bell/>} label="Notifications" badge={3} popoverWidth={300}>
//     {({ close }) => <AlertList onPick={close} />}
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
  badge?: ReactNode; // counter or dot; nothing/0 → not drawn
  onClick?: () => void; // direct action (if there's no popover)
  children?: ReactNode | ((p: { close: () => void }) => ReactNode); // popover content
  popoverWidth?: number; // panel width when compact (when full it takes the rail width)
  placement?: "top" | "bottom"; // top for the bottom zone
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
      className={`flex items-center gap-2.5 rounded-xl text-sm text-left transition w-full min-w-0 overflow-hidden px-2 py-2 ${
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
      <span className={`flex-1 min-w-0 truncate transition-opacity duration-150 ${compact ? "opacity-0" : "opacity-100"}`}>{label}</span>
    </button>
  );

  if (children == null) return button();

  return (
    <Popover
      placement={placement}
      align={compact ? "start" : "stretch"}
      width={compact ? popoverWidth : undefined}
      className="w-full"
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

// User in the SideNav footer: avatar + name (+ detail) that opens a menu
// upwards with their stuff (theme, settings, sign out…). When compact, only
// the avatar; the menu unfolds to the right.
//   <SideNavUser name="Adrià Pulido" subtitle="adria@mail.com" items={[…]} />
// With `groups` the menu is split into titled blocks (e.g. "You are in" with
// the sites and their check, and "Account" below):
//   <SideNavUser name="…" groups={[{ title: "You are in", items: sites }, { title: "Account", items }]} />
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
  avatar?: string | ReactNode; // image URL or a node; nothing → initials
  items?: MenuItem[]; // simple menu (if there are no groups)
  menuTitle?: ReactNode;
  groups?: { title?: ReactNode; items: MenuItem[] }[]; // menu in blocks
  children?: ReactNode; // extra content at the end of the menu (anything)
}) {
  const compact = useSideNavCompact();
  const blocks = groups ?? [{ title: menuTitle, items }];
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
          className={`flex items-center gap-2.5 rounded-xl text-left transition w-full min-w-0 overflow-hidden px-2 py-2 ${
            open ? "bg-[var(--hover)]" : "hover:bg-[var(--hover)]"
          }`}
        >
          {av}
          <span className={`flex-1 min-w-0 flex items-center gap-2.5 transition-opacity duration-150 ${compact ? "opacity-0" : "opacity-100"}`} aria-hidden={compact || undefined}>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold truncate">{name}</span>
              {subtitle && <span className="block text-[11px] text-muted truncate">{subtitle}</span>}
            </span>
            <ChevronsUpDown size={14} className="text-muted shrink-0" />
          </span>
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
          {blocks.map((g, i) => (
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
