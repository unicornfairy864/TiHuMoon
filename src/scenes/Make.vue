<script setup>
// Phase 6b · make：5 步亲手制作（docs/CONTENT.md §11）
// 第 4 步写昵称+祝福（存 tihumoon.nickname/.blessing），第 5 步点亮（tihumoon.made=1）
import { ref, computed } from 'vue'
import { useStage } from '../composables/useStage.js'
import { readKey, writeKey } from '../composables/useStorage.js'
import { blessings } from '../data/blessings.js'

const { next } = useStage()

const STEPS = [
  { title: '裁纸', desc: '把彩纸裁成长条，剪出上下两个圆底座' },
  { title: '围骨', desc: '长条围成灯笼身，上下底座一扣成形' },
  { title: '装饰', desc: '贴上兔儿爷剪纸、桂花枝、祥云图案' },
  { title: '写祝福', desc: '写上昵称与祝福，它会跟着灯笼一起升空' },
  { title: '点亮', desc: '放入 LED 茶灯、挂上流苏，就等一阵风' },
]

const step = ref(0) // 0..4
const lit = ref(false)
const nickname = ref(readKey('nickname', ''))
const blessing = ref(readKey('blessing', ''))
const err = ref('')

const stepTitle = computed(() => STEPS[step.value].title)
const stepDesc = computed(() => STEPS[step.value].desc)

function shuffleBlessing() {
  let b = blessing.value
  for (let i = 0; i < 8 && b === blessing.value; i++) {
    b = blessings[Math.floor(Math.random() * blessings.length)]
  }
  blessing.value = b.slice(0, 30)
  err.value = ''
}

function nextStep() {
  if (step.value === 3) {
    const n = nickname.value.trim()
    const b = blessing.value.trim()
    if (!n || !b) {
      err.value = '昵称和祝福语都要填哦'
      return
    }
    if (n.length > 12) {
      err.value = '昵称最多 12 个字'
      return
    }
    if (b.length > 30) {
      err.value = '祝福语最多 30 个字'
      return
    }
    nickname.value = n
    blessing.value = b
    writeKey('nickname', n)
    writeKey('blessing', b)
    err.value = ''
  }
  if (step.value < STEPS.length - 1) step.value++
}

function back() {
  if (step.value > 0 && !lit.value) step.value--
}

function lightUp() {
  lit.value = true
  writeKey('made', '1')
}
</script>

<template>
  <section class="mk">
    <p class="mk__kicker">亲手做一盏</p>
    <h2 class="mk__title">{{ stepTitle }}</h2>

    <!-- 5 格进度 -->
    <ol class="mk__dots" aria-label="制作进度">
      <li
        v-for="(s, i) in STEPS"
        :key="s.title"
        :class="{ 'is-done': i < step || lit, 'is-now': i === step && !lit }"
      ></li>
    </ol>

    <!-- 中央灯笼（随步骤进化，最后点亮） -->
    <div class="mk__lantern" :class="[`is-s${step + 1}`, { 'is-lit': lit }]" aria-hidden="true">
      <i class="mk__hang"></i>
      <i class="mk__cap mk__cap--top"></i>
      <i class="mk__body">
        <em v-if="step >= 3 && nickname" class="mk__name">{{ nickname }}</em>
        <em v-if="lit && blessing" class="mk__wish">{{ blessing }}</em>
      </i>
      <i class="mk__cap mk__cap--bot"></i>
      <i class="mk__tassel"></i>
    </div>

    <p class="mk__desc">{{ stepDesc }}</p>

    <!-- 第 4 步：写祝福 -->
    <div v-if="step === 3" class="mk__form">
      <input
        v-model="nickname"
        class="mk__input"
        type="text"
        maxlength="12"
        placeholder="昵称（12 字内）"
        aria-label="昵称"
      />
      <textarea
        v-model="blessing"
        class="mk__input mk__input--area"
        maxlength="30"
        rows="2"
        placeholder="祝福语（30 字内）"
        aria-label="祝福语"
      ></textarea>
      <button class="mk__dice" type="button" @click="shuffleBlessing">🎲 抽一条祝福</button>
      <p v-if="err" class="mk__err" role="alert">{{ err }}</p>
    </div>

    <!-- 控制区 -->
    <div class="mk__actions">
      <button v-if="step < 4" class="tm-btn tm-btn--primary" type="button" @click="nextStep">
        {{ step === 3 ? '写好了，下一步 →' : '下一步 →' }}
      </button>
      <button v-else-if="!lit" class="tm-btn tm-btn--primary" type="button" @click="lightUp">
        点亮花灯
      </button>
      <template v-else>
        <p class="mk__done">做好了！放它去飞吧 🏮</p>
        <button class="tm-btn tm-btn--primary" type="button" @click="next">前往放飞 →</button>
      </template>
    </div>

    <button v-if="step > 0 && !lit" class="mk__back" type="button" @click="back">← 上一步</button>
  </section>
</template>

<style scoped>
.mk {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 20px 44px;
  overflow: hidden;
}

.mk__kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--tm-moon);
  opacity: 0.85;
}

.mk__title {
  margin: 0;
  font-size: clamp(22px, 6vw, 28px);
  letter-spacing: 3px;
  color: var(--tm-cream);
}

/* --- 5 格进度 --- */
.mk__dots {
  list-style: none;
  display: flex;
  gap: 10px;
  margin: 0;
  padding: 0;
}

.mk__dots li {
  width: 26px;
  height: 6px;
  border-radius: var(--tm-radius-pill);
  background: rgb(251 243 224 / 0.18);
  transition: background 0.3s var(--tm-ease);
}

.mk__dots li.is-done {
  background: var(--tm-success);
}

.mk__dots li.is-now {
  background: linear-gradient(90deg, var(--tm-moon), var(--tm-lantern));
}

/* --- 中央灯笼 --- */
.mk__lantern {
  position: relative;
  width: 150px;
  height: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mk__hang {
  width: 2px;
  height: 22px;
  background: rgb(223 232 245 / 0.5);
}

.mk__cap {
  width: 66px;
  height: 13px;
  border-radius: 5px;
  background: linear-gradient(180deg, #8a5a1d, #6b4407);
}

.mk__body {
  position: relative;
  width: 120px;
  height: 118px;
  display: grid;
  place-items: center;
  border-radius: 50% / 46%;
  background:
    repeating-linear-gradient(90deg, rgb(120 30 20 / 0.35) 0 2px, transparent 2px 17px),
    radial-gradient(circle at 35% 30%, #f08a6a, #d9564a 62%, #b23c33);
  box-shadow: inset 0 -12px 24px rgb(90 20 10 / 0.35);
  transition: filter 0.6s, box-shadow 0.6s;
}

.mk__name {
  font-style: normal;
  font-family: var(--tm-font);
  font-size: 15px;
  color: #fff3cf;
  text-shadow: 0 1px 3px rgb(80 10 0 / 0.6);
}

.mk__wish {
  position: absolute;
  bottom: -26px;
  max-width: 220px;
  font-style: normal;
  font-family: var(--tm-font);
  font-size: 12px;
  line-height: 1.4;
  color: var(--tm-moon-soft);
  text-align: center;
}

.mk__cap--bot {
  margin-top: -2px;
}

.mk__tassel {
  width: 3px;
  height: 30px;
  background: linear-gradient(180deg, var(--tm-moon), transparent);
}

/* 步骤进化：1 裁出条纹 → 2 骨架虚线 → 3 贴花 → 4 上字 → 5 待点亮 */
.mk__lantern.is-s1 .mk__body {
  filter: saturate(0.35) brightness(1.1);
}
.mk__lantern.is-s2 .mk__body {
  background:
    repeating-linear-gradient(90deg, transparent 0 15px, rgb(255 243 207 / 0.5) 15px 17px),
    repeating-linear-gradient(0deg, transparent 0 26px, rgb(255 243 207 / 0.4) 26px 28px),
    radial-gradient(circle at 35% 30%, #7e6a58, #5d4d40 70%);
}
.mk__lantern.is-s3 .mk__body {
  background:
    radial-gradient(circle at 26% 34%, #ffe9a8 0 6px, transparent 7px),
    radial-gradient(circle at 74% 60%, #ffe9a8 0 5px, transparent 6px),
    radial-gradient(circle at 60% 24%, #7fc8a9 0 4px, transparent 5px),
    repeating-linear-gradient(90deg, rgb(120 30 20 / 0.3) 0 2px, transparent 2px 17px),
    radial-gradient(circle at 35% 30%, #f08a6a, #d9564a 62%, #b23c33);
}
.mk__lantern.is-s5:not(.is-lit) .mk__body {
  filter: brightness(0.5) saturate(0.7);
}

/* 点亮 */
.mk__lantern.is-lit .mk__body {
  filter: brightness(1.28) saturate(1.1);
  box-shadow:
    inset 0 -12px 24px rgb(90 20 10 / 0.3),
    0 0 34px rgb(246 196 69 / 0.75),
    0 0 80px rgb(246 196 69 / 0.4);
}

.mk__desc {
  margin: 0;
  min-height: 2.6em;
  max-width: 340px;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--tm-cloud);
  opacity: 0.85;
}
/* --- 第 4 步表单 --- */
.mk__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(340px, 100%);
}

.mk__input {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: var(--tm-radius-m);
  border: 1px solid rgb(223 232 245 / 0.3);
  background: rgb(18 32 61 / 0.6);
  color: var(--tm-cream);
  font-family: var(--tm-font);
  font-size: 15px;
  outline: none;
}

.mk__input::placeholder {
  color: rgb(223 232 245 / 0.45);
}

.mk__input:focus {
  border-color: var(--tm-moon);
}

.mk__input--area {
  resize: none;
  line-height: 1.5;
}

.mk__dice {
  align-self: center;
  min-height: 34px;
  padding: 6px 16px;
  border-radius: var(--tm-radius-pill);
  border: 1px dashed rgb(247 217 100 / 0.5);
  background: transparent;
  color: var(--tm-moon);
  font-size: 13px;
  cursor: pointer;
}

.mk__err {
  margin: 0;
  font-size: 12.5px;
  color: var(--tm-danger);
  text-align: center;
}

/* --- 控制区 --- */
.mk__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 46px;
}

.mk__done {
  margin: 0;
  font-family: var(--tm-font);
  font-size: 16px;
  color: var(--tm-moon);
  animation: mk-pop 0.5s var(--tm-ease);
}

@keyframes mk-pop {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  70% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.mk__back {
  min-height: 32px;
  padding: 4px 14px;
  border: none;
  background: transparent;
  color: var(--tm-cloud);
  font-size: 13px;
  opacity: 0.6;
}

/* --- 横屏矮屏 --- */
@media (orientation: landscape) and (max-height: 480px) {
  .mk {
    gap: 6px;
    padding-top: 8px;
  }
  .mk__title {
    font-size: 19px;
  }
  .mk__lantern {
    width: 110px;
    height: 150px;
  }
  .mk__hang {
    height: 10px;
  }
  .mk__body {
    width: 86px;
    height: 82px;
  }
  .mk__cap {
    width: 48px;
    height: 10px;
  }
  .mk__tassel {
    height: 18px;
  }
  .mk__desc {
    min-height: 1.6em;
    font-size: 13px;
  }
  .mk__form {
    width: min(560px, 92%);
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  .mk__input {
    width: 46%;
    min-height: 38px;
  }
  .mk__input--area {
    width: 46%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mk__done {
    animation: none;
  }
}
</style>