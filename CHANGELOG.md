# Changelog

本项目遵循「每次对话一次提交」，版本号按阶段递增。

## [0.3.0] - 2026-09-25

### Phase 3 · 3D 开场（进行中）
### Added
- `src/three/introScene.js` — Three.js 开场场景：程序化低多边形「鹈鹕骑车」+ 月亮星空 + 三层视差滚动；**9.5s 电影运镜**（CatmullRom 样条：正后方远 → 右侧贴地近 → 右前方远；速度编排 慢起→加速→侧拍放慢→滑至正面保持；7.4s 触发标题回调，注视点末段右移让鹈鹕居左半屏）
- `src/scenes/Intro3d.vue` — 终幕标题卡：中央分割线 + 右半屏「游中秋」逐字弹出（月光黄，霞鹜文楷），WebGL 降级占位
- `src/scenes/registry.js` — 章节 id → 场景组件注册表（未实装章节回落 StagePlaceholder）
- 开场背景加**三潭印月**：三座瓶形石塔等边三角形布阵、周开五孔暖光烛光、湖面月光碎金 + 旁侧**小篷船**（半圆竹篷、船头小灯、随波轻晃、烛光微闪；资料源 CCTV《三潭印月》）
- 湖对岸后移（远岸离公路 15→20 单位）+ 岸边**葱郁树林**：16 棵球簇树冠（三色深浅、错落两排、慢速视差），远山退至 z-24 之后，雾远裁 48→60 保住绿色
- 湖面改**椭圆**（rx16/rz7.5 @ z-12）：近岸贴回公路（-4.5）、远岸保持 -19.5，曲线边界替代平面直线切边
- 整体后移让位标题：湖心 z-12→-13.5（近岸 -6/远岸 -21）、三塔 +1.6（-11.2/-11.2/-13.8）、小篷船 z-13、碎金同移；树林 -22.4 起、远山 -26 起，避开「游中秋」字面
- **三塔与船移到金线左侧**（鹈鹕一侧）：湖心 x 2.1→-1，TRI (-14.5,-11.5)/(-11.9,-11.5)/(-13.2,-9.2)、小船 (-15.5,-12.5)；投影核算均在画面中线以左
- **鹈鹕后移+景观前移**：骑手与 TARGET z-2（构图不变、骑手更远），湖/三塔/船/碎金/树前移 2（近岸 -4/远岸 -19），塔基高于鹈鹕头线，解除遮挡
- `scripts/analyze_photo.py` + `npm run photo` — 实拍照片技术体检：亮度/天空方差/EXIF/亮斑候选（疑似月亮归一化坐标），输出 JSON 供配置月亮锚点（无视觉能力的验收方案）

### Changed
- 赏月点 **6 → 4 站**：删除「满陇桂雨」「钱塘江·城市阳台」，吴山城隍阁改为 spot4；DESIGN/PLAN/CONTENT/ASSETS 同步（四站路线、拍摄清单 spot1–4）
- 开场运镜改为**全程连续弧线**：删除侧拍停留（单段 easeInOutCubic 0–7.4s，约 3.7s 在侧面以最高速掠过），标题仍 7.4s 触发
- `Intro3d.vue`：「跳过」改为**右上角小字**（`safe-top + 36px` 避开状态栏）→ 直达结尾；动画结束**不再自动跳转**，场景驻留为背景并自动浮出合并后的结束页按钮（首次「开始夜游」；有存档「继续上次 / 重新开始」）
- 章节流程 **home 并入 intro3d 结束页**：`stages.js` 14→13 章节、移除 `HOME_STAGE`；`useStage` 断点判定改为 `indexOf > 0`，credits 重置回开场
- `src/App.vue` — 章节渲染改走 `resolveScene()` 注册表
- `docs/ASSETS.md` — 图片方案改为用户实拍照片（含天空处理对照表：hero/放飞天空留空无月）
- `docs/PLAN.md` — WebGL 降级方案改为动态 SVG 鹈鹕骑车

## [0.2.0] - 2026-09-25

### Phase 2 · 外壳与导航（已完成，待用户验收）
### Added
- `src/composables/useStage.js` — 线性章节状态机（14 章节、断点续玩、重新开始）
- `src/composables/useStorage.js` — localStorage 封装（`tihumoon.*`，容错降级）
- `src/scenes/stages.js` — 章节元数据（id/标题/所属 Phase/导航开关）
- `src/scenes/StagePlaceholder.vue` — 14 章节占位场景（intro 自动过渡、home 断点 CTA、credits 重置）
- `src/App.vue` 重写为章节外壳：顶部进度条 + 章节切换动画 + 底部线性导航
- `src/style.css` 通用按钮 `.tm-btn` 与切换动画
- `docs/ASSETS.md`：4 组图片生成 prompt（中英，可直接复制使用）

### Changed
- `docs/PLAN.md`：新增硬性约束「测试与验收一律交给用户」

## [0.1.0] - 2026-09-25

### Phase 1 · 基础设施（已完成）
### Added
- git 仓库初始化（仅 `main` 分支）+ `.gitignore`
- Vite 8 + Vue 3.5 + Three.js 0.186 脚手架（`npm.cmd` 安装）
- 全局设计令牌 `src/style.css`（夜蓝/月光黄配色、霞鹜文楷字体栈、safe-area）
- 项目文档：`docs/PLAN.md`、`docs/DESIGN.md`、`docs/CONTENT.md`、`docs/ASSETS.md`
- `README.md`、本 Changelog
- 数据转换：`用户.txt`/`祝福.txt`（GBK，各 200 条）→ `src/data/users.js`、`src/data/blessings.js`
- `scripts/convert_data.py`（`npm run convert` 可重跑）
- 首页占位组件 `App.vue`（月亮渐变 + 标题）

### Changed
- `docs/CONTENT.md`：credits 署名确认为「计算机基拔尖基地班-红叶」

### Notes
- 灯谜章节仅保留用户原稿 JHWL 一条，三选项全对 + 礼盒 gag
- 三张参考图仅作风格参考，不直接上站（见 `docs/ASSETS.md` 版权红线）
