"use client";

// The app's navigation bar, in THREE zones:
//   top     → logo or whatever matters most (site picker, notification bell…)
//   menu    → the navigation items (scrolls if they don't fit)
//   bottom  → anything: usually the user (SideNavUser) and their stuff
//
// Desktop (≥ md): 232px rail on the left (.app-shell layout), which can be
// COLLAPSED to icons only (73px); the preference is remembered. Every row is
// 48px (px-2 py-2 around a 32px icon slot) with the same 12px rail padding,
// so the icon does not move when collapsing; labels fade out. When compact,
// top/bottom show `topCompact` / `bottomCompact` if given.
// Mobile (< md): off-canvas on the left, opened with the hamburger PageHeader
// draws when a SideNav is mounted; closed on navigation, X, Escape or backdrop.
//
//   <SideNav
//     top={<SideNavBrand icon={<IconChip…/>} href="/">Solaula</SideNavBrand>}
//     items={[{ href, label, icon }]}
//     activePath={usePathname()}
//     LinkComponent={Link}                       // next/link
//     bottom={<SideNavUser name="Adrià" items={[…]} />}
//   />
import { ElementType, ReactNode, useEffect, type ComponentPropsWithoutRef } from "react";
import { ChevronsLeft, ChevronsRight, ChevronsUpDown, X } from "lucide-react";
import { sideNavState, useIsMobile, useSideNavCompact, useSideNavState } from "./sideNavState";
import { Popover } from "../overlays/Popover";
import { Menu, type MenuItem } from "../overlays/Menu";
import { IconButton } from "../controls/IconButton";
import { Avatar } from "../primitives/Avatar";
import { useEscape } from "../internal/layers";
import type { LinkLike } from "../internal/link";

/** Whether `href` is `path` or one of its parents, on segment boundaries ("/course" is not active on "/courses"). */
function matches(path: string, href: string): boolean {
  if (path === href) return true;
  if (href === "/") return false;
  return path.startsWith(href.endsWith("/") ? href : `${href}/`);
}

// The rail row every zone shares: a 32px icon slot and a label that fades out
// when the rail is compact.
function RailRow<C extends ElementType = "button">({
  as,
  icon,
  label,
  compact,
  active = false,
  className = "",
  ...rest
}: {
  as?: C;
  icon: ReactNode;
  label: ReactNode;
  compact: boolean;
  /** Hover fill kept on (open popover, current item). */
  active?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<C>, "as" | "className" | "children">) {
  const Tag: ElementType = as ?? "button";
  return (
    <Tag
      {...(Tag === "button" ? { type: "button" } : null)}
      {...rest}
      className={`flex items-center gap-2.5 rounded-xl text-left transition w-full min-w-0 overflow-hidden px-2 py-2 ${
        active ? "bg-[var(--hover)]" : "hover:bg-[var(--hover)]"
      } ${className}`}
    >
      {icon}
      <span className={`flex-1 min-w-0 truncate transition-opacity duration-150 ${compact ? "opacity-0" : "opacity-100"}`} aria-hidden={compact || undefined}>
        {label}
      </span>
    </Tag>
  );
}

const ICON_SLOT = "relative inline-flex items-center justify-center w-8 h-8 shrink-0";

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
  /** Free top zone (not a link); normally SideNavBrand. */
  top?: ReactNode;
  /** Top zone in compact mode (otherwise `top` is shown). */
  topCompact?: ReactNode;
  /** @deprecated Use `top={<SideNavBrand …/>}`. Logo linked to `logoHref` when there is no `top`. */
  logo?: ReactNode;
  /** @deprecated Use `top={<SideNavBrand href=…/>}`. */
  logoHref?: string;
  items: { href: string; label: string; icon: ReactNode }[];
  /** Current path (`usePathname()`): the most specific matching item is active. */
  activePath: string;
  /** Link component for the items (next/link). Default: "a". */
  LinkComponent?: LinkLike;
  /** Bottom zone: SideNavAction, SideNavUser… */
  bottom?: ReactNode;
  /** Bottom zone in compact mode (by default `bottom` is reused: its rows adapt). */
  bottomCompact?: ReactNode;
  /** Collapse/expand button on desktop. */
  collapsible?: boolean;
  /** @deprecated Put a SideNavAction in `bottom`. Appended to the bottom zone. */
  mobileAction?: { label: string; icon: ReactNode; onClick: () => void };
  /** Extra elements hanging off the nav. */
  children?: ReactNode;
}) {
  const A: LinkLike = LinkComponent ?? "a";
  const { open, collapsed, moving } = useSideNavState();
  const compact = useSideNavCompact();
  const mobile = useIsMobile();

  // Only ONE item is active: the most specific one the path is inside.
  const activeHref = items
    .map((item) => item.href)
    .filter((href) => matches(activePath, href))
    .sort((a, b) => b.length - a.length)[0];

  useEffect(() => {
    sideNavState.mount();
    return () => sideNavState.unmount();
  }, []);

  // Leaving the mobile size closes the panel, without a slide.
  useEffect(() => {
    if (!mobile) sideNavState.closeNow();
  }, [mobile]);

  useEscape(sideNavState.close, open);

  const logoNode = logo && (
    <A href={logoHref} className="flex items-center gap-2 px-2 py-2 select-none min-w-0 overflow-hidden" onClick={sideNavState.close}>
      {logo}
    </A>
  );
  const topNode = compact ? (topCompact ?? top ?? logoNode) : (top ?? logoNode);
  // Content only "jumps" when swapping top/topCompact: that's where it fades.
  const topKey = topCompact !== undefined ? (compact ? "c" : "f") : "top";

  return (
    <>
      <nav
        className="sidenav h-full flex flex-col bg-[var(--secondary)] border-r border-[var(--border)] px-3 py-4 gap-3"
        data-open={open || undefined}
        data-moving={moving || undefined}
        data-collapsed={collapsed || undefined}
        aria-label="Main navigation"
      >
        {(topNode || !compact) && (
          <div key={topKey} className={`flex items-start gap-2 shrink-0 ${topCompact !== undefined ? "drawer-fade" : ""}`}>
            <div className="min-w-0 flex-1">{topNode}</div>
            <IconButton label="Close menu" onClick={sideNavState.close} className="md:hidden">
              <X size={18} />
            </IconButton>
          </div>
        )}

        {/* No reserved gutter: the rows line up with the other zones. */}
        <ul className="flex-1 min-h-0 custom-scrollbar scroll-no-gutter flex flex-col gap-1 list-none m-0 p-0">
          {items.map((item) => {
            const active = item.href === activeHref;
            return (
              <li key={item.href}>
                <RailRow
                  as={A}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={compact ? item.label : undefined}
                  onClick={sideNavState.close}
                  compact={compact}
                  active={active}
                  className={`text-sm ${active ? "font-semibold" : ""}`}
                  icon={<span className={`${ICON_SLOT} rounded-lg transition ${active ? "bg-app-gradient text-white blue-shadow" : ""}`}>{item.icon}</span>}
                  label={item.label}
                />
              </li>
            );
          })}
        </ul>

        {collapsible && (
          <RailRow
            onClick={sideNavState.toggleCollapsed}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            title={collapsed ? "Expand menu" : "Collapse menu"}
            aria-pressed={collapsed}
            compact={compact}
            className="max-md:hidden text-muted hover:text-[var(--foreground)] text-[12px]"
            icon={<span className={ICON_SLOT}>{collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}</span>}
            label="Collapse"
          />
        )}

        {(bottom || mobileAction) && (
          <div className="flex flex-col gap-1 shrink-0 pt-3 border-t border-[var(--border)]">
            {compact && bottomCompact !== undefined ? bottomCompact : bottom}
            {mobileAction && <SideNavAction onClick={mobileAction.onClick} icon={mobileAction.icon} label={mobileAction.label} />}
          </div>
        )}

        {children}
      </nav>
      {open && <div className="sidenav-backdrop md:hidden" onClick={sideNavState.close} aria-hidden />}
    </>
  );
}

// App brand for the top zone: icon (usually an IconChip) + name, linked to
// the home page; the name fades out when compact.
//   <SideNavBrand icon={<IconChip size="lg"><Sparkles size={16} /></IconChip>} href="/panel" LinkComponent={Link}>
//     Solaula
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
  /** Tooltip when compact (when children is not plain text). */
  title?: string;
}) {
  const A: LinkLike = LinkComponent ?? "a";
  const compact = useSideNavCompact();
  const tip = title ?? (typeof children === "string" ? children : undefined);
  return (
    <RailRow
      as={A}
      href={href}
      title={compact ? tip : undefined}
      onClick={sideNavState.close}
      compact={compact}
      className="select-none"
      icon={<span className={ICON_SLOT}>{icon}</span>}
      label={<span className="flex items-center gap-2 font-bold text-lg">{children}</span>}
    />
  );
}

/**
 * Text button for the SideNav (icon + label); icon-only with a tooltip when compact.
 * @deprecated Use SideNavAction.
 */
export function SideNavButton({
  onClick,
  icon,
  children,
  title,
}: {
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
  /** Tooltip when compact (when children is not plain text). */
  title?: string;
}) {
  const compact = useSideNavCompact();
  const tip = title ?? (typeof children === "string" ? children : undefined);
  return (
    <RailRow
      onClick={onClick}
      title={compact ? tip : undefined}
      aria-label={compact ? tip : undefined}
      compact={compact}
      className="text-sm"
      icon={<span className={ICON_SLOT}>{icon}</span>}
      label={children}
    />
  );
}

// Action for the top/bottom zones: icon + label (+ badge) that does something
// on click or opens a popover with anything (notifications, filters…).
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
  /** Counter or dot; nothing, 0, "" or false → not drawn. */
  badge?: ReactNode;
  /** Direct action (when there is no popover). */
  onClick?: () => void;
  /** Popover content. */
  children?: ReactNode | ((p: { close: () => void }) => ReactNode);
  /** Panel width when compact (when full it takes the rail width). */
  popoverWidth?: number;
  /** "top" for the bottom zone. */
  placement?: "top" | "bottom";
  active?: boolean;
}) {
  const compact = useSideNavCompact();
  const showBadge = badge != null && badge !== 0 && badge !== false && badge !== "";

  const row = (open?: boolean, toggle?: () => void) => (
    <RailRow
      onClick={toggle ?? onClick}
      aria-expanded={toggle ? open : undefined}
      title={compact ? label : undefined}
      aria-label={compact ? label : undefined}
      compact={compact}
      active={open || active}
      className="text-sm"
      icon={
        <span className={ICON_SLOT}>
          {icon}
          {showBadge && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[var(--negative)] text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {badge}
            </span>
          )}
        </span>
      }
      label={label}
    />
  );

  if (children == null) return row();

  return (
    <Popover
      placement={placement}
      align={compact ? "start" : "stretch"}
      width={compact ? popoverWidth : undefined}
      className="w-full"
      trigger={({ open, toggle }) => row(open, toggle)}
    >
      {children}
    </Popover>
  );
}

function NameBlock({ name, subtitle }: { name: string; subtitle?: ReactNode }) {
  return (
    <>
      <span className="block text-sm font-semibold truncate">{name}</span>
      {subtitle && <span className="block text-[11px] text-muted truncate">{subtitle}</span>}
    </>
  );
}

// User in the SideNav footer: avatar + name (+ detail) that opens a menu
// upwards (theme, settings, sign out…). When compact, only the avatar.
//   <SideNavUser name="Adrià Pulido" subtitle="adria@mail.com" items={[…]} />
// With `groups` the menu is split into titled blocks:
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
  /** Image URL or a node; nothing → initials on the app gradient. */
  avatar?: string | ReactNode;
  /** Simple menu (when there are no groups). */
  items?: MenuItem[];
  menuTitle?: ReactNode;
  /** Menu in titled blocks. */
  groups?: { title?: ReactNode; items: MenuItem[] }[];
  /** Extra content at the end of the menu. */
  children?: ReactNode;
}) {
  const compact = useSideNavCompact();
  const blocks = groups ?? [{ title: menuTitle, items }];
  const face =
    !avatar || typeof avatar === "string" ? (
      <Avatar name={name} src={typeof avatar === "string" ? avatar : undefined} decorative />
    ) : (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0 overflow-hidden">{avatar}</span>
    );

  return (
    <Popover
      placement="top"
      align={compact ? "start" : "stretch"}
      width={compact ? 240 : undefined}
      trigger={({ open, toggle }) => (
        <RailRow
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          title={compact ? name : undefined}
          compact={compact}
          active={open}
          icon={face}
          label={
            <span className="flex items-center gap-2.5">
              <span className="flex-1 min-w-0">
                <NameBlock name={name} subtitle={subtitle} />
              </span>
              <ChevronsUpDown size={14} className="text-muted shrink-0" />
            </span>
          }
        />
      )}
    >
      {({ close }) => (
        <>
          {compact && (
            <div className="px-3 pt-2.5 pb-1 border-b border-[var(--border)]">
              <NameBlock name={name} subtitle={subtitle} />
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
