# TiHuMoon 设计规范（DESIGN）

## 1. 视觉基调
参考图3 夜景色系（**仅参考不使用原图**）：夜空蓝 + 月光黄双主色，中式中秋夜氛围，扁平插画风。

## 2. 设计令牌（CSS 变量，定义于 `src/style.css`）
| 令牌 | 值 | 用途 |
|---|---|---|
| `--tm-night` | `#2F4C86` | 夜空蓝主背景 |
| `--tm-night-deep` | `#1B2C52` | 深夜蓝 |
| `--tm-night-ink` | `#12203D` | 最深底色 |
| `--tm-ink` | `#2B3F72` | 深蓝文字 |
| `--tm-moon` | `#F7D964` | 月光黄·主强调 |
| `--tm-moon-soft` | `#FFE9A8` | 柔和月光 |
| `--tm-orange` | `#E8843C` | 桂橘橙·次强调 |
| `--tm-lantern` | `#F6C445` | 灯笼暖黄 |
| `--tm-cream` | `#FBF3E0` | 卡片米白 |
| `--tm-cloud` | `#DFE8F5` | 浅蓝灰 |

## 3. 字体
- 正文：`--tm-font` = LXGW WenKai（霞鹜文楷，**Phase 8 嵌入**）→ 系统楷体兜底（Kaiti SC/STKaiti/KaiTi）→ serif
- UI/数字：`--tm-font-ui` = 系统无衬线
- 字号：正文 16px，标题 20–28px，最小 12px；行高 1.6

## 4. 布局与适配
- 高度用 `100dvh`（禁 `vh` 造成的移动端跳动）
- `viewport-fit=cover` + `env(safe-area-inset-*)` 适配刘海/底部横条
- 内容宽 `max-width: 480px` 居中，桌面两侧留夜色渐变
- 横屏：`@media (orientation: landscape)` 卡片改横向排列/限高，`max-height` 控制首屏
- 触控目标 ≥ 44×44px；主按钮全宽胶囊形
- 章节间滚动容器独立，避免整页滚动条

## 5. 章节状态机（线性播放，无自由跳转）
```
intro3d（结束页=首页） → map → spot1..spot6 → riddle → science → make → fly → credits
```
- 仅允许「下一章 / 上一章」相邻移动；首次进入按序推进
- `tihumoon.progress` 记录当前章节 id，重开时在开场结束页询问「继续上次 / 重新开始」
- 章节切换过渡：淡出 300ms → 内容切换 → 淡入 300ms；3D→2D 用渐隐

## 6. 动效原则
- 时长 0.2–0.6s，缓动 `cubic-bezier(0.22, 0.61, 0.36, 1)`
- 月亮/灯笼：呼吸光晕（box-shadow 脉动）；元素入场以上移淡入为主
- 尊重 `prefers-reduced-motion`（全局已降级）

## 7. localStorage
| key | 类型 | 说明 |
|---|---|---|
| `tihumoon.progress` | string | 当前章节 id |
| `tihumoon.nickname` | string | 用户昵称（≤12 字） |
| `tihumoon.blessing` | string | 用户祝福（≤30 字） |
| `tihumoon.made` | '1' | 是否已完成花灯 |

读写统一走 `src/composables/useStorage.js`，容错解析（try/catch + 校验）。

## 8. 组件命名
- 文件：PascalCase，如 `SpotCard.vue`；composable：`useXxx.js`
- CSS 类：`tm-` 前缀或 scoped；CSS 变量全局 `--tm-*`

## 9. 可访问性
- 语义标签 + `aria-label`（图标按钮）；焦点可见 `:focus-visible`
- 对比度：米白字于夜蓝底 ≥ 4.5:1；月光黄仅作强调不作长文本
