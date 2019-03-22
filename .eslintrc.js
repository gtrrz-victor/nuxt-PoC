module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'node': true
  },
  'extends': [
    "plugin:vue/recommended",
    'standard',
    "plugin:prettier/recommended"
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
    'parser': 'babel-eslint'
  },
  'plugins': [
    'vue'
  ],
  'rules': {
    "semi": [2, "never"],
    "no-console": "off",
    "vue/max-attributes-per-line": "off",
    "prettier/prettier": ["error", { "semi": false }],
    "vue/no-multi-spaces": ["disable", {
      "ignoreProperties": false
    }]
  }
}
