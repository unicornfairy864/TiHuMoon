# Changelog

本项目遵循「每次对话一次提交」，版本号按阶段递增。

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
