// @ts-check

import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import cypressEslint from 'eslint-plugin-cypress';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

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
                project: `./tsconfig.json`,
            },
        },

        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            cypressEslint.configs.recommended,
            eslintPluginPrettierRecommended,
        ],

        rules: {
            '@typescript-eslint/no-misused-promises': [
                'error',
                {
                    checksConditionals: false,
                },
            ],
            indent: [0, 4],
        },

        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.ts'],
                },
            },
        },

        ignores: ['node_modules/', './eslint.config.mjs'],
    },
]);
