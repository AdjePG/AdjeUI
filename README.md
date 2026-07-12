# adje-shared-ui — design system compartido

Paquete instalable (vía dependencia git, sin necesidad de publicarlo en npm) con
los componentes y estilos compartidos por **MisFinanzas**
(`D:\AdriPG\Programacion\MisFinanzas`) y **Adje Store**
(`D:\AdriPG\Programacion\Adje Store`).

## Contenido

| Import | Qué aporta |
|---|---|
| `adje-shared-ui/ui` | Card, IconChip, SectionTitle, HelpTip, Stat, Segmented, Tabs, Pill, Button, Drawer, Modal, Select, Field, inputCls, ChoiceToggle, PickCard, Pagination, Empty |
| `adje-shared-ui/toast` | ToastProvider + useToast |
| `adje-shared-ui/PageHeader` | Cabecera de página con subpestañas opcionales |
| `adje-shared-ui/theme.css` | Paleta base, layout `.principal`, `.card`, scrollbars, animaciones, tooltips |

Los colores de identidad de marca NO viven aquí: cada app define en su propio
`globals.css` (`:root`) `--accent-pink`, `--accent-blue`, `--app-gradient`,
`--blue-shadow`, `--scrollbar-thumb` y `--scrollbar-thumb-hover`.

## Cómo se consume desde cada app

Es un paquete real de npm (sin publicar en el registro; se instala directo desde
GitHub), no una carpeta hermana con alias de rutas. En el `package.json` de la
app consumidora:

```json
"dependencies": {
  "adje-shared-ui": "github:AdjePG/AdjeStyling"
}
```

Y en su `next.config.mjs`, para que Next.js transpile el TSX/CSS del paquete
(viene como código fuente, sin compilar):

```js
const nextConfig = {
  transpilePackages: ["adje-shared-ui"],
};
```

En `tailwind.config.ts`, para que no purgue las clases usadas solo dentro del
paquete:

```ts
content: [
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
  "./node_modules/adje-shared-ui/**/*.{ts,tsx}",
],
```

Y los imports normales:

```tsx
export * from "adje-shared-ui/ui";       // src/components/ui.tsx (barrel)
import "adje-shared-ui/theme.css";        // en layout.tsx, tras globals.css
```

## Publicar un cambio

1. Edita aquí, prueba en ambas apps (`npm install` en cada una para refrescar
   el git dependency si cambiaste algo que npm cachea; con git dependencies
   normalmente basta con `rm -rf node_modules/adje-shared-ui && npm install`).
2. `git add -A && git commit -m "..." && git push`.
3. En cada app: `npm update adje-shared-ui` (o el borrado de node_modules de
   arriba) y vuelve a desplegar.

## Reglas

- **Un cambio aquí afecta a las apps que lo instalen** — arranca ambas en local
  tras cambiar algo antes de hacer push.
- Nada de lógica de dominio (finanzas, Etsy): eso vive en cada app.
- Nada de colores en hexadecimal de una marca: usar siempre `var(--...)`.
- Las apps consumidoras deben mantener versiones compatibles de `next`, `react`,
  `tailwindcss` y `lucide-react` (hoy: next 14.2.15, react 18.3, tailwind 3.4,
  lucide 1.24), ya que son `peerDependencies`.
