<script setup>
// spot3 · 三潭印月 —— 三塔点烛 + 「第 33 个月亮」互动彩蛋（CONTENT.md §5 逐字）：
// 点击石塔逐个点亮 → 计数动画（15 → 30 → 32 → 点满后第 33 个揭示）→ 显示「下一站」
import { onMounted, onUnmounted, ref } from 'vue'
import { useStage } from '../composables/useStage.js'
import RideTransition from './RideTransition.vue'
import { createSpot3 } from '../three/spot3Scene.js'

defineProps({
  stage: { type: Object, required: true },
})
const { go } = useStage()

const canvasRef = ref(null)
const webglOk = ref(true)
const riding = ref(false)

const NEXT = { id: 'spot4', title: '吴山城隍阁' }
const SPOT = {
  no: '第 3 站',
  title: '三潭印月',
  intro: '湖心三塔点烛，一夜可见 33 个月亮',
  points: ['小瀛洲', '三塔印月', '人民币一元背面同款'],
  quote: '鹈鹕说：数到 32 个月亮，剩下那个，你自己收好。',
}

// —— 彩蛋状态机（阶段说明逐字取自 CONTENT.md 彩蛋文案）——
const STEP = 110 // 计数步进间隔 ms
const litCount = ref(0) // 已点亮塔数 0–3
const moonCount = ref(0) // 展示中的月亮计数（动画递增）
const stageText = ref('') // 当前阶段说明（点满三塔后出现）
const finalMsg = ref(false) // 第 33 个月亮揭示
let timers = []

function clearTimers() {
  for (const t of timers) clearTimeout(t)
  timers = []
}

// 计数动画：从当前值逐帧推进到目标值
function countTo(target) {
  const from = moonCount.value
  const steps = Math.max(1, target - from)
  for (let i = 1; i <= steps; i++) {
    timers.push(setTimeout(() => {
      moonCount.value = from + i
    }, i * STEP))
  }
}

// 点满三塔：15（3塔×5洞）→ 30（倒映×2）→ 32（+真月+倒影）→ 第 33 个揭示
function runFinale() {
  stageText.value = '3 塔 × 5 洞 = 15 个月亮'
  countTo(15) // 5→15 共 10 步
  timers.push(setTimeout(() => {
    stageText.value = '倒映湖中 ×2 → 30 个'
    countTo(30) // 15→30 共 15 步
  }, 10 * STEP + 700))
  timers.push(setTimeout(() => {
    stageText.value = '加天上真月 + 水中倒影 → 32 个'
    countTo(32) // 30→32 共 2 步
  }, 25 * STEP + 1400))
  timers.push(setTimeout(() => {
    finalMsg.value = true
  }, 27 * STEP + 2200))
}

function onCanvasTap(e) {
  if (!sceneApi || litCount.value >= 3) return
  const hit = sceneApi.pick(e.clientX, e.clientY)
  if (hit < 0 || sceneApi.isLit(hit)) return
  if (!sceneApi.lightTower(hit)) return
  const n = litCount.value + 1
  litCount.value = n
  clearTimers()
  if (n === 1) {
    countTo(5) // 1 塔 = 5 洞
  } else if (n === 2) {
    countTo(10) // 2 塔 = 10 洞
  } else {
    runFinale()
  }
}

function onNext() {
  if (riding.value) return
  riding.value = true
}

function onRideDone() {
  riding.value = false
  go(NEXT.id)
}

let sceneApi = null

onMounted(() => {
  sceneApi = createSpot3(canvasRef.value)
  if (!sceneApi) webglOk.value = false
})

onUnmounted(() => {
  clearTimers()
  if (sceneApi) {
    sceneApi.dispose()
    sceneApi = null
  }
})
</script>

<template>
  <section class="spot">
    <canvas
      v-show="webglOk"
      ref="canvasRef"
      class="spot__canvas spot__canvas--tap"
      aria-label="三潭印月夜景，点击石塔点亮"
      @pointerdown="onCanvasTap"
    ></canvas>

    <!-- 降级页：文案齐全 + 按钮点亮模拟 -->
    <div v-if="!webglOk" class="spot__fallback" aria-hidden="true"></div>

    <div class="spot__head">
      <span class="spot__badge">{{ SPOT.no }}</span>
      <h2 class="spot__title">{{ SPOT.title }}</h2>
    </div>

    <p class="spot__intro">{{ SPOT.intro }}</p>

    <!-- 互动提示 / 计数（主体在画面中上部，提示悬其下方） -->
    <div class="spot__interact" :class="{ 'spot__interact--dim': litCount > 0 && !finalMsg }">
      <p v-if="finalMsg" class="spot__hint spot__hint--final">
        还有 1 个呢？——<b>第 33 个月亮，在你心里。</b>
      </p>
      <p v-else-if="stageText" class="spot__hint spot__hint--count">
        <b>{{ moonCount }}</b> 个月亮 · {{ stageText }}
      </p>
      <p v-else-if="litCount > 0" class="spot__hint spot__hint--count">
        <b>{{ moonCount }}</b> 个月亮
      </p>
      <p v-else class="spot__hint">点一点湖心的石塔，把烛光点亮</p>
    </div>

    <div class="spot__panel">
      <ul class="spot__points">
        <li v-for="p in SPOT.points" :key="p">{{ p }}</li>
      </ul>
      <p class="spot__quote">{{ SPOT.quote }}</p>
    </div>

    <!-- 「下一站」仅在点满三塔（或 WebGL 降级）后显示 -->
    <div class="spot__cta">
      <button v-if="litCount >= 3 || !webglOk" class="tm-btn tm-btn--primary spot__next" @click="onNext">
        下一站 · {{ NEXT.title }}
      </button>
      <p v-else class="spot__locked">点亮三座石塔，继续出发</p>
    </div>

    <RideTransition v-if="riding" :to-title="NEXT.title" @done="onRideDone" />
  </section>
</template>

<style scoped>
.spot {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.spot__canvas,
.spot__fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* 仅本站画布接收点击（其余站画布 pointer-events:none） */
.spot__canvas--tap {
  pointer-events: auto;
  touch-action: manipulation;
}

.spot__fallback {
  pointer-events: none;
  background:
    radial-gradient(circle at 76% 22%, rgb(247 217 100 / 0.5), transparent 30%),
    radial-gradient(ellipse 140% 70% at 50% 108%, rgb(18 32 61 / 0.9), transparent 55%),
    linear-gradient(180deg, #24406f, var(--tm-night-ink));
}

.spot__head {
  position: absolute;
  top: calc(var(--tm-safe-top) + 14px);
  left: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

.spot__badge {
  padding: 3px 10px;
  border: 1px solid rgb(247 217 100 / 0.55);
  border-radius: var(--tm-radius-pill);
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--tm-moon);
}

.spot__title {
  margin: 0;
  font-size: 24px;
  letter-spacing: 4px;
  color: var(--tm-cream);
  text-shadow: 0 2px 14px rgb(10 20 45 / 0.65);
}

.spot__intro {
  position: absolute;
  top: calc(var(--tm-safe-top) + 62px);
  left: 20px;
  max-width: min(64vw, 300px);
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--tm-cloud);
  text-shadow: 0 1px 8px rgb(10 20 45 / 0.7);
}

.spot__intro::before {
  content: '';
  display: block;
  width: 26px;
  height: 2px;
  margin-bottom: 6px;
  background: linear-gradient(90deg, var(--tm-moon), transparent);
}

/* 互动提示：画面中下部、文字条上方 */
.spot__interact {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 30%;
  text-align: center;
  pointer-events: none;
  transition: opacity 0.4s var(--tm-ease);
}

.spot__interact--dim {
  opacity: 0.92;
}

.spot__hint {
  display: inline-block;
  margin: 0;
  padding: 6px 16px;
  border-radius: var(--tm-radius-pill);
  background: rgb(18 32 61 / 0.62);
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--tm-moon-soft);
  backdrop-filter: blur(2px);
}

.spot__hint--count b {
  font-size: 20px;
  color: var(--tm-moon);
  margin: 0 4px;
}

.spot__hint--final {
  color: var(--tm-moon);
  animation: spot3-pop 0.5s var(--tm-ease);
}

.spot__hint--final b {
  color: var(--tm-moon);
}

@keyframes spot3-pop {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.94);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

.spot__panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 34px 20px calc(130px + var(--tm-safe-bottom));
  background: linear-gradient(180deg, transparent, rgb(18 32 61 / 0.88) 42%, rgb(18 32 61 / 0.96));
  pointer-events: none;
}

.spot__points {
  margin: 0 0 8px;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spot__points li {
  padding: 3px 12px;
  border: 1px solid rgb(247 217 100 / 0.35);
  border-radius: var(--tm-radius-pill);
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--tm-moon-soft);
  background: rgb(18 32 61 / 0.5);
}

.spot__quote {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--tm-cloud);
  opacity: 0.9;
}

.spot__cta {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: calc(72px + var(--tm-safe-bottom));
  text-align: center;
}

.spot__next {
  min-width: min(64vw, 260px);
}

.spot__locked {
  margin: 0;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--tm-cloud);
  opacity: 0.75;
}

@media (orientation: landscape) and (max-height: 480px) {
  .spot__intro {
    top: calc(var(--tm-safe-top) + 52px);
    font-size: 12px;
    max-width: 46vw;
  }
  .spot__title {
    font-size: 20px;
  }
  .spot__interact {
    bottom: 34%;
  }
  .spot__panel {
    padding-bottom: calc(106px + var(--tm-safe-bottom));
  }
  .spot__points {
    margin-bottom: 4px;
  }
  .spot__quote {
    display: none;
  }
  .spot__cta {
    bottom: calc(62px + var(--tm-safe-bottom));
  }
  .spot__next {
    min-width: 0;
    min-height: 36px;
    padding: 6px 18px;
    font-size: 13px;
  }
}
</style>
