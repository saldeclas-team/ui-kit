module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "react",
        },
      ],
    ],
    plugins: [
      // NOTE: react-native-worklets/plugin must be listed LAST.
      // Reanimated 4 delegates worklet transformation to react-native-worklets.
      "react-native-worklets/plugin",
    ],
  };
};
