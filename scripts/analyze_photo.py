"""analyze_photo.py — 实拍照片技术体检（审美归人，数值归脚本）

用法：
  npm run photo               # 分析 public/assets/photos/
  python scripts/analyze_photo.py <目录>

输出（逐张 + 末尾 JSON）：
  尺寸/构图方向、EXIF(时间/焦距/光圈/ISO)、整体亮度、天空(上1/3)均值与方差、
  色偏(R-B)、亮斑候选列表（含归一化坐标/圆度，第一个常为月亮/路灯）。
仅做客观指标与告警，不判断"好不好看"。
"""

import json
import statistics
import sys
from collections import deque
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("缺少 Pillow，请先执行：pip install pillow")

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

MAX_W = 900           # 分析缩略宽度（速度）
BRIGHT = 200          # 亮斑阈值 (0-255)
MIN_BLOB = 15         # 最小亮斑像素数（缩略图尺度）
SKY_BUSY_STD = 30     # 天空方差告警阈值
TOO_BRIGHT = 110      # 整体亮度过高（疑似非夜景）
TOO_DARK = 18         # 过暗
MIN_W = 1200          # 原图宽低于此建议重拍
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

# EXIF 常用 tag
EXIF_DT, EXIF_FN, EXIF_ISO, EXIF_FL, EXIF_FL35 = 0x0132, 0x829D, 0x8827, 0x920A, 0xA405


def find_blobs(gray, w, h):
    """找亮斑连通域，按 亮度×面积 排序，返回归一化候选。"""
    seen = bytearray(w * h)
    blobs = []
    for i, v in enumerate(gray):
        if v < BRIGHT or seen[i]:
            continue
        q = deque([i])
        seen[i] = 1
        cells = []
        while q:
            p = q.popleft()
            cells.append(p)
            x, y = p % w, p // w
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    np_ = ny * w + nx
                    if not seen[np_] and gray[np_] >= BRIGHT:
                        seen[np_] = 1
                        q.append(np_)
        if len(cells) < MIN_BLOB:
            continue
        xs = [p % w for p in cells]
        ys = [p // w for p in cells]
        area = len(cells)
        cx, cy = sum(xs) / area, sum(ys) / area
        bw, bh = max(xs) - min(xs) + 1, max(ys) - min(ys) + 1
        aspect = min(bw, bh) / max(bw, bh)
        fill = area / (bw * bh)
        intensity = sum(gray[p] for p in cells) / area
        blobs.append(
            {
                "x": round(cx / w, 4),
                "y": round(cy / h, 4),
                "area_ratio": round(area / (w * h), 5),
                "roundness": round(aspect * fill, 3),
                "intensity": round(intensity, 1),
                "score": round(intensity * area / 1000, 1),
            }
        )
    blobs.sort(key=lambda b: -b["score"])
    for n, b in enumerate(blobs[:3], 1):
        b["n"] = n
        b["moonish"] = bool(
            b["y"] < 0.75 and b["roundness"] >= 0.55 and b["area_ratio"] >= 0.0002
        )
    return blobs[:3]


def analyze(path: Path) -> dict:
    img = Image.open(path)
    w0, h0 = img.size
    thumb = img.copy()
    thumb.thumbnail((MAX_W, MAX_W))
    w, h = thumb.size

    rgb = thumb.convert("RGB")
    r, g, b = [sum(ch.getdata()) / (w * h) for ch in rgb.split()]
    gray = list(thumb.convert("L").getdata())

    sky_step = gray[: int(h / 3) * w][::7]
    sky_mean = round(statistics.fmean(sky_step), 1)
    sky_std = round(statistics.pstdev(sky_step), 1)
    overall = round(statistics.fmean(gray[::11]), 1)

    exif = img.getexif()
    exif_out = {}
    if exif:
        mapping = {
            "datetime": EXIF_DT,
            "fnumber": EXIF_FN,
            "iso": EXIF_ISO,
            "focal_mm": EXIF_FL,
            "focal_35mm": EXIF_FL35,
        }
        for key, tag in mapping.items():
            v = exif.get(tag)
            if v is not None:
                exif_out[key] = str(v)

    warnings = []
    if w0 < MIN_W:
        warnings.append(f"原图仅 {w0}px 宽，建议重拍（< {MIN_W}px）")
    if sky_std > SKY_BUSY_STD:
        warnings.append(f"天空方差 {sky_std} 偏高，上1/3 不够干净，标题区可能受影响")
    if overall > TOO_BRIGHT:
        warnings.append(f"整体亮度 {overall} 偏高，可能不是夜景")
    if overall < TOO_DARK:
        warnings.append(f"整体亮度 {overall} 过暗，细节可能丢失")
    if abs(r - b) > 40:
        warnings.append(f"色偏明显 (R-B={round(r - b, 1)})，与其他照片并排可能不统一")
    fl35 = str(exif_out.get("focal_35mm", ""))
    if fl35.isdigit() and int(fl35) >= 60:
        warnings.append("长焦拍摄，疑似月亮特写/抠图素材候选")

    return {
        "file": path.name,
        "width": w0,
        "height": h0,
        "orientation": "landscape" if w0 > h0 else ("portrait" if h0 > w0 else "square"),
        "exif": exif_out,
        "brightness": {"overall": overall, "sky_mean": sky_mean, "sky_std": sky_std},
        "color": {"r": round(r, 1), "g": round(g, 1), "b": round(b, 1), "warmth_r_minus_b": round(r - b, 1)},
        "bright_blobs": find_blobs(gray, w, h),
        "warnings": warnings,
    }


def main():
    root = Path(__file__).resolve().parents[1]
    folder = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "public" / "assets" / "photos"

    if not folder.is_dir():
        print(f"目录不存在：{folder}（把照片放进来后重跑 npm run photo）")
        print("JSON:\n[]")
        return

    files = sorted(p for p in folder.iterdir() if p.suffix.lower() in EXTS)
    if not files:
        print(f"目录为空：{folder}")
        print("JSON:\n[]")
        return

    print(f"📁 {folder}  共 {len(files)} 张\n")
    results = []
    for i, p in enumerate(files, 1):
        try:
            r = analyze(p)
        except Exception as e:  # 坏图不中断整体
            r = {"file": p.name, "error": str(e)}
        results.append(r)
        if "error" in r:
            print(f"[{i}] {p.name}  ❌ 读取失败: {r['error']}")
            continue
        e = r["exif"]
        exif_bits = " ".join(f"{k}={v}" for k, v in e.items()) or "无EXIF"
        print(
            f"[{i}] {r['file']}  {r['width']}×{r['height']} {r['orientation']} | "
            f"亮度{r['brightness']['overall']} 天空均值{r['brightness']['sky_mean']}"
            f"/方差{r['brightness']['sky_std']} | {exif_bits}"
        )
        for blob in r["bright_blobs"]:
            flag = "  ← 疑似月亮 ✓" if blob["moonish"] else ""
            print(
                f"     亮斑#{blob['n']} ({blob['x']}, {blob['y']}) "
                f"面积{round(blob['area_ratio'] * 100, 3)}% 圆度{blob['roundness']}{flag}"
            )
        for wmsg in r["warnings"]:
            print(f"     ⚠ {wmsg}")
        print()

    print("--- JSON（我按这个配置月亮锚点）---")
    print(json.dumps(results, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()

