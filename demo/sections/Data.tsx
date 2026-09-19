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

// ---------------- data ----------------

export function DataSection() {
  const [page, setPage] = useState(1);
  return (
    <Section id="data" title="Data" subtitle="src/data — indicators, table, progress and pagination">
      <Card className="flex flex-col gap-4">
        <Block name="Stat: tone (neutral, positive, negative, accent) + icon / hint / help">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <Stat label="Products" value={57} icon={<Package size={14} />} />
            <Stat label="Published" value={12} tone="positive" hint="2 paused" />
            <Stat label="Average margin" value="44%" tone="accent" help={<p>Profit / sale price.</p>} />
            <Stat label="Losses" value={2} tone="negative" icon={<Wallet size={14} />} hint="This month" />
          </div>
        </Block>
        <Block name="Table (horizontal scroll if it does not fit; th/td without classes)">
          <div className="w-full">
            <Table minWidth={520}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Tags</th>
                  <th className="!text-right">Price</th>
                  <th className="!text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2D Smiley</td>
                  <td><Pill color={palette("green", 600)}>Published</Pill></td>
                  <td className="text-muted">graphic tee, funny</td>
                  <td className="text-right font-semibold">$24.99</td>
                  <td className="text-right">
                    <IconButton label="Edit" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
                    <IconButton label="Delete" size="sm" tone="danger" onClick={() => {}}><Trash2 size={13} /></IconButton>
                  </td>
                </tr>
                <tr>
                  <td>Vespa Mug</td>
                  <td><Pill>Idea</Pill></td>
                  <td className="text-muted">vespa, retro</td>
                  <td className="text-right font-semibold">$14.99</td>
                  <td className="text-right">
                    <IconButton label="Edit" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
                    <IconButton label="Delete" size="sm" tone="danger" onClick={() => {}}><Trash2 size={13} /></IconButton>
                  </td>
                </tr>
                <tr>
                  <td>Poster Kharis</td>
                  <td><Pill color={palette("amber", 600)}>Pending</Pill></td>
                  <td className="text-muted">wall art</td>
                  <td className="text-right font-semibold">$19.99</td>
                  <td className="text-right">
                    <IconButton label="Edit" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
                    <IconButton label="Delete" size="sm" tone="danger" onClick={() => {}}><Trash2 size={13} /></IconButton>
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
              <span className="text-[12px] text-muted shrink-0">3 of 8 (max)</span>
            </div>
          </div>
        </Block>
        <Block name="Pagination (page, pageCount, total, noun)">
          <div className="w-full">
            <Pagination page={page} pageCount={5} total={102} onPage={setPage} noun="products" />
          </div>
        </Block>
      </Card>
    </Section>
  );
}
