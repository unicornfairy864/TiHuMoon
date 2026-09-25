// ============================================================
// BGM 单例：根目录 bgm.mp3 循环播放（App 壳左上角按钮控制）
// 持久化：tihumoon.bgm.enabled（是否启用）/ tihumoon.bgm.time（播放进度）
// credits「重新开始」resetAll 会停播并连同这两项一并删除（resetBgmState）
// 自动播放限制：加载时若存档为启用，尝试恢复播放；被浏览器拦截则
// 静默回到禁用态（存档保留，等用户点击）
// ============================================================
import { ref, readonly } from 'vue'
import { readKey, writeKey, removeKey } from './useStorage.js'
import bgmUrl from '../../bgm.mp3'

const enabled = ref(false)

let audio = null
let lastSave = 0
let suppress = false // reset 清档期间屏蔽回写，避免 pause 事件把 key 写回来

function saveTime() {
  if (!audio || suppress) return
  const now = Date.now()
  if (now - lastSave < 2000) return
  lastSave = now
  writeKey('bgm.time', audio.currentTime.toFixed(1))
}

function ensureAudio() {
  if (audio) return audio
  const el = new Audio(bgmUrl)
  el.loop = true
  el.preload = 'metadata'
  el.volume = 0.7
  // 元数据就绪后恢复进度（过期/超长的存档丢弃）
  el.addEventListener('loadedmetadata', () => {
    const t = parseFloat(readKey('bgm.time', '0'))
    if (Number.isFinite(t) && t > 0 && t < (el.duration || Infinity)) {
      try {
        el.currentTime = t
      } catch {
        /* 忽略 */
      }
    }
  })
  el.addEventListener('timeupdate', saveTime)
  el.addEventListener('pause', () => {
    lastSave = 0
    saveTime()
  })
  window.addEventListener('pagehide', () => {
    lastSave = 0
    saveTime()
  })
  audio = el
  return el
}

async function restore() {
  const el = ensureAudio()
  if (readKey('bgm.enabled', '0') !== '1') return
  try {
    await el.play()
    enabled.value = true
  } catch {
    enabled.value = false // 被自动播放策略拦截：保持存档，等用户点击
  }
}

async function toggle() {
  const el = ensureAudio()
  if (enabled.value) {
    el.pause()
    enabled.value = false
    writeKey('bgm.enabled', '0')
    lastSave = 0
    saveTime()
    return
  }
  try {
    await el.play()
    suppress = false
    enabled.value = true
    writeKey('bgm.enabled', '1')
  } catch {
    enabled.value = false
  }
}

// 重新开始：停播 + 删除进度与启用状态
function resetBgmState() {
  suppress = true
  if (audio) {
    audio.pause()
    try {
      audio.currentTime = 0
    } catch {
      /* 忽略 */
    }
  }
  enabled.value = false
  removeKey('bgm.enabled')
  removeKey('bgm.time')
}

export function useBgm() {
  if (!audio) restore() // 首次使用（App 挂载）：初始化并尝试恢复存档
  return { enabled: readonly(enabled), toggle }
}

export { resetBgmState }
