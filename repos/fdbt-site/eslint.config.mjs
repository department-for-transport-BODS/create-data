// @ts-check

import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import jest from 'eslint-plugin-jest';
import js from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.jest,
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly',
            },

            ecmaVersion: 2018,
            sourceType: 'module',

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },

                tsconfigRootDir: __dirname,
                project: `./tsconfig.json`,
            },
        },

        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            react.configs.flat.recommended,
            react.configs.flat['jsx-runtime'],
            jsxA11Y.flatConfigs.recommended,
            jest.configs['flat/recommended'],
            eslintPluginPrettierRecommended,
        ],

        rules: {
            'jest/no-disabled-tests': 'error',
            'jest/no-identical-title': 'error',
            'jest/valid-expect': 'error',
            'no-console': 'error',

            indent: [
                0,
                4,
                {
                    ignoredNodes: [
                        'JSXElement',
                        'JSXElement > *',
                        'JSXAttribute',
                        'JSXIdentifier',
                        'JSXNamespacedName',
                        'JSXMemberExpression',
                        'JSXSpreadAttribute',
                        'JSXExpressionContainer',
                        'JSXOpeningElement',
                        'JSXClosingElement',
                        'JSXText',
                        'JSXEmptyExpression',
                        'JSXSpreadChild',
                    ],

                    SwitchCase: 1,
                },
            ],

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    ignoreRestSiblings: false,
                },
            ],

            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/restrict-plus-operands': 'off',
            '@typescript-eslint/ban-types': 'off',
            'jsx-a11y/click-events-have-key-events': 'off',
            '@typescript-eslint/no-unused-expressions': ['error'],

            'react/jsx-filename-extension': [
                1,
                {
                    extensions: ['.js', '.jsx', '.tsx'],
                },
            ],

            'react/jsx-indent': [0, 4],
            'react/require-default-props': 'off',

            'jsx-a11y/label-has-associated-control': [
                2,
                {
                    assert: 'htmlFor',
                },
            ],

            'func-style': [2, 'expression'],
            curly: [2, 'all'],
            '@typescript-eslint/unbound-method': 0,

            'react/forbid-dom-props': [
                'error',
                {
                    forbid: ['style'],
                },
            ],
        },

        settings: {
            react: {
                version: 'detect',
            },
        },

        ignores: ['**/.next', '**/cypress_tests', '**/node_modules/'],
    },
    {
        files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
        extends: [tseslint.configs.disableTypeChecked],
        languageOptions: {
            globals: {
                ...globals.node,
            },
            parserOptions: {
                project: null,
                projectService: false,
            },
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    globalIgnores(['**/.next', '**/cypress_tests', '**/node_modules/', '**/dist']),
]);
