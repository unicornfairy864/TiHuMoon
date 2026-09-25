<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useStage } from '../composables/useStage.js'
import { createIntro } from '../three/introScene.js'

const { next } = useStage()

const canvasRef = ref(null)
const webglOk = ref(true)
const titleOn = ref(false)

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
  disposeScene = createIntro(canvasRef.value, {
    onFinish: finish,
    onTitle: () => {
      titleOn.value = true
    },
  })
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

    <!-- 终幕：左右分割，鹈鹕居左，右半屏「游中秋」逐字显现 -->
    <div class="intro__title" :class="{ 'intro__title--on': titleOn }" aria-hidden="true">
      <span class="intro__divider"></span>
      <div class="intro__chars">
        <span style="--i: 0">游</span>
        <span style="--i: 1">中</span>
        <span style="--i: 2">秋</span>
      </div>
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

.intro__title {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 中央分割线（视觉左右分屏） */
.intro__divider {
  position: absolute;
  left: 50%;
  top: 14%;
  bottom: 14%;
  width: 2px;
  transform: scaleY(0);
  transform-origin: center;
  background: linear-gradient(180deg, transparent, rgb(247 217 100 / 0.75), transparent);
  transition: transform 0.45s var(--tm-ease);
}

.intro__chars {
  position: absolute;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: clamp(6px, 2vw, 18px);
  font-family: var(--tm-font);
  color: var(--tm-moon);
  text-shadow:
    0 0 26px rgb(247 217 100 / 0.45),
    0 2px 10px rgb(10 20 45 / 0.6);
}

.intro__chars span {
  font-size: min(13vw, 20vh);
  line-height: 1;
  font-weight: 700;
  opacity: 0;
  transform: translateY(0.35em);
  transition:
    opacity 0.5s ease,
    transform 0.5s cubic-bezier(0.2, 0.9, 0.25, 1.25);
  transition-delay: calc(0.15s + var(--i) * 0.14s);
}

.intro__title--on .intro__divider {
  transform: scaleY(1);
}

.intro__title--on .intro__chars span {
  opacity: 1;
  transform: translateY(0);
}
</style>
