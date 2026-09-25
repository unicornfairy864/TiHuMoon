<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useStage } from '../composables/useStage.js'
import { createIntro } from '../three/introScene.js'

const { next, canResume, resume, restartTour } = useStage()

const canvasRef = ref(null)
const webglOk = ref(true)
const titleOn = ref(false)
const ended = ref(false)

let sceneApi = null

// 动画结束：不自动跳转，停在当前场景并浮出结束页按钮
function onAnimEnd() {
  ended.value = true
}

// 结束页「开始夜游」：进 map（home 章节已并入本页）
function startTour() {
  next()
}

// 右上角小字「跳过」：镜头直达结尾，标题与结束页同帧出现
function skip() {
  if (sceneApi) sceneApi.skip()
  else {
    titleOn.value = true
    ended.value = true
  }
}

onMounted(() => {
  sceneApi = createIntro(canvasRef.value, {
    onFinish: onAnimEnd,
    onTitle: () => {
      titleOn.value = true
    },
  })
  if (!sceneApi) {
    // WebGL 不可用：跳过动画直接展示结束页（动态 SVG 降级后续实装）
    webglOk.value = false
    titleOn.value = true
    ended.value = true
  }
})

onUnmounted(() => {
  if (sceneApi) {
    sceneApi.dispose()
    sceneApi = null
  }
})
</script>

<template>
  <section class="intro">
    <canvas v-show="webglOk" ref="canvasRef" class="intro__canvas" aria-label="3D 鹈鹕骑车开场" />

    <!-- WebGL 降级占位（Phase 3 后续替换为动态 SVG） -->
    <div v-if="!webglOk" class="intro__fallback">
      <div class="intro__moon"></div>
      <p>轻量模式 · 中秋夜，骑上车，带你把杭州的月亮看个遍</p>
    </div>

    <!-- 终幕：左右分割，鹈鹕居左，右半屏「游中秋」逐字显现；结束后浮出开始页按钮 -->
    <div
      class="intro__stage"
      :class="{ 'intro__stage--on': titleOn, 'intro__stage--end': ended }"
    >
      <span class="intro__divider" aria-hidden="true"></span>
      <div class="intro__side">
        <div class="intro__chars" aria-hidden="true">
          <span style="--i: 0">游</span>
          <span style="--i: 1">中</span>
          <span style="--i: 2">秋</span>
        </div>
        <div class="intro__cta">
          <template v-if="canResume">
            <button class="tm-btn tm-btn--primary" @click="resume">继续上次</button>
            <button class="tm-btn tm-btn--ghost" @click="restartTour">重新开始</button>
          </template>
          <button v-else class="tm-btn tm-btn--primary" @click="startTour">开始夜游</button>
        </div>
      </div>
    </div>

    <!-- 跳过：右上角小字，抬高避开手机状态栏 -->
    <button v-if="!ended" class="intro__skip" @click="skip">跳过</button>
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

/* 右上角小字「跳过」：紧贴安全区顶部，不留空行 */
.intro__skip {
  position: absolute;
  right: 12px;
  top: var(--tm-safe-top);
  min-height: 32px;
  padding: 6px 12px;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--tm-cloud);
  background: none;
  border: none;
  border-radius: var(--tm-radius-pill);
  opacity: 0.7;
}

.intro__skip:active {
  color: var(--tm-moon);
  opacity: 1;
}

.intro__stage {
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

/* 右半屏整体块：标题 + 结束页按钮作为一个整体，垂直居中（占右 50%） */
.intro__side {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: clamp(14px, 3vh, 28px);
  width: 50vw;
  padding: clamp(16px, 3vh, 32px) clamp(16px, 4vw, 40px); /* 四周留白，块不贴边 */
}

.intro__chars {
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

/* 结束页：动画结束后自动浮现的开始按钮（块内流式排列，宽度随整块） */
.intro__cta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translateY(12px);
  transition:
    opacity 0.5s var(--tm-ease) 0.15s,
    transform 0.5s var(--tm-ease) 0.15s,
    visibility 0s linear 0.65s;
}

.intro__stage--end .intro__cta {
  opacity: 1;
  visibility: visible;
  transform: none;
  pointer-events: auto;
  transition-delay: 0.15s, 0.15s, 0s;
}

.intro__stage--on .intro__divider {
  transform: scaleY(1);
}

.intro__stage--on .intro__chars span {
  opacity: 1;
  transform: translateY(0);
}

/* 横屏矮屏：压缩结束页按钮 */
@media (orientation: landscape) and (max-height: 480px) {
  .intro__side {
    gap: 8px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .intro__cta {
    gap: 6px;
  }
  .intro__cta .tm-btn {
    min-height: 32px;
    font-size: 12px;
  }
}
</style>
