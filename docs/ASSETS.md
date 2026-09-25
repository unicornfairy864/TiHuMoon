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

**统一生成 prompt（可直接复制给 image 模型，中英任选）**

**P0-1 主视觉·夜景鹈鹕骑车（横版 ≥1600×900）**
- 中文：扁平矢量插画，中秋夜晚，一只白色大鹈鹕骑着深藏青色自行车在西湖边公路骑行，橙黄色大嘴，夜空深靛蓝缀星与金色满月，远山剪影、湖面月光倒影，路边暖黄灯笼，干净几何色块，画面左侧留夜空放标题，无文字、无水印
- EN: flat vector illustration, a white pelican riding a deep navy bicycle along a lakeside road at Mid-Autumn night, Hangzhou West Lake, huge golden full moon in deep indigo starry sky, mountain silhouettes, moonlight reflection, warm lantern glow, clean geometric shapes, empty sky space on the left, no text, no watermark

**P0-2 六张赏月点插画（方图 ≥800×800，风格统一）**
统一后缀：`…, flat vector illustration, Mid-Autumn night, deep indigo sky #2F4C86, moonlight yellow #F7D964, clean shapes, square composition, no text, no watermark`

| 站 | 主体描述（接在统一后缀前） |
|---|---|
| 平湖秋月 | 湖畔长廊与石拱桥，如镜湖面托起金色满月 |
| 宝石山 | 山顶保俶塔剪影，俯瞰西湖与城灯 |
| 三潭印月 | 湖中三座石塔，烛光从圆孔透出，水面倒影 |
| 满陇桂雨 | 桂花树与山间石径，石桌茶盏 |
| 吴山城隍阁 | 层层飞檐城隍阁，老城屋顶夜景 |
| 钱塘江·城市阳台 | 现代城市天际线与灯光秀，江面倒影 |

**P1-3 花灯特写（方图）**
中式纸灯笼特写，暖黄光晕从灯内透出，贴剪纸玉兔与桂花，黄色流苏垂下，背景虚化圆月与桂树夜色，扁平矢量插画风，无文字、无水印

**P1-4 放飞夜空背景（竖版 ≥1000×1600）**
竖版扁平矢量插画，西湖群山黑色剪影之上是深靛蓝夜空与巨大金色满月，十余盏孔明灯缓缓升空，星空点点，顶部大面积留夜空，无文字、无水印

**收到后放置目录**：`public/assets/`（建议命名 `hero-night.png`、`spot1.png`…`spot6.png`、`lantern.png`、`fly-bg.png`）

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
