module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.base.json']
  },
  plugins: ['@typescript-eslint', 'react'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    node: true
  },
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off'
  }
};
