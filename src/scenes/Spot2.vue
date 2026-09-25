<script setup>
// spot2 · 宝石山 —— 山顶俯瞰城湖万家（CONTENT.md §4 逐字）
import { onMounted, onUnmounted, ref } from 'vue'
import { useStage } from '../composables/useStage.js'
import RideTransition from './RideTransition.vue'
import { createSpot2 } from '../three/spot2Scene.js'

defineProps({
  stage: { type: Object, required: true },
})
const { go } = useStage()

const canvasRef = ref(null)
const webglOk = ref(true)
const riding = ref(false)

const NEXT = { id: 'spot3', title: '三潭印月' }
const SPOT = {
  no: '第 2 站',
  title: '宝石山',
  intro: '登高望月，保俶塔剪影正对西湖',
  points: ['初阳台', '保俶塔灯光', '俯瞰城湖万家'],
  quote: '鹈鹕说：从山上看，月光是洒下来的；骑回山下，就捡一兜回家。',
}

let sceneApi = null

function onNext() {
  if (riding.value) return
  riding.value = true
}

function onRideDone() {
  riding.value = false
  go(NEXT.id)
}

onMounted(() => {
  sceneApi = createSpot2(canvasRef.value)
  if (!sceneApi) webglOk.value = false
})

onUnmounted(() => {
  if (sceneApi) {
    sceneApi.dispose()
    sceneApi = null
  }
})
</script>

<template>
  <section class="spot">
    <canvas v-show="webglOk" ref="canvasRef" class="spot__canvas" aria-label="宝石山夜景"></canvas>
    <div v-if="!webglOk" class="spot__fallback" aria-hidden="true"></div>

    <div class="spot__head">
      <span class="spot__badge">{{ SPOT.no }}</span>
      <h2 class="spot__title">{{ SPOT.title }}</h2>
    </div>

    <p class="spot__intro">{{ SPOT.intro }}</p>

    <div class="spot__panel">
      <ul class="spot__points">
        <li v-for="p in SPOT.points" :key="p">{{ p }}</li>
      </ul>
      <p class="spot__quote">{{ SPOT.quote }}</p>
    </div>

    <div class="spot__cta">
      <button class="tm-btn tm-btn--primary spot__next" @click="onNext">下一站 · {{ NEXT.title }}</button>
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
  pointer-events: none;
}

.spot__fallback {
  background:
    radial-gradient(circle at 50% 30%, rgb(232 164 60 / 0.42), transparent 40%),
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

@media (orientation: landscape) and (max-height: 480px) {
  .spot__intro {
    top: calc(var(--tm-safe-top) + 52px);
    font-size: 12px;
    max-width: 46vw;
  }
  .spot__title {
    font-size: 20px;
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
