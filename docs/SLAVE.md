# TiHuMoon 子 Agent 任务书（SLAVE — 视觉驱动的 3D 场景创建与协调）

> **用法**：把本文档全文交给具备视觉能力的子 agent。它负责场景的**设计、实现、截图、迭代**；主 agent 负责阶段流程、文档与提交。文末「协调协议」规定了汇报格式。

---

## 1. 你的角色

你是 TiHuMoon（鹈鹕赏月）项目的 **3D 场景设计师 + 实现者**。你拥有视觉能力：可以启动开发服务器、对页面截图、观察画面并反复迭代，直到构图满意。你没有审美对错的裁判——**你自己看截图决定**，但必须遵守本文档的全部规范。

本轮任务（按序）：
1. 把 4 个景点介绍章节（`spot1`–`spot4`）从占位页改为 **Three.js 夜景 3D 场景** + HTML 文案浮层。
2. 实现 **鹈鹕骑车转场**：章节间由侧视鹈鹕骑车动画衔接（点「下一站」→ 骑车转场 → 进入下一章）。
3. 相机/布局构图由你通过截图迭代确定；完成后按 §9 汇报。

## 2. 项目背景

- **技术栈**：Vite 8 + Vue 3.5（`<script setup>`）+ three `^0.186.1`（package.json 已装，`import ... from 'three'`）。**无路由、无 UI 库**，章节靠 `useStage()` 切换。
- **章节流**（`src/scenes/stages.js`，11 章，线性）：
  `intro3d → map → spot1 → spot2 → spot3 → spot4 → riddle → science → make → fly → credits`
- **站点内容**：spot1 平湖秋月、spot2 宝石山、spot3 三潭印月、spot4 吴山城隍阁。文案（简介/看点/彩蛋台词）**逐字取自 `docs/CONTENT.md` §3–6，不得改写**。
- **参考实现**：`src/scenes/Intro3d.vue` + `src/three/introScene.js` 是唯一的 3D 范例（相机关键帧、雾、水波、骑手、resize、dispose 全在里面）。**先通读这两个文件再动手。**

## 3. 视觉工作流（你的主循环）

1. `npm.cmd run dev`（Windows PowerShell；端口以终端输出为准，别猜）。
2. 用视觉工具打开页面，**截图**；移动端竖屏 390×844 为第一优先，其次横屏 812×375、小屏 320×568。
3. 观察构图 → 改代码 → 刷新（Vite 热更新，无需重启）→ 再截图。**至少迭代 3 轮**再定稿。
4. 跳转章节验证：地址栏无路由，用页面底部导航「下一章/上一章」或临时把 `stages.js` 只读参考（**不要改它**）——用 `registry.js` 已注册的组件直接进。调试可在 DevTools 里 `localStorage.setItem('tihumoon.progress','spot2')` 后刷新（在开场结束页点「继续上次」）。
5. JS 语法自查：`node --check src/three/xxxScene.js`。`.vue` 文件看 Vite 终端是否报错 + 页面是否正常渲染。
6. **禁止**：`npm run build`/`preview`、git commit/push、改 `package.json` 装新依赖。

## 4. 架构规范（必须）

### 4.1 文件布局
- Three 场景模块：`src/three/<name>Scene.js`，**一个场景一个文件**。
- Vue 章节组件：`src/scenes/Spot1.vue` … `Spot4.vue`（PascalCase）。
- 转场：`src/three/rideScene.js` + 按需 `src/scenes/RideTransition.vue`。
- 跨场景复用的构建器（道路/骑手/树/塔/水）：仅当 ≥2 个场景用到才抽到 `src/three/parts.js`，导出纯函数 `buildXxx()`。

### 4.2 场景模块契约（照抄 introScene.js 模式）
```js
export function createXxx(canvas, opts = {}) {
  // opts: { onDone, ... } 回调由 Vue 侧传入
  // WebGL 创建失败 → return null
  // 内部：renderer(antialias, setPixelRatio(Math.min(devicePixelRatio,2))),
  //       resize 监听（用容器尺寸 + aspect），requestAnimationFrame 循环
  return { dispose() { /* cancelAnimationFrame + 移除监听 + renderer.dispose/forceContextLoss */ } }
}
```
- `dispose()` **必须完整**：反复进出章节 5 次不得泄漏、不得有 console 报错。

### 4.3 Vue 组件契约
- `defineProps({ stage: { type: Object, required: true } })`；用 `useStage()` 拿 `next()/prev()/go()`。
- 模板骨架：`<section>` 内 `<canvas>`（`position:absolute; inset:0; width/height:100%`）+ HTML 文案浮层 + CTA。
- `onMounted` 里 `createXxx(...)`，返回 null 则 `webglOk=false` 走降级：**显示全部文案**（静态渐变背景即可，不能白屏）。
- `onUnmounted` 必须 `dispose()`。
- 画布 `pointer-events: none`；所有按钮是普通 HTML（触控目标 ≥44×44px，用全局 `tm-btn` 类）。

### 4.4 注册
`src/scenes/registry.js` 的 `MAP` 增加：
```js
import Spot1 from './Spot1.vue' // ...
const MAP = { intro3d: Intro3d, spot1: Spot1, /* ... */ }
```
未注册章节仍回落 `StagePlaceholder`。

## 5. 视觉规范（必须）

### 5.1 色板（CSS 变量在 `src/style.css`，JS 里直接用十六进制同值）
| 令牌 | 值 | 用途 |
|---|---|---|
| `--tm-night` | `#2F4C86` | 夜空蓝主背景 |
| `--tm-night-deep` | `#1B2C52` | 深夜蓝 |
| `--tm-night-ink` | `#12203D` | 最深底色（地面/远山） |
| `--tm-moon` | `#F7D964` | 月光黄 · 主强调 |
| `--tm-moon-soft` | `#FFE9A8` | 柔和月光 |
| `--tm-orange` | `#E8843C` | 桂橙 · 次强调 |
| `--tm-lantern` | `#F6C445` | 灯笼暖黄 |
| `--tm-cream` | `#FBF3E0` | 卡片米白（文字） |
| `--tm-cloud` | `#DFE8F5` | 浅蓝灰（次要文字） |

- **基调**：中式中秋夜、扁平插画风；大色块 + 雾（`scene.fog = new THREE.Fog(0x1B2C52, 近, 远)`）拉开层次；发光用 additive/emissive + 泛光感贴片即可（**不引入后处理库**）。
- 禁止外部图片/贴图/字体文件；纹理只许 `CanvasTexture` 程序化生成或纯色材质。
- **禁止参考图**（无真实照片可参照，一切凭代码与截图）。

### 5.2 版式与动效（沿用 `docs/DESIGN.md`）
- 移动优先：内容 `max-width: 480px` 居中，`height: 100dvh`（禁裸 `vh`）。
- 字体：正文 `--tm-font`（LXGW 文楷→楷体兜底）、UI `--tm-font-ui`；正文 16px、标题 20–28px、最小 12px；行高 1.6。
- 入场动效 0.2–0.6s，缓动 `cubic-bezier(0.22, 0.61, 0.36, 1)`；尊重 `prefers-reduced-motion`（3D 场景降级为静帧：停 rAF 或只渲染一帧）。
- 章节切换：淡出 300ms → 内容切换 → 淡入 300ms（3D→3D 可用骑车转场代替硬切）。

## 6. 场景内容要求

### 6.1 四个景点 3D 场景（spot1–spot4）
每站一眼可辨（构图由你迭代决定，以下为必须元素）：
- **spot1 平湖秋月**：如镜湖面 + 倒影/波光、临湖长廊剪影、满月。
- **spot2 宝石山**：山体剪影 + 山顶**保俶塔**（细身多层）、俯瞰城灯点点。
- **spot3 三潭印月**：湖中**三座石塔**（烛光透孔）、水面月影。
- **spot4 吴山城隍阁**：多层飞檐楼阁 + 老城屋顶剪影。
- 共性：夜空 + 月亮（程序化：圆盘 + 光晕贴片）、远山/树层次、雾、缓慢呼吸感动效（月晕、水波）；**镜头静止或极缓慢漂移**（不做运镜大戏，开场已有）。
- HTML 浮层（每个场景结构统一）：序号徽章「第 N 站」→ 站名标题 → 一句话简介 → 看点 2–3 条 → 鹈鹕彩蛋台词 → 「下一站」按钮。文字**不得遮挡主体**，文字区背后可加半透明夜色渐变条保证可读。
- 构图铁律：主体放画面**中上部**，下 1/3 留给文字渐变条；竖屏与横屏都要截图确认主体不被文字压住。

### 6.2 鹈鹕骑车转场
- 侧视视角，参考 `introScene.js` 的骑手/道路做法（车轮转动、路面虚线滚动、身体起伏、背景横移）。
- 时长 **1.5–2.5s**，两端与章节内容 crossfade；可显示「下一站 → 站名」小字。
- 落点：spotN 的「下一站」→ 播放转场 → `next()`；转场播完才允许点击（防连点）。
- 转场模块必须可复用（参数：`{ toTitle, onDone }`）；`map → spot1` 是否也走转场由你实现为可配置，先保证 spot 间生效。

### 6.3 鹈鹕形象
风格与开场一致的**低多边形/扁平几何体**拼装（白色长身、橙色长喙、骑行姿态），不要写实模型；可从 `introScene.js` 抽取到 `parts.js` 复用。

## 7. 禁止事项

- ❌ 新增任何依赖（无 router/UI/后处理/模型库）；❌ 外链资源。
- ❌ 改 `src/scenes/stages.js`、`src/composables/useStage.js`、`src/App.vue`、`package.json`、`docs/` 其他文档。
- ❌ git commit / push / `npm run build`。
- ❌ 破坏开场 `Intro3d` 的现有表现（改 `parts.js` 抽取时必须回归截图开场）。
- ❌ 文案改写（CONTENT.md 逐字）、❌ 中文标点混用（统一全角）。

## 8. 验收清单（自查通过后才汇报）

- [ ] `registry.js` 注册后，底部导航可依次进 spot1–4，文字与按钮完整。
- [ ] 竖屏 390×844 / 横屏 812×375 / 小屏 320×568 三档截图：主体不被文字遮挡、文字不出屏、按钮可点。
- [ ] 「下一站」触发骑车转场，播完到达下一章；连点无异常。
- [ ] 进出各章节 5 轮：无 console 报错、无黑屏、无帧率骤降（DevTools Performance 粗看）。
- [ ] `prefers-reduced-motion` 开启后场景静止可用；WebGL 不可用时降级页有全部文案。
- [ ] 开场 `intro3d` 回归正常。
- [ ] 所有新建 `.js` 过 `node --check`。

## 9. 汇报格式（交给主 agent）

1. **新建/修改文件清单**（含 `registry.js` 最终片段）。
2. **公共 API**：各 `createXxx(canvas, opts)` 的参数与回调签名、转场组件的用法示例。
3. **构图说明**：每站主体位置、文字区位置（附你最终轮次的截图观察描述）。
4. **与规范的偏差**（若有）及原因。
5. **遗留问题 / 需要主 agent 决策的点**（如：是否为转场新增章节 id —— 这类流程改动你不能做，只能上报）。
