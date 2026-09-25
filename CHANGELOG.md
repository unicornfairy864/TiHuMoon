# Changelog

本项目遵循「每次对话一次提交」，版本号按阶段递增。

## [0.3.0] - 2026-09-25

### Phase 3 · 3D 开场（进行中）
### Added
- `src/three/introScene.js` — Three.js 开场场景：程序化低多边形「鹈鹕骑车」（车轮/曲柄/蹬腿动画）+ 月亮星空 + 虚线/灯笼杆/远山三层视差滚动；**7.2s 电影运镜**（CatmullRom 样条：正后方远 → 右侧贴地近 → 正前方远，余弦缓动，竖/横屏自动换算机位距离）
- `src/scenes/Intro3d.vue` — 开场组件：跳过按钮 + WebGL 降级占位（后续替换为动态 SVG 鹈鹕骑车）
- `src/scenes/registry.js` — 章节 id → 场景组件注册表（未实装章节回落 StagePlaceholder）
- `scripts/analyze_photo.py` + `npm run photo` — 实拍照片技术体检：亮度/天空方差/EXIF/亮斑候选（疑似月亮归一化坐标），输出 JSON 供配置月亮锚点（无视觉能力的验收方案）

### Changed
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
