<script setup>
// Phase 1 基建占位：后续 Phase 2 接入章节状态机外壳
</script>

<template>
  <main class="boot">
    <div class="moon"></div>
    <h1>鹈鹕赏月 <span>TiHuMoon</span></h1>
    <p>杭州中秋赏月指南 · 建设中</p>
    <p class="hint">Phase 1 · 基础设施已完成（Vite + Vue 3 + Three.js）</p>
  </main>
</template>

<style scoped>
.boot {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  background: linear-gradient(180deg, var(--tm-night-deep), var(--tm-night-ink));
  padding: var(--tm-safe-top) 24px calc(24px + var(--tm-safe-bottom));
}

.moon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff7d6, var(--tm-moon) 60%, #e7bd3f);
  box-shadow: 0 0 48px rgb(247 217 100 / 0.55);
  margin-bottom: 24px;
}

h1 {
  margin: 0;
  font-size: 28px;
  letter-spacing: 2px;
  color: var(--tm-moon);
}

h1 span {
  display: block;
  font-size: 13px;
  letter-spacing: 6px;
  color: var(--tm-cloud);
  opacity: 0.7;
  font-family: var(--tm-font-ui);
}

p {
  margin: 0;
  color: var(--tm-cream);
  opacity: 0.85;
}

.hint {
  font-size: 13px;
  opacity: 0.5;
}
</style>
