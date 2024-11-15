/** @type {import("prettier").Options} */
const config = {
  arrowParens: 'avoid',
  bracketSpacing: true,
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'ignore',
  singleAttributePerLine: false,
  insertPragma: false,
  bracketSameLine: false,
  jsxBracketSameLine: false,
  jsxSingleQuote: false,
  printWidth: 120,
  proseWrap: 'never',
  quoteProps: 'as-needed',
  requirePragma: false,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  useTabs: false,
  vueIndentScriptAndStyle: false,
  "plugins": ["prettier-plugin-tailwindcss"],
  tailwindConfig: './tailwind.config.js',
}

module.exports = config
