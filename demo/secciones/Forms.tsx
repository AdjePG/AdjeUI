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

// ---------------- forms ----------------

export function FormsSection() {
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
          {/* variante="plano": sin marco y con la barra flotando solo al
              escribir. Es la de los editores tipo documento, donde una caja por
              parrafo convierte la pagina en un formulario. */}
          <div className="flex flex-col gap-1 w-full text-sm">
            <span className="text-muted">variante=&quot;plano&quot; (editor tipo documento: sin marco, barra al escribir)</span>
            <Frame className="p-3">
              <RichTextEditor variante="plano" value={rich} onChange={setRich} placeholder="Escribe la teoria..." />
            </Frame>
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
