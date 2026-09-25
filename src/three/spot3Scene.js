// ============================================================
// spot3 · 三潭印月 —— 湖心三塔 + 「第 33 个月亮」互动彩蛋：
// 点击石塔逐个点亮（3 塔 × 5 洞 = 15 → 倒映 ×2 = 30 → 真月+倒影 = 32 → 第 33 个在心里）
// 参考 6.2 图：氛围感优先（月影 / 萤火 / 小瀛洲 / 泊船），图中文字全部省略
// ============================================================
import * as THREE from 'three'
import {
  C,
  initView,
  bindResize,
  addNightLights,
  fitFov,
  prefersReducedMotion,
  buildMoon,
  buildStars,
  buildWater,
  buildMoonGlade,
  buildStreaks,
  buildTree,
  buildPagoda,
  buildBoat,
  buildGlowSprite,
  disposeScene,
} from './parts.js'

export function createSpot3(canvas, opts = {}) {
  const view = initView(canvas, {
    fov: 50,
    near: 0.1,
    far: 150,
    bg: C.nightDeep,
    fog: { color: C.nightDeep, near: 16, far: 78 },
  })
  if (!view) return null
  const { renderer, scene, camera } = view
  addNightLights(scene, { ambient: 1.0, hemi: 0.6, moon: 1.3, moonPos: [4, 8, -24] })

  // —— 天空：星 + 满月 + 月光水道 ——
  scene.add(buildStars({ count: 120, spread: 76, yMin: 5, yMax: 26, zMin: 24, zMax: 56 }))
  const moon = buildMoon({ radius: 2.2, pos: [4.6, 7.4, -36] })
  scene.add(moon.group)
  const glade = buildMoonGlade({ x: 4.6, zNear: 8, zFar: -26, width: 2.6, count: 14 })
  scene.add(glade.group)

  // —— 湖面 ——
  scene.add(buildWater({ w: 200, d: 110, color: C.lakeDeep, z: -18 }))

  // —— 远山两层 + 小瀛洲岛 ——
  const hillMat = new THREE.MeshLambertMaterial({ color: C.hill })
  for (let i = -5; i <= 5; i++) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), hillMat)
    const s = 3.4 + Math.abs(Math.sin(i * 2.1)) * 3.4
    hill.scale.set(s, s * 0.4, 1)
    hill.position.set(i * 6 + Math.sin(i * 2.4) * 1.4, 0, -30 - Math.abs(Math.cos(i * 1.4)) * 4)
    scene.add(hill)
  }
  const isle = new THREE.Group()
  const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshLambertMaterial({ color: C.shore }))
  mound.scale.set(5.2, 1.0, 2.4)
  mound.position.y = -0.1
  isle.add(mound)
  for (let i = 0; i < 4; i++) {
    const tree = buildTree(i % 2 ? C.leafNight : C.leafDeep)
    tree.position.set(-2.6 + i * 1.7 + Math.sin(i * 2.2) * 0.5, 0.55, Math.sin(i * 1.4) * 0.6)
    tree.scale.setScalar(0.95 + Math.abs(Math.sin(i * 2.7)) * 0.5)
    isle.add(tree)
  }
  const dockLamp = buildGlowSprite({ color: C.lantern, size: 0.8, opacity: 0.5 })
  dockLamp.sprite.position.set(3.4, 0.75, 0.8)
  isle.add(dockLamp.sprite)
  isle.position.set(-8.2, 0, -14)
  scene.add(isle)

  // —— 三座石塔（等边三角形布阵；初始不点烛，等待点击）——
  const POS = [
    [-2.3, -1.6],
    [2.3, -1.6],
    [0, 0.8],
  ]
  const towers = []
  const hitMeshes = []
  const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  const streakItems = []
  POS.forEach(([x, z], i) => {
    const pag = buildPagoda({ lit: false })
    pag.group.scale.setScalar(1.7)
    pag.group.position.set(x, 0, z)
    pag.group.rotation.y = i * 0.9
    scene.add(pag.group)
    // 烛光泛光 + 点光源 + 水面倒影（点亮后渐显）
    const candle = buildGlowSprite({ color: C.glow, size: 1.7, opacity: 0.6 })
    candle.sprite.position.set(x, 1.45, z)
    candle.sprite.scale.setScalar(0.001)
    scene.add(candle.sprite)
    const light = new THREE.PointLight(0xffd98a, 0, 7, 2)
    light.position.set(x, 1.7, z)
    scene.add(light)
    streakItems.push({ x, z, w: 1.1, len: 3.4, color: C.lantern })
    // 拾取热区（透明球，挂在塔位）
    const hit = new THREE.Mesh(new THREE.SphereGeometry(1.15, 8, 8), hitMat)
    hit.position.set(x, 1.4, z)
    hit.userData.tower = i
    scene.add(hit)
    hitMeshes.push(hit)
    towers.push({ group: pag.group, glowMat: pag.glowMat, candle, light, lit: false, litAt: 0, phase: i * 2.1 })
  })
  const reflections = buildStreaks({ items: streakItems, opacity: 0 })
  for (const r of reflections.streaks) r.mat.opacity = 0
  scene.add(reflections.group)
  // —— 泊船 + 萤火 ——
  const boat = buildBoat()
  boat.position.set(4.9, 0.05, 2.2)
  boat.rotation.y = -0.7
  scene.add(boat)
  const flies = []
  for (let i = 0; i < 7; i++) {
    const gl = buildGlowSprite({ color: C.moonSoft, size: 0.3, opacity: 0.7 })
    const base = {
      x: -4.5 + Math.random() * 9,
      y: 0.8 + Math.random() * 1.4,
      z: -3 + Math.random() * 4,
    }
    gl.sprite.position.set(base.x, base.y, base.z)
    scene.add(gl.sprite)
    flies.push({ sprite: gl.sprite, mat: gl.mat, base, phase: Math.random() * Math.PI * 2 })
  }

  // —— 相机 ——
  const BASE = new THREE.Vector3(0, 2.4, 9)
  const LOOK = new THREE.Vector3(0, 1.1, -2)
  camera.position.copy(BASE)
  camera.lookAt(LOOK)

  // —— 互动 API ——
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()

  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return -1
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
    const hits = raycaster.intersectObjects(hitMeshes, false)
    return hits.length ? hits[0].object.userData.tower : -1
  }

  function lightTower(i) {
    const tw = towers[i]
    if (!tw || tw.lit) return false
    tw.lit = true
    tw.litAt = reduced ? -10 : elapsed
    if (reduced) {
      applyLitStatic(i)
      renderOnce()
    }
    return true
  }

  function isLit(i) {
    return !!(towers[i] && towers[i].lit)
  }

  // 降级静帧：直接置为点亮终态（含倒影）
  function applyLitStatic(i) {
    const tw = towers[i]
    tw.glowMat.opacity = 0.85
    tw.candle.sprite.scale.setScalar(1.7)
    tw.candle.mat.opacity = 0.6
    tw.light.intensity = 0.95
    if (reflections.streaks[i]) reflections.streaks[i].mat.opacity = 0.15
  }

  // —— 主循环 ——
  const reduced = prefersReducedMotion()
  const clock = new THREE.Clock()
  let raf = 0
  let elapsed = 0

  function animate(dt, t) {
    moon.haloMat.opacity = 0.72 + Math.sin(t * 0.8) * 0.14
    for (const d of glade.dashes) d.mat.opacity = 0.08 + 0.1 * (0.5 + 0.5 * Math.sin(t * 1.4 + d.phase))
    boat.position.y = 0.05 + Math.sin(t * 1.05) * 0.026
    boat.rotation.z = Math.sin(t * 0.75) * 0.022
    for (const f of flies) {
      f.sprite.position.set(
        f.base.x + Math.sin(t * 0.5 + f.phase) * 0.55,
        f.base.y + Math.sin(t * 0.85 + f.phase * 1.3) * 0.28,
        f.base.z
      )
      f.mat.opacity = 0.4 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2.2 + f.phase * 2))
    }
    for (const tw of towers) {
      if (!tw.lit) continue
      tw.glowMat.opacity = 0.72 + 0.16 * Math.sin(t * 2.6 + tw.phase)
      // 烛光弹出：0.45s 内从 0 弹到 1
      const pop = Math.min(1, Math.max(0, (t - tw.litAt) * 2.2))
      const ease = 1 - Math.pow(1 - pop, 3)
      const flicker = 0.86 + 0.14 * Math.sin(t * 3.1 + tw.phase)
      tw.candle.sprite.scale.setScalar(Math.max(0.001, 1.7 * ease * flicker))
      tw.light.intensity += (0.95 - tw.light.intensity) * Math.min(1, dt * 3 + 0.02)
    }
    for (let i = 0; i < towers.length; i++) {
      const target = towers[i].lit ? 0.15 : 0
      const m = reflections.streaks[i].mat
      m.opacity += (target - m.opacity) * Math.min(1, dt * 2.5 + 0.02)
    }
    camera.position.set(BASE.x + Math.sin(t * 0.13) * 0.14, BASE.y + Math.sin(t * 0.1) * 0.05, BASE.z)
    camera.lookAt(LOOK)
    renderer.render(scene, camera)
  }

  function renderOnce() {
    animate(0, 0)
  }

  if (reduced) {
    renderOnce()
  } else {
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(clock.getDelta(), 0.05)
      elapsed += dt
      animate(dt, elapsed)
    }
    frame()
  }

  const unbind = bindResize(canvas, renderer, camera, () => {
    fitFov(camera, 50)
    if (reduced) renderOnce()
  })
  fitFov(camera, 50)

  return {
    pick,
    lightTower,
    isLit,
    dispose() {
      cancelAnimationFrame(raf)
      unbind()
      disposeScene(scene)
      renderer.dispose()
      try {
        renderer.forceContextLoss()
      } catch {
        /* 忽略 */
      }
    },
  }
}
