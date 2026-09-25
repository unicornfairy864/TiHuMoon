// localStorage 统一封装（容错：隐私模式/超限一律静默降级）
const PREFIX = 'tihumoon.'

export function readKey(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : raw
  } catch (e) {
    return fallback
  }
}

export function writeKey(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, String(value))
    return true
  } catch (e) {
    return false
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch (e) {
    /* 忽略 */
  }
}