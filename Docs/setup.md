# SETUP

```
.vscode

```

```sh
git config user.name Kevin
git config user.email dl_xq@sina.com

```

```sh
# https://nextjs.org/
pnpm create next-app@latest meetai

# https://prettier.io/
pnpm add --save-dev --save-exact prettier
# 类名自动排序（这是 Next.js + Tailwind 开发体验提升最明显的配置之一）
pnpm add --save-dev prettier-plugin-tailwindcss
# https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#configuration-new-eslintconfigjs
pnpm add -D eslint-plugin-prettier eslint-config-prettier

# https://commitlint.js.org/
pnpm add -D @commitlint/cli @commitlint/config-conventional
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

# https://typicode.github.io/husky/
pnpm add --save-dev husky
pnpm exec husky init
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

# https://github.com/lint-staged/lint-staged
pnpm add --save-dev lint-staged
echo "pnpm exec lint-staged" > .husky/pre-commit
echo "pnpm exec commitlint --edit \$1" > .husky/commit-msg
```

```sh
# tailwindcss

# https://ui.shadcn.com/docs/installation/next
pnpm dlx shadcn@latest init
```
