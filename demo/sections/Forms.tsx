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
import { TEXT_TOOLS, RichText, RichTextEditor, richTextToPlain } from "../../rich-text";
import { Block, Frame, Section } from "../common";

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
    "<h2>Simple present</h2><p>We start with the <strong>simple present</strong> and continuous, which is where the mistakes pile up.</p><ul><li><p>Routines: <em>I work</em></p></li><li><p>Right now: <em>I am working</em></p></li></ul>"
  );

  function submit() {
    const ok = validate({
      name: rules.required()(name),
      desc: rules.maxLen(60)(desc),
      type: rules.required("Pick a type")(type),
      // Several rules per field: the first failing one is shown.
      slug: [rules.required()(slug), rules.minLen(3)(slug)],
      price: [rules.required()(price), rules.positive()(price === "" ? null : Number(price))],
      url: rules.url()(url),
    });
    if (!ok) {
      toast("Check the fields in red.", "warning");
      return;
    }
    toast("Valid form. ✔", "success");
    reset();
  }

  return (
    <Section
      id="forms"
      title="Forms"
      subtitle="src/forms — Field marks the error in red (message + border) automatically; Input/Select/Button share height, the date one too"
    >
      <Card className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name" required error={errors.name} help={<p>Required field: leave it empty and press Save to see the error.</p>}>
            <Input
              value={name}
              placeholder="Smiley"
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
            />
          </Field>
          <Field label="Type" required error={errors.type}>
            <Select
              value={type}
              onChange={(v) => {
                setType(v);
                clearError("type");
              }}
              placeholder="Pick…"
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
          <Field label="Price (positive)" required error={errors.price} right={<span className="text-[11px]">EUR</span>}>
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
        <Field label="URL (url: empty is valid)" error={errors.url}>
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
          label="Description (maxLen 60)"
          error={errors.desc}
          right={
            <span className={`text-[11px] ${desc.length > 60 ? "text-[var(--negative)]" : ""}`}>
              {desc.length}/60
            </span>
          }
        >
          <Textarea
            value={desc}
            placeholder="Type more than 60 characters to see the validation…"
            onChange={(e) => {
              setDesc(e.target.value);
              clearError("desc");
            }}
          />
        </Field>
        <Field label="ChipEditor (tags, max. 5 of 20 characters; Enter or comma adds, Backspace removes)">
          <ChipEditor values={tags} onChange={setTags} max={5} maxLen={20} placeholder="Add tag…" />
        </Field>
        <Block name="RichTextEditor (adje-shared-ui/rich-text): bounded WYSIWYG, stores HTML · RichText: sanitized viewer">
          <div className="grid lg:grid-cols-2 gap-3 w-full items-start">
            <Field label="Lesson theory" as="div" right={<span className="text-[11px]">{richTextToPlain(rich).length} characters</span>}>
              <RichTextEditor value={rich} onChange={setRich} placeholder="Write the theory…" />
            </Field>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted">This is how the reader sees it (RichText)</span>
              <Frame className="p-3 min-h-[178px]">
                <RichText html={rich} />
              </Frame>
            </div>
          </div>
          {/* variant="plain": no frame and the toolbar floats only while
              typing. It is the one for document-style editors, where a box per
              paragraph turns the page into a form. */}
          <div className="flex flex-col gap-1 w-full text-sm">
            <span className="text-muted">
              variant=&quot;plain&quot; (document-style editor: no frame, toolbar while typing) and without headings:
              tools without h2/h3, which here are provided by the Section block
            </span>
            <Frame className="p-3">
              <RichTextEditor
                variant="plain"
                tools={TEXT_TOOLS.filter((h) => h !== "h2" && h !== "h3")}
                value={rich}
                onChange={setRich}
                placeholder="Write the theory..."
              />
            </Frame>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Button size="sm" variant="outline" onClick={() => setRich("<p>Value loaded from outside (setContent without overwriting what you type).</p>")}>
              Change value from outside
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRich("")}>Clear</Button>
            <code className="text-[11px] font-mono text-muted truncate flex-1">{rich || '""'}</code>
          </div>
        </Block>
        <Block name="Sizes (size sm · md · lg): Input, native date, Select and Button measure the same at each size">
          <div className="flex flex-col gap-2 w-full">
            {(["sm", "md", "lg"] as const).map((s) => (
              <div key={s} className="flex items-center gap-2 w-full flex-wrap">
                <span className="w-7 text-[11px] font-mono text-muted">{s}</span>
                <div className="w-40"><Input size={s} placeholder="Text" /></div>
                <div className="w-40"><Input size={s} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                <Select size={s} className="w-40" value="" onChange={() => {}} placeholder="Select…" options={[{ value: "x", label: "Option" }]} />
                <Button size={s}><Calendar size={s === "lg" ? 16 : 14} /> Button</Button>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-muted w-full">Rule: an Input and the Button next to it wear the SAME size. Never a button taller or shorter than its input.</p>
        </Block>
        <Block name="Loose states: Input invalid / disabled / inputCls on a native element">
          <div className="w-40"><Input invalid placeholder="invalid" /></div>
          <div className="w-40"><Input disabled placeholder="disabled" /></div>
          <input className={`${inputCls} w-40`} placeholder="inputCls (native)" />
        </Block>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={reset}>Clear errors</Button>
          <Button onClick={submit}>Save (validates)</Button>
        </div>
      </Card>
    </Section>
  );
}
