<script setup>
// spot1 · 平湖秋月 —— Three.js 夜景 + 文案浮层（CONTENT.md §3 逐字）
import { onMounted, onUnmounted, ref } from 'vue'
import { useStage } from '../composables/useStage.js'
import RideTransition from './RideTransition.vue'
import { createSpot1 } from '../three/spot1Scene.js'

defineProps({
  stage: { type: Object, required: true },
})
const { go } = useStage()

const canvasRef = ref(null)
const webglOk = ref(true)
const riding = ref(false)

// 章节数据（CONTENT.md §3–6）
const NEXT = { id: 'spot2', title: '宝石山' }
const SPOT = {
  no: '第 1 站',
  title: '平湖秋月',
  intro: '西湖北山街尽端，湖面如镜托起一轮满月',
  points: ['白堤灯影', '曲院风荷夜色', '临湖长廊'],
  quote: '鹈鹕说：把轮子停在镜子上，我就拥有两个月亮。',
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
  sceneApi = createSpot1(canvasRef.value)
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
    <canvas v-show="webglOk" ref="canvasRef" class="spot__canvas" aria-label="平湖秋月夜景"></canvas>

    <!-- WebGL 降级：静态渐变夜空 + 全部文案 -->
    <div v-if="!webglOk" class="spot__fallback" aria-hidden="true"></div>

    <!-- 顶部徽章 + 标题 -->
    <div class="spot__head">
      <span class="spot__badge">{{ SPOT.no }}</span>
      <h2 class="spot__title">{{ SPOT.title }}</h2>
    </div>

    <!-- 中部左上简介 -->
    <p class="spot__intro">{{ SPOT.intro }}</p>

    <!-- 下 1/3 文案渐变条 -->
    <div class="spot__panel">
      <ul class="spot__points">
        <li v-for="p in SPOT.points" :key="p">{{ p }}</li>
      </ul>
      <p class="spot__quote">{{ SPOT.quote }}</p>
    </div>

    <!-- 下一站（播转场） -->
    <div class="spot__cta">
      <button class="tm-btn tm-btn--primary spot__next" @click="onNext">下一站 · {{ NEXT.title }}</button>
    </div>

    <!-- 骑车转场 -->
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

/* 降级底色（夜空渐变 + 月晕） */
.spot__fallback {
  background:
    radial-gradient(circle at 72% 18%, rgb(247 217 100 / 0.5), transparent 32%),
    radial-gradient(ellipse 140% 70% at 50% 108%, rgb(18 32 61 / 0.9), transparent 55%),
    linear-gradient(180deg, #24406f, var(--tm-night-ink));
}

/* 顶部：徽章 + 标题 */
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

/* 简介：左上标题下方 */
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

/* 下 1/3：渐变条 + 看点 + 彩蛋 */
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

/* CTA */
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

/* 横屏矮屏：压缩浮层 */
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
