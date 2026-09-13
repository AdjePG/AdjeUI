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
  ChoiceToggle,
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
  PickCard,
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
  Radio,
  Checkbox,
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

// ---------------- primitives ----------------

export function PrimitivesSection() {
  return (
    <Section id="primitives" title="Primitives" subtitle="src/primitives — superficies y piezas básicas">
      <Card className="flex flex-col gap-4">
        <Block name="Card (glow) / IconChip (md, lg)">
          <Card className="!p-3 text-[13px]">Una Card dentro de otra</Card>
          <Card glow className="!p-3 text-[13px]">Card con glow</Card>
          <IconChip><Sparkles size={15} /></IconChip>
          <IconChip size="lg"><Package size={17} /></IconChip>
        </Block>
        <Block name="Pill (neutra / con color)">
          <Pill>Neutra</Pill>
          <Pill color={palette("green", 600)}>Publicado</Pill>
          <Pill color={palette("violet", 600)}>Diseñando</Pill>
          <Pill color={palette("red", 600)}>Pausado</Pill>
          <Pill color="var(--accent-blue)"><Sparkles size={11} /> Con icono</Pill>
        </Block>
        <Block name="Skeleton (la forma la da className)">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-16 w-full" />
        </Block>
        <Block name="Empty (con y sin icono)">
          <Frame className="flex-1">
            <Empty icon={<Search />} title="Sin resultados">Prueba con otros filtros.</Empty>
          </Frame>
          <Frame className="flex-1">
            <Empty title="Todavía no hay nada" />
          </Frame>
        </Block>
      </Card>
    </Section>
  );
}
