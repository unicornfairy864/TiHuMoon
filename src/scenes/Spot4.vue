<script setup>
// spot4 · 吴山城隍阁 —— 阁上观湖观城（CONTENT.md §6 逐字）
import { onMounted, onUnmounted, ref } from 'vue'
import { useStage } from '../composables/useStage.js'
import { createSpot4 } from '../three/spot4Scene.js'

defineProps({
  stage: { type: Object, required: true },
})
const { next } = useStage()

const canvasRef = ref(null)
const webglOk = ref(true)

const SPOT = {
  no: '第 4 站',
  title: '吴山城隍阁',
  intro: '城隍阁上看老杭州与新杭州同框',
  points: ['吴山天风', '鼓楼夜市', '阁上观湖观城'],
  quote: '鹈鹕说：今晚的月亮都看完了？别急，明天它还在这条路线上。',
}

let sceneApi = null

onMounted(() => {
  sceneApi = createSpot4(canvasRef.value)
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
    <canvas v-show="webglOk" ref="canvasRef" class="spot__canvas" aria-label="吴山城隍阁夜景"></canvas>
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

    <!-- 最后一站：进入灯谜章节（用 useStage().next()） -->
    <div class="spot__cta">
      <button class="tm-btn tm-btn--primary spot__next" @click="next">下一站 · 灯谜</button>
    </div>
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
    radial-gradient(circle at 50% 34%, rgb(232 164 60 / 0.45), transparent 38%),
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
