// ============================================================
// spot4 · 吴山城隍阁 —— 三层飞檐楼阁（暖光勾边）+ 巨月悬于阁后 +
// 老城屋顶剪影万家灯火 + 鼓楼夜市灯笼串（参考图3）
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
  buildGlowSprite,
  makeLatticeTexture,
  makePlaqueTexture,
  disposeScene,
} from './parts.js'

export function createSpot4(canvas, opts = {}) {
  const view = initView(canvas, {
    fov: 48,
    near: 0.1,
    far: 170,
    bg: C.nightDeep,
    fog: { color: C.nightDeep, near: 20, far: 90 },
  })
  if (!view) return null
  const { renderer, scene, camera } = view
  addNightLights(scene, { ambient: 1.0, hemi: 0.6, moon: 1.25, moonPos: [0, 10, -18] })
  // 楼身暖光泛光（模拟景观照明自下而上打亮）
  const upA = new THREE.PointLight(0xffc46a, 0.85, 22, 2)
  upA.position.set(-2.8, 2.4, 4.6)
  const upB = new THREE.PointLight(0xffc46a, 0.85, 22, 2)
  upB.position.set(2.8, 3.4, 4.2)
  scene.add(upA, upB)

  // —— 天空：星 + 巨月（悬于阁后，参考图3 构图）——
  scene.add(buildStars({ count: 110, spread: 80, yMin: 8, yMax: 30, zMin: 26, zMax: 60 }))
  const moon = buildMoon({ radius: 3.2, pos: [0, 8.4, -13], warm: true })
  scene.add(moon.group)

  // —— 地面 + 吴山山体 ——
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 44),
    new THREE.MeshLambertMaterial({ color: 0x0e1830 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.set(0, 0, 4)
  scene.add(ground)
  const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshLambertMaterial({ color: 0x101a30 }))
  mound.scale.set(10.5, 1.6, 7)
  mound.position.set(0, -0.5, -1)
  scene.add(mound)

  // —— 城隍阁主体 ——
  const pav = new THREE.Group()
  const pillarMat = new THREE.MeshLambertMaterial({ color: C.pillar })
  const roofMat = new THREE.MeshLambertMaterial({ color: C.roofInk, flatShading: true })
  const stoneMat = new THREE.MeshLambertMaterial({ color: C.stoneDark })
  const glowMat = new THREE.MeshBasicMaterial({ color: C.glow, transparent: true })
  const glowStrips = []
  const latticeA = makeLatticeTexture({ cols: 5, rows: 2 })
  const latticeB = makeLatticeTexture({ cols: 4, rows: 2 })

  function windowPlane(w, h, tex) {
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }))
  }

  // 台基 + 台阶
  const deck = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.9, 5.2), stoneMat)
  deck.position.y = 0.45
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 0.9), stoneMat)
  step1.position.set(0, 0.15, 3.0)
  const step2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.7), stoneMat)
  step2.position.set(0, 0.45, 2.9)
  pav.add(deck, step1, step2)

  // 单层：楼身（四窗面）+ 攒尖顶 + 檐边暖光勾边 + 翘角
  function tier({ w, d, bodyH, yBase, roofR, roofH, tex, plaque = null }) {
    const g = new THREE.Group()
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, bodyH, d), pillarMat)
    body.position.y = yBase + bodyH / 2
    g.add(body)
    const wf = windowPlane(w * 0.82, bodyH * 0.72, tex)
    wf.position.set(0, yBase + bodyH / 2, d / 2 + 0.02)
    const wb = wf.clone()
    wb.position.z = -d / 2 - 0.02
    wb.rotation.y = Math.PI
    const wl = windowPlane(d * 0.82, bodyH * 0.72, tex)
    wl.position.set(-w / 2 - 0.02, yBase + bodyH / 2, 0)
    wl.rotation.y = -Math.PI / 2
    const wr = wl.clone()
    wr.position.x = w / 2 + 0.02
    wr.rotation.y = Math.PI / 2
    g.add(wf, wb, wl, wr)
    if (plaque) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(plaque.w, plaque.h), new THREE.MeshBasicMaterial({ map: makePlaqueTexture(plaque.chars) }))
      p.position.set(0, yBase + bodyH * 0.52, d / 2 + 0.04)
      g.add(p)
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(roofR, roofH, 4), roofMat)
    roof.rotation.y = Math.PI / 4
    roof.scale.z = (d + 0.9) / (w + 0.9)
    roof.position.y = yBase + bodyH + roofH / 2 + 0.06
    g.add(roof)
    // 檐边暖光勾边（前/后/左/右四条）
    const yEave = yBase + bodyH + 0.1
    const zf = d / 2 + 0.24
    const xf = w / 2 + 0.24
    const stripF = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.07, 0.07), glowMat)
    stripF.position.set(0, yEave, zf)
    const stripB = stripF.clone()
    stripB.position.z = -zf
    const stripL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, d + 0.5), glowMat)
    stripL.position.set(-xf, yEave, 0)
    const stripR = stripL.clone()
    stripR.position.x = xf
    g.add(stripF, stripB, stripL, stripR)
    glowStrips.push(glowMat)
    // 四角翘角（小锥上扬）
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const hook = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.5, 6), roofMat)
        hook.position.set(sx * xf, yEave + 0.16, sz * zf)
        hook.rotation.z = -sx * 0.6
        hook.rotation.x = sz * 0.6
        g.add(hook)
      }
    }
    return g
  }

  const t1 = tier({ w: 4.6, d: 3.6, bodyH: 1.9, yBase: 0.9, roofR: 3.05, roofH: 1.15, tex: latticeA })
  const t2 = tier({ w: 3.4, d: 2.6, bodyH: 1.5, yBase: 3.9, roofR: 2.3, roofH: 1.0, tex: latticeB, plaque: { chars: '城隍阁', w: 0.55, h: 1.3 } })
  const t3 = tier({ w: 2.4, d: 1.8, bodyH: 1.15, yBase: 6.4, roofR: 1.62, roofH: 0.85, tex: latticeA })
  pav.add(t1, t2, t3)

  // 塔刹（顶饰 + 顶灯）
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.6, 8), stoneMat)
  spire.position.y = 8.65
  const spireBall = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), new THREE.MeshBasicMaterial({ color: C.window }))
  spireBall.position.y = 9.0
  const topGlow = buildGlowSprite({ color: C.window, size: 1.6, opacity: 0.55 })
  topGlow.sprite.position.y = 9.05
  pav.add(spire, spireBall, topGlow.sprite)
  scene.add(pav)

  // —— 老城屋顶剪影（前景两排，暖窗点点）——
  const houseMat = new THREE.MeshLambertMaterial({ color: 0x0d1730 })
  const houseWin = new THREE.MeshBasicMaterial({ color: C.window })
  function house(x, z, w, h, roofed) {
    const g = new THREE.Group()
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.8), houseMat)
    body.position.y = h / 2
    g.add(body)
    if (roofed) {
      const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.78, h * 0.42, 4), houseMat)
      roof.rotation.y = Math.PI / 4
      roof.position.y = h + h * 0.2
      g.add(roof)
    }
    const nWin = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < nWin; i++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.18), houseWin)
      win.position.set((Math.random() - 0.5) * w * 0.6, h * (0.3 + Math.random() * 0.35), w * 0.4 + 0.02)
      g.add(win)
    }
    g.position.set(x, 0, z)
    scene.add(g)
    return g
  }
  const frontRow = [-7.4, -5.2, -2.7, 2.2, 4.9, 7.2]
  frontRow.forEach((x, i) => house(x + Math.sin(i * 2.3) * 0.3, 4.4 + Math.abs(Math.sin(i)) * 0.8, 1.5 + Math.abs(Math.sin(i * 1.7)) * 0.9, 0.8 + Math.abs(Math.cos(i * 2.1)) * 0.7, i % 2 === 0))
  const backRow = [-6.3, -3.9, 3.6, 6.1]
  backRow.forEach((x, i) => house(x, 3.2 + Math.abs(Math.cos(i)) * 0.5, 1.3 + Math.abs(Math.sin(i * 2.9)) * 0.7, 0.9 + Math.abs(Math.sin(i)) * 0.5, i % 2 === 1))

  // —— 鼓楼夜市：灯笼串 + 立灯 ——
  const lanternMat = new THREE.MeshBasicMaterial({ color: C.orange })
  const lanternGlows = []
  function lanternBall(x, y, z, r) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 10), lanternMat)
    ball.position.set(x, y, z)
    const gl = buildGlowSprite({ color: C.orange, size: r * 5.5, opacity: 0.5 })
    gl.sprite.position.set(x, y, z)
    scene.add(ball, gl.sprite)
    lanternGlows.push(gl)
  }
  // 左侧灯串：杆顶垂到屋檐
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.4, 8), new THREE.MeshLambertMaterial({ color: 0x241d2c }))
  pole.position.set(-6.6, 1.2, 3.6)
  scene.add(pole)
  for (let i = 0; i < 5; i++) {
    const u = i / 4
    const x = -6.6 + u * 2.6
    const y = 2.35 - Math.sin(u * Math.PI) * 0.55 - u * 0.35
    lanternBall(x, y, 3.6, 0.11)
  }
  // 右侧立灯两盏
  for (const [x, z] of [[4.8, 3.2], [5.8, 3.9]]) {
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.9, 6), new THREE.MeshLambertMaterial({ color: 0x241d2c }))
    stand.position.set(x, 0.45, z)
    scene.add(stand)
    lanternBall(x, 1.0, z, 0.13)
  }

  // —— 相机：低角仰观，静止 + 极缓慢漂移 ——
  const BASE = new THREE.Vector3(0, 3.0, 11.5)
  const LOOK = new THREE.Vector3(0, 4.4, 0)
  camera.position.copy(BASE)
  camera.lookAt(LOOK)

  // —— 主循环 ——
  const reduced = prefersReducedMotion()
  const clock = new THREE.Clock()
  let raf = 0
  let elapsed = 0

  function animate(dt, t) {
    moon.haloMat.opacity = 0.7 + Math.sin(t * 0.7) * 0.13
    const stripBase = 0.62 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.6))
    glowMat.opacity = stripBase
    for (let i = 0; i < lanternGlows.length; i++) {
      lanternGlows[i].mat.opacity = 0.38 + 0.2 * (0.5 + 0.5 * Math.sin(t * 2.4 + i * 1.9))
    }
    topGlow.mat.opacity = 0.42 + 0.2 * (0.5 + 0.5 * Math.sin(t * 1.9))
    camera.position.set(BASE.x + Math.sin(t * 0.12) * 0.15, BASE.y + Math.sin(t * 0.1) * 0.06, BASE.z)
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
    fitFov(camera, 48)
    if (reduced) renderOnce()
  })
  fitFov(camera, 48)

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
