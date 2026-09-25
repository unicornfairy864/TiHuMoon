# TiHuMoon 子 Agent 任务书（SLAVE — 3D 场景创建与协调）

> **用法**：把本文档全文交给子 agent。**它只读写项目文件，不运行任何命令**；测试、截图、验收由用户手动完成并逐步回传反馈。子 agent 据反馈小步改文件，主 agent 负责阶段流程、文档与提交。汇报格式见 §9。

---

## 1. 你的角色与边界

你是 TiHuMoon（鹈鹕赏月）项目的 **3D 场景实现者**。**你没有运行与测试能力，也不需要**：你的工作范围**只限于读写项目文件**。开发服务器、截图、真机体验与验收全部由**用户**完成，用户会把测试结果逐步反馈给你，你据此继续改文件。

本轮任务（按序）：
1. 把 4 个景点介绍章节（`spot1`–`spot4`）从占位页改为 **Three.js 夜景 3D 场景** + HTML 文案浮层。
2. 实现 **鹈鹕骑车转场**：章节间由侧视鹈鹕骑车动画衔接（点「下一站」→ 骑车转场 → 进入下一章）。
3. 相机/布局按 §5 规范在代码里定好；交付后等用户测试反馈，**分轮次小步修改**。

## 2. 项目背景

- **技术栈**：Vite 8 + Vue 3.5（`<script setup>`）+ three `^0.186.1`（package.json 已装，`import ... from 'three'`）。**无路由、无 UI 库**，章节靠 `useStage()` 切换。
- **章节流**（`src/scenes/stages.js`，11 章，线性）：
  `intro3d → map → spot1 → spot2 → spot3 → spot4 → riddle → science → make → fly → credits`
- **站点内容**：spot1 平湖秋月、spot2 宝石山、spot3 三潭印月、spot4 吴山城隍阁。文案（简介/看点/彩蛋台词）**逐字取自 `docs/CONTENT.md` §3–6，不得改写**。
- **参考实现**：`src/scenes/Intro3d.vue` + `src/three/introScene.js` 是唯一的 3D 范例（相机关键帧、雾、水波、骑手、resize、dispose 全在里面）。**先通读这两个文件再动手。**

## 3. 工作流（只改文件，用户测试）

1. **先读再写**：通读 `src/scenes/Intro3d.vue`、`src/three/introScene.js`、`docs/CONTENT.md`、`src/style.css`，再动手。
2. **小步修改**：一次只交付一组相关改动（一个站点，或只做转场），不要一次性写完全部章节。
3. **静态自查**（你唯一允许的「运行」）：`node --check <文件>.js`；`.vue` 靠逐行读代码自查（标签闭合、导入路径、命名拼写）。
4. **交付**：按 §9 写明改了什么、让用户测什么、预期表现。等用户回传测试结果 → 按反馈改 → 再交付下一轮。
5. 反馈描述不清时**先提问**（哪一站、哪个视角、期望效果），不要凭猜大改。

你**绝不允许**执行：`npm` 任何命令（dev/build/preview）、起服务、截图、测试脚本、git 操作——这些全部由用户执行。

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
- **禁止参考图**（无真实照片可参照，一切凭代码实现，效果由用户测试把关）。

### 5.2 版式与动效（沿用 `docs/DESIGN.md`）
- 移动优先：内容 `max-width: 480px` 居中，`height: 100dvh`（禁裸 `vh`）。
- 字体：正文 `--tm-font`（LXGW 文楷→楷体兜底）、UI `--tm-font-ui`；正文 16px、标题 20–28px、最小 12px；行高 1.6。
- 入场动效 0.2–0.6s，缓动 `cubic-bezier(0.22, 0.61, 0.36, 1)`；尊重 `prefers-reduced-motion`（3D 场景降级为静帧：停 rAF 或只渲染一帧）。
- 章节切换：淡出 300ms → 内容切换 → 淡入 300ms（3D→3D 可用骑车转场代替硬切）。

## 6. 场景内容要求

### 6.1 四个景点 3D 场景（spot1–spot4）
每站一眼可辨（构图按 §5 规范拟定，以下为必须元素）：
- **spot1 平湖秋月**：如镜湖面 + 倒影/波光、临湖长廊剪影、满月。
- **spot2 宝石山**：山体剪影 + 山顶**保俶塔**（细身多层）、俯瞰城灯点点。
- **spot3 三潭印月**：湖中**三座石塔**（烛光透孔）、水面月影。
- **spot4 吴山城隍阁**：多层飞檐楼阁 + 老城屋顶剪影。
- 共性：夜空 + 月亮（程序化：圆盘 + 光晕贴片）、远山/树层次、雾、缓慢呼吸感动效（月晕、水波）；**镜头静止或极缓慢漂移**（不做运镜大戏，开场已有）。
- HTML 浮层（每个场景结构统一）：序号徽章「第 N 站」→ 站名标题 → 一句话简介 → 看点 2–3 条 → 鹈鹕彩蛋台词 → 「下一站」按钮。文字**不得遮挡主体**，文字区背后可加半透明夜色渐变条保证可读。
- 构图铁律：主体放画面**中上部**，下 1/3 留给文字渐变条；竖屏/横屏差异用响应式代码兜底，由用户测试确认主体不被文字压住。

### 6.2 鹈鹕骑车转场
- 侧视视角，参考 `introScene.js` 的骑手/道路做法（车轮转动、路面虚线滚动、身体起伏、背景横移）。
- 时长 **1.5–2.5s**，两端与章节内容 crossfade；可显示「下一站 → 站名」小字。
- 落点：spotN 的「下一站」→ 播放转场 → `next()`；转场播完才允许点击（防连点）。
- 转场模块必须可复用（参数：`{ toTitle, onDone }`）；`map → spot1` 是否也走转场由你实现为可配置，先保证 spot 间生效。

### 6.3 鹈鹕形象
风格与开场一致的**低多边形/扁平几何体**拼装（白色长身、橙色长喙、骑行姿态），不要写实模型；可从 `introScene.js` 抽取到 `parts.js` 复用。

## 7. 禁止事项

- ❌ 运行任何命令做验证（dev/build/preview/截图/测试脚本一律由用户执行）；❌ git commit / push。
- ❌ 新增任何依赖（无 router/UI/后处理/模型库）；❌ 外链资源。
- ❌ 改 `src/scenes/stages.js`、`src/composables/useStage.js`、`src/App.vue`、`package.json`、`docs/` 其他文档。
- ❌ 破坏开场 `Intro3d` 的现有表现（改 `parts.js` 抽取时必须在汇报中提醒用户回归测试开场）。
- ❌ 文案改写（CONTENT.md 逐字）、❌ 中文标点混用（统一全角）。

## 8. 验收（两层分工）

**你交付前的静态自查**（只有这些）：
- [ ] 所有新建 `.js` 过 `node --check`；`.vue` 导入路径、标签闭合、命名逐行核对。
- [ ] 对照 §4–§7 规范逐条检查（契约、dispose、色板、文案逐字、禁止项）。

**用户逐步验收**（每轮交付时，把下面对应的测试点列给用户，收到反馈逐项修）：
- [ ] `registry.js` 注册后，底部导航可依次进 spot1–4，文字与按钮完整。
- [ ] 竖屏 390×844 / 横屏 812×375 / 小屏 320×568：主体不被文字遮挡、文字不出屏、按钮可点。
- [ ] 「下一站」触发骑车转场，播完到达下一章；连点无异常。
- [ ] 进出各章节 5 轮：无 console 报错、无黑屏、无明显掉帧。
- [ ] `prefers-reduced-motion` 开启后场景静止可用；WebGL 不可用时降级页有全部文案。
- [ ] 开场 `intro3d` 回归正常。

## 9. 汇报格式（每轮交付给用户/主 agent）

1. **本轮修改文件清单**（含 `registry.js` 最终片段）+ 每个文件改了什么。
2. **公共 API**：各 `createXxx(canvas, opts)` 的参数与回调签名、转场组件的用法示例。
3. **测试指引**：让用户测什么（章节/操作步骤）、预期表现、对应 §8 用户验收清单的哪几条。
4. **与规范的偏差**（若有）及原因。
5. **遗留问题 / 需要主 agent 决策的点**（如：是否为转场新增章节 id —— 这类流程改动你不能做，只能上报）。

收到用户测试反馈后：复述你的理解 → 小步修改 → 回到第 1 条重新汇报。
