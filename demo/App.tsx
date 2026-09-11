import { useEffect, useState } from "react";
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

const SITES = [
  { id: "academia", nombre: "Academia Adrià", detalle: "tu academia" },
  { id: "aprendizaje", nombre: "Mi aprendizaje", detalle: "tus cursos como alumno" },
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

function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-3 scroll-mt-20">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-[13px] text-muted">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Block({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{name}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

// Marco punteado para ejemplos que necesitan un contenedor.
function Frame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full border border-dashed border-[var(--border)] rounded-xl ${className}`}>{children}</div>;
}

// ---------------- tokens ----------------

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

function TokensSection() {
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

// ---------------- primitives ----------------

function PrimitivesSection() {
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

// ---------------- controls ----------------

function ControlsSection() {
  const { toast } = useToast();
  const [seg, setSeg] = useState("todos");
  const [view, setView] = useState("grid");
  const [tab, setTab] = useState("a");
  const [on, setOn] = useState(true);
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
        <Block name="ChoiceToggle (2 opciones con tono; admite icon)">
          <div className="w-72">
            <ChoiceToggle
              value={tone}
              onChange={setTone}
              options={[
                { value: "in", label: "Ingreso", tone: "positive", icon: <TrendingUp size={16} /> },
                { value: "out", label: "Gasto", tone: "negative", icon: <TrendingDown size={16} /> },
              ]}
            />
          </div>
        </Block>
        <Block name="PickCard (seleccionable, con y sin icono)">
          <PickCard selected={pick === "a"} onClick={() => setPick("a")} icon={<Sparkles size={15} />} label="Kharismatics" />
          <PickCard selected={pick === "b"} onClick={() => setPick("b")} icon={<Package size={15} />} label="Vehículos" />
          <PickCard selected={pick === "c"} onClick={() => setPick("c")} label="Sin icono" />
        </Block>
      </Card>
    </Section>
  );
}

// ---------------- forms ----------------

function FormsSection() {
  const { toast } = useToast();
  const { errors, validate, clearError, reset } = useFormErrors();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [url, setUrl] = useState("");
  const [date, setDate] = useState("");
  const [tags, setTags] = useState<string[]>(["graphic tee", "funny gift"]);
  const [rich, setRich] = useState(
    "<h2>Presente simple</h2><p>Arrancamos por el <strong>presente simple</strong> y continuo, que es donde se concentran los errores.</p><ul><li><p>Rutinas: <em>I work</em></p></li><li><p>Ahora mismo: <em>I am working</em></p></li></ul>"
  );

  function submit() {
    const ok = validate({
      name: rules.required()(name),
      desc: rules.maxLen(60)(desc),
      type: rules.required("Elige un tipo")(type),
      // Varias reglas por campo: se muestra la primera que falla.
      slug: [rules.required()(slug), rules.minLen(3)(slug)],
      price: [rules.required()(price), rules.positive()(price === "" ? null : Number(price))],
      url: rules.url()(url),
    });
    if (!ok) {
      toast("Revisa los campos en rojo.", "warning");
      return;
    }
    toast("Formulario válido. ✔", "success");
    reset();
  }

  return (
    <Section
      id="forms"
      title="Forms"
      subtitle="src/forms — Field marca el error en rojo (mensaje + borde) automáticamente; Input/Select/Button comparten altura, también el de fecha"
    >
      <Card className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nombre" required error={errors.name} help={<p>Campo obligatorio: déjalo vacío y pulsa Guardar para ver el error.</p>}>
            <Input
              value={name}
              placeholder="Smiley"
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
            />
          </Field>
          <Field label="Tipo" required error={errors.type}>
            <Select
              value={type}
              onChange={(v) => {
                setType(v);
                clearError("type");
              }}
              placeholder="Elige…"
              options={[
                { value: "tee", label: "👕 T-shirt" },
                { value: "mug", label: "☕ Mug" },
                { value: "poster", label: "🖼️ Poster" },
              ]}
            />
          </Field>
          <Field label="Slug (required + minLen 3)" required error={errors.slug}>
            <Input
              value={slug}
              placeholder="ab"
              onChange={(e) => {
                setSlug(e.target.value);
                clearError("slug");
              }}
            />
          </Field>
          <Field label="Precio (positive)" required error={errors.price} right={<span className="text-[11px]">EUR</span>}>
            <Input
              type="number"
              value={price}
              placeholder="0"
              onChange={(e) => {
                setPrice(e.target.value);
                clearError("price");
              }}
            />
          </Field>
        </div>
        <Field label="URL (url: vacío es válido)" error={errors.url}>
          <Input
            value={url}
            placeholder="https://…"
            onChange={(e) => {
              setUrl(e.target.value);
              clearError("url");
            }}
          />
        </Field>
        <Field
          label="Descripción (maxLen 60)"
          error={errors.desc}
          right={
            <span className={`text-[11px] ${desc.length > 60 ? "text-[var(--negative)]" : ""}`}>
              {desc.length}/60
            </span>
          }
        >
          <Textarea
            value={desc}
            placeholder="Escribe más de 60 caracteres para ver la validación…"
            onChange={(e) => {
              setDesc(e.target.value);
              clearError("desc");
            }}
          />
        </Field>
        <Field label="ChipEditor (tags, máx. 5 de 20 caracteres; Enter o coma añade, Backspace quita)">
          <ChipEditor values={tags} onChange={setTags} max={5} maxLen={20} placeholder="Añadir tag…" />
        </Field>
        <Block name="RichTextEditor (adje-shared-ui/rich-text): WYSIWYG acotado, guarda HTML · RichText: visor sanitizado">
          <div className="grid lg:grid-cols-2 gap-3 w-full items-start">
            <Field label="Teoría de la lección" as="div" right={<span className="text-[11px]">{richTextToPlain(rich).length} caracteres</span>}>
              <RichTextEditor value={rich} onChange={setRich} placeholder="Escribe la teoría…" />
            </Field>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Así lo ve el lector (RichText)</span>
              <Frame className="p-3 min-h-[178px]">
                <RichText html={rich} />
              </Frame>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Button size="sm" variant="outline" onClick={() => setRich("<p>Valor cargado desde fuera (setContent sin pisar lo que escribes).</p>")}>
              Cambiar valor desde fuera
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRich("")}>Vaciar</Button>
            <code className="text-[11px] font-mono text-muted truncate flex-1">{rich || '""'}</code>
          </div>
        </Block>
        <Block name="Tallas (size sm · md · lg): Input, fecha nativa, Select y Button miden lo mismo en cada talla">
          <div className="flex flex-col gap-2 w-full">
            {(["sm", "md", "lg"] as const).map((s) => (
              <div key={s} className="flex items-center gap-2 w-full flex-wrap">
                <span className="w-7 text-[11px] font-mono text-muted">{s}</span>
                <div className="w-40"><Input size={s} placeholder="Texto" /></div>
                <div className="w-40"><Input size={s} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                <Select size={s} className="w-40" value="" onChange={() => {}} placeholder="Select…" options={[{ value: "x", label: "Opción" }]} />
                <Button size={s}><Calendar size={s === "lg" ? 16 : 14} /> Botón</Button>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-muted w-full">Regla: un Input y el Button de al lado llevan la MISMA talla. Nunca un botón más alto o más bajo que su input.</p>
        </Block>
        <Block name="Estados sueltos: Input invalid / disabled / inputCls en un elemento nativo">
          <div className="w-40"><Input invalid placeholder="invalid" /></div>
          <div className="w-40"><Input disabled placeholder="disabled" /></div>
          <input className={`${inputCls} w-40`} placeholder="inputCls (nativo)" />
        </Block>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={reset}>Limpiar errores</Button>
          <Button onClick={submit}>Guardar (valida)</Button>
        </div>
      </Card>
    </Section>
  );
}

// ---------------- overlays ----------------

function OverlaysSection() {
  const { toast } = useToast();
  const [modal, setModal] = useState(false);
  const [modalWide, setModalWide] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [drawerWide, setDrawerWide] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [confirmSoft, setConfirmSoft] = useState(false);
  const { errors, validate, clearError, reset } = useFormErrors();
  const [name, setName] = useState("");

  function openModal(wide: boolean) {
    setModalWide(wide);
    setModal(true);
  }
  function openDrawer(wide: boolean) {
    setDrawerWide(wide);
    setDrawer(true);
  }

  function saveModal() {
    if (!validate({ name: rules.required()(name) })) return;
    toast(`"${name}" creado.`, "success");
    setModal(false);
    setName("");
    reset();
  }

  return (
    <Section
      id="overlays"
      title="Overlays"
      subtitle="src/overlays — Modal y Drawer con zona de acciones propia (footer), ConfirmDialog, HelpTip y toasts"
    >
      <Card className="flex flex-col gap-4">
        <Block name="Modal (normal / wide) · Drawer (normal / wide)">
          <Button onClick={() => openModal(false)}>Abrir Modal</Button>
          <Button variant="outline" onClick={() => openModal(true)}>Modal wide</Button>
          <Button onClick={() => openDrawer(false)}>Abrir Drawer</Button>
          <Button variant="outline" onClick={() => openDrawer(true)}>Drawer wide</Button>
        </Block>
        <Block name="ConfirmDialog (danger / neutro con cancelLabel)">
          <Button variant="danger" onClick={() => setConfirm(true)}>Eliminar algo…</Button>
          <Button variant="outline" onClick={() => setConfirmSoft(true)}>Publicar…</Button>
        </Block>
        <Block name="Toast: success · error · warning · info">
          <Button size="sm" variant="outline" onClick={() => toast("Guardado correctamente.", "success")}>success</Button>
          <Button size="sm" variant="outline" onClick={() => toast("No se pudo guardar.", "error")}>error</Button>
          <Button size="sm" variant="outline" onClick={() => toast("Revisa los campos.", "warning")}>warning</Button>
          <Button size="sm" variant="outline" onClick={() => toast("Un toast informativo.", "info")}>info</Button>
        </Block>
        <Block name="Popover + Menu (clic fuera / Escape cierra; placement top|bottom; align start|end|stretch)">
          <Popover
            align="start"
            width={240}
            trigger={({ open, toggle }) => (
              <Button variant="outline" onClick={toggle} className={open ? "!bg-[var(--hover)]" : ""}>
                <Settings size={14} /> Menú de acciones <ChevronsUpDown size={13} />
              </Button>
            )}
          >
            {({ close }) => (
              <Menu
                title="Acciones"
                onPick={close}
                items={[
                  { label: "Editar", icon: <Pencil size={15} />, onClick: () => toast("Editar", "info") },
                  { label: "Duplicar", hint: "Copia sin alumnos", icon: <Copy size={15} />, onClick: () => toast("Duplicar", "info") },
                  { label: "Activo", icon: <Filter size={15} />, active: true },
                  { label: "Eliminar", icon: <Trash2 size={15} />, danger: true, onClick: () => toast("Eliminar", "warning") },
                ]}
              />
            )}
          </Popover>
          <Popover
            placement="top"
            align="end"
            width={260}
            trigger={({ toggle }) => (
              <Button variant="ghost" onClick={toggle}>
                <Bell size={14} /> Contenido libre (arriba)
              </Button>
            )}
          >
            <div className="p-3 text-[13px]">
              <b>Cualquier contenido.</b>
              <p className="text-muted mt-1">Un Popover no tiene que ser un Menu: campanita de avisos, selector de sitio, filtros…</p>
            </div>
          </Popover>
        </Block>
        <Block name="HelpTip (hover/focus, formato con p/ul/b, nunca se sale de pantalla)">
          <span className="text-sm text-muted inline-flex items-center gap-1">
            Ayuda contextual <HelpTip label="HelpTip"><p>Un tooltip con <b>formato</b>.</p><ul><li>Solo hover</li><li>Nunca se sale de pantalla</li></ul></HelpTip>
          </span>
          <span className="text-sm text-muted inline-flex items-center gap-1 ml-auto">
            Pegado al borde derecho <HelpTip><p>Se recorta al viewport en vez de salirse.</p></HelpTip>
          </span>
        </Block>
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={modalWide ? "Modal wide" : "Nuevo diseño"}
        wide={modalWide}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={saveModal}>Crear</Button>
          </>
        }
      >
        <Field label="Nombre" required error={errors.name}>
          <Input
            value={name}
            placeholder="Déjalo vacío y pulsa Crear…"
            onChange={(e) => {
              setName(e.target.value);
              clearError("name");
            }}
            autoFocus
          />
        </Field>
        {modalWide && (
          <p className="text-[13px] text-muted mt-3">
            La variante <b>wide</b> da más ancho para formularios a dos columnas o tablas.
          </p>
        )}
      </Modal>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={drawerWide ? "Editor (wide)" : "Editor"}
        icon={<Pencil size={14} />}
        wide={drawerWide}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawer(false)}>Cancelar</Button>
            <Button onClick={() => { toast("Guardado.", "success"); setDrawer(false); }}>Guardar cambios</Button>
          </>
        }
      >
        <p className="text-[13px] text-muted leading-relaxed">
          El contenido hace scroll; la zona de acciones de abajo queda siempre visible.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => toast("Eliminado.", "info")}
        title="¿Eliminar el elemento?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
      />
      <ConfirmDialog
        open={confirmSoft}
        onClose={() => setConfirmSoft(false)}
        onConfirm={() => toast("Publicado.", "success")}
        title="¿Publicar ahora?"
        message={<>Se publicará en <b>Etsy</b> con los datos actuales.</>}
        confirmLabel="Publicar"
        cancelLabel="Todavía no"
      />
    </Section>
  );
}

// ---------------- data ----------------

function DataSection() {
  const [page, setPage] = useState(1);
  return (
    <Section id="data" title="Data" subtitle="src/data — indicadores, tabla, progreso y paginación">
      <Card className="flex flex-col gap-4">
        <Block name="Stat: tone (neutral, positive, negative, accent) + icon / hint / help">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <Stat label="Productos" value={57} icon={<Package size={14} />} />
            <Stat label="Publicados" value={12} tone="positive" hint="2 pausados" />
            <Stat label="Margen medio" value="44%" tone="accent" help={<p>Beneficio / precio de venta.</p>} />
            <Stat label="Pérdidas" value={2} tone="negative" icon={<Wallet size={14} />} hint="Este mes" />
          </div>
        </Block>
        <Block name="Table (scroll horizontal si no cabe; th/td sin clases)">
          <div className="w-full">
            <Table minWidth={520}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Estado</th>
                  <th>Tags</th>
                  <th className="!text-right">Precio</th>
                  <th className="!text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2D Smiley</td>
                  <td><Pill color={palette("green", 600)}>Publicado</Pill></td>
                  <td className="text-muted">graphic tee, funny</td>
                  <td className="text-right font-semibold">24,99 $</td>
                  <td className="text-right">
                    <IconButton label="Editar" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
                    <IconButton label="Eliminar" size="sm" tone="danger" onClick={() => {}}><Trash2 size={13} /></IconButton>
                  </td>
                </tr>
                <tr>
                  <td>Vespa Mug</td>
                  <td><Pill>Idea</Pill></td>
                  <td className="text-muted">vespa, retro</td>
                  <td className="text-right font-semibold">14,99 $</td>
                  <td className="text-right">
                    <IconButton label="Editar" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
                    <IconButton label="Eliminar" size="sm" tone="danger" onClick={() => {}}><Trash2 size={13} /></IconButton>
                  </td>
                </tr>
                <tr>
                  <td>Poster Kharis</td>
                  <td><Pill color={palette("amber", 600)}>Pendiente</Pill></td>
                  <td className="text-muted">wall art</td>
                  <td className="text-right font-semibold">19,99 $</td>
                  <td className="text-right">
                    <IconButton label="Editar" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
                    <IconButton label="Eliminar" size="sm" tone="danger" onClick={() => {}}><Trash2 size={13} /></IconButton>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Block>
        <Block name="ProgressBar: tone (accent, positive, negative) + max">
          <div className="w-full flex flex-col gap-2">
            <ProgressBar value={72} />
            <ProgressBar value={100} tone="positive" />
            <ProgressBar value={31} tone="negative" />
            <div className="flex items-center gap-2">
              <div className="flex-1"><ProgressBar value={3} max={8} /></div>
              <span className="text-[12px] text-muted shrink-0">3 de 8 (max)</span>
            </div>
          </div>
        </Block>
        <Block name="Pagination (page, pageCount, total, noun)">
          <div className="w-full">
            <Pagination page={page} pageCount={5} total={102} onPage={setPage} noun="productos" />
          </div>
        </Block>
      </Card>
    </Section>
  );
}

// ---------------- layout ----------------

function LayoutSection() {
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
