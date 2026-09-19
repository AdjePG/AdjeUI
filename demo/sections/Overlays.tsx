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
import { Block, Frame, Section } from "../common";

// ---------------- overlays ----------------

// Menu with dividers and key combinations. The menu only DRAWS the
// shortcut; what makes it work is useShortcuts, up here — that is why the
// shortcuts work even with the menu closed (try it without opening it).
function ShortcutsMenuBlock() {
  const { toast } = useToast();
  const items = useMemo(
    () => [
      { label: "Edit", icon: <Pencil size={15} />, shortcut: "mod+e", onClick: () => toast("Edit", "info") },
      { label: "Duplicate", icon: <Copy size={15} />, shortcut: "mod+d", onClick: () => toast("Duplicate", "info") },
      { separator: true as const },
      { label: "Filter", icon: <Filter size={15} />, onClick: () => toast("Filter", "info") },
      { separator: true as const },
      { label: "Delete", icon: <Trash2 size={15} />, danger: true, shortcut: "mod+shift+backspace", onClick: () => toast("Delete", "warning") },
    ],
    [toast],
  );
  useShortcuts(items);

  return (
    <Block name="Menu: separators + keyboard shortcuts (useShortcuts wires them up, even with the menu closed)">
      <Popover
        align="start"
        width={260}
        trigger={({ open, toggle }) => (
          <Button variant="outline" onClick={toggle} className={open ? "!bg-[var(--hover)]" : ""}>
            <Settings size={14} /> With shortcuts <ChevronsUpDown size={13} />
          </Button>
        )}
      >
        {({ close }) => <Menu title="Actions" onPick={close} items={items} />}
      </Popover>
      <span className="text-[12px] text-muted">Try Ctrl/⌘+E or Ctrl/⌘+D without opening the menu.</span>
    </Block>
  );
}

export function OverlaysSection() {
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
    toast(`"${name}" created.`, "success");
    setModal(false);
    setName("");
    reset();
  }

  return (
    <Section
      id="overlays"
      title="Overlays"
      subtitle="src/overlays — Modal and Drawer with their own action zone (footer), ConfirmDialog, HelpTip and toasts"
    >
      <Card className="flex flex-col gap-4">
        <Block name="Modal (normal / wide) · Drawer (normal / wide)">
          <Button onClick={() => openModal(false)}>Open Modal</Button>
          <Button variant="outline" onClick={() => openModal(true)}>Modal wide</Button>
          <Button onClick={() => openDrawer(false)}>Open Drawer</Button>
          <Button variant="outline" onClick={() => openDrawer(true)}>Drawer wide</Button>
        </Block>
        <Block name="ConfirmDialog (danger / neutral with cancelLabel)">
          <Button variant="danger" onClick={() => setConfirm(true)}>Delete something…</Button>
          <Button variant="outline" onClick={() => setConfirmSoft(true)}>Publish…</Button>
        </Block>
        <Block name="Toast: success · error · warning · info">
          <Button size="sm" variant="outline" onClick={() => toast("Saved successfully.", "success")}>success</Button>
          <Button size="sm" variant="outline" onClick={() => toast("Could not save.", "error")}>error</Button>
          <Button size="sm" variant="outline" onClick={() => toast("Check the fields.", "warning")}>warning</Button>
          <Button size="sm" variant="outline" onClick={() => toast("An informational toast.", "info")}>info</Button>
        </Block>
        <Block name="Popover + Menu (click outside / Escape closes; placement top|bottom; align start|end|stretch)">
          <Popover
            align="start"
            width={240}
            trigger={({ open, toggle }) => (
              <Button variant="outline" onClick={toggle} className={open ? "!bg-[var(--hover)]" : ""}>
                <Settings size={14} /> Actions menu <ChevronsUpDown size={13} />
              </Button>
            )}
          >
            {({ close }) => (
              <Menu
                title="Actions"
                onPick={close}
                items={[
                  { label: "Edit", icon: <Pencil size={15} />, onClick: () => toast("Edit", "info") },
                  { label: "Duplicate", hint: "Copy without students", icon: <Copy size={15} />, onClick: () => toast("Duplicate", "info") },
                  { label: "Active", icon: <Filter size={15} />, active: true },
                  { label: "Delete", icon: <Trash2 size={15} />, danger: true, onClick: () => toast("Delete", "warning") },
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
                <Bell size={14} /> Free content (top)
              </Button>
            )}
          >
            <div className="p-3 text-[13px]">
              <b>Any content.</b>
              <p className="text-muted mt-1">A Popover does not have to be a Menu: notification bell, site switcher, filters…</p>
            </div>
          </Popover>
        </Block>
        <ShortcutsMenuBlock />
        <Block name="HelpTip (hover/focus, formatting with p/ul/b, never leaves the screen)">
          <span className="text-sm text-muted inline-flex items-center gap-1">
            Contextual help <HelpTip label="HelpTip"><p>A tooltip with <b>formatting</b>.</p><ul><li>Hover only</li><li>Never leaves the screen</li></ul></HelpTip>
          </span>
          <span className="text-sm text-muted inline-flex items-center gap-1 ml-auto">
            Stuck to the right edge <HelpTip><p>It is clamped to the viewport instead of overflowing.</p></HelpTip>
          </span>
        </Block>
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={modalWide ? "Modal wide" : "New design"}
        wide={modalWide}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={saveModal}>Create</Button>
          </>
        }
      >
        <Field label="Name" required error={errors.name}>
          <Input
            value={name}
            placeholder="Leave it empty and press Create…"
            onChange={(e) => {
              setName(e.target.value);
              clearError("name");
            }}
            autoFocus
          />
        </Field>
        {modalWide && (
          <p className="text-[13px] text-muted mt-3">
            The <b>wide</b> variant gives more width for two-column forms or tables.
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
            <Button variant="ghost" onClick={() => setDrawer(false)}>Cancel</Button>
            <Button onClick={() => { toast("Saved.", "success"); setDrawer(false); }}>Save changes</Button>
          </>
        }
      >
        <p className="text-[13px] text-muted leading-relaxed">
          The content scrolls; the action zone at the bottom stays always visible.
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
        onConfirm={() => toast("Deleted.", "info")}
        title="Delete the item?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
      <ConfirmDialog
        open={confirmSoft}
        onClose={() => setConfirmSoft(false)}
        onConfirm={() => toast("Published.", "success")}
        title="Publish now?"
        message={<>It will be published to <b>Etsy</b> with the current data.</>}
        confirmLabel="Publish"
        cancelLabel="Not yet"
      />
    </Section>
  );
}
