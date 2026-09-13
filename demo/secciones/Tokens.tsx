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
import { Block, Frame, Section } from "../comunes";

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
      toast(`Copiado: ${text}`, "success");
    } catch {
      toast(text, "info");
    }
  }

  return (
    <Section
      id="tokens"
      title="Tokens"
      subtitle="theme.css — tokens de tema (cambian con claro/oscuro), alturas de control y la paleta fija de 15 colores × 10 tonos"
    >
      <Card className="flex flex-col gap-5">
        <Block name="Tokens de tema (haz clic para copiar la variable)">
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

        <Block name="Alturas de control: --control-h-sm 32 · --control-h 38 · --control-h-lg 46 (Button, Input y Select comparten talla)">
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

        <Block name="Paleta fija: 15 colores × 10 tonos (clic = copiar var(); el título muestra el hex)">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[640px] flex flex-col gap-1">
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
                      className="h-7 rounded-md border border-black/5 hover:scale-110 hover:z-10 transition"
                      style={{ background: palette(name, sh) }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[12px] text-muted w-full">
            En código: <code className="font-mono">palette("green", 600)</code> → <code className="font-mono">var(--c-green-600)</code>;{" "}
            <code className="font-mono">PALETTE.green[600]</code> → hex para SVG/canvas. Los tonos no cambian con el tema: usa 500–600 sobre
            fondo claro y 300–400 sobre fondo oscuro.
          </p>
        </Block>

        <Block name="Uso: Pills con la paleta">
          <Pill color={palette("green", 600)}>Publicado</Pill>
          <Pill color={palette("violet", 600)}>Diseñando</Pill>
          <Pill color={palette("rose", 600)}>Pausado</Pill>
          <Pill color={palette("amber", 600)}>Pendiente</Pill>
          <Pill color={palette("cyan", 600)}>Nuevo</Pill>
          <Pill color={palette("slate", 500)}>Archivado</Pill>
        </Block>
      </Card>
    </Section>
  );
}
