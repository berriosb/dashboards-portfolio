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
]);

export default eslintConfig;
