module.exports = {
  "extends": "loopback",
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
    "object-curly-spacing": ["error", "always"]
  }
};
