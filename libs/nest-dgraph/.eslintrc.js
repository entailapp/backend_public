// module.exports = {
//   parser: '@typescript-eslint/parser',
//   parserOptions: {
//     project: 'tsconfig.json',
//     sourceType: 'module',
//   },
//   plugins: ['@typescript-eslint/eslint-plugin'],
//   extends: [
//     'plugin:@typescript-eslint/recommended',
//     'plugin:prettier/recommended',
//   ],
//   root: true,
//   env: {
//     node: true,
//     jest: true,
//   },
//   ignorePatterns: ['.eslintrc.js'],
//   rules: {
//     '@typescript-eslint/interface-name-prefix': 'off',
//     '@typescript-eslint/explicit-function-return-type': 'off',
//     '@typescript-eslint/explicit-module-boundary-types': 'off',
//     '@typescript-eslint/no-explicit-any': 'off',
//   },
// };

module.exports = {
  ...require('@entailapps/backend-configs/profiles/default/config/.eslintrc.js'),
  ignorePatterns: ['**/*.spec.ts', '**/*.e2e-spec.ts']
}
