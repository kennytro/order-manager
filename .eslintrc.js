module.exports = {
  "extends": "loopback",
  "parserOptions": {
    "ecmaVersion": "2017"
  },
  "rules": {
    "object-curly-spacing": ["error", "always"],
    "comma-dangle": ["error", "never"],
    "max-len": [
      "error",
      {
        "code": 200,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true
      }
    ],
    "indent": [
        "error",
        2,
        {
          "SwitchCase": 1
        }
    ]
  }
};
