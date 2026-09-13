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
} from "../../src";
import { RichText, RichTextEditor, richTextToPlain } from "../../rich-text";
import { Block, Frame, Section } from "../comunes";

// ---------------- data ----------------

export function DataSection() {
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
