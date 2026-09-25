<script setup>
// Phase 5 · 灯谜：JHWL 三问三喜（唯一一条，用户原稿逐字保留）
// 流程：选选项 → 翻牌「答对了！」→ 礼盒弹出 → 点击拆开 → 礼物文案 → 收下
// 三份礼物全部拆开后出现「继续出发」进 science
import { ref, computed, onUnmounted } from 'vue'
import { useStage } from '../composables/useStage.js'
import RIDDLE from '../data/riddle.js'

const { next } = useStage()

const phase = ref('pick') // pick | flip | box | gift
const activeIdx = ref(0)
const opened = ref([]) // 已拆开的选项下标
let flipTimer = null

const allOpened = computed(() => opened.value.length >= RIDDLE.options.length)
const giftText = computed(() => RIDDLE.options[activeIdx.value].gift)
const hint = computed(() =>
  allOpened.value
    ? '三份礼物都收齐了 ——'
    : `每一份都算答对 · 已拆开 ${opened.value.length} / ${RIDDLE.options.length} 份礼物`
)

function pick(i) {
  if (phase.value !== 'pick') return
  activeIdx.value = i
  if (opened.value.includes(i)) {
    phase.value = 'gift' // 已拆过的：直接重温礼物
    return
  }
  phase.value = 'flip'
  flipTimer = setTimeout(() => {
    phase.value = 'box'
  }, 850)
}

function openBox() {
  if (phase.value !== 'box') return
  if (!opened.value.includes(activeIdx.value)) opened.value.push(activeIdx.value)
  phase.value = 'gift'
}

function closeGift() {
  if (phase.value !== 'gift') return
  phase.value = 'pick'
}

onUnmounted(() => clearTimeout(flipTimer))
</script>

<template>
  <section class="rd">
    <p class="rd__kicker">中场歇脚 · 灯谜</p>
    <h2 class="rd__lead">{{ RIDDLE.lead }}</h2>
    <p class="rd__q">{{ RIDDLE.q }}</p>

    <ul class="rd__opts">
      <li v-for="(o, i) in RIDDLE.options" :key="o.label">
        <button
          class="rd__opt"
          :class="{ 'is-opened': opened.includes(i) }"
          type="button"
          :disabled="phase !== 'pick'"
          @click="pick(i)"
        >
          <span class="rd__idx">{{ i + 1 }}</span>
          <span class="rd__label">{{ o.label }}</span>
          <span v-if="opened.includes(i)" class="rd__got">✓ 礼物已收</span>
          <span v-else class="rd__arrow">→</span>
        </button>
      </li>
    </ul>

    <p class="rd__hint">{{ hint }}</p>
    <button v-if="allOpened" class="tm-btn tm-btn--primary rd__go" type="button" @click="next">
      继续出发 →
    </button>

    <!-- 翻牌：答对了！ -->
    <Transition name="rd-pop">
      <div v-if="phase === 'flip'" class="rd__mask rd__mask--soft">
        <div class="rd__flip">答对了！</div>
      </div>
    </Transition>

    <!-- 礼盒：点击拆开 -->
    <div v-if="phase === 'box'" class="rd__mask">
      <button class="rd__box" type="button" @click="openBox">
        <i class="rd__box__lid" aria-hidden="true"></i>
        <i class="rd__box__ribbon" aria-hidden="true"></i>
        <span class="rd__box__hint">点击拆开</span>
      </button>
    </div>

    <!-- 礼物文案 -->
    <div v-if="phase === 'gift'" class="rd__mask" @click.self="closeGift">
      <div class="rd__gift" role="dialog" :aria-label="`第 ${activeIdx + 1} 份礼物`">
        <p class="rd__gift__title">恭喜你，获得第 {{ activeIdx + 1 }} 份礼物 ——</p>
        <p class="rd__gift__body">{{ giftText }}</p>
        <button class="tm-btn tm-btn--ghost" type="button" @click="closeGift">收下</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rd {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  padding: 24px 20px 48px;
  overflow: hidden;
}

.rd::before {
  content: '';
  position: absolute;
  top: 6%;
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff7d6, var(--tm-moon) 62%, #e7bd3f);
  box-shadow: 0 0 40px rgb(247 217 100 / 0.45);
  opacity: 0.9;
}

.rd__kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--tm-moon);
  opacity: 0.85;
}

.rd__lead {
  margin: 26px 0 0;
  font-size: clamp(17px, 4.6vw, 22px);
  font-weight: 600;
  color: var(--tm-cream);
}

.rd__q {
  margin: 0;
  padding: 8px 18px;
  font-size: clamp(18px, 5vw, 24px);
  letter-spacing: 1px;
  color: var(--tm-moon);
  border-top: 1px solid rgb(247 217 100 / 0.3);
  border-bottom: 1px solid rgb(247 217 100 / 0.3);
}

/* --- 选项 --- */
.rd__opts {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rd__opt {
  width: 100%;
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--tm-radius-m);
  border: 1px solid rgb(223 232 245 / 0.22);
  background: rgb(251 243 224 / 0.06);
  color: var(--tm-cream);
  font-family: var(--tm-font);
  font-size: 17px;
  text-align: left;
  transition: transform 0.15s var(--tm-ease), border-color 0.2s;
}

.rd__opt:active:not(:disabled) {
  transform: scale(0.98);
}

.rd__opt:disabled {
  opacity: 0.55;
  cursor: default;
}

.rd__opt.is-opened {
  border-color: rgb(127 200 169 / 0.55);
  background: rgb(127 200 169 / 0.1);
  opacity: 0.85;
}

.rd__idx {
  flex: none;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--tm-moon), var(--tm-lantern));
  color: #4a3200;
  font-family: var(--tm-font-ui);
  font-size: 13px;
  font-weight: 700;
}

.rd__label {
  flex: 1;
}

.rd__got {
  font-size: 12px;
  color: var(--tm-success);
  font-family: var(--tm-font-ui);
}

.rd__arrow {
  color: var(--tm-moon);
  opacity: 0.8;
}

.rd__hint {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--tm-cloud);
  opacity: 0.7;
}

.rd__go {
  margin-top: 4px;
}

/* --- 遮罩层（z 低于左上角 BGM 按钮 z40，演示中仍可静音） --- */
.rd__mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(10 20 45 / 0.72);
  backdrop-filter: blur(4px);
}

.rd__mask--soft {
  background: rgb(10 20 45 / 0.35);
  backdrop-filter: none;
  pointer-events: none;
}
/* --- 翻牌「答对了！」 --- */
.rd__flip {
  padding: 18px 40px;
  border-radius: var(--tm-radius-l);
  background: linear-gradient(135deg, var(--tm-moon), var(--tm-lantern));
  color: #4a3200;
  font-family: var(--tm-font);
  font-size: clamp(26px, 8vw, 40px);
  font-weight: 700;
  letter-spacing: 4px;
  box-shadow: var(--tm-shadow-float);
}

.rd-pop-enter-active {
  animation: rd-flip-in 0.5s var(--tm-ease);
}

@keyframes rd-flip-in {
  0% {
    transform: perspective(600px) rotateY(90deg) scale(0.7);
    opacity: 0;
  }
  100% {
    transform: perspective(600px) rotateY(0) scale(1);
    opacity: 1;
  }
}

/* --- 礼盒 --- */
.rd__box {
  position: relative;
  width: min(190px, 52vw);
  aspect-ratio: 1;
  border: none;
  border-radius: var(--tm-radius-m);
  background: linear-gradient(180deg, #f3d9a0 0 34%, #efc373 34% 100%);
  box-shadow: var(--tm-shadow-float), inset 0 -10px 24px rgb(160 100 30 / 0.25);
  cursor: pointer;
  animation: rd-box-bounce 1.1s ease-in-out infinite;
}

.rd__box__lid {
  position: absolute;
  left: -4%;
  top: -12%;
  width: 108%;
  height: 26%;
  border-radius: 10px;
  background: linear-gradient(180deg, #ffe9b8, #f0c76e);
  box-shadow: 0 4px 10px rgb(90 60 10 / 0.3);
}

.rd__box__ribbon {
  position: absolute;
  left: calc(50% - 9px);
  top: -12%;
  width: 18px;
  height: 112%;
  background: linear-gradient(180deg, var(--tm-orange), #d96f2c);
}

.rd__box__hint {
  position: absolute;
  left: 50%;
  bottom: -46px;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--tm-moon-soft);
}

@keyframes rd-box-bounce {
  0%,
  100% {
    transform: translateY(0) rotate(-1.5deg);
  }
  50% {
    transform: translateY(-10px) rotate(1.5deg);
  }
}

/* --- 礼物文案 --- */
.rd__gift {
  width: min(400px, 100%);
  padding: 26px 22px 20px;
  border-radius: var(--tm-radius-l);
  background: linear-gradient(180deg, #fff8e8, #f7e8c6);
  color: #5a4212;
  text-align: center;
  box-shadow: var(--tm-shadow-float);
  animation: rd-gift-in 0.45s var(--tm-ease);
}

.rd__gift__title {
  margin: 0 0 12px;
  font-size: 13px;
  letter-spacing: 1px;
  opacity: 0.75;
}

.rd__gift__body {
  margin: 0 0 18px;
  font-family: var(--tm-font);
  font-size: clamp(18px, 5.4vw, 23px);
  line-height: 1.65;
  color: #7a4a08;
}

.rd__gift .tm-btn--ghost {
  color: #7a4a08;
  border-color: rgb(122 74 8 / 0.4);
}

@keyframes rd-gift-in {
  0% {
    transform: scale(0.72) translateY(16px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* --- 横屏矮屏 --- */
@media (orientation: landscape) and (max-height: 480px) {
  .rd {
    padding-top: 16px;
    gap: 8px;
  }
  .rd::before {
    display: none;
  }
  .rd__lead {
    margin-top: 0;
    font-size: 15px;
  }
  .rd__opt {
    min-height: 44px;
    font-size: 15px;
  }
  .rd__box {
    width: min(130px, 34vh);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rd__box {
    animation: none;
  }
}
</style>