import { ref, computed } from 'vue'
import { STAGES, DEFAULT_STAGE, HOME_STAGE } from '../scenes/stages.js'
import { readKey, writeKey, removeKey } from './useStorage.js'

// 模块级单例：App 与各场景共享同一状态
const currentId = ref(DEFAULT_STAGE)
const resumeId = ref(null) // home 上待确认的断点章节 id

function indexOf(id) {
  return STAGES.findIndex((s) => s.id === id)
}

// 启动时读取断点：仅当存档在 home 之后才提示"继续上次"
;(function init() {
  const saved = readKey('progress', null)
  if (saved && indexOf(saved) > indexOf(HOME_STAGE)) resumeId.value = saved
})()

function go(id) {
  if (indexOf(id) < 0) return
  currentId.value = id
  writeKey('progress', id)
}

function next() {
  const i = indexOf(currentId.value)
  if (i >= 0 && i < STAGES.length - 1) go(STAGES[i + 1].id)
}

function prev() {
  const i = indexOf(currentId.value)
  if (i > 0) go(STAGES[i - 1].id)
}

function resume() {
  if (resumeId.value) {
    go(resumeId.value)
    resumeId.value = null
  }
}

// home「重新开始」：清断点，从路线图重走
function restartTour() {
  resumeId.value = null
  removeKey('progress')
  go('map')
}

// credits「重新开始」：清断点回 home（见 PLAN.md §5 Phase 7）
function resetAll() {
  resumeId.value = null
  removeKey('progress')
  currentId.value = HOME_STAGE
}

export function useStage() {
  const currentIndex = computed(() => Math.max(0, indexOf(currentId.value)))
  const current = computed(() => STAGES[currentIndex.value])
  const isFirst = computed(() => currentIndex.value === 0)
  const isLast = computed(() => currentIndex.value === STAGES.length - 1)
  const progress = computed(() => currentIndex.value / (STAGES.length - 1))
  const showNav = computed(() => current.value.shellNav !== false)

  return {
    currentId,
    current,
    currentIndex,
    isFirst,
    isLast,
    progress,
    showNav,
    total: STAGES.length,
    canResume: computed(() => resumeId.value !== null),
    next,
    prev,
    go,
    resume,
    restartTour,
    resetAll,
  }
}