// ============================================================
// spot2 · 宝石山 —— 站立山顶俯瞰：脚下山岩 + 保俶塔剪影 + 初阳台 +
// 俯瞰城湖万家（亮窗楼群 / 霓虹 / 灯火倒影）+ 暖橙大月亮 + 左上枝叶入画（参考图1）
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
  buildStreaks,
  buildTree,
  buildBoat,
  buildGlowSprite,
  makeWindowTexture,
  disposeScene,
} from './parts.js'

// 保俶塔：细身多层实心砖塔剪影 + 塔身暖光点（保俶塔灯光）
function buildBaochu() {
  const g = new THREE.Group()
  const mat = new THREE.MeshLambertMaterial({ color: 0x0e1730 })
  const h = 4.6
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.46, h, 8), mat)
  body.position.y = h / 2
  g.add(body)
  for (let i = 0; i < 7; i++) {
    const u = i / 6
    const eave = new THREE.Mesh(new THREE.CylinderGeometry(0.4 - u * 0.15, 0.44 - u * 0.15, 0.09, 8), mat)
    eave.position.y = 0.75 + u * (h - 1.2)
    g.add(eave)
  }
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.62, 8), mat)
  spire.position.y = h + 0.28
  g.add(spire)
  // 暖窗点：贴在塔身四周
  const winMat = new THREE.MeshBasicMaterial({ color: C.window })
  for (let i = 0; i < 4; i++) {
    const y = 1.15 + i * 0.82
    const r = 0.46 - 0.2 * (y / h) + 0.02
    const a = i * 1.65
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.13), winMat)
    w.position.set(Math.sin(a) * r, y, Math.cos(a) * r)
    w.rotation.y = a
    g.add(w)
  }
  return g
}

// 初阳台：六柱石亭剪影（山顶小亭）
function buildPavilion() {
  const g = new THREE.Group()
  const mat = new THREE.MeshLambertMaterial({ color: 0x0e1730 })
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.3, 8), mat)
  base.position.y = 0.15
  g.add(base)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6), mat)
    col.position.set(Math.sin(a) * 0.62, 0.75, Math.cos(a) * 0.62)
    g.add(col)
  }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.55, 6), mat)
  roof.position.y = 1.45
  g.add(roof)
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: C.window }))
  bulb.position.y = 0.62
  g.add(bulb)
  return g
}

export function createSpot2(canvas, opts = {}) {
  const view = initView(canvas, {
    fov: 52,
    near: 0.1,
    far: 240,
    bg: C.nightDeep,
    fog: { color: C.nightDeep, near: 30, far: 155 },
  })
  if (!view) return null
  const { renderer, scene, camera } = view
  addNightLights(scene, { ambient: 1.0, hemi: 0.6, moon: 1.3, moonPos: [2, 12, -40] })

  // —— 天空：疏星 + 暖橙大月亮（参考图1 的橙月）——
  scene.add(buildStars({ count: 90, spread: 90, yMin: 12, yMax: 34, zMin: 40, zMax: 90 }))
  const moon = buildMoon({ radius: 3.4, pos: [1.2, 14, -84], warm: true })
  scene.add(moon.group)

  // —— 湖面（山脚至城市脚下）——
  scene.add(buildWater({ w: 260, d: 100, color: C.lakeDeep, z: -42 }))

  // —— 城市天际线：远排剪影 + 主排亮窗楼 + 近排裙楼 ——
  const neonMats = []
  const reflectionItems = []

  // 远排：纯剪影楼群
  for (let i = 0; i < 8; i++) {
    const w = 3 + Math.abs(Math.sin(i * 2.7)) * 2.4
    const h = 5 + Math.abs(Math.cos(i * 1.8)) * 5.5
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2.4), new THREE.MeshLambertMaterial({ color: 0x0d1730 }))
    b.position.set(-19 + i * 5.4 + Math.sin(i * 3.1) * 1.2, h / 2, -76 - Math.abs(Math.sin(i)) * 3)
    scene.add(b)
  }

  // 单栋亮窗楼（贴 CanvasTexture 亮窗 + 可选霓虹顶带 / 塔冠灯）
  function makeBuilding({ x, z, w, d, h, neon = null, crown = false }) {
    const g = new THREE.Group()
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: 0x0f1a33 }))
    body.position.y = h / 2
    g.add(body)
    const tex = makeWindowTexture({ cols: Math.max(3, Math.round(w * 1.7)), rows: Math.max(5, Math.round(h * 1.5)), litRatio: 0.52 })
    const win = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, h * 0.92), new THREE.MeshBasicMaterial({ map: tex, transparent: true }))
    win.position.set(0, h / 2, d / 2 + 0.02)
    g.add(win)
    if (neon) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.66, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: neon, transparent: true }))
      strip.position.set(0, h - 0.18, d / 2 + 0.06)
      g.add(strip)
      neonMats.push(strip.material)
    }
    if (crown) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), new THREE.MeshBasicMaterial({ color: C.window }))
      bulb.position.set(0, h + 0.12, 0)
      g.add(bulb)
      const gl = buildGlowSprite({ color: C.window, size: 1.3, opacity: 0.5 })
      gl.sprite.position.set(0, h + 0.24, 0)
      g.add(gl.sprite)
    }
    g.position.set(x, 0, z)
    scene.add(g)
    if (neon || crown) {
      reflectionItems.push({ x, z: z + d / 2 + 1, w: w * 0.5, len: 7 + Math.random() * 4, color: neon || C.lantern })
    }
    return g
  }

  const NEONS = [C.neonCyan, C.neonRed, C.lantern, C.moonSoft]
  // 主排高层
  for (let i = 0; i < 7; i++) {
    const h = 6.5 + Math.abs(Math.sin(i * 2.2)) * 6
    makeBuilding({
      x: -17 + i * 5.6 + Math.sin(i * 4.2) * 0.8,
      z: -65,
      w: 2.8 + Math.abs(Math.cos(i * 1.7)) * 1.4,
      d: 2.2,
      h,
      neon: i % 2 === 0 ? NEONS[i % NEONS.length] : null,
      crown: i === 3,
    })
  }
  // 近排裙楼
  for (let i = 0; i < 6; i++) {
    makeBuilding({
      x: -14 + i * 5.8 + Math.sin(i * 2.9) * 0.9,
      z: -55,
      w: 2.2 + Math.abs(Math.sin(i * 1.3)) * 1.0,
      d: 2.0,
      h: 2.8 + Math.abs(Math.cos(i * 2.6)) * 2.6,
      neon: i % 3 === 1 ? NEONS[(i + 2) % NEONS.length] : null,
    })
  }

  // 城市上方光污染柔光 + 楼群水面反光柱
  const cityGlow = buildGlowSprite({ color: 0xffd98a, size: 1, opacity: 0.3 })
  cityGlow.sprite.scale.set(42, 12, 1)
  cityGlow.sprite.position.set(0, 6, -78)
  scene.add(cityGlow.sprite)
  const streaks = buildStreaks({ items: reflectionItems, opacity: 0.14 })
  scene.add(streaks.group)

  // —— 脚下的山：崖顶平台 + 乱石 + 下坡岩块（渲染个样子，参考图1 前景山岩）——
  const rockMat = new THREE.MeshLambertMaterial({ color: C.rock, flatShading: true })
  const rockDeepMat = new THREE.MeshLambertMaterial({ color: C.rockDeep, flatShading: true })
  function rock(x, y, z, sx, sy, sz, mat) {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), mat || rockMat)
    m.scale.set(sx, sy, sz)
    m.position.set(x, y, z)
    scene.add(m)
    return m
  }
  rock(0, 5.3, 13.5, 6.2, 1.7, 4.6) // 站立的崖顶平台
  rock(-4.6, 4.6, 10.2, 3.2, 1.4, 2.6)
  rock(4.8, 4.4, 10.6, 3.0, 1.5, 2.8)
  rock(0.8, 2.9, 6.4, 4.6, 1.5, 3.0, rockDeepMat) // 下坡
  rock(-4.2, 2.0, 3.2, 3.8, 1.3, 2.6, rockDeepMat)
  rock(4.4, 1.8, 2.6, 3.6, 1.2, 2.4, rockDeepMat)

  // 山上草木
  const bushes = [
    [-3.4, 6.6, 9.9, 1.15],
    [3.1, 6.5, 10.2, 1.0],
    [-2.6, 3.9, 4.4, 1.3],
    [3.4, 3.6, 4.9, 1.15],
    [0.8, 6.7, 9.4, 0.9],
  ]
  for (const [x, y, z, s] of bushes) {
    const tree = buildTree(C.leafNight)
    tree.position.set(x, y, z)
    tree.scale.setScalar(s)
    scene.add(tree)
  }

  // —— 保俶塔（左前方山脊上）+ 初阳台（右前方）——
  rock(-2.8, 3.9, 0.2, 3.4, 1.7, 2.4, rockDeepMat) // 塔下脊丘
  const baochu = buildBaochu()
  baochu.position.set(-2.8, 5.2, 0.2)
  scene.add(baochu)
  const towerGlow = buildGlowSprite({ color: C.window, size: 1.6, opacity: 0.28 })
  towerGlow.sprite.position.set(-2.8, 6.6, 0.5)
  scene.add(towerGlow.sprite)
  rock(3.2, 3.5, -1.6, 2.8, 1.5, 2.0, rockDeepMat) // 亭下小丘
  const pav = buildPavilion()
  pav.position.set(3.2, 4.2, -1.6)
  scene.add(pav)

  // —— 左上枝叶入画（近景剪影，宽屏时框住画面）——
  const foliageMat = new THREE.MeshLambertMaterial({ color: C.leafNight })
  function blob(x, y, z, r, sy) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), foliageMat)
    m.scale.y = sy
    m.position.set(x, y, z)
    scene.add(m)
    return m
  }
  blob(-4.6, 9.4, 7.6, 1.6, 0.75)
  blob(-5.9, 10.2, 6.4, 1.25, 0.8)
  blob(-3.4, 10.4, 6.2, 1.0, 0.9)
  const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.4, 6), foliageMat)
  branch.position.set(-5.2, 10.3, 6.8)
  branch.rotation.z = 0.55
  branch.rotation.y = 0.4
  scene.add(branch)

  // —— 湖心夜游船 + 灯光水痕（参考图1 湖面小船）——
  const boat = buildBoat()
  boat.position.set(1.8, 0.05, -24)
  boat.rotation.y = -0.4
  scene.add(boat)
  const boatTrail = buildStreaks({ items: [{ x: 1.8, z: -22.5, w: 0.5, len: 4.5, color: C.lantern }], opacity: 0.13 })
  scene.add(boatTrail.group)

  // —— 相机：立于崖顶远眺，静止 + 极缓慢漂移 ——
  const BASE = new THREE.Vector3(0, 8.2, 11)
  const LOOK = new THREE.Vector3(0, 3.8, -18)
  camera.position.copy(BASE)
  camera.lookAt(LOOK)

  // —— 主循环 ——
  const reduced = prefersReducedMotion()
  const clock = new THREE.Clock()
  let raf = 0
  let elapsed = 0

  function animate(dt, t) {
    moon.haloMat.opacity = 0.7 + Math.sin(t * 0.7) * 0.14
    for (let i = 0; i < neonMats.length; i++) {
      neonMats[i].opacity = 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(t * 2.1 + i * 1.7))
    }
    for (const s of streaks.streaks) s.mat.opacity = 0.1 + 0.07 * (0.5 + 0.5 * Math.sin(t * 1.2 + s.phase))
    for (const s of boatTrail.streaks) s.mat.opacity = 0.09 + 0.06 * (0.5 + 0.5 * Math.sin(t * 1.5 + s.phase))
    boat.position.y = 0.05 + Math.sin(t * 1.0) * 0.025
    boat.rotation.z = Math.sin(t * 0.7) * 0.02
    camera.position.set(BASE.x + Math.sin(t * 0.12) * 0.18, BASE.y + Math.sin(t * 0.09) * 0.06, BASE.z)
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
    fitFov(camera, 52)
    if (reduced) renderOnce()
  })
  fitFov(camera, 52)

  return {
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
