<script setup>
import { computed } from 'vue'
import { STAGES } from './scenes/stages.js'
import { useStage } from './composables/useStage.js'
import { useBgm } from './composables/useBgm.js'
import { resolveScene } from './scenes/registry.js'

const { currentId, current, currentIndex, progress, total } = useStage()
const { enabled: bgmOn, toggle: toggleBgm } = useBgm()

const progressPercent = computed(() => `${Math.round(progress.value * 100)}%`)
const isIntro = computed(() => currentId.value === 'intro3d')
</script>

<template>
  <div class="tm-shell" :class="{ 'tm-shell--intro': isIntro }">
    <!-- 左上角 BGM 开关：页面加载即出现，0.5s 聚焦提示；禁用态带反斜杠 -->
    <button
      class="tm-bgm"
      :class="{ 'is-on': bgmOn }"
      type="button"
      :aria-pressed="bgmOn"
      aria-label="背景音乐开关"
      @click="toggleBgm"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 17.5V6.2l9-2v11.3" />
        <circle cx="6.8" cy="17.5" r="2.3" />
        <circle cx="15.8" cy="15.5" r="2.3" />
      </svg>
      <i class="tm-bgm__slash" aria-hidden="true"></i>
    </button>

    <!-- 顶部：进度条 + 章节名（intro 隐藏） -->
    <header v-if="!isIntro" class="tm-top">
      <div class="tm-top__bar" role="progressbar" :aria-valuenow="currentIndex + 1" :aria-valuemax="total">
        <i :style="{ width: progressPercent }"></i>
      </div>
      <div class="tm-top__meta">
        <span class="tm-top__title">{{ current.title }}</span>
        <span class="tm-top__count">{{ currentIndex + 1 }} / {{ total }}</span>
      </div>
    </header>

    <!-- 章节内容：淡入淡出切换 -->
    <Transition name="stage" mode="out-in">
      <component :is="resolveScene(currentId)" :key="currentId" :stage="current" />
    </Transition>
  </div>
</template>

<style scoped>
.tm-shell {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse 120% 60% at 50% -10%, rgb(47 76 134 / 0.55), transparent),
    linear-gradient(180deg, var(--tm-night-deep), var(--tm-night-ink));
  color: var(--tm-cream);
}

/* --- 顶部进度 --- */
.tm-top {
  padding: calc(var(--tm-safe-top) + 8px) 16px 6px;
  flex: none;
}

.tm-top__bar {
  height: 4px;
  border-radius: var(--tm-radius-pill);
  background: rgb(251 243 224 / 0.15);
  overflow: hidden;
}

.tm-top__bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--tm-moon), var(--tm-orange));
  transition: width 0.4s var(--tm-ease);
}

.tm-top__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  color: var(--tm-cloud);
  opacity: 0.7;
}

.tm-top__title {
  letter-spacing: 2px;
  color: var(--tm-moon);
}

/* --- 左上角 BGM 开关 --- */
.tm-bgm {
  position: absolute;
  left: 12px;
  top: var(--tm-safe-top);
  z-index: 40;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 50%;
  border: 1px solid rgb(251 243 224 / 0.25);
  background: rgb(18 32 61 / 0.55);
  backdrop-filter: blur(6px);
  color: rgb(223 232 245 / 0.55);
  /* 刚加载时 0.5s 聚焦提示 */
  animation: tm-bgm-hint 0.5s ease 0.15s 1 both;
}

.tm-bgm svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tm-bgm svg circle {
  fill: currentColor;
  stroke: none;
}

/* 禁用态：反斜杠（\）划掉音符 */
.tm-bgm__slash {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(
    to bottom right,
    transparent calc(50% - 1px),
    currentColor calc(50% - 1px),
    currentColor calc(50% + 1px),
    transparent calc(50% + 1px)
  );
  opacity: 0.8;
}

.tm-bgm.is-on {
  color: var(--tm-moon);
  border-color: rgb(247 217 100 / 0.55);
  box-shadow: 0 0 14px rgb(247 217 100 / 0.25);
}

.tm-bgm.is-on .tm-bgm__slash {
  display: none;
}

.tm-bgm:active {
  transform: scale(0.94);
}

@keyframes tm-bgm-hint {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  55% {
    transform: scale(1.14);
    opacity: 1;
    box-shadow: 0 0 0 7px rgb(247 217 100 / 0.28);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 0 0 rgb(247 217 100 / 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tm-bgm {
    animation: none;
  }
}

/* --- 横屏：压缩 --- */
@media (orientation: landscape) and (max-height: 480px) {
  .tm-top {
    padding-top: calc(var(--tm-safe-top) + 4px);
  }
  .tm-top__meta {
    margin-top: 3px;
  }
}
</style>
