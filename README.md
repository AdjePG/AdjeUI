# AdjeUI (adje-shared-ui) — design system compartido

Paquete instalable (vía dependencia git, sin necesidad de publicarlo en npm) con
los componentes y estilos compartidos por **MisFinanzas**
(`D:\AdriPG\Programacion\MisFinanzas`) y **Adje Store**
(`D:\AdriPG\Programacion\Adje Store`). Solo web (React/Next); la antigua versión
Flutter se retiró.

## Organización

Un componente por archivo, agrupado por categoría en `src/`:

| Carpeta | Componentes |
|---|---|
| `src/primitives` | Card, IconChip, Pill, Empty, Skeleton |
| `src/controls` | Button, IconButton, Segmented, Tabs, Switch, ChoiceToggle, PickCard, Toolbar |
| `src/forms` | Field, Input, Textarea, Select, ChipEditor, `useFormErrors` + `rules` (validación), `inputCls` |
| `src/overlays` | Modal, Drawer, ConfirmDialog, HelpTip, ToastProvider/useToast |
| `src/data` | Stat, ProgressBar, Pagination, Table |
| `src/layout` | PageHeader, SectionTitle, Collapsible, SideNav/SideNavButton, `useTheme` |

Los gráficos (recharts) siguen viviendo en MisFinanzas (`src/components/charts.tsx`):
dependen de recharts y de sus formateadores de euros, y solo los usa esa app. Si
algún día Adje Store necesita gráficos, se moverán aquí como módulo opcional.

`src/index.ts` lo exporta todo. Los puntos de entrada históricos
(`adje-shared-ui/ui`, `/toast`, `/PageHeader`) siguen funcionando como
re-exports, así que las apps existentes no se rompen; para código nuevo importa
de `adje-shared-ui` a secas.

## Reglas de la casa

- **Tamaños concretos.** Todos los controles de línea (Button, Input —incluida
  la fecha nativa—, Select, Segmented) miden `--control-h` (38px; `sm` 32px,
  `lg` 46px, definidos en `theme.css`). Nunca un botón más alto que un input.
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
`npm install`). Probar SIEMPRE en ambas apps: cualquier cambio aquí las afecta a
las dos.
