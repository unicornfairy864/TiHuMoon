// 章节定义：数组顺序 = 线性播放顺序（见 docs/PLAN.md §4）
// shellNav:false 的章节隐藏底部导航（自带 CTA）
export const STAGES = [
  { id: 'intro3d', title: '开场动画', desc: '3D 鹈鹕骑车', phase: 'Phase 3', shellNav: false },
  { id: 'home', title: '鹈鹕赏月', desc: '主界面', phase: 'Phase 4', shellNav: false },
  { id: 'map', title: '今晚的路线', desc: '六站赏月路线图', phase: 'Phase 4' },
  { id: 'spot1', title: '平湖秋月', desc: '第 1 站 · 西湖经典', phase: 'Phase 4' },
  { id: 'spot2', title: '宝石山', desc: '第 2 站 · 登高望月', phase: 'Phase 4' },
  { id: 'spot3', title: '三潭印月', desc: '第 3 站 · 33 个月亮', phase: 'Phase 4' },
  { id: 'spot4', title: '满陇桂雨', desc: '第 4 站 · 桂香伴月', phase: 'Phase 4' },
  { id: 'spot5', title: '吴山城隍阁', desc: '第 5 站 · 城山揽月', phase: 'Phase 4' },
  { id: 'spot6', title: '钱塘江·城市阳台', desc: '第 6 站 · 江天一月', phase: 'Phase 4' },
  { id: 'riddle', title: '灯谜', desc: 'JHWL 三问三喜', phase: 'Phase 5' },
  { id: 'science', title: '花灯六艺', desc: '高陵花灯工序科普', phase: 'Phase 6' },
  { id: 'make', title: '亲手做花灯', desc: '五步完成', phase: 'Phase 6' },
  { id: 'fly', title: '放飞祝福', desc: '灯笼升空', phase: 'Phase 7' },
  { id: 'credits', title: '鸣谢', desc: '计算机基拔尖基地班-红叶', phase: 'Phase 7' },
]

export const DEFAULT_STAGE = 'intro3d'
export const HOME_STAGE = 'home'