// AdjeUI — barrel principal. Un componente por archivo, organizado por
// categoría:
//   primitives/  superficies y piezas básicas (Card, Pill, IconChip, Empty, Skeleton, CodeBlock)
//   controls/    botones y toggles (Button, IconButton, Segmented, Tabs, Switch, ChoiceOption, ScrollArrows)
//   forms/       formularios (Field, Input, Textarea, Select, validación)
//   overlays/    capas (Modal, Drawer, ConfirmDialog, HelpTip, Toast, Popover, Menu, useShortcuts)
//   data/        datos e indicadores (Stat, ProgressBar, Pagination)
//   layout/      estructura de página (PageHeader, SectionTitle, Collapsible, SideNav/SideNavUser, useTheme)
//   tokens/      paleta fija de 15 colores × 10 tonos (palette, PALETTE)

// primitives
export { Card } from "./primitives/Card";
export { IconChip } from "./primitives/IconChip";
export { Pill } from "./primitives/Pill";
export { Empty } from "./primitives/Empty";
export { Skeleton } from "./primitives/Skeleton";
export { CodeBlock } from "./primitives/CodeBlock";

// controls
export { Button, type ButtonVariant, type ControlSize } from "./controls/Button";
export { IconButton } from "./controls/IconButton";
export { Segmented } from "./controls/Segmented";
export { Tabs } from "./controls/Tabs";
export { Switch, type SwitchSize } from "./controls/Switch";
export { ChoiceOption, ChoiceMark, type ChoiceSize, type ChoiceTone } from "./controls/Choice";
export { ScrollArrows } from "./controls/ScrollArrows";
export { Toolbar, type ToolbarItem } from "./controls/Toolbar";

// forms
export { Field, useFieldInvalid } from "./forms/Field";
export { Input, Textarea, inputCls, INPUT_SIZES } from "./forms/Input";
export { Select } from "./forms/Select";
export { ChipEditor } from "./forms/ChipEditor";
export { useFormErrors, rules, type RuleResult } from "./forms/validation";

// overlays
export { Modal } from "./overlays/Modal";
export { Drawer } from "./overlays/Drawer";
export { ConfirmDialog } from "./overlays/ConfirmDialog";
export { HelpTip } from "./overlays/HelpTip";
export { ToastProvider, useToast } from "./overlays/Toast";
export { Popover } from "./overlays/Popover";
export { Menu, type MenuItem, type MenuAction, type MenuSeparator } from "./overlays/Menu";
export {
  useShortcuts,
  formatShortcut,
  parseShortcut,
  esMac,
  useEsMac,
  type Combo,
  type AccionConAtajo,
} from "./overlays/shortcuts";

// data
export { Stat } from "./data/Stat";
export { ProgressBar } from "./data/ProgressBar";
export { Pagination } from "./data/Pagination";
export { Table } from "./data/Table";

// layout
export { PageHeader } from "./layout/PageHeader";
export { SectionTitle } from "./layout/SectionTitle";
export { Collapsible } from "./layout/Collapsible";
export { SideNav, SideNavBrand, SideNavButton, SideNavUser, SideNavAction } from "./layout/SideNav";
export { sideNavState, useSideNavState, useSideNavCompact, useIsMobile } from "./layout/sideNavState";
export { useTheme, type Theme } from "./layout/theme";

// tokens
export {
  palette,
  paletteHex,
  PALETTE,
  PALETTE_NAMES,
  PALETTE_SHADES,
  type PaletteName,
  type PaletteShade,
} from "./tokens/palette";
