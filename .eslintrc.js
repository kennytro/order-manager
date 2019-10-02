module.exports = {
  "extends": "loopback",
  "plugins": [
    "chai-friendly"
  ],
  "parserOptions": {
    "ecmaVersion": "2017"
  },
  "rules": {
    "camelcase": [
      "error",
      {
        "properties": "never"
      }
    ],
    "comma-dangle": ["error", "never"],
    "indent": [
        "error",
        2,
        {
          "SwitchCase": 1
        }
    ],
    "max-len": [
      "error",
      {
        "code": 200,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true
      }
    ],
    "object-curly-spacing": ["error", "always"],
    "space-before-function-paren": [
      "error",
      {
        "anonymous": "never",
        "named": "never",
        "asyncArrow": "always"
      }
    ],
    "no-unused-expressions": 0,
    "chai-friendly/no-unused-expressions": 2
  }
};
