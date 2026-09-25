<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useStage } from '../composables/useStage.js'
import { createIntro } from '../three/introScene.js'

const { next } = useStage()

const canvasRef = ref(null)
const webglOk = ref(true)

let disposeScene = null
let finished = false
let fallbackTimer = null

function finish() {
  if (finished) return
  finished = true
  if (disposeScene) {
    disposeScene()
    disposeScene = null
  }
  next()
}

onMounted(() => {
  disposeScene = createIntro(canvasRef.value, { onFinish: finish })
  if (!disposeScene) {
    // WebGL 不可用：降级（Phase 3 内将替换为动态 SVG 鹈鹕骑车）
    webglOk.value = false
    fallbackTimer = setTimeout(finish, 3000)
  }
})

onUnmounted(() => {
  clearTimeout(fallbackTimer)
  if (disposeScene) {
    disposeScene()
    disposeScene = null
  }
})
</script>

<template>
  <section class="intro">
    <canvas v-show="webglOk" ref="canvasRef" class="intro__canvas" aria-label="3D 鹈鹕骑车开场" />

    <!-- WebGL 降级占位（Phase 3 后续替换为动态 SVG） -->
    <div v-if="!webglOk" class="intro__fallback">
      <div class="intro__moon"></div>
      <p>轻量模式 · 即将进入</p>
    </div>

    <button class="intro__skip tm-btn tm-btn--ghost" @click="finish">跳过开场</button>
  </section>
</template>

<style scoped>
.intro {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.intro__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.intro__fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--tm-cloud);
  font-size: 14px;
  opacity: 0.85;
}

.intro__moon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff7d6, var(--tm-moon) 62%, #e7bd3f);
  box-shadow: 0 0 48px rgb(247 217 100 / 0.5);
}

.intro__skip {
  position: absolute;
  right: 16px;
  bottom: calc(16px + var(--tm-safe-bottom));
  min-height: 38px;
  padding: 6px 18px;
  font-size: 13px;
  background: rgb(18 32 61 / 0.55);
  backdrop-filter: blur(4px);
}
</style>
