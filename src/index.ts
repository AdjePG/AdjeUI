// AdjeUI main barrel. One component (or tight family) per file, by category:
//   primitives/  surfaces and basic pieces (Card, Pill, Overline, IconChip, Avatar, Empty, Skeleton, Spinner, CodeBlock)
//   controls/    buttons and toggles (Button, IconButton, Segmented, Tabs, Switch, ChoiceOption, ScrollArrows, Toolbar)
//   forms/       Field, Input, PasswordInput, Textarea, Select, ChipEditor, validation
//   overlays/    layers (Modal, Drawer, ConfirmDialog, HelpTip, Toast, Popover, Menu, useShortcuts)
//   data/        Stat, ProgressBar, Pagination, Table
//   layout/      PageHeader, SectionTitle, Collapsible, Carousel, SideNav family, OverlayScrollbar, useTheme
//   tokens/      fixed palette (15 colours x 10 shades) and tone colours
//   internal/    private helpers, not exported
// Rich text lives in its own entrypoint: "adje-shared-ui/rich-text".

// primitives
export { Card } from "./primitives/Card";
export { IconChip } from "./primitives/IconChip";
export { Pill } from "./primitives/Pill";
export { Overline, overlineCls } from "./primitives/Overline";
export { Avatar, AvatarStack, initials, type AvatarProps, type AvatarSize } from "./primitives/Avatar";
export { Empty } from "./primitives/Empty";
export { Skeleton } from "./primitives/Skeleton";
export { Spinner } from "./primitives/Spinner";
export { CodeBlock } from "./primitives/CodeBlock";
export { tokenize, splitLines, type Token, type TokenType } from "./primitives/highlight";

// controls
export { Button, type ButtonVariant, type ControlSize } from "./controls/Button";
export { IconButton } from "./controls/IconButton";
export { Segmented, type SegmentedOption } from "./controls/Segmented";
export { Tabs } from "./controls/Tabs";
export { Switch, type SwitchSize } from "./controls/Switch";
export { ChoiceOption, ChoiceMark, type ChoiceSize, type ChoiceTone } from "./controls/Choice";
export { ScrollArrows } from "./controls/ScrollArrows";
export { useScrollEdges } from "./controls/useScrollEdges";
export { Toolbar, type ToolbarItem } from "./controls/Toolbar";

// forms
export { Field, useFieldInvalid, useFieldControlId, useFieldLabelId } from "./forms/Field";
export { Input, PasswordInput, Textarea, inputCls, INPUT_SIZES } from "./forms/Input";
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
export { Carousel } from "./layout/Carousel";
export { PageHeader } from "./layout/PageHeader";
export { SectionTitle } from "./layout/SectionTitle";
export { Collapsible } from "./layout/Collapsible";
export { SideNav, SideNavBrand, SideNavButton, SideNavUser, SideNavAction } from "./layout/SideNav";
export { sideNavState, useSideNavState, useSideNavCompact, useIsMobile } from "./layout/sideNavState";
export { OverlayScrollbar } from "./layout/OverlayScrollbar";
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
export { TONE_COLOR, type Tone } from "./tokens/tone";
