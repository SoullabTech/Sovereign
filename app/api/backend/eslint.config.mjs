export default {
  extends: ["eslint:recommended", "plugin:react/recommended"],
  plugins: ["react"],
  env: {
    browser: true,
    node: true,
  },
  rules: {
    // Your custom rules can go here
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"], // Ensures TypeScript files are linted
      parserOptions: {
        project: "./tsconfig.json", // Path to your TypeScript config
      },
    },
  ],
};
