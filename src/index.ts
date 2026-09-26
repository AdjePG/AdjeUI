// AdjeUI — main barrel. One component per file, organized by category:
//   primitives/  surfaces and basic pieces (Card, Pill, Overline, IconChip, Empty, Skeleton, CodeBlock)
//   controls/    buttons and toggles (Button, IconButton, Segmented, Tabs, Switch, ChoiceOption, ScrollArrows)
//   forms/       forms (Field, Input, Textarea, Select, validation)
//   overlays/    layers (Modal, Drawer, ConfirmDialog, HelpTip, Toast, Popover, Menu, useShortcuts)
//   data/        data and indicators (Stat, ProgressBar, Pagination)
//   layout/      page structure (PageHeader, SectionTitle, Collapsible, SideNav/SideNavUser, useTheme)
//   tokens/      fixed palette of 15 colors x 10 shades (palette, PALETTE)

// primitives
export { Card } from "./primitives/Card";
export { IconChip } from "./primitives/IconChip";
export { Pill } from "./primitives/Pill";
export { Overline, overlineCls } from "./primitives/Overline";
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
export { useScrollEdges } from "./controls/useScrollEdges";
export { Toolbar, type ToolbarItem } from "./controls/Toolbar";

// forms
export { Field, useFieldInvalid } from "./forms/Field";
export { Input, Textarea, inputCls, INPUT_SIZES } from "./forms/Input";
export { Select, type SelectOption } from "./forms/Select";
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
  isMac,
  useIsMac,
  type Combo,
  type ShortcutAction,
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
