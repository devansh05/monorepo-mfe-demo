export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program",
          message:
            "JavaScript files are not allowed. Please use TypeScript (.ts or .tsx) instead.",
        },
      ],
    },
  },
];
