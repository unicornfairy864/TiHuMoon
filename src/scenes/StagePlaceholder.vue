<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useStage } from '../composables/useStage.js'
import { readKey } from '../composables/useStorage.js'

const props = defineProps({
  stage: { type: Object, required: true },
})

const { next, resetAll } = useStage()

// intro 占位：3s 后自动进入下一站（现由 Intro3d 实装，此为注册表回落兜底）
let timer = null
onMounted(() => {
  if (props.stage.id === 'intro3d') {
    timer = setTimeout(next, 3000)
  }
})
onUnmounted(() => clearTimeout(timer))

// 读取存档状态，便于验收各章节联动
const nickname = readKey('nickname', '')
const blessing = readKey('blessing', '')
const made = readKey('made', '') === '1'
</script>

<template>
  <section class="ph">
    <div class="ph__moon" aria-hidden="true"></div>
    <p class="ph__kicker">{{ stage.phase }} · 占位场景</p>
    <h2 class="ph__title">{{ stage.title }}</h2>
    <p class="ph__desc">{{ stage.desc }}</p>

    <!-- 0 · intro：自动过渡 + 可跳过 -->
    <template v-if="stage.id === 'intro3d'">
      <p class="ph__hint">3D 鹈鹕骑车开场（Phase 3 实装）</p>
      <button class="tm-btn tm-btn--primary" @click="next">跳过开场</button>
    </template>

    <!-- 11 · credits：署名 + 重置 -->
    <template v-else-if="stage.id === 'credits'">
      <p class="ph__hint">制作：计算机基拔尖基地班-红叶</p>
      <p class="ph__hint">资料鸣谢：杭州赏月资料 · 高陵花灯纸扎技艺 · 霞鹜文楷</p>
      <button class="tm-btn tm-btn--primary" @click="resetAll">重新开始</button>
    </template>

    <!-- 章节存档状态（验收用） -->
    <p v-if="stage.id === 'make'" class="ph__store">存档：{{ made ? '花灯已制作' : '尚未制作' }}</p>
    <p v-if="stage.id === 'fly'" class="ph__store">
      存档：{{ nickname || '（未填昵称）' }} · {{ blessing || '（未填祝福）' }}
    </p>

    <!-- 未实装章节：占位「下一站」保持线性推进（各章实装后由页内 CTA 替代） -->
    <button
      v-if="!['intro3d', 'credits'].includes(stage.id)"
      class="tm-btn tm-btn--primary"
      @click="next"
    >
      下一站
    </button>

    <p v-if="!['intro3d', 'credits'].includes(stage.id)" class="ph__hint">
      本章节内容在 {{ stage.phase }} 实装
    </p>
  </section>
</template>

<style scoped>
.ph {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  padding: 24px 24px 110px;
  overflow: hidden;
}

.ph__moon {
  position: absolute;
  top: 8%;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff7d6, var(--tm-moon) 62%, #e7bd3f);
  box-shadow: 0 0 44px rgb(247 217 100 / 0.5);
  animation: ph-breathe 4s ease-in-out infinite;
}

@keyframes ph-breathe {
  50% {
    box-shadow: 0 0 64px rgb(247 217 100 / 0.75);
  }
}

.ph__kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--tm-moon);
  opacity: 0.85;
}

.ph__title {
  margin: 0;
  font-size: 26px;
  letter-spacing: 2px;
  color: var(--tm-cream);
}

.ph__desc,
.ph__hint,
.ph__store {
  margin: 0;
  font-size: 14px;
  color: var(--tm-cloud);
  opacity: 0.75;
}

.ph__store {
  font-size: 12px;
  padding: 6px 12px;
  border: 1px dashed rgb(223 232 245 / 0.35);
  border-radius: var(--tm-radius-pill);
}

.ph__cta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(280px, 100%);
}
</style>
