<script setup>
// Phase 7a · fly：放飞祝福（docs/CONTENT.md §12）
// 西湖山影 + 满月 + 星空；预存 4 组随机昵称+祝福错峰升空，
// 第 5 盏是用户自己的（金色高亮、慢速、停留更久）
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStage } from '../composables/useStage.js'
import { readKey } from '../composables/useStorage.js'
import { users } from '../data/users.js'
import { blessings } from '../data/blessings.js'

const { next } = useStage()

const displayName = readKey('nickname', '') || '匿名旅人'
const displayWish = readKey('blessing', '') || '但愿人长久，千里共婵娟。'

// 星空（一次性随机布局）
const stars = Array.from({ length: 46 }, () => ({
  left: `${(Math.random() * 96 + 2).toFixed(1)}%`,
  top: `${(Math.random() * 52 + 2).toFixed(1)}%`,
  width: `${(Math.random() * 2 + 1).toFixed(1)}px`,
  opacity: (Math.random() * 0.55 + 0.3).toFixed(2),
  animationDelay: `${(Math.random() * 3).toFixed(2)}s`,
}))

const lanterns = ref([])
let nextId = 0
const timers = []
let seqTimer = null

function pickPair() {
  return {
    name: users[Math.floor(Math.random() * users.length)],
    wish: blessings[Math.floor(Math.random() * blessings.length)],
  }
}

function launch({ name, wish, mine = false }) {
  if (lanterns.value.length >= 5) return // 同屏最多 5 盏
  const dur = (mine ? 10.5 : 7.5) + Math.random() * 2.5 // mine 更慢
  const x = 8 + Math.random() * 72 // 8% ~ 80%
  const l = {
    id: nextId++,
    name,
    wish,
    mine,
    show: false,
    x,
    h: 62 + Math.random() * 24, // 上升高度 62%~86% 视口高
    dur,
    style: { left: `${x}%`, bottom: '-14%', transitionDuration: `${dur}s` },
  }
  lanterns.value.push(l)
  // 双 rAF 后抬升（确保初始位渲染过一帧；left 已定，只动 bottom）
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      l.style.bottom = `${100 - l.h}%`
    })
  )
  const hold = (mine ? 4.5 : 3.5) + Math.random() // 悬停展示昵称+祝福
  timers.push(setTimeout(() => (l.show = true), dur * 1000))
  timers.push(setTimeout(() => (l.gone = true), (dur + hold) * 1000))
  timers.push(setTimeout(() => {
    lanterns.value = lanterns.value.filter((x) => x.id !== l.id)
  }, (dur + hold + 1.2) * 1000))
}

// 序列：预存 1-4 先升空，第 5 盏用户自己的
function startSequence() {
  const jobs = []
  for (let i = 0; i < 4; i++) jobs.push(pickPair())
  jobs.push({ name: displayName, wish: displayWish, mine: true })
  jobs.forEach((job, i) => {
    seqTimer = setTimeout(() => launch(job), i * 2600) // 错峰起飞
  })
}

function oneMore() {
  launch(pickPair())
}

const mineFlying = computed(() => lanterns.value.some((l) => l.mine && l.show))

onMounted(startSequence)
onUnmounted(() => {
  clearTimeout(seqTimer)
  timers.forEach(clearTimeout)
})
</script>

<template>
  <section class="fy">
    <!-- 背景：星空 + 满月 + 西湖山影 + 水面 -->
    <div class="fy__sky" aria-hidden="true">
      <i v-for="(s, i) in stars" :key="i" class="fy__star" :style="s"></i>
      <i class="fy__moon"></i>
      <svg class="fy__hills" viewBox="0 0 400 90" preserveAspectRatio="none">
        <path
          d="M0,90 L0,58 C30,44 52,52 80,36 C104,22 126,34 150,30 C176,26 190,44 218,40 C246,36 258,18 286,24 C316,30 330,48 356,42 C378,37 390,50 400,46 L400,90 Z"
          fill="#0d1730"
        />
        <path
          d="M0,90 L0,72 C40,62 60,68 96,58 C130,49 150,62 184,60 C216,58 240,46 274,52 C306,58 330,70 360,64 C380,60 392,68 400,66 L400,90 Z"
          fill="#101d38"
        />
      </svg>
      <div class="fy__water"></div>
    </div>

    <!-- 顶部文案 -->
    <header class="fy__head">
      <p class="fy__kicker">放飞祝福</p>
      <p class="fy__line">
        月亮会替你记得 —— <b>{{ displayName }} 的祝福</b>
      </p>
    </header>

    <!-- 灯笼场 -->
    <div class="fy__field" aria-live="polite">
      <div
        v-for="l in lanterns"
        :key="l.id"
        class="fy__lan"
        :class="{ 'is-mine': l.mine, 'is-gone': l.gone }"
        :style="l.style"
      >
        <i class="fy__lan__glow"></i>
        <i class="fy__lan__body"></i>
        <i class="fy__lan__tassel"></i>
        <p v-if="l.show" class="fy__lan__label" :class="{ 'is-mine': l.mine }">
          <b>{{ l.name }}</b>
          <span>{{ l.wish }}</span>
        </p>
      </div>
    </div>

    <!-- 底部操作 -->
    <footer class="fy__foot">
      <button class="tm-btn tm-btn--ghost" type="button" @click="oneMore">再放一盏</button>
      <button class="tm-btn tm-btn--primary" type="button" @click="next">去看看大家的 →</button>
    </footer>

    <p v-if="mineFlying" class="fy__toast">这盏写的是你的名字 🏮</p>
  </section>
</template>

<style scoped>
.fy {
  position: relative;
  flex: 1;
  overflow: hidden;
}

/* --- 背景 --- */
.fy__sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #101d3e 0%, var(--tm-night-deep) 46%, var(--tm-night-ink) 100%);
}

.fy__star {
  position: absolute;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fff;
  animation: fy-twinkle 2.6s ease-in-out infinite;
}

@keyframes fy-twinkle {
  50% {
    opacity: 0.15;
  }
}

.fy__moon {
  position: absolute;
  top: 7%;
  right: 12%;
  width: clamp(74px, 20vw, 120px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fffbe8, var(--tm-moon) 60%, #e7bd3f);
  box-shadow: 0 0 60px rgb(247 217 100 / 0.55), 0 0 140px rgb(247 217 100 / 0.3);
}

.fy__hills {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 11%;
  width: 100%;
  height: 26%;
}

.fy__water {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 12%;
  background: linear-gradient(180deg, #16294d, #101d3e);
}

.fy__water::after {
  content: '';
  position: absolute;
  top: 0;
  right: 12%;
  width: clamp(60px, 16vw, 100px);
  height: 100%;
  background: linear-gradient(180deg, rgb(247 217 100 / 0.35), transparent);
  filter: blur(3px);
}

/* --- 顶部文案 --- */
.fy__head {
  position: absolute;
  top: calc(var(--tm-safe-top) + 56px);
  left: 0;
  right: 0;
  text-align: center;
  padding: 0 20px;
  pointer-events: none;
}

.fy__kicker {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--tm-moon);
  opacity: 0.85;
}

.fy__line {
  margin: 0;
  font-size: clamp(14px, 4vw, 17px);
  color: var(--tm-cloud);
}

.fy__line b {
  color: var(--tm-moon);
  font-family: var(--tm-font);
}

/* --- 灯笼场 --- */
.fy__field {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.fy__lan {
  position: absolute;
  width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition-property: bottom;
  transition-timing-function: linear;
}

.fy__lan.is-gone {
  opacity: 0;
  transition: opacity 1.1s ease;
}
/* --- 灯笼本体 --- */
.fy__lan__glow {
  position: absolute;
  top: 26px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(246 196 69 / 0.5), transparent 65%);
}

.fy__lan__body {
  position: relative;
  width: 34px;
  height: 40px;
  border-radius: 46% / 42%;
  background:
    repeating-linear-gradient(90deg, rgb(120 30 20 / 0.3) 0 2px, transparent 2px 8px),
    radial-gradient(circle at 35% 30%, #ffd98a, var(--tm-lantern) 62%, #d99a24);
  box-shadow: 0 0 18px rgb(246 196 69 / 0.7);
}

.fy__lan__body::before,
.fy__lan__body::after {
  content: '';
  position: absolute;
  left: 25%;
  width: 50%;
  height: 6px;
  border-radius: 3px;
  background: #7a5418;
}

.fy__lan__body::before {
  top: -5px;
}

.fy__lan__body::after {
  bottom: -5px;
}

.fy__lan__tassel {
  width: 2px;
  height: 14px;
  background: linear-gradient(180deg, var(--tm-orange), transparent);
}

/* 用户自己的：金色高亮 + 光环 */
.fy__lan.is-mine .fy__lan__body {
  background:
    repeating-linear-gradient(90deg, rgb(120 60 10 / 0.3) 0 2px, transparent 2px 8px),
    radial-gradient(circle at 35% 30%, #fff3cf, var(--tm-moon) 60%, #e0a92e);
  box-shadow: 0 0 26px rgb(247 217 100 / 0.95), 0 0 60px rgb(247 217 100 / 0.5);
}

.fy__lan.is-mine .fy__lan__glow {
  width: 130px;
  height: 130px;
  top: 8px;
  background: radial-gradient(circle, rgb(247 217 100 / 0.55), transparent 65%);
}

/* --- 到顶浮现昵称 + 祝福 --- */
.fy__lan__label {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: min(64vw, 250px);
  margin: 0;
  padding: 6px 12px;
  border-radius: var(--tm-radius-pill);
  background: rgb(10 20 45 / 0.72);
  border: 1px solid rgb(223 232 245 / 0.3);
  backdrop-filter: blur(4px);
  text-align: center;
  animation: fy-label-in 0.5s var(--tm-ease);
}

.fy__lan__label b {
  display: block;
  font-size: 12px;
  color: var(--tm-moon);
  letter-spacing: 1px;
}

.fy__lan__label span {
  display: block;
  margin-top: 2px;
  font-family: var(--tm-font);
  font-size: 13px;
  line-height: 1.45;
  color: var(--tm-cream);
}

.fy__lan__label.is-mine {
  max-width: min(78vw, 300px);
  border-color: rgb(247 217 100 / 0.7);
  box-shadow: 0 0 18px rgb(247 217 100 / 0.35);
}

.fy__lan__label.is-mine b {
  font-size: 14px;
}

.fy__lan__label.is-mine span {
  font-size: 16px;
  color: var(--tm-moon-soft);
}

@keyframes fy-label-in {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(8px) scale(0.85);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

/* --- 底部操作 --- */
.fy__foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(var(--tm-safe-bottom) + 18px);
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 0 16px;
  z-index: 5;
}

.fy__toast {
  position: absolute;
  left: 50%;
  bottom: calc(var(--tm-safe-bottom) + 76px);
  transform: translateX(-50%);
  margin: 0;
  padding: 6px 14px;
  border-radius: var(--tm-radius-pill);
  background: rgb(247 217 100 / 0.16);
  border: 1px solid rgb(247 217 100 / 0.45);
  color: var(--tm-moon);
  font-size: 12.5px;
  white-space: nowrap;
  animation: fy-label-in 0.5s var(--tm-ease);
}

/* --- 横屏矮屏 --- */
@media (orientation: landscape) and (max-height: 480px) {
  .fy__head {
    top: calc(var(--tm-safe-top) + 40px);
  }
  .fy__kicker {
    display: none;
  }
  .fy__moon {
    top: 5%;
  }
  .fy__foot {
    bottom: calc(var(--tm-safe-bottom) + 8px);
  }
  .fy__toast {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fy__star {
    animation: none;
  }
}
</style>