module.exports = (api) => {
  // development and production
  let presetEnvConfig = {
    modules: false,
    targets: {
      browsers: ["chrome >= 69"],
    },
  }

  // testing
  const isTest = api.env("test")
  if (isTest) {
    presetEnvConfig = {
      targets: {
        node: "current",
      },
    }
  }

  return {
    presets: [
      ["@babel/preset-env", presetEnvConfig],
      "@babel/preset-typescript",
    ],
    plugins: [
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-proposal-class-properties",
    ],
  }
}
