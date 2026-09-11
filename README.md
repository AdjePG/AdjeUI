# AdjeUI (adje-shared-ui) — design system compartido

Paquete instalable (vía dependencia git, sin necesidad de publicarlo en npm) con
los componentes y estilos compartidos por las apps de Adje: **MisFinanzas**,
**Adje Store**, **Aula Propia** y las que vengan. Solo web (React/Next); la
antigua versión Flutter se retiró.

## Organización

Un componente por archivo, agrupado por categoría en `src/`:

| Carpeta | Componentes |
|---|---|
| `src/primitives` | Card, IconChip, Pill, Empty, Skeleton |
| `src/controls` | Button, IconButton, Segmented, Tabs, Switch, ChoiceToggle, PickCard, Toolbar |
| `src/forms` | Field, Input, Textarea, Select, ChipEditor, `useFormErrors` + `rules` (validación), `inputCls`; RichTextEditor/RichText (entrypoint aparte `adje-shared-ui/rich-text`) |
| `src/overlays` | Modal, Drawer, ConfirmDialog, HelpTip, ToastProvider/useToast, Popover + Menu |
| `src/data` | Stat, ProgressBar, Pagination, Table |
| `src/layout` | PageHeader, SectionTitle, Collapsible, SideNav + SideNavBrand/SideNavAction/SideNavButton/SideNavUser, `useTheme` |
| `src/tokens` | `palette(name, shade)`, `paletteHex`, `PALETTE` — paleta fija de 15 colores × 10 tonos |

Los gráficos (recharts) siguen viviendo en MisFinanzas (`src/components/charts.tsx`):
dependen de recharts y de sus formateadores de euros, y solo los usa esa app. Si
algún día Adje Store necesita gráficos, se moverán aquí como módulo opcional.

`src/index.ts` lo exporta todo **salvo el texto enriquecido**: `RichTextEditor`
(WYSIWYG con Tiptap: negrita, cursiva, subrayado, título, listas, cita, enlace),
`RichText` (visor sanitizado con DOMPurify), `sanitizeRichText`,
`richTextToPlain` e `isRichTextEmpty` se importan de `adje-shared-ui/rich-text`.
Están aparte porque arrastran Tiptap y DOMPurify: solo la app que los use los
instala (`npm i @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
@tiptap/pm dompurify`). El editor guarda HTML; úsalo dentro de
`<Field as="div">` (un editor no va dentro de `<label>`). Los puntos de entrada históricos
(`adje-shared-ui/ui`, `/toast`, `/PageHeader`) siguen funcionando como
re-exports, así que las apps existentes no se rompen; para código nuevo importa
de `adje-shared-ui` a secas.

## Reglas de la casa

- **Tamaños concretos.** Todos los controles de línea (Button, Input —incluida
  la fecha nativa—, Select, Segmented) miden `--control-h` (38px; `sm` 32px,
  `lg` 46px, definidos en `theme.css`). Button, Input y Select comparten la prop
  `size` (sm/md/lg): un input y el botón de al lado llevan SIEMPRE la misma
  talla. Nunca un botón más alto o más bajo que su input.
- **Zona de acciones.** Modal y Drawer tienen prop `footer`: los botones de
  guardar/cancelar van ahí (barra propia, en el Drawer siempre visible), nunca
  sueltos en el contenido.
- **Validación.** `useFormErrors` + `rules` para validar en el cliente, y
  `<Field error={errors.x} required>`: pinta el mensaje en rojo y el borde del
  control automáticamente (via contexto), para que siempre se sepa qué campo
  falla.
- **Colores solo por token.** Nada de hex en componentes: `var(--...)` siempre.
  Los tokens base viven en `theme.css`; los de identidad de marca
  (`--accent-pink`, `--accent-blue`, `--app-gradient`, `--blue-shadow`,
  `--scrollbar-thumb`, `--scrollbar-thumb-hover`) los define cada app en su
  `globals.css`.
- **Paleta fija para colores "de dato".** Etiquetas, categorías, pills y
  gráficos usan la paleta de 15 colores × 10 tonos (`--c-<color>-<tono>`,
  50→900): slate, red, orange, amber, yellow, lime, green, teal, cyan, blue,
  indigo, violet, purple, pink, rose. En código: `palette("green", 600)` devuelve
  `var(--c-green-600)`; `PALETTE.green[600]` da el hex para destinos sin CSS
  (canvas, SVG exportado). Los tonos no cambian con el tema: 500–600 en claro,
  300–400 en oscuro. Se ven todos en la sección Tokens del demo.
- **Navegación en tres zonas.** `SideNav` tiene `top` (normalmente `SideNavBrand`:
  icono + nombre de la app; o lo que sea: selector de sitio, avisos), el menú (`items`) y `bottom` (lo que
  sea; normalmente `SideNavUser`: avatar + nombre que abre un `Menu` con tema,
  ajustes, salir) y `SideNavAction` (icono + etiqueta + badge, con acción o
  popover: notificaciones, avisos…). En escritorio es el rail de 232px del layout
  `.principal`, contraíble a solo iconos (72px) con el botón «Contraer» (se
  recuerda en localStorage; `topCompact`/`bottomCompact` para las zonas,
  `useSideNavCompact()` para contenido propio);
  por debajo de 768px queda oculto a la izquierda y se abre con la hamburguesa
  que `PageHeader` pinta solo cuando hay un SideNav montado (sin provider:
  `sideNavState`). Se cierra al navegar, con Escape o tocando el fondo.
- **Sin lógica de dominio.** Aquí solo UI reutilizable.

## Demo / escaparate

```bash
npm install
npm run demo   # http://localhost:4400
```

`demo/` es una página con todos los componentes vivos, por categoría: úsala para
ver qué hay antes de crear algo nuevo, y añade ahí cualquier componente nuevo.

## Cómo se consume desde cada app

Es un paquete real de npm (sin publicar en el registro; se instala directo desde
GitHub), no una carpeta hermana con alias de rutas. En el `package.json` de la
app consumidora:

```json
"dependencies": {
  "adje-shared-ui": "github:AdjePG/AdjeUI"
}
```

Y en su configuración:

- `next.config.mjs`: `transpilePackages: ["adje-shared-ui"]` (el paquete se
  distribuye como TSX sin compilar).
- `tailwind.config.ts` → `content`: añadir
  `"./node_modules/adje-shared-ui/**/*.{ts,tsx}"` para que Tailwind no purgue
  las clases del paquete.
- `app/layout.tsx` (o global): `import "adje-shared-ui/theme.css";`

**Publicar cambios:** commit + push a `main` en GitHub y, en cada app,
`npm update adje-shared-ui` (o borrar `node_modules/adje-shared-ui` y
`npm install`). Probar SIEMPRE en todas las apps que lo consumen: cualquier cambio aquí las
afecta a todas.
