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
import { Block, Frame, Section } from "../common";

const THEME_TOKENS = [
  "background",
  "foreground",
  "primary",
  "secondary",
  "tertiary",
  "card",
  "border",
  "muted",
  "hover",
  "positive",
  "negative",
  "warning",
  "accent-blue",
  "accent-pink",
];

export function TokensSection() {
  const { toast } = useToast();

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast(`Copied: ${text}`, "success");
    } catch {
      toast(text, "info");
    }
  }

  return (
    <Section
      id="tokens"
      title="Tokens"
      subtitle="theme.css — theme tokens (change with light/dark), control heights and the fixed palette of 15 colors × 10 shades"
    >
      <Card className="flex flex-col gap-5">
        <Block name="Theme tokens (click to copy the variable)">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 w-full">
            {THEME_TOKENS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => copy(`var(--${t})`)}
                className="flex flex-col items-start gap-1 rounded-xl border border-[var(--border)] p-2 text-left hover:bg-[var(--hover)] transition"
              >
                <span className="w-full h-8 rounded-lg border border-[var(--border)]" style={{ background: `var(--${t})` }} />
                <span className="text-[11px] font-mono truncate max-w-full">--{t}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => copy("var(--app-gradient)")}
              className="flex flex-col items-start gap-1 rounded-xl border border-[var(--border)] p-2 text-left hover:bg-[var(--hover)] transition"
            >
              <span className="w-full h-8 rounded-lg" style={{ background: "var(--app-gradient)" }} />
              <span className="text-[11px] font-mono truncate max-w-full">--app-gradient</span>
            </button>
          </div>
        </Block>

        <Block name="Control heights: --control-h-sm 32 · --control-h 38 · --control-h-lg 46 (Button, Input and Select share the size)">
          <div className="flex items-end gap-3 flex-wrap">
            {(["sm", "md", "lg"] as const).map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-28">
                    <Input size={s} placeholder={`Input ${s}`} />
                  </div>
                  <Button size={s} variant="outline">
                    {s}
                  </Button>
                </div>
                <span className="text-[11px] font-mono text-muted">{s === "md" ? "--control-h" : `--control-h-${s}`}</span>
              </div>
            ))}
          </div>
        </Block>

        <Block name="Fixed palette: 15 colors × 10 shades (click = copy var(); the tooltip shows the hex)">
          {/* code-scroll and not custom-scrollbar (26 Sep 2026): that one is the
              vertical panels' bar, and here it drew a vertical scrollbar over
              the last column. The hover is a ring, not a scale: a swatch
              growing 10% pushed past the edge and cut the column off. */}
          <div className="w-full overflow-x-auto overflow-y-hidden code-scroll">
            <div className="min-w-[640px] flex flex-col gap-1 p-1">
              <div className="grid gap-1" style={{ gridTemplateColumns: "72px repeat(10, minmax(0, 1fr))" }}>
                <span />
                {PALETTE_SHADES.map((sh) => (
                  <span key={sh} className="text-[10px] font-mono text-muted text-center">
                    {sh}
                  </span>
                ))}
              </div>
              {PALETTE_NAMES.map((name) => (
                <div key={name} className="grid gap-1 items-center" style={{ gridTemplateColumns: "72px repeat(10, minmax(0, 1fr))" }}>
                  <span className="text-[11px] font-mono text-muted">{name}</span>
                  {PALETTE_SHADES.map((sh) => (
                    <button
                      key={sh}
                      type="button"
                      title={`--c-${name}-${sh} · ${PALETTE[name][sh]}`}
                      onClick={() => copy(palette(name, sh))}
                      className="h-7 rounded-md border border-black/5 transition hover:ring-2 hover:ring-[var(--foreground)] hover:ring-offset-2 hover:ring-offset-[var(--card)]"
                      style={{ background: palette(name, sh) }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[12px] text-muted w-full">
            In code: <code className="font-mono">palette("green", 600)</code> → <code className="font-mono">var(--c-green-600)</code>;{" "}
            <code className="font-mono">PALETTE.green[600]</code> → hex for SVG/canvas. Shades do not change with the theme: use 500–600 on a
            light background and 300–400 on a dark one.
          </p>
        </Block>

        <Block name="Usage: Pills with the palette">
          <Pill color={palette("green", 600)}>Published</Pill>
          <Pill color={palette("violet", 600)}>Designing</Pill>
          <Pill color={palette("rose", 600)}>Paused</Pill>
          <Pill color={palette("amber", 600)}>Pending</Pill>
          <Pill color={palette("cyan", 600)}>New</Pill>
          <Pill color={palette("slate", 500)}>Archived</Pill>
        </Block>
      </Card>
    </Section>
  );
}
