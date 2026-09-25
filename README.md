# TiHuMoon 鹈鹕赏月

> 杭州中秋赏月指南 · 移动端 Web Demo  
> 鹈鹕骑自行车，带你逛 6 个赏月点：赏月 → 猜灯谜 → 做花灯 → 放飞祝福。

## 项目简介
- **场景**：中秋节导员布置的杭州赏月指南，以「鹈鹕骑车带学院同学夜游杭州」为主线
- **时长**：5–10 分钟线性演示（章节状态机推进，不可自由跳转）
- **适配**：手机竖屏/横屏优先，桌面可预览；进度/昵称/祝福用 localStorage 记忆

## 技术栈
| 层 | 选型 | 说明 |
|---|---|---|
| 构建 | Vite 8 | Windows 下须用 `npm.cmd`（`npm.ps1` 被策略封锁） |
| 框架 | Vue 3.5 | SFC + Composition API，无 UI 库 |
| 3D | Three.js 0.186 | 开场程序化低多边形鹈鹕+自行车 |
| 样式 | 原生 CSS | CSS 变量设计令牌，见 `docs/DESIGN.md` |
| 路由 | 自研章节状态机 | 不用 vue-router，线性播放 |
| 存储 | localStorage | `tihumoon.*` 系列 key |

## 快速开始
```powershell
npm.cmd install
npm.cmd run dev        # 开发 http://localhost:5173
npm.cmd run build      # 产物 dist/
npm.cmd run convert    # 重新转换 GBK 数据（用户.txt / 祝福.txt）
```

## 目录结构
```
TiHuMoon/
├─ docs/               # 项目文档（PLAN / DESIGN / CONTENT / ASSETS）
├─ scripts/            # convert_data.py（GBK→UTF-8 数据转换）
├─ src/
│  ├─ scenes/          # 各章节 Vue 组件（Phase 2+）
│  ├─ three/           # Three.js 开场场景（Phase 3+）
│  ├─ composables/     # useStage / useStorage（Phase 2+）
│  ├─ data/            # users.js / blessings.js（自动生成）
│  ├─ App.vue
│  ├─ main.js
│  └─ style.css        # 设计令牌
├─ index.html
├─ vite.config.js      # base: './' 静态托管友好
└─ package.json
```

## 文档
- `docs/PLAN.md` — 分阶段计划与完成状态（每次对话后更新）
- `docs/DESIGN.md` — 视觉/布局/状态机/localStorage 规范
- `docs/CONTENT.md` — 各章节内容与文案（灯谜仅 JHWL 一条）
- `docs/ASSETS.md` — 图片资产需求与版权红线

## 分支策略
仅 `main` 一个分支；**每次对话结束后提交一次版本**，commit message 用 `feat:/docs:/style:/chore:` 前缀。

## 数据来源
`用户.txt`（200 昵称）、`祝福.txt`（200 祝福语）为 GBK 编码，经 `scripts/convert_data.py` 转为 UTF-8 的 `src/data/*.js`。
