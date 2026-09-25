// ============================================================
// 霞鹜文楷字体子集化：LXGWWenKai-Regular.ttf (24.4MB)
//   → public/assets/fonts/lxgw-wenkai-subset.woff2
// 字符集 = src 全部源码中出现的字符（含 users/blessings 400 条数据）
//   + 可打印 ASCII + 常用中文标点（兜底输入框打字）
// 用法：npm run subset-font（改文案/数据后重跑）
// ============================================================
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import subsetFont from 'subset-font'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const TTF = join(ROOT, 'LXGWWenKai-Regular.ttf')
const OUT_DIR = join(ROOT, 'public', 'assets', 'fonts')
const OUT = join(OUT_DIR, 'lxgw-wenkai-subset.woff2')

// 递归收集源码文件
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (['.js', '.vue', '.css'].includes(extname(p))) out.push(p)
  }
  return out
}

// 源码全部字符（渲染得到的文本都在源码里：文案/数据/样式）
let corpus = ''
for (const f of walk(SRC)) corpus += readFileSync(f, 'utf8')

// 兜底：可打印 ASCII + 常用中文标点/全角符号（输入框用户打字）
corpus +=
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
  ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~' +
  '，。、；：？！……——「」『』（）《》·【】￥％＋－×÷　℃'

const chars = [...new Set([...corpus])].join('')
const ttf = readFileSync(TTF)
const woff2 = await subsetFont(ttf, chars, { targetFormat: 'woff2' })

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT, woff2)
console.log(
  `[subset-font] chars=${chars.length} ttf=${(ttf.length / 1024 / 1024).toFixed(1)}MB ` +
    `→ woff2=${(woff2.length / 1024).toFixed(0)}KB  (${OUT})`
)
