import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  // Any other config imports go at the top, but before the rules.
  eslintPluginPrettierRecommended,
  // rules go at the bottom, otherwise they will be overridden by prettier.
  {
    // VSCode's 'editor.codeActionsOnSave.source.organizeImports' conflicts with eslint / prettier
    // so disable VSCode's organize imports and use eslint instead.
    rules: {
      // 核心导入排序规则
      'import/order': [
        'error',
        {
          // 定义分组
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],

          // 确保组间有空行
          'newlines-between': 'always',

          // 字母排序
          alphabetize: {
            order: 'asc', // "asc" (升序) 或 "desc" (降序)
            caseInsensitive: true, // 不区分大小写
          },

          // (可选) 配置内部模块/别名
          // "pathGroups": [
          //     {
          //         "pattern": "@/**",
          //         "group": "internal"
          //     }
          // ],
          // "pathGroupsExcludedImportTypes": ["type"],
        },
      ],

      // 4. (可选) 确保命名导入 { a, b } 也是有序的
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true, // 必须为 true，让 import/order 处理行排序
          ignoreMemberSort: false, // 设为 false，让这个规则处理成员排序
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],

      // 确保在最后一个导入语句后有一个空行
      'import/newline-after-import': 'error',
    },
  },
]);

export default eslintConfig;
