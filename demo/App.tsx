import { useState } from "react";
import {
  Calendar,
  Copy,
  Layers,
  Moon,
  Package,
  Pencil,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";
import {
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
  PageHeader,
  Pagination,
  PickCard,
  Pill,
  ProgressBar,
  SectionTitle,
  Segmented,
  Select,
  Skeleton,
  Stat,
  Switch,
  Table,
  Tabs,
  Textarea,
  ToastProvider,
  Toolbar,
  rules,
  useFormErrors,
  useToast,
} from "../src";

// Escaparate de AdjeUI: una sección por categoría, con ejemplos vivos.
// Arranca con `npm run demo` (puerto 4400).

const SECTIONS = [
  { id: "primitives", label: "Primitives" },
  { id: "controls", label: "Controls" },
  { id: "forms", label: "Forms" },
  { id: "overlays", label: "Overlays" },
  { id: "data", label: "Data" },
  { id: "layout", label: "Layout" },
];

export function App() {
  return (
    <ToastProvider>
      <Showcase />
    </ToastProvider>
  );
}

function Showcase() {
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        icon={<Sparkles size={17} />}
        title="AdjeUI"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted hidden sm:block">
              Design system de MisFinanzas y Adje Store
            </span>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {dark ? <Sun size={14} /> : <Moon size={14} />} Tema
            </Button>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-5 flex flex-col gap-8">
        {/* Índice */}
        <div className="flex flex-wrap gap-1.5">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[12px] font-semibold rounded-full border border-[var(--border)] px-2.5 py-1 hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] transition"
            >
              {s.label}
            </a>
          ))}
        </div>

        <PrimitivesSection />
        <ControlsSection />
        <FormsSection />
        <OverlaysSection />
        <DataSection />
        <LayoutSection />
      </div>
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

// ---------------- primitives ----------------

function PrimitivesSection() {
  return (
    <Section id="primitives" title="Primitives" subtitle="src/primitives — superficies y piezas básicas">
      <Card className="flex flex-col gap-4">
        <Block name="Card / IconChip">
          <Card className="!p-3 text-[13px]">Una Card dentro de otra</Card>
          <Card glow className="!p-3 text-[13px]">Card con glow</Card>
          <IconChip><Sparkles size={15} /></IconChip>
          <IconChip size="lg"><Package size={17} /></IconChip>
        </Block>
        <Block name="Pill">
          <Pill>Neutra</Pill>
          <Pill color="#16a34a">Publicado</Pill>
          <Pill color="#8b5cf6">Diseñando</Pill>
          <Pill color="#dc2626">Pausado</Pill>
        </Block>
        <Block name="Skeleton">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="h-9 w-44" />
        </Block>
        <Block name="Empty">
          <div className="w-full border border-dashed border-[var(--border)] rounded-xl">
            <Empty icon={<Search />} title="Sin resultados">Prueba con otros filtros.</Empty>
          </div>
        </Block>
      </Card>
    </Section>
  );
}

// ---------------- controls ----------------

function ControlsSection() {
  const [seg, setSeg] = useState("todos");
  const [tab, setTab] = useState("a");
  const [on, setOn] = useState(true);
  const [tone, setTone] = useState<"in" | "out">("in");
  const [pick, setPick] = useState("a");

  return (
    <Section id="controls" title="Controls" subtitle="src/controls — botones y toggles. Todos miden --control-h: nunca un botón más alto que un input">
      <Card className="flex flex-col gap-4">
        <Block name="Button (variant × size)">
          <Button>Primario</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger"><Trash2 size={14} /> Danger</Button>
          <Button loading>Guardando…</Button>
          <Button size="sm"><Plus size={13} /> Small</Button>
          <Button size="lg"><Rocket size={16} /> Large</Button>
        </Block>
        <Block name="IconButton">
          <IconButton label="Editar" onClick={() => {}}><Pencil size={14} /></IconButton>
          <IconButton label="Copiar" tone="accent" onClick={() => {}}><Copy size={14} /></IconButton>
          <IconButton label="Eliminar" tone="danger" onClick={() => {}}><Trash2 size={14} /></IconButton>
          <IconButton label="Pequeño" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
        </Block>
        <Block name="Segmented / Tabs">
          <Segmented
            value={seg}
            onChange={setSeg}
            options={[
              { value: "todos", label: "Todos" },
              { value: "ideas", label: "Ideas" },
              { value: "pub", label: "Publicados" },
            ]}
          />
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "a", label: "Series", icon: <Layers size={14} /> },
              { value: "b", label: "Tipos", icon: <Package size={14} /> },
            ]}
          />
        </Block>
        <Block name="Toolbar (colapsa a ··· cuando no cabe)">
          <div className="w-full max-w-md border border-dashed border-[var(--border)] rounded-xl p-2">
            <Toolbar
              items={[
                { key: "a", label: "Exportar", icon: <Copy size={14} /> },
                { key: "b", label: "Importar", icon: <Plus size={14} /> },
                { key: "c", label: "Otra acción", icon: <Pencil size={14} /> },
                { key: "new", label: "Añadir", icon: <Plus size={14} />, variant: "primary", pinned: true },
              ]}
            />
          </div>
        </Block>
        <Block name="Switch / ChoiceToggle / PickCard">
          <Switch checked={on} onChange={setOn} label="Activar" />
          <div className="w-64">
            <ChoiceToggle
              value={tone}
              onChange={setTone}
              options={[
                { value: "in", label: "Ingreso", tone: "positive" },
                { value: "out", label: "Gasto", tone: "negative" },
              ]}
            />
          </div>
          <PickCard selected={pick === "a"} onClick={() => setPick("a")} icon={<Sparkles size={15} />} label="Kharismatics" />
          <PickCard selected={pick === "b"} onClick={() => setPick("b")} icon={<Package size={15} />} label="Vehículos" />
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
  const [date, setDate] = useState("");
  const [tags, setTags] = useState<string[]>(["graphic tee", "funny gift"]);

  function submit() {
    const ok = validate({
      name: rules.required()(name),
      desc: rules.maxLen(60)(desc),
      type: rules.required("Elige un tipo")(type),
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
              ]}
            />
          </Field>
        </div>
        <Field label="Descripción (máx. 60)" error={errors.desc}>
          <Textarea
            value={desc}
            placeholder="Escribe más de 60 caracteres para ver la validación…"
            onChange={(e) => {
              setDesc(e.target.value);
              clearError("desc");
            }}
          />
        </Field>
        <Field label="ChipEditor (tags, máx. 5 de 20 caracteres)">
          <ChipEditor values={tags} onChange={setTags} max={5} maxLen={20} placeholder="Añadir tag…" />
        </Field>
        <Block name="Alturas iguales: Input + fecha nativa + Select + Button">
          <div className="flex items-center gap-2 w-full flex-wrap">
            <div className="w-40"><Input placeholder="Texto" /></div>
            <div className="w-40"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <Select className="w-40" value="" onChange={() => {}} placeholder="Select…" options={[{ value: "x", label: "Opción" }]} />
            <Button><Calendar size={14} /> Botón</Button>
          </div>
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
  const [drawer, setDrawer] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const { errors, validate, clearError, reset } = useFormErrors();
  const [name, setName] = useState("");

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
        <Block name="Modal / Drawer / ConfirmDialog / Toast / HelpTip">
          <Button onClick={() => setModal(true)}>Abrir Modal</Button>
          <Button variant="outline" onClick={() => setDrawer(true)}>Abrir Drawer</Button>
          <Button variant="danger" onClick={() => setConfirm(true)}>Eliminar algo…</Button>
          <Button variant="ghost" onClick={() => toast("Un toast de ejemplo.", "info")}>Toast</Button>
          <span className="text-sm text-muted inline-flex items-center gap-1">
            Ayuda contextual <HelpTip label="HelpTip"><p>Un tooltip con <b>formato</b>.</p><ul><li>Solo hover</li><li>Nunca se sale de pantalla</li></ul></HelpTip>
          </span>
        </Block>
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Nuevo diseño"
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
      </Modal>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Editor"
        icon={<Pencil size={14} />}
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
    </Section>
  );
}

// ---------------- data ----------------

function DataSection() {
  const [page, setPage] = useState(1);
  return (
    <Section id="data" title="Data" subtitle="src/data — indicadores, progreso y paginación">
      <Card className="flex flex-col gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Productos" value={57} icon={<Package size={14} />} />
          <Stat label="Publicados" value={12} tone="positive" hint="2 pausados" />
          <Stat label="Margen medio" value="44%" tone="accent" help={<p>Beneficio / precio de venta.</p>} />
          <Stat label="Pérdidas" value={2} tone="negative" />
        </div>
        <Block name="Table">
          <div className="w-full">
            <Table minWidth={400}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Estado</th>
                  <th className="!text-right">Precio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2D Smiley</td>
                  <td><Pill color="#16a34a">Publicado</Pill></td>
                  <td className="text-right font-semibold">24,99 $</td>
                </tr>
                <tr>
                  <td>Vespa Mug</td>
                  <td><Pill>Idea</Pill></td>
                  <td className="text-right font-semibold">14,99 $</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Block>
        <Block name="ProgressBar">
          <div className="w-full flex flex-col gap-2">
            <ProgressBar value={72} />
            <ProgressBar value={100} tone="positive" />
            <ProgressBar value={31} tone="negative" />
          </div>
        </Block>
        <Pagination page={page} pageCount={5} total={102} onPage={setPage} noun="productos" />
      </Card>
    </Section>
  );
}

// ---------------- layout ----------------

function LayoutSection() {
  return (
    <Section id="layout" title="Layout" subtitle="src/layout — cabecera de página, títulos de sección y acordeones">
      <Card className="flex flex-col gap-4">
        <SectionTitle
          icon={<Layers size={14} />}
          title="SectionTitle"
          subtitle="Con chip, subtítulo, ayuda y acciones a la derecha"
          help={<p>El título estándar dentro de una Card.</p>}
          right={<Button size="sm" variant="outline"><Plus size={13} /> Acción</Button>}
        />
        <Collapsible title="Collapsible: ¿cómo se organiza AdjeUI?" icon={<Package size={14} />} defaultOpen>
          <p>
            Un componente por archivo en <b>src/</b>, agrupado por categoría: primitives, controls,
            forms, overlays, data y layout. El barrel <b>src/index.ts</b> lo exporta todo.
          </p>
        </Collapsible>
        <p className="text-[12px] text-muted">
          El PageHeader es la cabecera fija de arriba de esta misma página.
        </p>
      </Card>
    </Section>
  );
}
