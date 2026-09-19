import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Calendar,
  ChevronsUpDown,
  Copy,
  Download,
  Filter,
  FormInput,
  ExternalLink,
  Grid3X3,
  Layers,
  LayoutTemplate,
  List,
  LogOut,
  MousePointerClick,
  Package,
  Palette,
  Pencil,
  Plus,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Table2,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  Wallet,
} from "lucide-react";
import {
  Menu,
  Popover,
  SideNavAction,
  SideNavBrand,
  SideNavUser,
  Button,
  Card,
  ChipEditor,
  Collapsible,
  ConfirmDialog,
  Drawer,
  Empty,
  Field,
  HelpTip,
  IconButton,
  IconChip,
  Input,
  Modal,
  PALETTE,
  PALETTE_NAMES,
  PALETTE_SHADES,
  PageHeader,
  Pagination,
  Pill,
  ProgressBar,
  SectionTitle,
  Segmented,
  Select,
  SideNav,
  SideNavButton,
  Skeleton,
  Stat,
  Switch,
  ChoiceOption,
  ScrollArrows,
  useShortcuts,
  Table,
  Tabs,
  Textarea,
  ToastProvider,
  Toolbar,
  inputCls,
  palette,
  rules,
  useFormErrors,
  useTheme,
  useToast,
} from "../../src";
import { RichText, RichTextEditor, richTextToPlain } from "../../rich-text";
import { SITES, Block, Frame, Section } from "../common";

// ---------------- layout ----------------

export function LayoutSection() {
  const { toast } = useToast();
  const { cycleTheme, themeLabel, ThemeIcon } = useTheme("adjeui-demo-theme");
  const [headerTab, setHeaderTab] = useState("series");
  const [site, setSite] = useState("academy");
  const current = SITES.find((s) => s.id === site)!;

  return (
    <Section id="layout" title="Layout" subtitle="src/layout — app navigation (SideNav), page header, section titles and accordions">
      <Card className="flex flex-col gap-4">
        <Block name="SideNav: three zones (top · menu · bottom), collapsible to icons only. The one on the left of this page is the real example">
          <div className="grid md:grid-cols-[260px_1fr] gap-4 w-full items-start">
            {/* Pieces for the top and bottom zones, on their own to see them up close */}
            <Frame className="p-3 flex flex-col gap-3 bg-[var(--secondary)]">
              <div>
                <span className="block text-[9.5px] font-semibold uppercase tracking-widest text-muted px-1 mb-1">top · You are in</span>
                <Popover
                  trigger={({ open, toggle }) => (
                    <button
                      type="button"
                      onClick={toggle}
                      aria-expanded={open}
                      className="w-full flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 text-left hover:border-[var(--accent-blue)] transition"
                    >
                      <IconChip><BookOpen size={14} /></IconChip>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-bold truncate">{current.name}</span>
                        <span className="block text-[10px] uppercase tracking-wide text-muted truncate">{current.detail}</span>
                      </span>
                      <ChevronsUpDown size={14} className="text-muted shrink-0" />
                    </button>
                  )}
                >
                  {({ close }) => (
                    <Menu
                      title="Switch site"
                      onPick={close}
                      items={SITES.map((s) => ({ label: s.name, hint: s.detail, active: s.id === site, onClick: () => setSite(s.id) }))}
                    />
                  )}
                </Popover>
              </div>
              <div className="border-t border-dashed border-[var(--border)] pt-3 flex flex-col gap-1">
                <span className="block text-[9.5px] font-semibold uppercase tracking-widest text-muted px-1 mb-1">bottom · SideNavAction + SideNavUser</span>
                <SideNavAction icon={<Bell size={17} className="text-muted" />} label="Notifications" badge={3} placement="top">
                  <div className="p-3 text-[13px] text-muted">Any content: notices, filters, help…</div>
                </SideNavAction>
                <SideNavAction icon={<Settings size={17} className="text-muted" />} label="Direct action (no popover)" onClick={() => toast("Direct action.", "info")} />
                <SideNavUser
                  name="Adrià Pulido"
                  subtitle="adria@mail.com"
                  menuTitle="Account"
                  items={[
                    { label: `Theme: ${themeLabel}`, icon: <ThemeIcon size={16} />, onClick: cycleTheme },
                    { label: "My details", icon: <Settings size={16} />, onClick: () => toast("The details modal would go here.", "info") },
                    { label: "Sign out", icon: <LogOut size={16} />, danger: true, onClick: () => toast("Signed out (demo).", "info") },
                  ]}
                />
              </div>
            </Frame>
            <div className="text-[13px] text-muted leading-relaxed flex flex-col gap-2">
              <p>
                <b className="text-[var(--foreground)]">top</b>: any node (logo, site switcher, bell). The usual one is <code className="font-mono">SideNavBrand</code> (icon + name linked, same row as the items and faded when collapsed). If the content does not adapt on its own, <code className="font-mono">topCompact</code> gives the reduced version. Compat: <code className="font-mono">logo</code> + <code className="font-mono">logoHref</code>.
              </p>
              <p>
                <b className="text-[var(--foreground)]">menu</b>: <code className="font-mono">items</code> with href/label/icon; the active one is set by <code className="font-mono">activePath</code>. It scrolls if it does not fit.
              </p>
              <p>
                <b className="text-[var(--foreground)]">bottom</b>: anything (the one on this page has notifications + user, and the site switcher lives inside the user menu via <code className="font-mono">groups</code>). Ready-made pieces: <code className="font-mono">SideNavAction</code> (icon + label + badge, direct action or popover: notifications, notices…), <code className="font-mono">SideNavButton</code> and <code className="font-mono">SideNavUser</code> (avatar + name that opens a <code className="font-mono">Menu</code>). All of them adapt to compact mode.
              </p>
              <p>
                <b className="text-[var(--foreground)]">Compact</b>: the "Collapse" button in the footer leaves the rail at 72px with icons only (tooltip with the name) and it is remembered in localStorage. <code className="font-mono">topCompact</code>/<code className="font-mono">bottomCompact</code> give the reduced version of the zones if needed; <code className="font-mono">useSideNavCompact()</code> for your own content.
              </p>
              <p>
                <b className="text-[var(--foreground)]">Mobile (&lt; 768px)</b>: the SideNav hides to the left and the PageHeader draws ☰ automatically (no provider, via <code className="font-mono">sideNavState</code>). It closes on navigation, with the X, Escape or the backdrop. Narrow this window to see it.
              </p>
            </div>
          </div>
        </Block>

        <Block name="PageHeader with tabs (row 2 flush with the edge) and actions">
          <Frame className="overflow-hidden [&>header]:!static [&>header]:!z-0">
            <PageHeader
              icon={<Layers size={17} />}
              title="Catalog"
              tabs={{
                value: headerTab,
                onChange: setHeaderTab,
                options: [
                  { value: "series", label: "Series", icon: <Layers size={14} /> },
                  { value: "types", label: "Types", icon: <Package size={14} /> },
                  { value: "stats", label: "Statistics", icon: <BarChart3 size={14} /> },
                ],
              }}
              actions={
                <Toolbar
                  items={[
                    { key: "exp", label: "Export", icon: <Download size={14} /> },
                    { key: "new", label: "New series", icon: <Plus size={14} />, variant: "primary", pinned: true },
                  ]}
                />
              }
            />
            <div className="p-4 text-[13px] text-muted">Active tab: {headerTab}. The real PageHeader is the fixed one at the top of this page.</div>
          </Frame>
        </Block>

        <SectionTitle
          icon={<Layers size={14} />}
          title="SectionTitle"
          subtitle="With chip, subtitle, help and actions on the right"
          help={<p>The standard title inside a Card.</p>}
          right={<Button size="sm" variant="outline"><Plus size={13} /> Action</Button>}
        />
        <SectionTitle title="Minimal SectionTitle (title only)" />

        <Collapsible title="Collapsible: how is AdjeUI organized?" icon={<Package size={14} />} defaultOpen>
          <p>
            One component per file in <b>src/</b>, grouped by category: tokens, primitives, controls,
            forms, overlays, data and layout. The <b>src/index.ts</b> barrel exports everything.
          </p>
        </Collapsible>
        <Collapsible title="Collapsible closed by default, no icon">
          <p>Content folded until opened.</p>
        </Collapsible>
      </Card>
    </Section>
  );
}
