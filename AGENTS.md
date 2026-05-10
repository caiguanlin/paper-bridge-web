# AGENTS.md

这是本仓库的全局上下文入口。保持它短、稳定、可执行；大段细节放到专门文档里，再从这里链接过去。

## 项目目标

`paper-bridge-web` 是一个 React + TypeScript + Vite 前端，用于小学试卷生成系统。核心场景包括教师登录、工作台、题库管理、教材目录管理、题型模板管理、试卷生成、试卷编辑、试卷历史、打印和 Word 导出。

后端 API 默认位于 `/api`。本地开发时通过 Vite dev server/proxy 访问后端。

## 技术栈

- React 19 + TypeScript
- Vite
- React Router
- TanStack React Query
- Ant Design
- Axios
- Day.js
- ESLint

## 仓库地图

- `src/main.tsx`：应用挂载入口。
- `src/App.tsx`：接入 `RouterProvider`。
- `src/routes.tsx`：应用路由定义。
- `src/app/`：应用壳层能力，包括布局、鉴权守卫、query client。
- `src/pages/`：按业务路由组织页面：
  - `auth/`：登录
  - `dashboard/`：工作台
  - `questions/`：题库管理
  - `papers/`：试卷生成、编辑、历史
  - `curriculum/`：教材目录
  - `templates/`：题型模板
- `src/api/`：领域 API 客户端。页面里不要直接散落 axios 调用。
- `src/types/`：请求、响应和共享业务类型。
- `src/styles/`、`src/App.css`：全局样式。
- `public/`：静态资源。
- `docs/`：后端/API 参考资料。
- `DESIGN.md`：设计参考。做较大 UI 调整前先阅读。

## 常用命令

在仓库根目录运行：

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

`npm run build` 是主要正确性检查，它会先运行 `tsc -b`，再构建 Vite bundle。`npm run lint` 用于 ESLint 和 React Hooks 规则检查。

## 开发约定

- 优先沿用现有的 page/api/type 组织方式，不新增不必要的顶层结构。
- HTTP 调用放在 `src/api/*Api.ts`，暴露面向业务的函数。
- 请求和响应模型放在 `src/types/`。
- 默认使用 `src/api/http.ts` 中的 `request<T>()` 封装；只有明确原因时才绕过。
- 路由集中维护在 `src/routes.tsx`。
- 鉴权行为保持与 `AuthGuard` 和 `teacher_token` localStorage key 一致。
- 保留现有中文 UI 文案，并使用 UTF-8 编码。若终端显示乱码，先确认编码，不要盲目重写文案。
- 做功能或修 bug 时，避免顺手重构无关代码。

## UI 原则

- 这是教师使用的教育运营工具，不是营销站点。优先保证录入清晰、表格/表单易扫读、导航可预期、生成和编辑试卷流程顺畅。
- 已有交互能用 Ant Design 解决时，优先使用 Ant Design。
- 除非任务明确要求 redesign，否则保持与现有布局一致。
- 较大的视觉调整需要先阅读 `DESIGN.md`，并与当前 Ant Design 实现协调。
- 不添加与生成、检查、编辑、导出试卷无关的装饰性 UI。


## 验证方式

完成代码变更前，运行最小但足够的检查：

- 类型/构建相关：`npm run build`
- lint/Hook 规则相关：`npm run lint`
- UI 行为相关：运行 `npm run dev`，在浏览器中验证受影响路由

如果某个命令因当前环境无法运行，最终回复里要明确说明。

## 渐进式上下文

不要把这个文件扩写成完整手册。信息变大时，放到更聚焦的位置：

- API 契约放在 `docs/`。
- 设计系统和视觉决策放在 `DESIGN.md` 或专门设计文档。
- 功能实现说明放在功能附近，或放进 `docs/`。
- 如果某个子目录形成了自己的约定，可以在该子目录添加局部 `AGENTS.md`。

## 登录信息
"{
    "username": "admin",
    "password": "itqm@2025"
}"

本文件遵循好上下文文件的原则：给出长期有效的方向，按需链接细节，避免把 agent 埋进过期或冗长的提示词里。
