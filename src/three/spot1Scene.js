// ============================================================
// spot1 · 平湖秋月 —— 如镜湖面 + 满月倒影 + 临湖长廊剪影 + 白堤灯影 + 曲院风荷
// 参考图4：夜湖对岸亮灯楼阁、月光水道；相机静止微漂移
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
  buildGlints,
  buildTree,
  buildBoat,
  buildGlowSprite,
  disposeScene,
} from './parts.js'

export function createSpot1(canvas, opts = {}) {
  const view = initView(canvas, {
    fov: 50,
    near: 0.1,
    far: 170,
    bg: C.nightDeep,
    fog: { color: C.nightDeep, near: 18, far: 95 },
  })
  if (!view) return null
  const { renderer, scene, camera } = view
  addNightLights(scene, { ambient: 1.0, hemi: 0.6, moon: 1.35, moonPos: [1, 9, -30] })

  // —— 天空：星 + 满月 ——
  scene.add(buildStars({ count: 130, spread: 80, yMin: 5, yMax: 28, zMin: 26, zMax: 60 }))
  const moon = buildMoon({ radius: 2.3, pos: [0.8, 8.6, -52] })
  scene.add(moon.group)

  // —— 湖面 ——
  scene.add(buildWater({ w: 220, d: 140, color: C.lakeDeep, z: -22 }))

  // 月光水道（月亮正下方碎金）
  const glade = buildMoonGlade({ x: 0.8, zNear: 9, zFar: -32, width: 3.0, count: 16 })
  scene.add(glade.group)

  // —— 远山两层 ——
  const hillMat = new THREE.MeshLambertMaterial({ color: C.hill })
  const hillFar = new THREE.MeshLambertMaterial({ color: 0x15213c })
  for (let i = -6; i <= 6; i++) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), i % 2 ? hillMat : hillFar)
    const s = 3.2 + Math.abs(Math.sin(i * 1.9)) * 3.6
    hill.scale.set(s, s * 0.42, 1)
    hill.position.set(i * 5.4 + Math.sin(i * 2.6) * 1.2, 0, -44 - Math.abs(Math.cos(i * 1.3)) * 4)
    scene.add(hill)
  }

  // —— 对岸亮灯小楼阁（参考图4 远景暖光楼）——
  const pavilion = new THREE.Group()
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x1a2745 })
  const winMat = new THREE.MeshBasicMaterial({ color: C.window })
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 1.3), stoneMat)
  base.position.y = 0.25
  const bodyT = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.0, 0.95), stoneMat)
  bodyT.position.y = 1.0
  const winF = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.55), winMat)
  winF.position.set(0, 1.0, 0.48)
  const roofT = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.6, 4), new THREE.MeshLambertMaterial({ color: C.roofInk }))
  roofT.position.y = 1.8
  roofT.rotation.y = Math.PI / 4
  const tipS = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), winMat)
  tipS.position.y = 2.18
  const pavGlow = buildGlowSprite({ color: C.lantern, size: 2.6, opacity: 0.32 })
  pavGlow.sprite.position.y = 1.1
  pavilion.add(base, bodyT, winF, roofT, tipS, pavGlow.sprite)
  pavilion.scale.setScalar(1.7)
  pavilion.position.set(10.5, 0.2, -40)
  scene.add(pavilion)

  // —— 白堤灯影：弧形长堤 + 一串堤灯（灯 + 水面反光）——
  const dikeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-13, 0.05, -2),
    new THREE.Vector3(-7, 0.05, -13),
    new THREE.Vector3(1, 0.05, -24),
    new THREE.Vector3(6, 0.05, -32),
  ])
  const dike = new THREE.Mesh(new THREE.TubeGeometry(dikeCurve, 32, 0.95, 8), new THREE.MeshLambertMaterial({ color: C.shore }))
  dike.scale.y = 0.4
  scene.add(dike)
  const lampMat = new THREE.MeshBasicMaterial({ color: C.lantern })
  const lampSpots = []
  for (let i = 0; i <= 7; i++) {
    const p = dikeCurve.getPointAt(i / 7)
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.5, 6), new THREE.MeshLambertMaterial({ color: C.post }))
    pole.position.set(p.x, 0.75, p.z)
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), lampMat)
    bulb.position.set(p.x, 1.55, p.z)
    const gl = buildGlowSprite({ color: C.lantern, size: 0.85, opacity: 0.5 })
    gl.sprite.position.set(p.x, 1.55, p.z)
    scene.add(pole, bulb, gl.sprite)
    lampSpots.push([p.x, p.z + 0.6, 1.2])
  }
  const lampGlints = buildGlints({ spots: lampSpots, color: C.lantern, opacity: 0.13 })
  scene.add(lampGlints.group)

  // —— 临湖长廊剪影（左岸）：平台 + 列柱 + 微翘檐顶 + 檐下灯笼 ——
  const walk = new THREE.Group()
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x241d2c })
  const deck = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 14), woodMat)
  deck.position.set(0, 0.25, -5)
  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.55, 14), woodMat)
  railL.position.set(-1.05, 0.75, -5)
  const railR = railL.clone()
  railR.position.x = 1.05
  walk.add(deck, railL, railR)
  const colMat = new THREE.MeshLambertMaterial({ color: 0x1c1724 })
  for (let i = 0; i < 7; i++) {
    const z = 2 - i * 2.33
    for (const x of [-1.0, 1.0]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.0, 8), colMat)
      col.position.set(x, 1.5, z)
      walk.add(col)
    }
  }
  const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.16, 14.6), new THREE.MeshLambertMaterial({ color: C.roofInk }))
  roofSlab.position.set(0, 2.62, -5)
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 14.6, 8), colMat)
  ridge.rotation.x = Math.PI / 2
  ridge.position.set(0, 2.78, -5)
  const eaveL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 1.5), new THREE.MeshLambertMaterial({ color: C.roofInk }))
  eaveL.position.set(-1.5, 2.72, 2.6)
  eaveL.rotation.z = 0.38
  const eaveR = eaveL.clone()
  eaveR.position.set(1.5, 2.72, 2.6)
  eaveR.rotation.z = -0.38
  const eaveL2 = eaveL.clone()
  eaveL2.position.set(-1.5, 2.72, -12.6)
  const eaveR2 = eaveR.clone()
  eaveR2.position.set(1.5, 2.72, -12.6)
  walk.add(roofSlab, ridge, eaveL, eaveR, eaveL2, eaveR2)
  const lanternSpots = []
  for (let i = 0; i < 5; i++) {
    const z = 1.2 - i * 3.1
    const lant = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), lampMat)
    lant.position.set(i % 2 ? 0.7 : -0.7, 2.3, z)
    const gl = buildGlowSprite({ color: C.lantern, size: 1.0, opacity: 0.55 })
    gl.sprite.position.copy(lant.position)
    walk.add(lant, gl.sprite)
    lanternSpots.push([lant.position.x, z + 0.3, 1.1])
  }
  walk.position.set(-8.6, 0, 4)
  scene.add(walk)
  const lanternGlints = buildGlints({ spots: lanternSpots, color: C.lantern, opacity: 0.11 })
  scene.add(lanternGlints.group)

  // —— 曲院风荷：右前景荷叶 + 花苞，随波轻晃 ——
  const lotus = []
  const padMatA = new THREE.MeshLambertMaterial({ color: C.leafDeep })
  const padMatB = new THREE.MeshLambertMaterial({ color: C.leaf2 })
  for (let i = 0; i < 8; i++) {
    const pad = new THREE.Mesh(new THREE.CircleGeometry(0.34 + Math.random() * 0.28, 14), i % 2 ? padMatA : padMatB)
    pad.rotation.x = -Math.PI / 2
    pad.rotation.z = Math.random() * Math.PI
    pad.position.set(1.8 + Math.random() * 3.0, 0.07, 1.2 + Math.random() * 4.4)
    scene.add(pad)
    lotus.push({ obj: pad, phase: Math.random() * Math.PI * 2, y: pad.position.y })
  }
  for (let i = 0; i < 3; i++) {
    const bud = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 8), new THREE.MeshLambertMaterial({ color: C.leaf }))
    bud.position.set(2.4 + Math.random() * 1.8, 0.32, 2.0 + Math.random() * 2.6)
    scene.add(bud)
    lotus.push({ obj: bud, phase: Math.random() * Math.PI * 2, y: bud.position.y })
  }

  // —— 对岸疏树 + 泊船 ——
  for (let i = 0; i < 6; i++) {
    const tree = buildTree(i % 2 ? C.leafNight : C.leafDeep)
    tree.position.set(-14 + i * 4.6 + Math.sin(i * 2.2) * 0.8, 0, -35 - (i % 2) * 2.5)
    tree.scale.setScalar(1.3 + Math.abs(Math.sin(i * 2.9)) * 0.6)
    scene.add(tree)
  }
  const boat = buildBoat()
  boat.scale.setScalar(1.1)
  boat.position.set(-5.6, 0.05, -1.2)
  boat.rotation.y = 0.5
  scene.add(boat)

  // —— 相机：静止 + 极缓慢漂移 ——
  const BASE = new THREE.Vector3(0, 2.3, 10)
  const LOOK = new THREE.Vector3(0, 2.0, -8)
  camera.position.copy(BASE)
  camera.lookAt(LOOK)

  // —— 主循环 ——
  const reduced = prefersReducedMotion()
  const clock = new THREE.Clock()
  let raf = 0
  let elapsed = 0

  function animate(dt, t) {
    // 月晕呼吸
    moon.haloMat.opacity = 0.72 + Math.sin(t * 0.8) * 0.14
    // 水面波光明灭
    for (const d of glade.dashes) d.mat.opacity = 0.08 + 0.1 * (0.5 + 0.5 * Math.sin(t * 1.4 + d.phase))
    for (const d of lampGlints.dashes) d.mat.opacity = 0.09 + 0.07 * (0.5 + 0.5 * Math.sin(t * 1.1 + d.phase))
    for (const d of lanternGlints.dashes) d.mat.opacity = 0.08 + 0.06 * (0.5 + 0.5 * Math.sin(t * 1.3 + d.phase))
    // 船与荷叶随波
    boat.position.y = 0.05 + Math.sin(t * 1.05) * 0.026
    boat.rotation.z = Math.sin(t * 0.75) * 0.022
    for (const l of lotus) l.obj.position.y = l.y + Math.sin(t * 0.9 + l.phase) * 0.015
    // 相机极缓慢漂移
    camera.position.set(BASE.x + Math.sin(t * 0.13) * 0.16, BASE.y + Math.sin(t * 0.1) * 0.06, BASE.z)
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
