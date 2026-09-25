import StagePlaceholder from './StagePlaceholder.vue'
import Intro3d from './Intro3d.vue'
import MapRoute from './Map.vue'
import Spot1 from './Spot1.vue'
import Spot2 from './Spot2.vue'
import Spot3 from './Spot3.vue'
import Spot4 from './Spot4.vue'
import Riddle from './Riddle.vue'
import Science from './Science.vue'
import Make from './Make.vue'
import Fly from './Fly.vue'
import Credits from './Credits.vue'

// 章节 id -> 真实场景组件；未实装的章节回落到占位场景
const MAP = {
  intro3d: Intro3d,
  map: MapRoute,
  spot1: Spot1,
  spot2: Spot2,
  spot3: Spot3,
  spot4: Spot4,
  riddle: Riddle,
  science: Science,
  make: Make,
  fly: Fly,
  credits: Credits,
}

export function resolveScene(id) {
  return MAP[id] || StagePlaceholder
}
