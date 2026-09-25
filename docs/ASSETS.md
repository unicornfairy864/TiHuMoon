# TiHuMoon 资产清单（ASSETS）

## 0. 版权红线
- 第三方截图/教程图/平台水印图 **一律不上站**，仅作风格参考
- 上站图片仅来自：① 用户自行搜集的免版权图 ② image 模型生成 ③ 代码程序化绘制
- 参考图描述已存 `图片.txt`（GBK），资产替换后可删除原始 txt

## 1. 用户参考图（3 张，仅参考）
| 文件 | 尺寸 | 内容 | 结论 |
|---|---|---|---|
| `image.png` | 1380×792 | 鹈鹕骑车扁平插画（白天海边，含暂停按钮 UI） | 骑车示例 → **忽略**，风格基准可参考 |
| `image copy.png` | 1254×1254 | 中秋发光灯笼 8 步教程图（疑含水印） | **仅参考**：灯笼视觉 + 制作流程 |
| `temp_image_…jpeg` | 941×1920 | 杭州中秋赏月地图截图（10 赏月点，杭小U） | **仅参考**：夜景色系 `#2F4C86`+`#F7D964`、卡片文案风格 |

## 2. 需要用户/image 模型生成的图片（按优先级）
| 优先级 | 资产 | 规格 | 用途 |
|---|---|---|---|
| P0 | 夜景版「鹈鹕骑车」主视觉 | 横版 ≥1600px 宽，PNG 透明底更佳 | 3D 开场降级图 + home hero |
| P0 | 6 张赏月点夜景小插画 | 1:1 ≥800px，统一风格 | spot 卡片配图 |
| P1 | 发光花灯特写（暖黄夜景） | 方图 | science/make 章节氛围图 |
| P1 | 夜空放飞背景（西湖山影+满月+孔明灯） | 竖版 ≥1000×1600 | fly 章节背景 |
| P2 | 鹈鹕头像/logo 小图 | 方图透明底 | favicon / credits 签名 |

**统一 prompt 风格词**（供生成时保持一致）：
`flat vector illustration, Chinese Mid-Autumn night, deep indigo blue sky, moonlight yellow glow, warm lantern, West Lake Hangzhou, clean shapes, no text, no watermark`

## 3. 代码程序化资产（无需图片）
- Three.js 低多边形鹈鹕 + 自行车（开场动画本体）
- 月亮/星星/光晕/湖面倒影（CSS 渐变 + canvas 粒子）
- 路线图 SVG（6 点连线 + 骑行小图标移动）
- 灯笼粒子上升动画（DOM/CSS）

## 4. 字体资产
- 霞鹜文楷 LXGW WenKai（OFL 开源，可商用嵌入）
- 方式：`@font-face` + woff2 子集（中文全量约 3–5MB，**拆分子集 + `font-display: swap`**）
- Phase 8 落地，文件放 `public/assets/fonts/`

## 5. 音频（可选，Phase 8）
- BGM：中秋主题纯音乐（需免版权）；音效：按钮点击、灯笼升空
- 若无合适资源则**静音版上线**，不留破音占位

## 6. 数据资产（已完成）
| 来源 | 转换 | 产物 | 条数 |
|---|---|---|---|
| `用户.txt`（GBK） | `scripts/convert_data.py` | `src/data/users.js` | 200 昵称（古风/随机/校园三组） |
| `祝福.txt`（GBK） | 同上 | `src/data/blessings.js` | 200 祝福语 |
