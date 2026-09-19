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
import { Block, Frame, Section } from "../common";

// ---------------- controls ----------------

export function ControlsSection() {
  const { toast } = useToast();
  const [seg, setSeg] = useState("all");
  const [view, setView] = useState("grid");
  const [tab, setTab] = useState("a");
  const [on, setOn] = useState(true);
  const [single, setSingle] = useState(0);
  const [multi, setMulti] = useState<number[]>([0]);
  const [tone, setTone] = useState<"in" | "out">("in");
  const [pick, setPick] = useState("a");
  const [year, setYear] = useState("2026");
  const [filterOn, setFilterOn] = useState(true);

  return (
    <Section id="controls" title="Controls" subtitle="src/controls — buttons and toggles. All measure --control-h: never a button taller than an input">
      <Card className="flex flex-col gap-4">
        <Block name="Button: variant (primary, outline, ghost, danger) × size (sm, md, lg) + loading / disabled">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger"><Trash2 size={14} /> Danger</Button>
          <Button loading>Saving…</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm"><Plus size={13} /> Small</Button>
          <Button size="lg"><Rocket size={16} /> Large</Button>
        </Block>
        <Block name="Button full (takes the full width) / type=submit">
          <div className="w-full max-w-xs">
            <Button full variant="outline" onClick={() => toast("Full-width button.", "info")}>
              <Download size={14} /> Download all
            </Button>
          </div>
        </Block>
        <Block name="IconButton: tone (neutral, accent, danger) × size (sm, md) + disabled">
          <IconButton label="Edit" onClick={() => {}}><Pencil size={14} /></IconButton>
          <IconButton label="Copy" tone="accent" onClick={() => {}}><Copy size={14} /></IconButton>
          <IconButton label="Delete" tone="danger" onClick={() => {}}><Trash2 size={14} /></IconButton>
          <IconButton label="Small" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
          <IconButton label="Disabled" disabled onClick={() => {}}><Trash2 size={14} /></IconButton>
        </Block>
        <Block name="Segmented: with text / icons only (title as tooltip)">
          <Segmented
            value={seg}
            onChange={setSeg}
            options={[
              { value: "all", label: "All" },
              { value: "ideas", label: "Ideas" },
              { value: "pub", label: "Published" },
            ]}
          />
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "grid", icon: <Grid3X3 size={15} />, title: "Grid" },
              { value: "list", icon: <List size={15} />, title: "List" },
              { value: "chart", icon: <BarChart3 size={15} />, title: "Chart" },
            ]}
          />
        </Block>
        <Block name="Segmented: sizes sm / md / lg (the same scale as Button, Input and Select)">
          <Segmented
            size="sm"
            value={view}
            onChange={setView}
            options={[
              { value: "grid", icon: <Grid3X3 size={14} />, title: "Grid" },
              { value: "list", icon: <List size={14} />, title: "List" },
            ]}
          />
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "grid", icon: <Grid3X3 size={15} />, title: "Grid" },
              { value: "list", icon: <List size={15} />, title: "List" },
            ]}
          />
          <Segmented
            size="lg"
            value={view}
            onChange={setView}
            options={[
              { value: "grid", icon: <Grid3X3 size={16} />, title: "Grid" },
              { value: "list", icon: <List size={16} />, title: "List" },
            ]}
          />
          <Button size="sm">sm</Button>
          <Button>md</Button>
          <Button size="lg">lg</Button>
        </Block>
        <Block name="Segmented and Tabs that do not fit: arrows at the ends, never a scrollbar">
          <Frame className="w-full max-w-sm p-3">
            <div className="flex flex-col gap-3">
              <Segmented
                value={seg}
                onChange={setSeg}
                options={[
                  { value: "all", label: "All" },
                  { value: "ideas", label: "Ideas" },
                  { value: "pub", label: "Published" },
                  { value: "drafts", label: "Drafts" },
                  { value: "archived", label: "Archived" },
                  { value: "trash", label: "Trash" },
                ]}
              />
              <Tabs
                value={tab}
                onChange={setTab}
                options={[
                  { value: "a", label: "Summary" },
                  { value: "b", label: "Transactions" },
                  { value: "c", label: "Budgets" },
                  { value: "d", label: "Categories" },
                  { value: "e", label: "Reports" },
                ]}
              />
            </div>
          </Frame>
          <span className="text-[12px] text-muted">Narrow the window: the arrows appear and disappear on their own as needed.</span>
        </Block>
        <Block name="Tabs (gradient underline; for subpages)">
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "a", label: "Series", icon: <Layers size={14} /> },
              { value: "b", label: "Types", icon: <Package size={14} /> },
              { value: "c", label: "No icon" },
            ]}
          />
        </Block>
        <Block name="Toolbar: leading (fixed), items that collapse into ···, active (toggle) and pinned (always visible)">
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
                { key: "exp", label: "Export", icon: <Download size={14} />, onClick: () => toast("Export", "info") },
                { key: "imp", label: "Import", icon: <Upload size={14} />, onClick: () => toast("Import", "info") },
                {
                  key: "filter",
                  label: "Active only",
                  icon: <Filter size={14} />,
                  active: filterOn,
                  onClick: () => setFilterOn((v) => !v),
                },
                { key: "dis", label: "Disabled", icon: <Pencil size={14} />, disabled: true },
                { key: "new", label: "Add", icon: <Plus size={14} />, variant: "primary", pinned: true, onClick: () => toast("Add", "success") },
              ]}
            />
          </Frame>
          <span className="text-[12px] text-muted">Narrow the window: the buttons move into the ··· menu and the pinned one keeps only its icon.</span>
        </Block>
        <Block name="Switch (with label, disabled)">
          <Switch checked={on} onChange={setOn} label="Enable" />
          <span className="text-sm">{on ? "Enabled" : "Disabled"}</span>
          <Switch checked={true} onChange={() => {}} disabled label="Disabled" />
          <Switch checked={false} onChange={() => {}} disabled label="Disabled" />
        </Block>
        <Block name="Switch: sizes sm / md / lg">
          <Switch size="sm" checked={on} onChange={setOn} label="Small" />
          <Switch size="md" checked={on} onChange={setOn} label="Medium" />
          <Switch size="lg" checked={on} onChange={setOn} label="Large" />
          <span className="text-[12px] text-muted">sm for dense rows · md by default · lg when it rules the screen</span>
        </Block>
        <Block name="ChoiceOption: the ONLY component for choosing (replaces PickCard and ChoiceToggle)">
          <span className="text-[12px] text-muted">
            The shape of the mark tells how many you can choose: round = one, square = several. Chosen is marked
            with a gradient border and a tick — and the tick appears once, never twice.
          </span>
        </Block>
        <Block name="Single (round mark) · multiple (square mark)">
          <div className="flex w-full flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1.5" role="radiogroup">
              {["Barcelona", "Girona", "Lleida"].map((c, i) => (
                <ChoiceOption key={c} checked={single === i} prefix={String.fromCharCode(65 + i)} onToggle={() => setSingle(i)}>
                  {c}
                </ChoiceOption>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              {["Email", "SMS", "Push"].map((c, i) => (
                <ChoiceOption
                  key={c}
                  multiple
                  checked={multi.includes(i)}
                  onToggle={() => setMulti((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i]))}
                >
                  {c}
                </ChoiceOption>
              ))}
            </div>
          </div>
        </Block>
        <Block name="mark={false}: card with icon and tick on the right (was PickCard)">
          <div className="grid w-full gap-2 sm:grid-cols-3">
            <ChoiceOption mark={false} checked={pick === "a"} onToggle={() => setPick("a")} icon={<Sparkles size={15} />}>
              Kharismatics
            </ChoiceOption>
            <ChoiceOption mark={false} checked={pick === "b"} onToggle={() => setPick("b")} icon={<Package size={15} />}>
              Vehicles
            </ChoiceOption>
            <ChoiceOption mark={false} checked={pick === "c"} onToggle={() => setPick("c")}>
              No icon
            </ChoiceOption>
          </div>
        </Block>
        <Block name="tone + align=center: two options with semantic color (was ChoiceToggle)">
          <div className="grid w-72 grid-cols-2 gap-2">
            <ChoiceOption
              mark={false}
              align="center"
              tone="positive"
              checked={tone === "in"}
              onToggle={() => setTone("in")}
              icon={<TrendingUp size={16} />}
            >
              Income
            </ChoiceOption>
            <ChoiceOption
              mark={false}
              align="center"
              tone="negative"
              checked={tone === "out"}
              onToggle={() => setTone("out")}
              icon={<TrendingDown size={16} />}
            >
              Expense
            </ChoiceOption>
          </div>
        </Block>
        <Block name="Sizes sm / md / lg and disabled">
          <div className="flex w-full flex-col gap-2 sm:w-80">
            <ChoiceOption size="sm" checked={on} onToggle={() => setOn(!on)}>
              Small
            </ChoiceOption>
            <ChoiceOption checked={on} onToggle={() => setOn(!on)}>
              Medium
            </ChoiceOption>
            <ChoiceOption size="lg" checked={on} onToggle={() => setOn(!on)}>
              Large
            </ChoiceOption>
            <ChoiceOption checked={false} disabled onToggle={() => {}}>
              Disabled
            </ChoiceOption>
          </div>
        </Block>
        <Block name="ChoiceMark: the standalone mark, for your own lists and tables">
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
