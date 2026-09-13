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
import { SITES, Block, Frame, Section } from "../comunes";

// ---------------- layout ----------------

export function LayoutSection() {
  const { toast } = useToast();
  const { cycleTheme, themeLabel, ThemeIcon } = useTheme("adjeui-demo-theme");
  const [headerTab, setHeaderTab] = useState("series");
  const [site, setSite] = useState("academia");
  const actual = SITES.find((s) => s.id === site)!;

  return (
    <Section id="layout" title="Layout" subtitle="src/layout — navegación de la app (SideNav), cabecera de página, títulos de sección y acordeones">
      <Card className="flex flex-col gap-4">
        <Block name="SideNav: tres zonas (top · menú · bottom), contraíble a solo iconos. El de la izquierda de esta página es el ejemplo real">
          <div className="grid md:grid-cols-[260px_1fr] gap-4 w-full items-start">
            {/* Piezas para las zonas top y bottom, sueltas para verlas de cerca */}
            <Frame className="p-3 flex flex-col gap-3 bg-[var(--secondary)]">
              <div>
                <span className="block text-[9.5px] font-semibold uppercase tracking-widest text-muted px-1 mb-1">top · Estás en</span>
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
                        <span className="block text-[13px] font-bold truncate">{actual.nombre}</span>
                        <span className="block text-[10px] uppercase tracking-wide text-muted truncate">{actual.detalle}</span>
                      </span>
                      <ChevronsUpDown size={14} className="text-muted shrink-0" />
                    </button>
                  )}
                >
                  {({ close }) => (
                    <Menu
                      title="Cambiar de sitio"
                      onPick={close}
                      items={SITES.map((s) => ({ label: s.nombre, hint: s.detalle, active: s.id === site, onClick: () => setSite(s.id) }))}
                    />
                  )}
                </Popover>
              </div>
              <div className="border-t border-dashed border-[var(--border)] pt-3 flex flex-col gap-1">
                <span className="block text-[9.5px] font-semibold uppercase tracking-widest text-muted px-1 mb-1">bottom · SideNavAction + SideNavUser</span>
                <SideNavAction icon={<Bell size={17} className="text-muted" />} label="Notificaciones" badge={3} placement="top">
                  <div className="p-3 text-[13px] text-muted">Cualquier contenido: avisos, filtros, ayuda…</div>
                </SideNavAction>
                <SideNavAction icon={<Settings size={17} className="text-muted" />} label="Acción directa (sin popover)" onClick={() => toast("Acción directa.", "info")} />
                <SideNavUser
                  name="Adrià Pulido"
                  subtitle="adria@correo.com"
                  menuTitle="Cuenta"
                  items={[
                    { label: `Tema: ${themeLabel}`, icon: <ThemeIcon size={16} />, onClick: cycleTheme },
                    { label: "Mis datos", icon: <Settings size={16} />, onClick: () => toast("Aquí iría el modal de datos.", "info") },
                    { label: "Salir", icon: <LogOut size={16} />, danger: true, onClick: () => toast("Sesión cerrada (demo).", "info") },
                  ]}
                />
              </div>
            </Frame>
            <div className="text-[13px] text-muted leading-relaxed flex flex-col gap-2">
              <p>
                <b className="text-[var(--foreground)]">top</b>: cualquier nodo (logo, selector de sitio, campanita). Lo habitual es <code className="font-mono">SideNavBrand</code> (icono + nombre enlazados, misma fila que los items y fundido al contraer). Si el contenido no se adapta solo, <code className="font-mono">topCompact</code> da la versión reducida. Compat: <code className="font-mono">logo</code> + <code className="font-mono">logoHref</code>.
              </p>
              <p>
                <b className="text-[var(--foreground)]">menú</b>: <code className="font-mono">items</code> con href/label/icon; el activo se marca por <code className="font-mono">activePath</code>. Hace scroll si no cabe.
              </p>
              <p>
                <b className="text-[var(--foreground)]">bottom</b>: lo que sea (el de esta página lleva notificaciones + usuario, y el selector de sitio va dentro del menú del usuario con <code className="font-mono">groups</code>). Piezas listas: <code className="font-mono">SideNavAction</code> (icono + etiqueta + badge, acción directa o popover: notificaciones, avisos…), <code className="font-mono">SideNavButton</code> y <code className="font-mono">SideNavUser</code> (avatar + nombre que abre un <code className="font-mono">Menu</code>). Todas se adaptan al modo compacto.
              </p>
              <p>
                <b className="text-[var(--foreground)]">Compacto</b>: el botón «Contraer» del pie deja el rail en 72px con solo iconos (tooltip con el nombre) y se recuerda en localStorage. <code className="font-mono">topCompact</code>/<code className="font-mono">bottomCompact</code> dan la versión reducida de las zonas si hace falta; <code className="font-mono">useSideNavCompact()</code> para contenido propio.
              </p>
              <p>
                <b className="text-[var(--foreground)]">Móvil (&lt; 768px)</b>: el SideNav se oculta a la izquierda y el PageHeader pinta ☰ automáticamente (sin provider, vía <code className="font-mono">sideNavState</code>). Se cierra al navegar, con la X, Escape o el fondo. Estrecha esta ventana para verlo.
              </p>
            </div>
          </div>
        </Block>

        <Block name="PageHeader con tabs (fila 2 pegada al borde) y actions">
          <Frame className="overflow-hidden [&>header]:!static [&>header]:!z-0">
            <PageHeader
              icon={<Layers size={17} />}
              title="Catálogo"
              tabs={{
                value: headerTab,
                onChange: setHeaderTab,
                options: [
                  { value: "series", label: "Series", icon: <Layers size={14} /> },
                  { value: "tipos", label: "Tipos", icon: <Package size={14} /> },
                  { value: "stats", label: "Estadísticas", icon: <BarChart3 size={14} /> },
                ],
              }}
              actions={
                <Toolbar
                  items={[
                    { key: "exp", label: "Exportar", icon: <Download size={14} /> },
                    { key: "new", label: "Nueva serie", icon: <Plus size={14} />, variant: "primary", pinned: true },
                  ]}
                />
              }
            />
            <div className="p-4 text-[13px] text-muted">Pestaña activa: {headerTab}. El PageHeader real es el fijo de arriba de esta página.</div>
          </Frame>
        </Block>

        <SectionTitle
          icon={<Layers size={14} />}
          title="SectionTitle"
          subtitle="Con chip, subtítulo, ayuda y acciones a la derecha"
          help={<p>El título estándar dentro de una Card.</p>}
          right={<Button size="sm" variant="outline"><Plus size={13} /> Acción</Button>}
        />
        <SectionTitle title="SectionTitle mínimo (solo título)" />

        <Collapsible title="Collapsible: ¿cómo se organiza AdjeUI?" icon={<Package size={14} />} defaultOpen>
          <p>
            Un componente por archivo en <b>src/</b>, agrupado por categoría: tokens, primitives, controls,
            forms, overlays, data y layout. El barrel <b>src/index.ts</b> lo exporta todo.
          </p>
        </Collapsible>
        <Collapsible title="Collapsible cerrado por defecto, sin icono">
          <p>Contenido plegado hasta que se abre.</p>
        </Collapsible>
      </Card>
    </Section>
  );
}
