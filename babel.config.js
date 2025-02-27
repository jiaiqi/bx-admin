module.exports = {
  plugins: [
    // '@babel/plugin-proposal-optional-chaining', //可选链 ?.
    // '@babel/plugin-proposal-nullish-coalescing-operator' //空值合并 ??
    "@babel/plugin-transform-optional-chaining", // 可选链 ?.
    "@babel/plugin-transform-nullish-coalescing-operator" // 空值合并 ??
  ],
  presets: [
    '@vue/app',
    ["@babel/preset-env", {
      "useBuiltIns": "entry",
      "corejs": 3
    }]
  ]
}
