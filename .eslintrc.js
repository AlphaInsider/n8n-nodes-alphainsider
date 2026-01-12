module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    //js rules
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'no-empty': 'off',
    'prefer-arrow-callback': 'error',
    'no-var': 'error',
    'array-bracket-spacing': ['error', 'never'],
    'object-curly-spacing': ['error', 'never'],
    'multiline-ternary': ['error', 'never'],
    'operator-linebreak': ['error', 'before'],
    'indent': ['error', 2, {'MemberExpression':0}],
    'quotes': ['error', 'single', {'avoidEscape':true, 'allowTemplateLiterals':true}],
    'brace-style': ['error', 'stroustrup', {'allowSingleLine': true}]
  }
};
