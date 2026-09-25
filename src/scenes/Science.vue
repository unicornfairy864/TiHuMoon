<script setup>
// Phase 6a · science：高陵花灯 6 工序科普（横向滑动卡片，docs/CONTENT.md §10）
import { useStage } from '../composables/useStage.js'

const { next } = useStage()

const STEPS = [
  { n: '壹', icon: '竹', title: '选材备料', desc: '竹簧扎骨、麻纸连接、35 克白纸备糊' },
  { n: '贰', icon: '扎', title: '扎骨架', desc: '按造型下料，大灯分两次扎成' },
  { n: '叁', icon: '糊', title: '糊纸', desc: '先难后易，平整贴合' },
  { n: '肆', icon: '晾', title: '纸张处理', desc: '神秘配方涂面晾晒，风吹雨淋不坏（独门一绝）' },
  { n: '伍', icon: '染', title: '上色', desc: '单色利落，复色渐染' },
  { n: '陆', icon: '饰', title: '搭配装饰', desc: '贴花瓣、缀剪纸，大功告成' },
]
</script>

<template>
  <section class="sc">
    <p class="sc__kicker">非遗小课堂</p>
    <h2 class="sc__title">一盏花灯，要过六道关</h2>

    <div class="sc__rail" role="list">
      <article v-for="s in STEPS" :key="s.title" class="sc__card" role="listitem">
        <header class="sc__head">
          <span class="sc__icon">{{ s.icon }}</span>
          <span class="sc__no">{{ s.n }}</span>
        </header>
        <h3 class="sc__name">{{ s.title }}</h3>
        <p class="sc__desc">{{ s.desc }}</p>
      </article>
    </div>

    <p class="sc__hint">← 左右滑动看六道工序 →</p>
    <p class="sc__src">资料：高陵民间花灯纸扎技艺（150 余年历史，西安市地方志办公室公开资料）</p>

    <button class="tm-btn tm-btn--primary sc__go" type="button" @click="next">我也来试试 →</button>
  </section>
</template>

<style scoped>
.sc {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 0 36px;
  overflow: hidden;
}

.sc__kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--tm-moon);
  opacity: 0.85;
}

.sc__title {
  margin: 0;
  font-size: clamp(20px, 5.6vw, 26px);
  color: var(--tm-cream);
  letter-spacing: 2px;
}

/* --- 横向滑动卡片 --- */
.sc__rail {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 6px 18px 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.sc__rail::-webkit-scrollbar {
  display: none;
}

.sc__card {
  flex: none;
  width: min(62vw, 230px);
  scroll-snap-align: center;
  padding: 16px 15px 14px;
  border-radius: var(--tm-radius-l);
  border: 1px solid rgb(223 232 245 / 0.2);
  background: linear-gradient(180deg, rgb(251 243 224 / 0.1), rgb(251 243 224 / 0.04));
  text-align: left;
}

.sc__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sc__icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff3cf, var(--tm-lantern) 70%, #e0a92e);
  color: #6b4407;
  font-size: 21px;
  font-weight: 700;
  box-shadow: 0 0 16px rgb(246 196 69 / 0.35);
}

.sc__no {
  font-family: var(--tm-font);
  font-size: 15px;
  color: var(--tm-moon);
  opacity: 0.75;
  letter-spacing: 2px;
}

.sc__name {
  margin: 12px 0 6px;
  font-size: 18px;
  letter-spacing: 2px;
  color: var(--tm-cream);
}

.sc__desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--tm-cloud);
  opacity: 0.85;
}

.sc__hint {
  margin: 0;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--tm-cloud);
  opacity: 0.55;
}

.sc__src {
  margin: 0;
  max-width: 420px;
  padding: 0 20px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--tm-cloud);
  opacity: 0.5;
}

.sc__go {
  margin-top: 4px;
}

/* --- 横屏矮屏 --- */
@media (orientation: landscape) and (max-height: 480px) {
  .sc {
    gap: 7px;
    padding-top: 10px;
  }
  .sc__title {
    font-size: 18px;
  }
  .sc__card {
    width: min(46vw, 210px);
    padding: 10px 12px;
  }
  .sc__icon {
    width: 34px;
    height: 34px;
    font-size: 16px;
  }
  .sc__name {
    margin: 8px 0 4px;
    font-size: 15px;
  }
  .sc__desc {
    font-size: 12px;
  }
  .sc__src {
    display: none;
  }
}
</style>