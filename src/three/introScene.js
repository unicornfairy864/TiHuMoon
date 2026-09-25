import * as THREE from 'three'

// 色板与 style.css 设计令牌对应
const C = {
  moon: 0xf7d964,
  star: 0xdfe8f5,
  hill: 0x101a30,
  ground: 0x16203a,
  road: 0x2a3448,
  line: 0xd8dfeb,
  post: 0x3a4664,
  lamp: 0xf6c445,
  bike: 0x3d5a8a,
  bikeDark: 0x1b2740,
  hub: 0x8ea4c9,
  body: 0xf4f1ea,
  wing: 0xe4ded0,
  beak: 0xf2b31f,
  pouch: 0xdf9714,
  leg: 0xe8a03c,
  eye: 0x1b1b24,
  seat: 0x141c30,
}

// 两点之间生成一根圆杆（车架 / 腿）
function bar(a, b, r, mat) {
  const start = new THREE.Vector3(a[0], a[1], a[2] || 0)
  const end = new THREE.Vector3(b[0], b[1], b[2] || 0)
  const dir = new THREE.Vector3().subVectors(end, start)
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 8), mat)
  mesh.position.copy(start).add(end).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  return mesh
}

// 带辐条的车轮（辐条让旋转可见）
function buildWheel() {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 10, 36), new THREE.MeshLambertMaterial({ color: C.bikeDark })))
  const spokeMat = new THREE.MeshBasicMaterial({ color: C.hub })
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.02, 6), spokeMat)
    s.rotation.z = (i * Math.PI) / 3
    g.add(s)
  }
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), spokeMat))
  return g
}

// 鹈鹕 + 自行车（面向 +x 行进方向）
function buildRider() {
  const group = new THREE.Group()

  const bikeMat = new THREE.MeshLambertMaterial({ color: C.bike })
  const darkMat = new THREE.MeshLambertMaterial({ color: C.bikeDark })
  const bodyMat = new THREE.MeshLambertMaterial({ color: C.body })
  const wingMat = new THREE.MeshLambertMaterial({ color: C.wing })
  const beakMat = new THREE.MeshLambertMaterial({ color: C.beak })
  const pouchMat = new THREE.MeshLambertMaterial({ color: C.pouch })
  const legMat = new THREE.MeshLambertMaterial({ color: C.leg })

  // 车轮
  const rear = buildWheel()
  rear.position.set(-0.9, 0.61, 0)
  const front = buildWheel()
  front.position.set(0.9, 0.61, 0)
  group.add(rear, front)

  // 车架
  group.add(
    bar([-0.9, 0.61], [0, 0.61], 0.045, bikeMat),
    bar([0, 0.61], [-0.38, 1.32], 0.045, bikeMat),
    bar([-0.38, 1.32], [-0.9, 0.61], 0.045, bikeMat),
    bar([0, 0.61], [0.72, 1.35], 0.045, bikeMat),
    bar([0.72, 1.35], [0.78, 1.58], 0.04, darkMat),
    bar([0.72, 1.35], [0.9, 0.61], 0.04, darkMat),
    bar([-0.38, 1.32], [-0.4, 1.46], 0.04, darkMat)
  )
  // 车座
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.18), new THREE.MeshLambertMaterial({ color: C.seat }))
  saddle.position.set(-0.42, 1.5, 0)
  group.add(saddle)
  // 车把（侧视下沿 z 轴的横杆）
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 8), darkMat)
  grip.rotation.x = Math.PI / 2
  grip.position.set(0.78, 1.6, 0)
  group.add(grip)

  // 曲柄组（踏板绕中轴旋转）
  const crank = new THREE.Group()
  crank.position.set(0, 0.61, 0)
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 16), darkMat)
  axle.rotation.x = Math.PI / 2
  crank.add(axle)
  const armMat = new THREE.MeshLambertMaterial({ color: C.hub })
  crank.add(bar([0, 0, 0.1], [0.19, 0, 0.1], 0.03, armMat))
  crank.add(bar([0, 0, -0.1], [-0.19, 0, -0.1], 0.03, armMat))
  const pedalA = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.12), darkMat)
  pedalA.position.set(0.19, 0, 0.13)
  const pedalB = pedalA.clone()
  pedalB.position.set(-0.19, 0, -0.13)
  crank.add(pedalA, pedalB)
  group.add(crank)

  // 鹈鹕身体（坐在车座上）
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 16), bodyMat)
  body.scale.set(1.1, 0.9, 0.8)
  body.position.set(-0.3, 1.98, 0)
  group.add(body)
  // 尾羽
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 8), wingMat)
  tail.rotation.z = Math.PI / 2
  tail.position.set(-0.95, 2.03, 0)
  group.add(tail)
  // 颈（曲线管）
  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 2.25, 0),
    new THREE.Vector3(0.35, 2.55, 0),
    new THREE.Vector3(0.6, 2.82, 0),
  ])
  group.add(new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 12, 0.14, 8), bodyMat))
  // 头 + 眼
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 12), bodyMat)
  head.position.set(0.66, 2.88, 0)
  group.add(head)
  const eyeMat = new THREE.MeshBasicMaterial({ color: C.eye })
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat)
  eyeL.position.set(0.75, 2.96, 0.16)
  const eyeR = eyeL.clone()
  eyeR.position.z = -0.16
  group.add(eyeL, eyeR)
  // 喙（锥形朝 +x）
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.13, 1.05, 10), beakMat)
  beak.rotation.z = -Math.PI / 2
  beak.position.set(1.28, 2.85, 0)
  group.add(beak)
  // 喉囊（挂在喙下方）
  const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), pouchMat)
  pouch.scale.set(1.4, 0.5, 0.6)
  pouch.position.set(1.1, 2.66, 0)
  group.add(pouch)
  // 双翼
  const wingL = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), wingMat)
  wingL.scale.set(1, 0.55, 0.22)
  wingL.rotation.z = -0.35
  wingL.position.set(-0.3, 2.08, 0.36)
  const wingR = wingL.clone()
  wingR.position.z = -0.36
  group.add(wingL, wingR)

  // 双腿（以髋部为轴轻微摆动）
  const legs = new THREE.Group()
  legs.position.set(-0.08, 1.65, 0)
  legs.add(bar([0, 0, 0.13], [0.13, -0.85, 0.15], 0.045, legMat))
  legs.add(bar([0, 0, -0.13], [0.13, -0.85, -0.15], 0.045, legMat))
  const footMat = new THREE.MeshLambertMaterial({ color: C.pouch })
  const footL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.1), footMat)
  footL.position.set(0.16, -0.86, 0.15)
  const footR = footL.clone()
  footR.position.z = -0.15
  legs.add(footL, footR)
  group.add(legs)

  return { group, wheels: [rear, front], crank, legs }
}

// 缓动：慢→快→慢
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// 时间 → 样条参数（速度编排）：
// 0–4.2s 后方起步慢→加速→贴近侧拍时放慢；4.2–7.4s 侧面滑行加速到正前方并收住；7.4s 后保持
function pathU(elapsed) {
  if (elapsed <= 4.2) return 0.5 * easeInOutCubic(elapsed / 4.2)
  if (elapsed <= 7.4) return 0.5 + 0.5 * easeInOutCubic((elapsed - 4.2) / 3.2)
  return 1
}

// 创建 3D 开场；返回 dispose 函数，WebGL 不可用时返回 null
export function createIntro(canvas, { onFinish = () => {}, onTitle = () => {} } = {}) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x12203d)
  scene.fog = new THREE.Fog(0x12203d, 16, 48)

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 140)

  // 灯光
  scene.add(new THREE.AmbientLight(0xffffff, 1.15))
  scene.add(new THREE.HemisphereLight(0x5570a6, 0x15203a, 0.7))
  const moonLight = new THREE.DirectionalLight(0xfff2c0, 1.5)
  moonLight.position.set(-4, 8, 6)
  scene.add(moonLight)

  // 月亮 + 光晕
  const moon = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.MeshBasicMaterial({ color: C.moon, fog: false }))
  moon.position.set(-7.5, 7.5, -36)
  const halo = new THREE.Mesh(new THREE.CircleGeometry(3.3, 48), new THREE.MeshBasicMaterial({ color: C.moon, transparent: true, opacity: 0.14, fog: false }))
  halo.position.copy(moon.position)
  halo.position.z -= 0.2
  scene.add(moon, halo)

  // 星空
  const starPos = []
  for (let i = 0; i < 160; i++) {
    starPos.push((Math.random() - 0.5) * 70, 3 + Math.random() * 20, -20 - Math.random() * 24)
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3))
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: C.star, size: 0.13, fog: false })))

  // 地面 + 公路
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 60), new THREE.MeshLambertMaterial({ color: C.ground }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.02
  const road = new THREE.Mesh(new THREE.PlaneGeometry(180, 3.6), new THREE.MeshLambertMaterial({ color: C.road }))
  road.rotation.x = -Math.PI / 2
  scene.add(ground, road)

  // 循环滚动的元素 { obj, speed, span }
  const scrollables = []

  // 车道虚线
  const lineMat = new THREE.MeshBasicMaterial({ color: C.line })
  for (let i = -5; i <= 5; i++) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.14), lineMat)
    dash.rotation.x = -Math.PI / 2
    dash.position.set(i * 4, 0.02, 0)
    scene.add(dash)
    scrollables.push({ obj: dash, speed: 9, span: 44 })
  }

  // 路边灯笼杆（近景视差）
  const postMat = new THREE.MeshLambertMaterial({ color: C.post })
  const lampMat = new THREE.MeshBasicMaterial({ color: C.lamp })
  for (let i = -3; i <= 3; i++) {
    const post = new THREE.Group()
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.8, 8), postMat)
    pole.position.y = 0.9
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), lampMat)
    lamp.position.y = 1.95
    post.add(pole, lamp)
    post.position.set(i * 7, 0, 2.7)
    scene.add(post)
    scrollables.push({ obj: post, speed: 9, span: 50 })
  }

  // 远山（慢速视差）
  const hillMat = new THREE.MeshLambertMaterial({ color: C.hill })
  for (let i = -4; i <= 4; i++) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), hillMat)
    const s = 2.6 + Math.abs(Math.sin(i * 2.3)) * 3.2
    hill.scale.set(s, s * 0.6, 1)
    hill.position.set(i * 6.5, 0, -16 - (i % 3))
    scene.add(hill)
    scrollables.push({ obj: hill, speed: 1.6, span: 58 })
  }

  // 鹈鹕骑手
  const rider = buildRider()
  scene.add(rider.group)

  // —— 电影运镜：后 → 右侧 → 前，远 → 近 → 远 ——
  // az: 相机方位角（-90=正后方, 0=骑手右侧+Z, 90=正前方）; el: 仰角; d: 基准距离;
  // v/h: 竖/横方向必须完整入画的半幅，用于按屏幕比例推最小距离
  const TARGET = new THREE.Vector3(0.1, 1.85, 0)
  const KEYS = [
    { az: -90, el: 0.34, d: 9.5, v: 1.9, h: 0.7 }, // 后方·远（略俯）
    { az: -45, el: 0.2, d: 7.0, v: 1.8, h: 1.6 }, // 后右 45°
    { az: 0, el: 0.06, d: 4.8, v: 1.4, h: 2.3 }, // 正右侧·近（贴地）
    { az: 45, el: 0.14, d: 7.5, v: 1.8, h: 1.6 }, // 前右 45°
    { az: 55, el: 0.18, d: 10.5, v: 1.9, h: 1.6 }, // 右前方·远（鹈鹕居左，右半屏留给标题）
  ]
  let cameraPath = null
  let lookPath = null
  const tmpPos = new THREE.Vector3()
  const tmpLook = new THREE.Vector3()

  // 自适应取景（竖屏也能装下）
  function resize() {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    const aspect = w / h
    camera.aspect = aspect
    camera.updateProjectionMatrix()

    // 竖屏水平可视窄 → 自动把关键帧推远，保证骑手完整入画
    const tanH = Math.tan((camera.fov * Math.PI) / 360)
    const pts = KEYS.map((k) => {
      const dist = Math.max(k.d, k.v / tanH, k.h / (tanH * aspect))
      const az = (k.az * Math.PI) / 180
      return new THREE.Vector3(
        TARGET.x + dist * Math.sin(az) * Math.cos(k.el),
        TARGET.y + dist * Math.sin(k.el),
        TARGET.z + dist * Math.cos(az) * Math.cos(k.el)
      )
    })
    cameraPath = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)

    // 注视点：末两帧向屏幕右偏移 → 鹈鹕落左半屏，右半屏留给「游中秋」
    const PAN = [0, 0, 0, 0.25, 0.5] // 偏移占水平半幅的比例
    const lookPts = pts.map((p, i) => {
      const dir = new THREE.Vector3().subVectors(TARGET, p).normalize()
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize()
      const pan = PAN[i] * tanH * p.distanceTo(TARGET) * aspect
      return new THREE.Vector3().copy(TARGET).addScaledVector(right, pan)
    })
    lookPath = new THREE.CatmullRomCurve3(lookPts, false, 'catmullrom', 0.5)
  }
  resize()
  window.addEventListener('resize', resize)

  // 主循环：9.5s 速度编排（慢→快→侧拍放慢→前方保持）；7.4s 触发标题，9.5s 收尾
  const clock = new THREE.Clock()
  let raf = 0
  let elapsed = 0
  let done = false
  let titleFired = false
  const DURATION = 9.5
  const TITLE_AT = 7.4

  function frame() {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    elapsed += dt

    for (const s of scrollables) {
      s.obj.position.x -= s.speed * dt
      if (s.obj.position.x < -s.span / 2) s.obj.position.x += s.span
    }

    const roll = (9 * dt) / 0.55 // 线速度 9 / 轮半径 0.55
    rider.wheels.forEach((w) => {
      w.rotation.z -= roll
    })
    rider.crank.rotation.z -= 6 * dt
    rider.legs.rotation.z = Math.sin(elapsed * 6) * 0.07
    rider.group.position.y = Math.sin(elapsed * 9) * 0.025

    const u = pathU(elapsed)
    cameraPath.getPoint(u, tmpPos)
    camera.position.copy(tmpPos)
    lookPath.getPoint(u, tmpLook)
    camera.lookAt(tmpLook)

    renderer.render(scene, camera)

    if (!titleFired && elapsed >= TITLE_AT) {
      titleFired = true
      onTitle()
    }

    if (elapsed >= DURATION && !done) {
      done = true
      cancelAnimationFrame(raf)
      onFinish()
    }
  }
  frame()

  return function dispose() {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose()
      const m = obj.material
      if (Array.isArray(m)) m.forEach((x) => x.dispose())
      else if (m) m.dispose()
    })
    renderer.dispose()
  }
}


