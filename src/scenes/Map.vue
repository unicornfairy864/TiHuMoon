<script setup>
// map · 路线图（CONTENT.md §2）：四站折线 + 鹈鹕图标沿路线移动 + 「出发」进 spot1
import { onMounted, ref } from 'vue'
import { useStage } from '../composables/useStage.js'

defineProps({
  stage: { type: Object, required: true },
})
const { next } = useStage()

const reduced = ref(false)
const drawn = ref(false)

// 四站节点（viewBox 320×520 竖屏坐标）
const STOPS = [
  { no: 1, name: '平湖秋月', x: 62, y: 80, side: 'start' },
  { no: 2, name: '宝石山', x: 238, y: 204, side: 'end' },
  { no: 3, name: '三潭印月', x: 86, y: 340, side: 'start' },
  { no: 4, name: '吴山城隍阁', x: 238, y: 462, side: 'end' },
]
const ROUTE = 'M62 80 L238 204 L86 340 L238 462'

onMounted(() => {
  reduced.value = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced.value) {
    drawn.value = true
  } else {
    requestAnimationFrame(() => {
      drawn.value = true
    })
  }
})
</script>

<template>
  <section class="map">
    <!-- 夜空底 + 星点 -->
    <div class="map__sky" aria-hidden="true"></div>

    <!-- 标题 -->
    <header class="map__head">
      <h2 class="map__title">今晚的赏月路线 · 四站</h2>
      <p class="map__sub">平湖秋月 → 宝石山 → 三潭印月 → 吴山城隍阁</p>
    </header>

    <!-- 路线图 -->
    <div class="map__canvas">
      <svg viewBox="0 0 320 520" preserveAspectRatio="xMidYMid meet" aria-label="四站赏月路线图">
        <!-- 底线（虚线导轨） -->
        <path class="map__ghost" :d="ROUTE" />

        <!-- 路线（描边动画） -->
        <path class="map__route" :class="{ 'map__route--on': drawn }" :d="ROUTE" />

        <!-- 站点 -->
        <g
          v-for="(s, i) in STOPS"
          :key="s.no"
          class="map__stop"
          :class="{ 'map__stop--on': drawn }"
          :style="{ '--i': i }"
        >
          <circle class="map__halo" :cx="s.x" :cy="s.y" r="15" />
          <circle class="map__dot" :cx="s.x" :cy="s.y" r="6.5" />
          <text
            class="map__name"
            :x="s.side === 'start' ? s.x + 17 : s.x - 17"
            :y="s.y + 5"
            :text-anchor="s.side"
          >{{ s.no }}. {{ s.name }}</text>
        </g>

        <!-- 鹈鹕小图标沿路线移动（reduced-motion 下隐藏） -->
        <g v-if="!reduced" class="map__pelican">
          <!-- 自行车 -->
          <circle class="p-wheel" cx="-5" cy="7" r="3.6" />
          <circle class="p-wheel" cx="6" cy="7" r="3.6" />
          <path class="p-frame" d="M-5 7 L0 0 L6 7 M0 0 L2 -5" />
          <!-- 车上的鹈鹕（朝右，随路线滑行保持直立） -->
          <ellipse class="p-body" cx="0" cy="-6" rx="7" ry="4.6" />
          <path class="p-body" d="M-7 -7 L-13 -10 L-8 -4 Z" />
          <circle class="p-body" cx="6" cy="-11" r="3.4" />
          <path class="p-beak" d="M9 -11.5 L15 -9.6 L9 -8 Z" />
          <circle class="p-eye" cx="7" cy="-12" r="0.9" />
          <animateMotion dur="11s" repeatCount="indefinite" :path="ROUTE" />
        </g>
      </svg>
    </div>

    <!-- 出发 → spot1 -->
    <div class="map__cta">
      <button class="tm-btn tm-btn--primary map__go" @click="next">出发 → 平湖秋月</button>
    </div>
  </section>
</template>

<style scoped>
.map {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.map__sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 10%, rgb(247 217 100 / 0.4), transparent 24%),
    radial-gradient(1.5px 1.5px at 18% 22%, rgb(255 255 255 / 0.85) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 66% 14%, rgb(255 255 255 / 0.7) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 34% 58%, rgb(255 255 255 / 0.55) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 86% 66%, rgb(255 255 255 / 0.6) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 12% 82%, rgb(255 255 255 / 0.5) 50%, transparent 51%),
    linear-gradient(180deg, #24406f, var(--tm-night-ink));
  pointer-events: none;
}

.map__head {
  position: absolute;
  top: calc(var(--tm-safe-top) + 14px);
  left: 20px;
  right: 20px;
  pointer-events: none;
}

.map__title {
  margin: 0;
  font-size: 22px;
  letter-spacing: 3px;
  color: var(--tm-cream);
  text-shadow: 0 2px 14px rgb(10 20 45 / 0.65);
}

.map__sub {
  margin: 6px 0 0;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--tm-moon-soft);
  opacity: 0.85;
}

.map__canvas {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(var(--tm-safe-top) + 76px);
  bottom: calc(92px + var(--tm-safe-bottom));
}

.map__canvas svg {
  width: 100%;
  height: 100%;
  display: block;
}

.map__ghost {
  fill: none;
  stroke: rgb(223 232 245 / 0.18);
  stroke-width: 2;
  stroke-dasharray: 2 9;
  stroke-linecap: round;
}

.map__route {
  fill: none;
  stroke: var(--tm-moon);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 700;
  stroke-dashoffset: 700;
  transition: stroke-dashoffset 2.2s var(--tm-ease);
  filter: drop-shadow(0 0 6px rgb(247 217 100 / 0.5));
}

.map__route--on {
  stroke-dashoffset: 0;
}

.map__stop {
  opacity: 0;
  transition: opacity 0.5s var(--tm-ease);
  transition-delay: calc(0.5s + var(--i) * 0.45s);
}

.map__stop--on {
  opacity: 1;
}

.map__halo {
  fill: rgb(247 217 100 / 0.16);
}

.map__dot {
  fill: var(--tm-moon);
  stroke: rgb(10 20 45 / 0.6);
  stroke-width: 1.5;
}

.map__name {
  font-family: var(--tm-font);
  font-size: 14px;
  letter-spacing: 1.5px;
  fill: var(--tm-cream);
  paint-order: stroke;
  stroke: rgb(10 20 45 / 0.65);
  stroke-width: 3px;
}

.map__pelican {
  filter: drop-shadow(0 2px 6px rgb(10 20 45 / 0.6));
}

.p-wheel {
  fill: none;
  stroke: var(--tm-moon);
  stroke-width: 1.4;
}

.p-frame {
  fill: none;
  stroke: var(--tm-orange);
  stroke-width: 1.4;
  stroke-linecap: round;
}

.p-body {
  fill: var(--tm-cream);
}

.p-beak {
  fill: var(--tm-orange);
}

.p-eye {
  fill: var(--tm-night-ink);
}

.map__cta {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: calc(28px + var(--tm-safe-bottom));
  text-align: center;
}

.map__go {
  min-width: min(70vw, 280px);
}

@media (orientation: landscape) and (max-height: 480px) {
  .map__head {
    top: calc(var(--tm-safe-top) + 6px);
  }
  .map__title {
    font-size: 17px;
  }
  .map__sub {
    display: none;
  }
  .map__canvas {
    top: calc(var(--tm-safe-top) + 34px);
    bottom: calc(66px + var(--tm-safe-bottom));
  }
  .map__cta {
    bottom: calc(14px + var(--tm-safe-bottom));
  }
  .map__go {
    min-height: 36px;
    padding: 6px 18px;
    font-size: 13px;
  }
}
</style>
