<script setup>
// Phase 7b · credits：鸣谢（docs/CONTENT.md §13）
// 「重新开始」→ resetAll：清 progress + BGM 状态，回开场动画
import { useStage } from '../composables/useStage.js'

const { resetAll } = useStage()

const THANKS = [
  {
    title: '资料鸣谢',
    items: [
      '杭州赏月地点资料（杭州日报《杭州赏月地图》、浙江在线、本地宝等公开报道）',
      '高陵民间花灯纸扎技艺（西安市地方志办公室公开资料）',
      '霞鹜文楷 LXGW WenKai（SIL Open Font License）',
    ],
  },
  {
    title: '数据鸣谢',
    items: ['200 条随机昵称（用户.txt）', '200 条中秋祝福语（祝福.txt）'],
  },
]
</script>

<template>
  <section class="cr">
    <div class="cr__moon" aria-hidden="true"></div>

    <p class="cr__kicker">旅程终点</p>
    <h2 class="cr__title">TiHuMoon · 鹈鹕赏月</h2>
    <p class="cr__sub">杭州中秋赏月指南 · 骑行四站 · 扎一盏灯 · 放一句祝福</p>

    <div class="cr__make">
      <p class="cr__label">制作</p>
      <p class="cr__name">计算机基拔尖基地班-红叶</p>
    </div>

    <div v-for="g in THANKS" :key="g.title" class="cr__group">
      <p class="cr__label">{{ g.title }}</p>
      <ul class="cr__list">
        <li v-for="t in g.items" :key="t">{{ t }}</li>
      </ul>
    </div>

    <button class="tm-btn tm-btn--primary cr__btn" type="button" @click="resetAll">
      重新开始
    </button>
    <p class="cr__end">但愿人长久，千里共婵娟 🌕</p>
  </section>
</template>

<style scoped>
.cr {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 24px 24px 44px;
  overflow: hidden;
}

.cr__moon {
  position: absolute;
  top: 5%;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff7d6, var(--tm-moon) 62%, #e7bd3f);
  box-shadow: 0 0 40px rgb(247 217 100 / 0.5);
  animation: cr-breathe 4s ease-in-out infinite;
}

@keyframes cr-breathe {
  50% {
    box-shadow: 0 0 60px rgb(247 217 100 / 0.75);
  }
}
.cr__kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--tm-moon);
  opacity: 0.85;
}

.cr__title {
  margin: 0;
  font-size: clamp(24px, 7vw, 32px);
  letter-spacing: 3px;
  color: var(--tm-cream);
}

.cr__sub {
  margin: 0;
  font-size: 13px;
  color: var(--tm-cloud);
  opacity: 0.7;
}

.cr__make {
  margin-top: 6px;
  padding: 12px 26px;
  border-top: 1px solid rgb(247 217 100 / 0.35);
  border-bottom: 1px solid rgb(247 217 100 / 0.35);
}

.cr__label {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--tm-moon);
  opacity: 0.8;
}

.cr__name {
  margin: 0;
  font-family: var(--tm-font);
  font-size: clamp(17px, 5vw, 21px);
  color: var(--tm-moon-soft);
}

.cr__group {
  max-width: 460px;
}

.cr__list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--tm-cloud);
  opacity: 0.78;
}

.cr__btn {
  margin-top: 6px;
  min-width: 180px;
}

.cr__end {
  margin: 0;
  font-family: var(--tm-font);
  font-size: 13px;
  color: var(--tm-cloud);
  opacity: 0.55;
}

/* --- 横屏矮屏 --- */
@media (orientation: landscape) and (max-height: 480px) {
  .cr {
    gap: 7px;
    padding-top: 14px;
  }
  .cr__moon {
    width: 40px;
    height: 40px;
  }
  .cr__title {
    font-size: 20px;
  }
  .cr__sub,
  .cr__end {
    display: none;
  }
  .cr__list {
    font-size: 11.5px;
    line-height: 1.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cr__moon {
    animation: none;
  }
}
</style>