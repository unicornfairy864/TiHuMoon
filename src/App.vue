<script setup>
import { computed } from 'vue'
import { STAGES } from './scenes/stages.js'
import { useStage } from './composables/useStage.js'
import { resolveScene } from './scenes/registry.js'

const { currentId, current, currentIndex, progress, total } = useStage()

const progressPercent = computed(() => `${Math.round(progress.value * 100)}%`)
const isIntro = computed(() => currentId.value === 'intro3d')
</script>

<template>
  <div class="tm-shell" :class="{ 'tm-shell--intro': isIntro }">
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
