const { defineConfig } = require("eslint-define-config")

module.exports = defineConfig({
  root: true,
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2021,
  },
  env: {
    browser: true,
    node: true,
  },
  rules: {
    semi: ["error", "never"],
    quotes: [
      "error",
      "double",
      {
        allowTemplateLiterals: true,
      },
    ],
    "comma-dangle": ["error", "always-multiline"],
    "@typescript-eslint/no-var-requires": "off",
  },
})
