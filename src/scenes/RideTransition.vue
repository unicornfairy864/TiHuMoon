<script setup>
// 章节间骑车转场：全屏画布 + 「下一站 → 站名」小字，播完回调 onDone
import { onMounted, onUnmounted, ref } from 'vue'
import { createRide } from '../three/rideScene.js'

const props = defineProps({
  toTitle: { type: String, default: '' },
  duration: { type: Number, default: 2.0 },
})
const emit = defineEmits(['done'])

const canvasRef = ref(null)
const ready = ref(false)
let api = null

onMounted(() => {
  api = createRide(canvasRef.value, { duration: props.duration, onDone: () => emit('done') })
  if (!api) emit('done') // WebGL 不可用直接放行
  ready.value = true
})

onUnmounted(() => {
  if (api) {
    api.dispose()
    api = null
  }
})
</script>

<template>
  <div class="ride">
    <canvas ref="canvasRef" class="ride__canvas" aria-hidden="true"></canvas>
    <Transition name="ride-fade">
      <p v-if="ready && toTitle" class="ride__tag">下一站 → {{ toTitle }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.ride {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: var(--tm-night-deep);
}

.ride__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.ride__tag {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(var(--tm-safe-bottom) + 48px);
  margin: 0;
  text-align: center;
  font-size: 14px;
  letter-spacing: 3px;
  color: var(--tm-moon);
  text-shadow: 0 2px 12px rgb(10 20 45 / 0.65);
}

.ride-fade-enter-active {
  transition: opacity 0.35s var(--tm-ease) 0.25s;
}

.ride-fade-enter-from {
  opacity: 0;
}
</style>
