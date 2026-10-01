import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Skills de terceros vendorizadas. `modern-screenshot.umd.js` es un bundle
    // UMD minificado: lint-earlo no dice nada del proyecto y sus 78 warnings
    // de no-unused-expressions son ruido puro.
    ".agents/**",
  ]),
  {
    // Los drawers de Banca y Logística virtualizan sus tablas con
    // @tanstack/react-virtual: antes pintaban solo las primeras 100 filas de
    // 6.131 créditos y 1.000 despachos, dejando el resto inalcanzable.
    //
    // `react-hooks/incompatible-library` salta porque useVirtualizer lee el DOM
    // y el compilador de React no puede probar que eso no mute durante el
    // render. La librería es oficialmente compatible con React 19; el warning
    // es del analizador estático, no de la librería. Se apaga solo en estos dos
    // archivos para que el resto del repo siga con el default del preset.
    files: [
      "components/banca/BancaDrilldownDrawer.tsx",
      "components/logistica/LogisticaDrilldownDrawer.tsx",
    ],
    rules: {
      "react-hooks/incompatible-library": "off",
    },
  },
]);

export default eslintConfig;
