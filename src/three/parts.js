// ============================================================
// TiHuMoon — 跨景点场景公共构建器（≥2 个场景复用才收录；纯函数、无全局状态）
// 色值与 src/style.css 设计令牌一一对应；buildRider/buildTree/buildBoat/buildPagoda
// 与 introScene.js 保持同一拼装方式（introScene 本体未改动，开场无回归风险）
// ============================================================
import * as THREE from 'three'

export const C = {
  // —— 设计令牌（style.css 同值）——
  night: 0x2f4c86,
  nightDeep: 0x1b2c52,
  nightInk: 0x12203d,
  moon: 0xf7d964,
  moonSoft: 0xffe9a8,
  orange: 0xe8843c,
  lantern: 0xf6c445,
  cream: 0xfbf3e0,
  cloud: 0xdfe8f5,
  // —— 场景扩展色（同族夜色）——
  hill: 0x101a30,
  ground: 0x16203a,
  lake: 0x1d3a69,
  lakeDeep: 0x16294d,
  shore: 0x142138,
  stone: 0xc9d3e4,
  stoneDark: 0x4a4f66,
  wood: 0x6b4a2e,
  mat: 0x8a7550,
  glow: 0xffe9a8,
  leaf: 0x2f6b47,
  leaf2: 0x24523a,
  leafDeep: 0x1a3d2e,
  leafNight: 0x122419,
  rock: 0x151f38,
  rockDeep: 0x101a30,
  body: 0xf4f1ea,
  wing: 0xe4ded0,
  beak: 0xf2b31f,
  pouch: 0xdf9714,
  leg: 0xe8a03c,
  eye: 0x1b1b24,
  bike: 0x3d5a8a,
  bikeDark: 0x1b2740,
  hub: 0x8ea4c9,
  seat: 0x141c30,
  post: 0x3a4664,
  road: 0x2a3448,
  line: 0xd8dfeb,
  pillar: 0x6e2a20,
  roofInk: 0x1c2a44,
  window: 0xffd98a,
  neonCyan: 0x9fd3e0,
  neonRed: 0xe06a5b,
}

// ---------- 视图初始化 / 尺寸 / 灯光 ----------

// 创建渲染器 + 场景 + 相机；WebGL 不可用返回 null
export function initView(canvas, { fov = 50, near = 0.1, far = 160, bg = C.nightDeep, fog = null } = {}) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(bg)
  if (fog) scene.fog = new THREE.Fog(fog.color, fog.near, fog.far)
  const camera = new THREE.PerspectiveCamera(fov, 1, near, far)
  return { renderer, scene, camera }
}

// 绑定 resize（用画布 CSS 尺寸）；返回解绑函数
export function bindResize(canvas, renderer, camera, onAfter) {
  function resize() {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    if (onAfter) onAfter()
  }
  resize()
  window.addEventListener('resize', resize)
  return () => window.removeEventListener('resize', resize)
}

// 夜色三件套灯光（环境光 + 半球光 + 月光方向光），返回方向光便于按需调向
export function addNightLights(scene, { ambient = 1.1, hemi = 0.65, moon = 1.4, moonPos = [-4, 8, 6] } = {}) {
  scene.add(new THREE.AmbientLight(0xffffff, ambient))
  scene.add(new THREE.HemisphereLight(0x5570a6, 0x15203a, hemi))
  const dir = new THREE.DirectionalLight(0xfff2c0, moon)
  dir.position.set(moonPos[0], moonPos[1], moonPos[2])
  scene.add(dir)
  return dir
}

// prefers-reduced-motion：3D 降级为静帧
export function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

// 竖屏自适应视角：窄屏拉宽 fov 保证水平主体完整入画（封顶防鱼眼畸变）
export function fitFov(camera, baseFov, { maxFov = 76 } = {}) {
  const a = camera.aspect
  const v =
    a >= 1
      ? baseFov
      : Math.min(maxFov, ((Math.atan(Math.tan((baseFov * Math.PI) / 360) / a) * 2 * 180) / Math.PI))
  camera.fov = v
  camera.updateProjectionMatrix()
}

// ---------- 程序化贴图（CanvasTexture）----------

// 径向渐变贴图（月亮/光晕/烛光通用底图）
export function makeRadialTexture(size, stops) {
  const cv = document.createElement('canvas')
  cv.width = size
  cv.height = size
  const ctx = cv.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [off, col] of stops) g.addColorStop(off, col)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 柔光晕贴图（灯笼/烛光 Sprite 用）
export function makeGlowTexture() {
  return makeRadialTexture(128, [
    [0, 'rgba(255,243,207,0.9)'],
    [0.35, 'rgba(255,233,168,0.45)'],
    [1, 'rgba(255,233,168,0)'],
  ])
}

// 城市楼体亮窗贴图：透明底 + 随机亮窗（暖/冷两色），用于「万家灯火」
export function makeWindowTexture({ cols = 5, rows = 12, litRatio = 0.55 } = {}) {
  const cv = document.createElement('canvas')
  cv.width = cols * 16
  cv.height = rows * 14
  const ctx = cv.getContext('2d')
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > litRatio) continue
      const warm = Math.random() < 0.72
      ctx.fillStyle = warm ? 'rgba(255,214,138,0.95)' : 'rgba(178,214,232,0.8)'
      ctx.fillRect(c * 16 + 5, r * 14 + 4, 6, 7)
    }
  }
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 中式格棂窗贴图：暖光底 + 墨色窗棂（城隍阁楼身）
export function makeLatticeTexture({ w = 128, h = 128, cols = 4, rows = 3 } = {}) {
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')
  ctx.fillStyle = '#ffd98a'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#2a1a12'
  ctx.lineWidth = Math.max(4, w / 32)
  for (let i = 0; i <= cols; i++) {
    const x = (i / cols) * w
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let j = 0; j <= rows; j++) {
    const y = (j / rows) * h
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 竖排匾额贴图（如「城隍阁」）：墨底金字
export function makePlaqueTexture(chars, { w = 64, h = 192, bg = '#24140e', fg = '#ffe9a8' } = {}) {
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(255,233,168,0.55)'
  ctx.lineWidth = 3
  ctx.strokeRect(4, 4, w - 8, h - 8)
  ctx.fillStyle = fg
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${Math.floor(w * 0.56)}px 'Kaiti SC','STKaiti','KaiTi',serif`
  const n = chars.length
  for (let i = 0; i < n; i++) {
    ctx.fillText(chars[i], w / 2, ((i + 0.5) / n) * h)
  }
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ---------- 天空 / 月 / 星 ----------

// 月亮：柔边核心 + 加色光晕（Sprite 恒朝向相机）；warm=true 偏橙（宝石山/城隍阁参考图氛围）
export function buildMoon({ radius = 2.1, pos = [0, 8, -40], warm = false } = {}) {
  const group = new THREE.Group()
  const coreTex = makeRadialTexture(128, [
    [0, '#fffbe8'],
    [0.5, warm ? '#f6c964' : '#f7d964'],
    [0.82, warm ? '#eda43c' : '#ffe9a8'],
    [1, warm ? 'rgba(232,164,60,0)' : 'rgba(247,217,100,0)'],
  ])
  const coreMat = new THREE.SpriteMaterial({ map: coreTex, transparent: true, depthWrite: false, fog: false })
  const core = new THREE.Sprite(coreMat)
  core.scale.setScalar(radius * 2.15)
  const haloTex = makeRadialTexture(128, [
    [0, 'rgba(255,233,168,0.5)'],
    [0.45, 'rgba(247,217,100,0.16)'],
    [1, 'rgba(247,217,100,0)'],
  ])
  const haloMat = new THREE.SpriteMaterial({
    map: haloTex,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    fog: false,
    blending: THREE.AdditiveBlending,
  })
  const halo = new THREE.Sprite(haloMat)
  halo.scale.setScalar(radius * 4.8)
  group.add(halo, core)
  group.position.set(pos[0], pos[1], pos[2])
  return { group, core, halo, coreMat, haloMat }
}

// 星空点云
export function buildStars({ count = 150, spread = 70, yMin = 4, yMax = 30, zMin = 22, zMax = 52 } = {}) {
  const pos = []
  for (let i = 0; i < count; i++) {
    pos.push(
      (Math.random() - 0.5) * spread,
      yMin + Math.random() * (yMax - yMin),
      -zMin - Math.random() * (zMax - zMin)
    )
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: C.cloud, size: 0.13, fog: false, transparent: true, opacity: 0.85 }))
}

// ---------- 水 ----------

// 湖面（大平面）
export function buildWater({ w = 200, d = 120, color = C.lakeDeep, y = 0, z = -20 } = {}) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshLambertMaterial({ color })
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(0, y, z)
  return mesh
}

// 月光水道：月亮正下方一列碎金横条（随波明灭）
export function buildMoonGlade({ x = 0, zNear = 8, zFar = -26, width = 2.6, count = 14, color = C.moon } = {}) {
  const group = new THREE.Group()
  const dashes = []
  const geo = new THREE.PlaneGeometry(1, 0.08)
  for (let i = 0; i < count; i++) {
    const u = count === 1 ? 0.5 : i / (count - 1)
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.14, depthWrite: false, fog: false })
    const dash = new THREE.Mesh(geo, mat)
    dash.rotation.x = -Math.PI / 2
    dash.scale.x = width * (0.35 + Math.random() * 0.75) * (0.55 + 0.45 * Math.sin(u * Math.PI))
    dash.position.set(x + (Math.random() - 0.5) * width * 0.4, 0.05, zNear + (zFar - zNear) * u)
    group.add(dash)
    dashes.push({ mat, phase: Math.random() * Math.PI * 2 })
  }
  return { group, dashes }
}

// 一片横向波光碎条（任意水岸反光：灯影/楼影）
export function buildGlints({ spots, color = C.lantern, opacity = 0.12, len = 1.6 } = {}) {
  const group = new THREE.Group()
  const dashes = []
  const geo = new THREE.PlaneGeometry(1, 0.07)
  for (const [gx, gz, gw] of spots) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, fog: false })
    const dash = new THREE.Mesh(geo, mat)
    dash.rotation.x = -Math.PI / 2
    dash.scale.x = gw || len
    dash.position.set(gx, 0.05, gz)
    group.add(dash)
    dashes.push({ mat, phase: Math.random() * Math.PI * 2 })
  }
  return { group, dashes }
}

// 水面竖直反光柱（城市灯火 / 点亮石塔的倒影），从 zStart 向相机方向（+z）拖出 len
export function buildStreaks({ items, opacity = 0.14 } = {}) {
  // items: [{ x, z, w, len, color }]
  const group = new THREE.Group()
  const streaks = []
  const geo = new THREE.PlaneGeometry(1, 1)
  for (const it of items) {
    const mat = new THREE.MeshBasicMaterial({
      color: it.color != null ? it.color : C.lantern,
      transparent: true,
      opacity,
      depthWrite: false,
      fog: false,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = -Math.PI / 2
    mesh.scale.set(it.w, it.len, 1)
    mesh.position.set(it.x, 0.06, it.z + it.len / 2)
    group.add(mesh)
    streaks.push({ mat, phase: Math.random() * Math.PI * 2 })
  }
  return { group, streaks }
}

// ---------- 草木 / 石塔 / 船（与 introScene 同款拼装）----------

// 远岸树：球簇树冠 + 细树干
export function buildTree(tint) {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.08, 0.6, 6),
    new THREE.MeshLambertMaterial({ color: C.wood })
  )
  trunk.position.y = 0.3
  g.add(trunk)
  const leafMat = new THREE.MeshLambertMaterial({ color: tint })
  for (const [x, y, z, r] of [
    [0, 0.95, 0, 0.44],
    [-0.3, 0.8, 0.05, 0.3],
    [0.3, 0.82, -0.05, 0.33],
    [0.05, 1.26, 0, 0.26],
  ]) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), leafMat)
    blob.position.set(x, y, z)
    blob.scale.y = 0.9
    g.add(blob)
  }
  return g
}

// 三潭印月石塔：瓶形、周开五圆孔；glowMat 缺省自建；lit=false 时不点烛（hole 透明度 0）
export function buildPagoda({ glowMat = null, lit = true } = {}) {
  const gm = glowMat || new THREE.MeshBasicMaterial({ color: C.glow, transparent: true, opacity: 0.85 })
  if (!lit) gm.opacity = 0
  const g = new THREE.Group()
  const stone = new THREE.MeshLambertMaterial({ color: C.stone })

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.24, 10), stone)
  base.position.y = 0.1
  const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.3, 10), stone)
  waist.position.y = 0.37
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 12), stone)
  belly.scale.y = 0.88
  belly.position.y = 0.86
  g.add(base, waist, belly)

  // 塔身五孔：暖光圆片（烛光透纸）
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.1, 12), gm)
    hole.position.set(Math.sin(a) * 0.405, 0.86, Math.cos(a) * 0.405)
    hole.rotation.y = a
    g.add(hole)
  }

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.16, 8), stone)
  neck.position.y = 1.24
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), stone)
  cap.position.y = 1.36
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 8), stone)
  tip.position.y = 1.5
  g.add(neck, cap, tip)
  return { group: g, glowMat: gm }
}

// 氛围小篷船：平底翘尾船体 + 半圆竹篾篷 + 船头一盏小灯
export function buildBoat() {
  const g = new THREE.Group()
  const woodMat = new THREE.MeshLambertMaterial({ color: C.wood })

  const hull = new THREE.Shape()
  hull.moveTo(-0.95, 0.3)
  hull.quadraticCurveTo(-0.9, 0.04, -0.55, 0)
  hull.lineTo(0.55, 0)
  hull.quadraticCurveTo(0.9, 0.04, 0.95, 0.3)
  hull.lineTo(0.75, 0.24)
  hull.quadraticCurveTo(0.6, 0.1, 0.35, 0.1)
  hull.lineTo(-0.35, 0.1)
  hull.quadraticCurveTo(-0.6, 0.1, -0.75, 0.24)
  hull.closePath()
  const hullGeo = new THREE.ExtrudeGeometry(hull, { depth: 0.5, bevelEnabled: false })
  hullGeo.translate(0, 0, -0.25)
  g.add(new THREE.Mesh(hullGeo, woodMat))

  // 篷（半圆拱、开口朝下）
  const canopy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 1.05, 12, 1, true, 0, Math.PI),
    new THREE.MeshLambertMaterial({ color: C.mat, side: THREE.DoubleSide })
  )
  canopy.rotation.z = Math.PI / 2
  canopy.position.set(0.05, 0.14, 0)
  g.add(canopy)

  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), new THREE.MeshBasicMaterial({ color: C.glow }))
  lamp.position.set(0.74, 0.36, 0)
  g.add(lamp)
  return g
}

// 柔光 Sprite（灯笼/烛光泛光贴片）
export function buildGlowSprite({ color = C.glow, size = 1.2, opacity = 0.55 } = {}) {
  const mat = new THREE.SpriteMaterial({
    map: makeGlowTexture(),
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    fog: false,
    blending: THREE.AdditiveBlending,
  })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.setScalar(size)
  return { sprite, mat }
}

// ---------- 骑手（与 introScene 同款，供骑车转场复用）----------

// 两点之间生成一根圆杆（车架 / 腿）
export function bar(a, b, r, mat) {
  const start = new THREE.Vector3(a[0], a[1], a[2] || 0)
  const end = new THREE.Vector3(b[0], b[1], b[2] || 0)
  const dir = new THREE.Vector3().subVectors(end, start)
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 8), mat)
  mesh.position.copy(start).add(end).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  return mesh
}

// 带辐条的车轮（辐条让旋转可见）
export function buildWheel() {
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

// 鹈鹕 + 自行车（面向 +x 行进方向）；返回 { group, wheels, crank, legs }
export function buildRider() {
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

// ---------- 通用 ----------

// 场景资源统一释放（几何体 / 材质 / 贴图）
export function disposeScene(scene) {
  scene.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    const m = obj.material
    const list = Array.isArray(m) ? m : m ? [m] : []
    for (const x of list) {
      if (x.map) x.map.dispose()
      x.dispose()
    }
  })
}

// 缓动：慢→快→慢
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
