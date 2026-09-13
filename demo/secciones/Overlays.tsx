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

// ---------------- overlays ----------------

// Menú con líneas divisorias y combinaciones de teclas. El menú solo PINTA el
// atajo; quien lo hace funcionar es useShortcuts, aquí arriba — por eso los
// atajos van aunque el menú esté cerrado (pruébalo sin abrirlo).
function BlockMenuAtajos() {
  const { toast } = useToast();
  const items = useMemo(
    () => [
      { label: "Editar", icon: <Pencil size={15} />, shortcut: "mod+e", onClick: () => toast("Editar", "info") },
      { label: "Duplicar", icon: <Copy size={15} />, shortcut: "mod+d", onClick: () => toast("Duplicar", "info") },
      { separator: true as const },
      { label: "Filtrar", icon: <Filter size={15} />, onClick: () => toast("Filtrar", "info") },
      { separator: true as const },
      { label: "Eliminar", icon: <Trash2 size={15} />, danger: true, shortcut: "mod+shift+backspace", onClick: () => toast("Eliminar", "warning") },
    ],
    [toast],
  );
  useShortcuts(items);

  return (
    <Block name="Menu: separadores + atajos de teclado (useShortcuts los engancha, aunque el menú esté cerrado)">
      <Popover
        align="start"
        width={260}
        trigger={({ open, toggle }) => (
          <Button variant="outline" onClick={toggle} className={open ? "!bg-[var(--hover)]" : ""}>
            <Settings size={14} /> Con atajos <ChevronsUpDown size={13} />
          </Button>
        )}
      >
        {({ close }) => <Menu title="Acciones" onPick={close} items={items} />}
      </Popover>
      <span className="text-[12px] text-muted">Prueba Ctrl/⌘+E o Ctrl/⌘+D sin abrir el menú.</span>
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
        <BlockMenuAtajos />
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
