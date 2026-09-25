// ============================================================
// 鹈鹕骑车转场 —— 侧视骑行：世界后移（骑手驻留画面中央），
// 车轮/曲柄随位移滚动、身体起伏；缓入缓出，时长 1.5–2.5s（默认 2.0s）
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
  buildTree,
  buildRider,
  easeInOutCubic,
  disposeScene,
} from './parts.js'

// 全程位移（世界内容需铺满 x ∈ [-DIST-20, +DIST+12]）
const DIST = 46

export function createRide(canvas, { duration = 2.0, onDone = () => {} } = {}) {
  const view = initView(canvas, {
    fov: 46,
    near: 0.1,
    far: 150,
    bg: C.nightDeep,
    fog: { color: C.nightDeep, near: 20, far: 75 },
  })
  if (!view) return null
  const { renderer, scene, camera } = view
  addNightLights(scene, { ambient: 1.15, hemi: 0.7, moon: 1.5, moonPos: [-4, 8, 6] })

  // —— 天空：星 + 月（不随世界移动，天然视差）——
  scene.add(buildStars({ count: 110, spread: 80, yMin: 5, yMax: 24, zMin: 24, zMax: 50 }))
  const moon = buildMoon({ radius: 2.0, pos: [-9, 7.6, -40] })
  scene.add(moon.group)

  // —— 移动世界：路面 + 虚线 + 灯杆 + 远山 + 树林 ——
  const world = new THREE.Group()
  scene.add(world)

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(260, 70), new THREE.MeshLambertMaterial({ color: C.ground }))
  ground.rotation.x = -Math.PI / 2
  ground.position.z = -14
  world.add(ground)
  const road = new THREE.Mesh(new THREE.PlaneGeometry(260, 3.6), new THREE.MeshLambertMaterial({ color: C.road }))
  road.rotation.x = -Math.PI / 2
  road.position.z = -2
  world.add(road)

  // 车道虚线（铺满行程）
  const lineMat = new THREE.MeshBasicMaterial({ color: C.line })
  for (let i = -15; i <= 13; i++) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.14), lineMat)
    dash.rotation.x = -Math.PI / 2
    dash.position.set(i * 4, 0.02, -2)
    world.add(dash)
  }
  // 路边灯杆（近景视差）
  const postMat = new THREE.MeshLambertMaterial({ color: C.post })
  for (let i = -8; i <= 8; i++) {
    const post = new THREE.Group()
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.8, 8), postMat)
    pole.position.y = 0.9
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshBasicMaterial({ color: C.lantern }))
    lamp.position.y = 1.95
    post.add(pole, lamp)
    post.position.set(i * 7, 0, 0.7)
    world.add(post)
  }
  // 远山（慢速视差感：同一世界内距离拉开）
  for (let i = -9; i <= 8; i++) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshLambertMaterial({ color: C.hill }))
    const s = 2.6 + Math.abs(Math.sin(i * 2.3)) * 3.2
    hill.scale.set(s, s * 0.6, 1)
    hill.position.set(i * 6.5, 0, -26 - (Math.abs(i) % 3))
    world.add(hill)
  }
  // 对岸树林两排
  for (let i = 0; i < 26; i++) {
    const tree = buildTree(i % 3 === 0 ? C.leafDeep : i % 3 === 1 ? C.leaf : C.leaf2)
    tree.position.set(-62 + i * 4.8 + Math.sin(i * 1.7) * 1.1, 0, -20.4 - (i % 2) * 1.7)
    tree.scale.setScalar(0.85 + Math.abs(Math.sin(i * 2.9)) * 0.75)
    world.add(tree)
  }

  // —— 鹈鹕骑手（画面中央，面向 +x）——
  const rider = buildRider()
  rider.group.position.z = -2
  scene.add(rider.group)

  // —— 相机：正侧方 ——
  const BASE = new THREE.Vector3(0, 2.6, 9)
  const LOOK = new THREE.Vector3(0, 1.7, -2)
  camera.position.copy(BASE)
  camera.lookAt(LOOK)

  // —— 主循环：u 0→1 缓入缓出，世界随位移后移 ——
  const reduced = prefersReducedMotion()
  const clock = new THREE.Clock()
  let raf = 0
  let elapsed = 0
  let prevOff = 0
  let done = false

  function animate(dt, t) {
    const u = easeInOutCubic(Math.min(t / duration, 1))
    const off = u * DIST
    world.position.x = -off
    const dx = off - prevOff
    prevOff = off
    const roll = dx / 0.55 // 线速度 / 轮半径
    rider.wheels.forEach((w) => {
      w.rotation.z -= roll
    })
    rider.crank.rotation.z -= dx * 2.4
    rider.legs.rotation.z = Math.sin(off * 2.4) * 0.08
    rider.group.position.y = Math.abs(Math.sin(off * 1.7)) * 0.035
    moon.haloMat.opacity = 0.72 + Math.sin(t * 2.2) * 0.1
    renderer.render(scene, camera)
  }

  if (reduced) {
    // 降级：静帧直达终点并立即回调
    animate(0, duration)
    onDone()
  } else {
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(clock.getDelta(), 0.05)
      elapsed += dt
      animate(dt, elapsed)
      if (elapsed >= duration && !done) {
        done = true
        onDone()
      }
    }
    frame()
  }

  const unbind = bindResize(canvas, renderer, camera, () => {
    fitFov(camera, 46)
  })
  fitFov(camera, 46)

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
