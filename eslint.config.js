import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
    { files: ["__tests__/**"], languageOptions: { globals: { ...globals.mocha, ...globals.chai } , } , },
    { ignores: ["coverage"]},
    { rules: { "indent": ["error", 4] } }
]);
