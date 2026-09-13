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
} from "../src";
import { RichText, RichTextEditor, richTextToPlain } from "../rich-text";
import { SITES, Section } from "./comunes";
import { TokensSection } from "./secciones/Tokens";
import { PrimitivesSection } from "./secciones/Primitives";
import { ControlsSection } from "./secciones/Controls";
import { FormsSection } from "./secciones/Forms";
import { OverlaysSection } from "./secciones/Overlays";
import { DataSection } from "./secciones/Data";
import { LayoutSection } from "./secciones/Layout";

// Escaparate de AdjeUI: una sección por categoría, con ejemplos vivos de TODAS
// las props de cada componente. Arranca con `npm run demo` (puerto 4400).

const SECTIONS = [
  { id: "tokens", label: "Tokens", icon: <Palette size={18} /> },
  { id: "primitives", label: "Primitives", icon: <Boxes size={18} /> },
  { id: "controls", label: "Controls", icon: <MousePointerClick size={18} /> },
  { id: "forms", label: "Forms", icon: <FormInput size={18} /> },
  { id: "overlays", label: "Overlays", icon: <Layers size={18} /> },
  { id: "data", label: "Data", icon: <Table2 size={18} /> },
  { id: "layout", label: "Layout", icon: <LayoutTemplate size={18} /> },
];

export function App() {
  return (
    <ToastProvider>
      <Showcase />
    </ToastProvider>
  );
}

// La demo ES una app con el layout real: .principal = SideNav (tres zonas) +
// main con scroll. Estrecha la ventana por debajo de 768px: el SideNav se
// oculta y aparece la hamburguesa en el PageHeader.
function Showcase() {
  const { toast } = useToast();
  // useTheme: el mismo hook que usan las apps (sistema → claro → oscuro).
  const { cycleTheme, themeLabel, ThemeIcon } = useTheme("adjeui-demo-theme");
  const [active, setActive] = useState(() => (typeof location !== "undefined" && location.hash.slice(1)) || "tokens");
  const [site, setSite] = useState("academia");

  // La sección visible marca el item activo del menú.
  useEffect(() => {
    const main = document.getElementById("demo-main");
    if (!main) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { root: main, rootMargin: "-80px 0px -60% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="principal">
      <SideNav
        top={
          <SideNavBrand href="#tokens" title="AdjeUI" icon={<IconChip size="lg"><Sparkles size={16} /></IconChip>}>
            AdjeUI <Pill color={palette("violet", 600)}>v2</Pill>
          </SideNavBrand>
        }
        items={SECTIONS.map((s) => ({ href: `#${s.id}`, label: s.label, icon: s.icon }))}
        activePath={`#${active}`}
        bottom={
          <>
            <SideNavAction icon={<Bell size={17} className="text-muted" />} label="Notificaciones" badge={2} placement="top" popoverWidth={300}>
              {({ close }) => (
                <div className="p-1">
                  <span className="block text-[9.5px] font-semibold uppercase tracking-widest text-muted px-2.5 pt-1.5 pb-1">Notificaciones</span>
                  {["Nuevo componente: SideNavAction", "La paleta fija ya tiene 15 colores"].map((t) => (
                    <button key={t} type="button" onClick={close} className="w-full flex items-start gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-[var(--hover)]">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-[var(--accent-blue)]" />
                      <span className="flex-1">{t}</span>
                    </button>
                  ))}
                </div>
              )}
            </SideNavAction>
            <SideNavUser
              name="Adje"
              subtitle={SITES.find((s) => s.id === site)!.nombre}
              groups={[
                {
                  title: "Estás en",
                  items: SITES.map((s) => ({ key: s.id, label: s.nombre, hint: s.detalle, active: s.id === site, onClick: () => setSite(s.id) })),
                },
                {
                  title: "Cuenta",
                  items: [
                    { label: `Tema: ${themeLabel}`, icon: <ThemeIcon size={16} />, onClick: cycleTheme },
                    { label: "Repositorio", hint: "github.com/AdjePG/AdjeUI", icon: <ExternalLink size={16} />, onClick: () => window.open("https://github.com/AdjePG/AdjeUI", "_blank") },
                    { label: "Cerrar sesión", icon: <LogOut size={16} />, danger: true, onClick: () => toast("Aquí la app cerraría sesión.", "info") },
                  ],
                },
              ]}
            />
          </>
        }
      />

      <main id="demo-main" className="custom-scrollbar overflow-y-auto">
        <PageHeader
          icon={<Sparkles size={17} />}
          title="AdjeUI"
          actions={
            <Button variant="outline" size="sm" onClick={cycleTheme} title="Cambiar tema (useTheme)">
              <ThemeIcon size={14} /> {themeLabel}
            </Button>
          }
        />

        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-5 flex flex-col gap-8">
          <TokensSection />
          <PrimitivesSection />
          <ControlsSection />
          <FormsSection />
          <OverlaysSection />
          <DataSection />
          <LayoutSection />
        </div>
      </main>
    </div>
  );
}

// ---------------- tokens ----------------

