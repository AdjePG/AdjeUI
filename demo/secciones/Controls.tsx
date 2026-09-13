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
  ChoiceMark,
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

// ---------------- controls ----------------

export function ControlsSection() {
  const { toast } = useToast();
  const [seg, setSeg] = useState("todos");
  const [view, setView] = useState("grid");
  const [tab, setTab] = useState("a");
  const [on, setOn] = useState(true);
  const [unaSola, setUnaSola] = useState(0);
  const [varias, setVarias] = useState<number[]>([0]);
  const [tone, setTone] = useState<"in" | "out">("in");
  const [pick, setPick] = useState("a");
  const [year, setYear] = useState("2026");
  const [filterOn, setFilterOn] = useState(true);

  return (
    <Section id="controls" title="Controls" subtitle="src/controls — botones y toggles. Todos miden --control-h: nunca un botón más alto que un input">
      <Card className="flex flex-col gap-4">
        <Block name="Button: variant (primary, outline, ghost, danger) × size (sm, md, lg) + loading / disabled">
          <Button>Primario</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger"><Trash2 size={14} /> Danger</Button>
          <Button loading>Guardando…</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm"><Plus size={13} /> Small</Button>
          <Button size="lg"><Rocket size={16} /> Large</Button>
        </Block>
        <Block name="Button full (ocupa el ancho) / type=submit">
          <div className="w-full max-w-xs">
            <Button full variant="outline" onClick={() => toast("Botón a lo ancho.", "info")}>
              <Download size={14} /> Descargar todo
            </Button>
          </div>
        </Block>
        <Block name="IconButton: tone (neutral, accent, danger) × size (sm, md) + disabled">
          <IconButton label="Editar" onClick={() => {}}><Pencil size={14} /></IconButton>
          <IconButton label="Copiar" tone="accent" onClick={() => {}}><Copy size={14} /></IconButton>
          <IconButton label="Eliminar" tone="danger" onClick={() => {}}><Trash2 size={14} /></IconButton>
          <IconButton label="Pequeño" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
          <IconButton label="Deshabilitado" disabled onClick={() => {}}><Trash2 size={14} /></IconButton>
        </Block>
        <Block name="Segmented: con texto / solo iconos (title como tooltip)">
          <Segmented
            value={seg}
            onChange={setSeg}
            options={[
              { value: "todos", label: "Todos" },
              { value: "ideas", label: "Ideas" },
              { value: "pub", label: "Publicados" },
            ]}
          />
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "grid", icon: <Grid3X3 size={15} />, title: "Cuadrícula" },
              { value: "list", icon: <List size={15} />, title: "Lista" },
              { value: "chart", icon: <BarChart3 size={15} />, title: "Gráfico" },
            ]}
          />
        </Block>
        <Block name="Segmented: tamaños sm / md / lg (la misma escala que Button, Input y Select)">
          <Segmented
            size="sm"
            value={view}
            onChange={setView}
            options={[
              { value: "grid", icon: <Grid3X3 size={14} />, title: "Cuadrícula" },
              { value: "list", icon: <List size={14} />, title: "Lista" },
            ]}
          />
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "grid", icon: <Grid3X3 size={15} />, title: "Cuadrícula" },
              { value: "list", icon: <List size={15} />, title: "Lista" },
            ]}
          />
          <Segmented
            size="lg"
            value={view}
            onChange={setView}
            options={[
              { value: "grid", icon: <Grid3X3 size={16} />, title: "Cuadrícula" },
              { value: "list", icon: <List size={16} />, title: "Lista" },
            ]}
          />
          <Button size="sm">sm</Button>
          <Button>md</Button>
          <Button size="lg">lg</Button>
        </Block>
        <Block name="Segmented y Tabs que no caben: flechas en los extremos, nunca una barra de desplazamiento">
          <Frame className="w-full max-w-sm p-3">
            <div className="flex flex-col gap-3">
              <Segmented
                value={seg}
                onChange={setSeg}
                options={[
                  { value: "todos", label: "Todos" },
                  { value: "ideas", label: "Ideas" },
                  { value: "pub", label: "Publicados" },
                  { value: "borradores", label: "Borradores" },
                  { value: "archivados", label: "Archivados" },
                  { value: "papelera", label: "Papelera" },
                ]}
              />
              <Tabs
                value={tab}
                onChange={setTab}
                options={[
                  { value: "a", label: "Resumen" },
                  { value: "b", label: "Movimientos" },
                  { value: "c", label: "Presupuestos" },
                  { value: "d", label: "Categorías" },
                  { value: "e", label: "Informes" },
                ]}
              />
            </div>
          </Frame>
          <span className="text-[12px] text-muted">Estrecha la ventana: las flechas aparecen y desaparecen solas según haga falta.</span>
        </Block>
        <Block name="Tabs (subrayado degradado; para subpáginas)">
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "a", label: "Series", icon: <Layers size={14} /> },
              { value: "b", label: "Tipos", icon: <Package size={14} /> },
              { value: "c", label: "Sin icono" },
            ]}
          />
        </Block>
        <Block name="Toolbar: leading (fijo), items que colapsan a ···, active (interruptor) y pinned (siempre visible)">
          <Frame className="max-w-md p-2">
            <Toolbar
              leading={
                <Select
                  className="w-28"
                  value={year}
                  onChange={setYear}
                  options={[
                    { value: "2026", label: "2026" },
                    { value: "2025", label: "2025" },
                  ]}
                />
              }
              items={[
                { key: "exp", label: "Exportar", icon: <Download size={14} />, onClick: () => toast("Exportar", "info") },
                { key: "imp", label: "Importar", icon: <Upload size={14} />, onClick: () => toast("Importar", "info") },
                {
                  key: "filter",
                  label: "Solo activos",
                  icon: <Filter size={14} />,
                  active: filterOn,
                  onClick: () => setFilterOn((v) => !v),
                },
                { key: "dis", label: "Deshabilitado", icon: <Pencil size={14} />, disabled: true },
                { key: "new", label: "Añadir", icon: <Plus size={14} />, variant: "primary", pinned: true, onClick: () => toast("Añadir", "success") },
              ]}
            />
          </Frame>
          <span className="text-[12px] text-muted">Estrecha la ventana: los botones pasan al menú ··· y el anclado se queda solo con icono.</span>
        </Block>
        <Block name="Switch (con label, disabled)">
          <Switch checked={on} onChange={setOn} label="Activar" />
          <span className="text-sm">{on ? "Activado" : "Desactivado"}</span>
          <Switch checked={true} onChange={() => {}} disabled label="Deshabilitado" />
          <Switch checked={false} onChange={() => {}} disabled label="Deshabilitado" />
        </Block>
        <Block name="Switch: tamaños sm / md / lg">
          <Switch size="sm" checked={on} onChange={setOn} label="Pequeño" />
          <Switch size="md" checked={on} onChange={setOn} label="Mediano" />
          <Switch size="lg" checked={on} onChange={setOn} label="Grande" />
          <span className="text-[12px] text-muted">sm para filas densas · md por defecto · lg cuando manda en la pantalla</span>
        </Block>
        <Block name="ChoiceOption: el ÚNICO componente para elegir (sustituye a PickCard y ChoiceToggle)">
          <span className="text-[12px] text-muted">
            La forma de la marca dice cuántas puedes elegir: redonda = una sola, cuadrada = varias. Elegida se marca
            con borde en degradado y tic — y el tic sale una sola vez, nunca dos.
          </span>
        </Block>
        <Block name="Una sola (marca redonda) · varias (marca cuadrada)">
          <div className="flex w-full flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1.5" role="radiogroup">
              {["Barcelona", "Girona", "Lleida"].map((c, i) => (
                <ChoiceOption key={c} checked={unaSola === i} prefix={String.fromCharCode(65 + i)} onToggle={() => setUnaSola(i)}>
                  {c}
                </ChoiceOption>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              {["Correo", "SMS", "Push"].map((c, i) => (
                <ChoiceOption
                  key={c}
                  multiple
                  checked={varias.includes(i)}
                  onToggle={() => setVarias((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i]))}
                >
                  {c}
                </ChoiceOption>
              ))}
            </div>
          </div>
        </Block>
        <Block name="marca={false}: tarjeta con icono y tic a la derecha (era PickCard)">
          <div className="grid w-full gap-2 sm:grid-cols-3">
            <ChoiceOption marca={false} checked={pick === "a"} onToggle={() => setPick("a")} icon={<Sparkles size={15} />}>
              Kharismatics
            </ChoiceOption>
            <ChoiceOption marca={false} checked={pick === "b"} onToggle={() => setPick("b")} icon={<Package size={15} />}>
              Vehículos
            </ChoiceOption>
            <ChoiceOption marca={false} checked={pick === "c"} onToggle={() => setPick("c")}>
              Sin icono
            </ChoiceOption>
          </div>
        </Block>
        <Block name="tone + align=center: dos opciones con color semántico (era ChoiceToggle)">
          <div className="grid w-72 grid-cols-2 gap-2">
            <ChoiceOption
              marca={false}
              align="center"
              tone="positive"
              checked={tone === "in"}
              onToggle={() => setTone("in")}
              icon={<TrendingUp size={16} />}
            >
              Ingreso
            </ChoiceOption>
            <ChoiceOption
              marca={false}
              align="center"
              tone="negative"
              checked={tone === "out"}
              onToggle={() => setTone("out")}
              icon={<TrendingDown size={16} />}
            >
              Gasto
            </ChoiceOption>
          </div>
        </Block>
        <Block name="Tamaños sm / md / lg y deshabilitada">
          <div className="flex w-full flex-col gap-2 sm:w-80">
            <ChoiceOption size="sm" checked={on} onToggle={() => setOn(!on)}>
              Pequeña
            </ChoiceOption>
            <ChoiceOption checked={on} onToggle={() => setOn(!on)}>
              Mediana
            </ChoiceOption>
            <ChoiceOption size="lg" checked={on} onToggle={() => setOn(!on)}>
              Grande
            </ChoiceOption>
            <ChoiceOption checked={false} disabled onToggle={() => {}}>
              Deshabilitada
            </ChoiceOption>
          </div>
        </Block>
        <Block name="ChoiceMark: la marca suelta, para listas y tablas propias">
          <span className="inline-flex items-center gap-2 text-sm">
            <ChoiceMark checked={on} size="sm" /> sm
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <ChoiceMark checked={on} /> md
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <ChoiceMark checked={on} size="lg" /> lg
          </span>
          <span className="mx-2 h-4 w-px bg-[var(--border)]" />
          <span className="inline-flex items-center gap-2 text-sm">
            <ChoiceMark multiple checked={on} size="sm" /> sm
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <ChoiceMark multiple checked={on} /> md
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <ChoiceMark multiple checked={on} size="lg" /> lg
          </span>
        </Block>
      </Card>
    </Section>
  );
}
