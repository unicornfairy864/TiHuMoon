import StagePlaceholder from './StagePlaceholder.vue'
import Intro3d from './Intro3d.vue'

// 章节 id -> 真实场景组件；未实装的章节回落到占位场景
const MAP = {
  intro3d: Intro3d,
}

export function resolveScene(id) {
  return MAP[id] || StagePlaceholder
}
