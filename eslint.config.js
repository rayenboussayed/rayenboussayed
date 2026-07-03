//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config";
import js from "@eslint/js";
import react from "@eslint-react/eslint-plugin";
import comments from "@eslint-community/eslint-plugin-eslint-comments";
import aiGuard from "eslint-plugin-ai-guard";
import boundaries from "eslint-plugin-boundaries";
import checkFile from "eslint-plugin-check-file";
import compat from "eslint-plugin-compat";
import css from "@eslint/css";
import depend from "eslint-plugin-depend";
import functional from "eslint-plugin-functional";
import json from "@eslint/json";
import jsdoc from "eslint-plugin-jsdoc";
import llmCore from "eslint-plugin-llm-core";
import n from "eslint-plugin-n";
import noSecrets from "eslint-plugin-no-secrets";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import noUseExtendNative from "eslint-plugin-no-use-extend-native";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier/recommended";
import regexp from "eslint-plugin-regexp";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import tailwindcss from "eslint-plugin-tailwindcss";
import testingLibrary from "eslint-plugin-testing-library";
import unicorn from "eslint-plugin-unicorn";
import deMorgan from "eslint-plugin-de-morgan";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import promise from "eslint-plugin-promise";
import reactHooks from "eslint-plugin-react-hooks";
import reactCompiler from "eslint-plugin-react-compiler";
import reactRefresh from "eslint-plugin-react-refresh";
import vitest from "eslint-plugin-vitest";
import globals from "globals";
import tseslint from "typescript-eslint";

const JS_TS = ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"];
const JSX_TSX = ["**/*.{jsx,tsx}"];
const TEST = ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"];
const SERVER = ["**/server.ts", "**/server.tsx", "**/nitro.config.ts"];

export default tseslint.config(
  // ── Ignores ─────────────────────────────────────────────────────────
  {
    ignores: [
      "eslint.config.js",
      "prettier.config.js",
      "src/routeTree.gen.ts",
      "**/*.gen.ts",
      "old/**",
      ".output/**",
      "dist/**",
      "src/components/charts/**",
      "src/components/ui/**",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  //  JS / TS FILES
  // ═══════════════════════════════════════════════════════════════════

  // ── Core ───────────────────────────────────────────────────────────
  { files: JS_TS, ...js.configs.recommended },

  // ── TypeScript ─────────────────────────────────────────────────────
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: JS_TS })),

  // ── TanStack (React Router, Start, Query) ──────────────────────────
  ...tanstackConfig.map((c) => ({ ...c, files: JS_TS })),

  // ── React ──────────────────────────────────────────────────────────
  { files: JSX_TSX, ...react.configs.recommended },
  { files: JSX_TSX, ...reactHooks.configs.flat["recommended-latest"] },
  { files: JSX_TSX, ...reactCompiler.configs.recommended },
  { files: JSX_TSX, ...jsxA11y.flatConfigs.recommended },

  // ── Code Quality ───────────────────────────────────────────────────
  { files: JS_TS, ...sonarjs.configs.recommended },
  { files: JS_TS, ...unicorn.configs["flat/recommended"] },
  { files: JS_TS, ...security.configs.recommended },
  { files: JS_TS, ...regexp.configs["flat/recommended"] },
  { files: JS_TS, ...compat.configs["flat/recommended"] },

  // eslint-comments (legacy plugin format — manual setup)
  {
    files: JS_TS,
    plugins: { "@eslint-community/eslint-comments": comments },
    rules: {
      "@eslint-community/eslint-comments/disable-enable-pair": "error",
      "@eslint-community/eslint-comments/no-aggregating-enable": "error",
      "@eslint-community/eslint-comments/no-duplicate-disable": "error",
      "@eslint-community/eslint-comments/no-unlimited-disable": "error",
      "@eslint-community/eslint-comments/no-unused-enable": "error",
    },
  },

  // ── Promises ───────────────────────────────────────────────────────
  { files: JS_TS, ...promise.configs["flat/recommended"] },

  // ── Imports ────────────────────────────────────────────────────────
  { files: JS_TS, ...importX.configs["flat/typescript"] },
  {
    files: JS_TS,
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({ alwaysTryTypes: true }),
      ],
    },
  },

  // ── De Morgan ──────────────────────────────────────────────────────
  { files: JS_TS, ...deMorgan.configs.recommended },

  // ── React Refresh (Vite HMR) ──────────────────────────────────────
  { files: JS_TS, ...reactRefresh.configs.recommended },

  // ── Perfectionist (import/object sorting) ──────────────────────────
  { files: JS_TS, ...perfectionist.configs["recommended-alphabetical"] },

  // ── AI Guard (security & reliability — manual flat config) ─────────
  {
    files: JS_TS,
    plugins: { "ai-guard": aiGuard },
    rules: aiGuard.configs.recommended.rules,
  },

  // ── LLM Core (code quality patterns) ──────────────────────────────
  ...llmCore.configs.recommended.map((c) => ({ ...c, files: JS_TS })),

  // ── JSDoc ──────────────────────────────────────────────────────────
  { files: JS_TS, ...jsdoc.configs["flat/recommended-typescript"] },

  // ── No Unsanitized (XSS prevention) ───────────────────────────────
  { files: JS_TS, ...noUnsanitized.configs.recommended },

  // ── No Use Extend Native ───────────────────────────────────────────
  { files: JS_TS, ...noUseExtendNative.configs.recommended },

  // ── Check File (naming conventions — manual setup) ─────────────────
  {
    files: JS_TS,
    plugins: { "check-file": checkFile },
  },

  // ── Depend (dependency bloat detection) ────────────────────────────
  { files: JS_TS, ...depend.configs["flat/recommended"] },

  // ── Boundaries (architectural layer enforcement) ───────────────────
  {
    files: JS_TS,
    plugins: { boundaries },
    rules: {
      "boundaries/element-types": [2],
      "boundaries/dependencies": [2],
      "boundaries/entry-point": [2],
      "boundaries/external": [2],
    },
    settings: {
      "boundaries/elements": [
        { type: "components", pattern: "src/components" },
        { type: "routes", pattern: "src/routes" },
        { type: "lib", pattern: "src/lib" },
        { type: "hooks", pattern: "src/hooks" },
        { type: "server", pattern: "src/server" },
      ],
      "boundaries/ignore": ["**/*.test.*", "**/*.spec.*"],
    },
  },

  // ── Functional (immutability — lite preset) ────────────────────────
  {
    files: JS_TS,
    ...functional.configs.lite,
  },

  // ── Tailwind CSS (class linting) ──────────────────────────────────
  {
    files: JSX_TSX,
    ...tailwindcss.configs.recommended,
    settings: {
      tailwindcss: {
        cssConfigPath: "./src/styles.css",
      },
    },
  },

  // ── Node.js / Nitro server rules ──────────────────────────────────
  { files: SERVER, ...n.configs["flat/recommended"] },

  // ── Vitest (test files only) ───────────────────────────────────────
  { files: TEST, ...vitest.configs.recommended },

  // ── Testing Library (test files only) ─────────────────────────────
  { files: TEST, ...testingLibrary.configs["flat/react"] },

  // ── No Secrets (manual setup) ─────────────────────────────────────
  {
    files: JS_TS,
    plugins: { "no-secrets": noSecrets },
    rules: {
      "no-secrets/no-secrets": "error",
      "no-secrets/no-pattern-match": "error",
    },
  },

  // ── .d.ts files (relax unused vars) ───────────────────────────────
  {
    files: ["**/*.d.ts"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  JSON FILES
  // ═══════════════════════════════════════════════════════════════════
  {
    files: ["**/*.json"],
    ignores: ["package-lock.json", "tsconfig.json"],
    language: "json/json",
    plugins: { json },
    rules: json.configs.recommended.rules,
  },
  {
    files: ["**/*.jsonc", "tsconfig.json"],
    language: "json/jsonc",
    plugins: { json },
    rules: json.configs.recommended.rules,
  },
  {
    files: ["**/*.json5"],
    language: "json/jsonc",
    plugins: { json },
    rules: json.configs.recommended.rules,
  },

  // ═══════════════════════════════════════════════════════════════════
  //  CSS FILES
  // ═══════════════════════════════════════════════════════════════════
  {
    files: ["**/*.css"],
    ignores: ["src/styles.css"],
    language: "css/css",
    plugins: { css },
    rules: {
      ...css.configs.recommended.rules,
      "css/no-invalid-at-rules": "off",
      "css/use-baseline": "off",
      "css/no-invalid-properties": "off",
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  GLOBAL CONFIG
  // ═══════════════════════════════════════════════════════════════════

  // ── Global Rules ───────────────────────────────────────────────────
  {
    files: JS_TS,
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // React
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Functional (React event handlers and effects return void; DOM mutation is necessary)
      "functional/no-return-void": "off",
      "functional/immutable-data": "off",
      "functional/no-loop-statements": "off",
      "functional/no-let": "off",
      "functional/functional-parameters": "off",
      "functional/no-mixed-types": "off",
      "functional/prefer-immutable-types": "off",

      // SonarJS
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/pseudo-random": "off",

      // Magic numbers (Three.js geometry values are inherently numeric)
      "no-magic-numbers": "off",

      // Compat (modern APIs used in portfolio)
      "compat/compat": "off",

      // Secrets (character sets for scramble animation)
      "no-secrets/no-secrets": "off",

      // Unicorn overrides
      "unicorn/no-null": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/prefer-spread": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/text-encoding-identifier-case": "off",

      // sort-imports conflicts with perfectionist
      "sort-imports": "off",
      "import-x/order": "off",
      "import/order": "off",

      // React hooks (valid usages in this codebase)
      "react-hooks/set-state-in-effect": "off",

      // @eslint-react (magic numbers in Three.js geometry is expected)
      "@eslint-react/no-magic-numbers": "off",
      "@eslint-react/naming-convention/exported-function-component": "off",

      // LLM Core (relaxed for this codebase)
      "llm-core/explicit-export-types": "off",
      "llm-core/no-magic-numbers": "off",
      "llm-core/filename-match-export": "off",

      // Check file naming (kebab-case for this project)
      "check-file/filename-naming-convention": "off",

      // Tailwind CSS
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-arbitrary-value": "warn",
      "tailwindcss/no-contradicting-classname": "error",
      "tailwindcss/no-custom-classname": "warn",

      // Prettier
      "prettier/prettier": "warn",
    },
  },

  // ── Global language options ─────────────────────────────────────────
  {
    files: JS_TS,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },

  // ── Prettier (must be last — JS/TS only) ────────────────────────────
  { files: JS_TS, ...prettier },
);
